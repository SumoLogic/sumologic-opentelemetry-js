import fs from 'fs/promises';
import path from 'path';
import { deepEqualOtelJson } from './deepEqualOtelJson';
import { expect, test } from '@playwright/test';
import axios from 'axios';
import { Server } from 'http';
import { startServer } from './server';

const verifyData = async (
  basedir: string,
  data: unknown,
  fixtureName: string,
): Promise<void> => {
  if ('WRITE_FIXTURES' in process.env) {
    await fs.writeFile(
      path.join(basedir, `../fixtures/${fixtureName}.json`),
      JSON.stringify(data, null, 2),
    );
  }

  const fixture = JSON.parse(
    await fs.readFile(
      path.join(basedir, `../fixtures/${fixtureName}.json`),
      'utf-8',
    ),
  );

  deepEqualOtelJson(data, fixture);
};

export interface DemoAppTestConfig {
  basedir: string;
  title: string;
  fixtureName: string;
  urlPath: string;
}

export const createVerifyDemoAppTest = async ({
  basedir,
  title,
  urlPath,
  fixtureName,
}: DemoAppTestConfig): Promise<void> => {
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

    page
      .on('console', (message) => {
        console.log(message.text());
      })
      .on('pageerror', (message) => {
        console.error(message);
      });

    await page.route('https://swapi.dev/api/planets', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        path: path.join(basedir, '../fixtures/planets.json'),
        headers: {
          'access-control-allow-origin': '*',
        },
      });
    });

    const httpServerUrl = `http://localhost:${port}`;

    await page.goto(`${httpServerUrl}/${urlPath}`);

    const planetsTitle = page.locator('h1').first();
    await expect(planetsTitle).toHaveText('Planets');

    const firstBatch = await axios.get(`${httpServerUrl}/traces`, {
      timeout: 5_000,
    });

    await verifyData(basedir, firstBatch.data, `${fixtureName}-first-batch`);

    // click at the third item on the list
    await page.click('text=Yavin XIV');

    const planetTitle = page.locator('h1').first();
    await expect(planetTitle).toHaveText('Planet');

    const secondBatch = await axios.get(`${httpServerUrl}/traces`, {
      timeout: 5_000,
    });

    await verifyData(basedir, secondBatch.data, `${fixtureName}-second-batch`);
  });
};
