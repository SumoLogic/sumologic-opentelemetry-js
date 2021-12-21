import { test } from '@playwright/test';
import { Server } from 'http';
import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import { startServer } from '../utils/server';
import { deepEqualOtelJson } from '../utils/deepEqualOtelJson';

let server: Server;

test.beforeAll(async () => {
  server = await startServer({ port: 5000 });
});

test.afterAll(async () => {
  await server.close();
});

test('script should load synchronously', async ({ page }) => {
  page.on('console', (message) => {
    console.log(message.text());
  });
  page.on('pageerror', (message) => {
    console.error(message);
  });
  await page.goto('http://localhost:5000/load_sync.html');
  const result = await axios.get('http://localhost:5000/traces', {
    timeout: 5_000,
  });
  if ('WRITE_FIXTURES' in process.env) {
    await fs.writeFile(
      path.join(__dirname, '../fixtures/load_sync.json'),
      JSON.stringify(result.data, null, 2),
    );
  }
  const fixture = JSON.parse(
    await fs.readFile(
      path.join(__dirname, '../fixtures/load_sync.json'),
      'utf-8',
    ),
  );
  deepEqualOtelJson(result.data, fixture);
});
