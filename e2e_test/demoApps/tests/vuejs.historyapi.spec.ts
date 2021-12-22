import { test } from '@playwright/test';
import { Server } from 'http';
import { startServer } from '../server/server';
import { DemoAppTestConfig, verifyDemoApp } from '../utils/verifyDemoApp';

const testConfig: DemoAppTestConfig = {
  fixtureName: 'vuejs.historyapi',
  urlPath: 'vuejs/',
  serverPort: 5012,
};

let server: Server;

test.beforeAll(async () => {
  server = await startServer({ port: testConfig.serverPort });
});

test.afterAll(async () => {
  await server.close();
});

test('test navigation in Vue.js, routing is based on History API', async ({
  page,
}) => {
  await verifyDemoApp(page, testConfig);
});
