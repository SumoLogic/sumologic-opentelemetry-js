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

    let rowTracesFixture: string | undefined;
    let rowLogsFixture: string | undefined;

    try {
      rowTracesFixture = await fs.readFile(
        path.join(basedir, `../fixtures/${name}.traces.json`),
        'utf-8',
      );
    } catch (error) {
      // NOP
    }

    try {
      rowLogsFixture = await fs.readFile(
        path.join(basedir, `../fixtures/${name}.logs.json`),
        'utf-8',
      );
    } catch (error) {
      // NOP
    }

    const [resultTraces, resultLogs] = await Promise.all([
      rowTracesFixture
        ? axios.get(`http://localhost:${port}/traces`, {
            timeout: 5_000,
          })
        : undefined,
      rowLogsFixture
        ? axios.get(`http://localhost:${port}/logs`, {
            timeout: 5_000,
          })
        : undefined,
    ]);
    if ('WRITE_FIXTURES' in process.env) {
      if (resultTraces != null) {
        await fs.writeFile(
          path.join(basedir, `../fixtures/${name}.traces.json`),
          JSON.stringify(resultTraces.data, null, 2),
        );
      }
      if (resultLogs != null) {
        await fs.writeFile(
          path.join(basedir, `../fixtures/${name}.logs.json`),
          JSON.stringify(resultLogs.data, null, 2),
        );
      }
    } else {
      if (rowTracesFixture != null) {
        deepEqualOtelJson(
          resultTraces!.data,
          JSON.parse(rowTracesFixture),
          `${name}.traces`,
        );
      }

      if (rowLogsFixture != null) {
        deepEqualOtelJson(
          resultLogs!.data,
          JSON.parse(rowLogsFixture),
          `${name}.logs`,
        );
      }
    }
  });
};
