import { test } from '@playwright/test';
import { Server } from 'http';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { startServer } from './server';
import { deepEqualOtelJson } from '../utils/deepEqualOtelJson';

interface ComparePageWithFixtureTestOptions {
  basedir: string;
  title: string;
  name: string;
}

export const createComparePageWithFixtureTest = ({
  basedir,
  title,
  name,
}: ComparePageWithFixtureTestOptions) => {
  let server: Server;
  let port: number;

  test.beforeAll(async () => {
    ({ server, port } = await startServer({ basedir }));
  });

  test.afterAll(async () => {
    await server.close();
  });

  test(title, async ({ page }) => {
    page.addInitScript(() => {
      const supportedEntryTypes =
        PerformanceObserver.supportedEntryTypes.filter(
          (type) => type !== 'longtask',
        );
      Object.defineProperty(PerformanceObserver, 'supportedEntryTypes', {
        configurable: true,
        enumerable: true,
        get: () => supportedEntryTypes,
      });
    });

    page.on('console', (message) => {
      console.log(message.text());
    });
    page.on('pageerror', (message) => {
      console.error(message);
    });

    await page.goto(`http://localhost:${port}/${name}.html`);
    const result = await axios.get(`http://localhost:${port}/traces`, {
      timeout: 50_000,
    });
    if ('WRITE_FIXTURES' in process.env) {
      await fs.writeFile(
        path.join(basedir, `../fixtures/${name}.json`),
        JSON.stringify(result.data, null, 2),
      );
    }
    const fixture = JSON.parse(
      await fs.readFile(
        path.join(basedir, `../fixtures/${name}.json`),
        'utf-8',
      ),
    );
    deepEqualOtelJson(result.data, fixture);
  });
};
