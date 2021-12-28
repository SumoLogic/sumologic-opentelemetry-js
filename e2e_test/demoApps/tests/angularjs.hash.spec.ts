import { test } from '@playwright/test';
import { Server } from 'http';
import { startServer } from '../server/server';
import { DemoAppTestConfig, verifyDemoApp } from '../utils/verifyDemoApp';

const testConfig: DemoAppTestConfig = {
  fixtureName: 'angularjs.hash',
  urlPath: 'angularjs/index_hash.html',
  serverPort: 5015,
};

let server: Server;

test.beforeAll(async () => {
  server = await startServer({ port: testConfig.serverPort });
});

test.afterAll(async () => {
  await server.close();
});

test('test navigation in Angular.js, routing is based on Hash', async ({
  page,
}) => {
  await verifyDemoApp(page, testConfig);
});
