import { test } from '@playwright/test';
import { Server } from 'http';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { startServer } from '../../utils/server';
import { deepEqualOtelJson } from '../../utils/deepEqualOtelJson';

let server: Server;

test.beforeAll(async () => {
  server = await startServer({ port: 5002 });
});

test.afterAll(async () => {
  await server.close();
});

test('script should load using legacy way', async ({ page }) => {
  page.on('console', (message) => {
    console.log(message.text());
  });
  page.on('pageerror', (message) => {
    console.error(message);
  });
  await page.goto('http://localhost:5002/loadScript/load_legacy.html');
  const result = await axios.get('http://localhost:5002/traces', {
    timeout: 5_000,
  });
  if ('WRITE_FIXTURES' in process.env) {
    await fs.writeFile(
      path.join(__dirname, '../../fixtures/loadScript/load_legacy.json'),
      JSON.stringify(result.data, null, 2),
    );
  }
  const fixture = JSON.parse(
    await fs.readFile(
      path.join(__dirname, '../../fixtures/loadScript/load_legacy.json'),
      'utf-8',
    ),
  );
  deepEqualOtelJson(result.data, fixture);
});
