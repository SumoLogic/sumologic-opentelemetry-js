import fs from 'fs/promises';
import path from 'path';
import { deepEqualOtelJson } from './../../utils/deepEqualOtelJson';
import { expect, Page } from '@playwright/test';
import axios from 'axios';

const verifyData = async (
  data: unknown,
  fixtureName: string,
): Promise<void> => {
  if ('WRITE_FIXTURES' in process.env) {
    await fs.writeFile(
      path.join(__dirname, `../fixtures/${fixtureName}.json`),
      JSON.stringify(data, null, 2),
    );
  }

  const fixture = JSON.parse(
    await fs.readFile(
      path.join(__dirname, `../fixtures/${fixtureName}.json`),
      'utf-8',
    ),
  );

  deepEqualOtelJson(data, fixture);
};

export interface DemoAppTestConfig {
  fixtureName: string;
  urlPath: string;
  serverPort: number;
}

export const verifyDemoApp = async (
  page: Page,
  { urlPath, fixtureName, serverPort }: DemoAppTestConfig,
): Promise<void> => {
  const HTTP_SERVER_URL = `http://localhost:${serverPort}`;

  page.addInitScript(() => {
    const supportedEntryTypes = PerformanceObserver.supportedEntryTypes.filter(
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
      path: './e2e_test/demoApps/fixtures/planets.json',
      headers: {
        'access-control-allow-origin': '*',
      },
    });
  });

  await page.goto(`${HTTP_SERVER_URL}/${urlPath}`);

  const planetsTitle = page.locator('h1').first();
  await expect(planetsTitle).toHaveText('Planets');

  const firstBatch = await axios.get(`${HTTP_SERVER_URL}/traces`, {
    timeout: 5_000,
  });

  await verifyData(firstBatch.data, `${fixtureName}-first-batch`);

  // click at the third item on the list
  await page.click('text=Yavin XIV');

  const planetTitle = page.locator('h1').first();
  await expect(planetTitle).toHaveText('Planet');

  const secondBatch = await axios.get(`${HTTP_SERVER_URL}/traces`, {
    timeout: 5_000,
  });

  await verifyData(secondBatch.data, `${fixtureName}-second-batch`);
};