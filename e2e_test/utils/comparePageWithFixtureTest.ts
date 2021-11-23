import { test } from '@playwright/test';
import { Server } from 'http';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { startServer } from './server';
import { deepEqualOtelJson } from '../utils/deepEqualOtelJson';

interface ComparePageWithFixtureTestOptions {
  title: string;
  name: string;
}

export const createComparePageWithFixtureTest = ({
  title,
  name,
}: ComparePageWithFixtureTestOptions) => {
  let server: Server;
  let port: number;

  test.beforeAll(async () => {
    ({ server, port } = await startServer());
  });

  test.afterAll(async () => {
    await server.close();
  });

  test(title, async ({ page }) => {
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
        path.join(__dirname, `../fixtures/${name}.json`),
        JSON.stringify(result.data, null, 2),
      );
    }
    const fixture = JSON.parse(
      await fs.readFile(
        path.join(__dirname, `../fixtures/${name}.json`),
        'utf-8',
      ),
    );
    deepEqualOtelJson(result.data, fixture);
  });
};
