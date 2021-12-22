import { test } from '@playwright/test';
import { Server } from 'http';
import { startServer } from '../../utils/server';
import { DemoAppTestConfig, verifyDemoApp } from '../../utils/verifyDemoApp';

const testConfig: DemoAppTestConfig = {
  fixtureName: 'react.hash',
  urlPath: 'react/index_hash.html',
  serverPort: 5010,
};

let server: Server;

test.beforeAll(async () => {
  server = await startServer({ port: testConfig.serverPort });
});

test.afterAll(async () => {
  await server.close();
});

test('test navigation in React, routing is based on Hash', async ({ page }) => {
  await verifyDemoApp(page, testConfig);
});
