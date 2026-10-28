import { test, expect } from '@playwright/test';
import { Server } from 'http';
import axios from 'axios';
import { startServer } from '../../utils/server';

// The fixture comparison treats URL attributes as "any string", so it can't prove
// that urls are untouched when the feature is off. This test asserts on raw payloads.
test.describe('url sanitization disabled by default', () => {
  let server: Server;
  let port: number;

  test.beforeAll(async () => {
    ({ server, port } = await startServer({ basedir: __dirname }));
  });

  test.afterAll(async () => {
    await server.close();
  });

  const getBatch = (signal: string) =>
    axios
      .get(`http://localhost:${port}/${signal}`, { timeout: 5_000 })
      .then((response) => response.data)
      .catch(() => undefined);

  test('exports urls exactly as captured when urlSanitizationConfig is not set', async ({
    page,
  }) => {
    await page.bringToFront();
    await page.goto(`http://localhost:${port}/url_sanitization_disabled.html`);
    await page.waitForSelector('#flushed', {
      state: 'attached',
      timeout: 10_000,
    });

    const [traces1, logs] = await Promise.all([
      getBatch('traces'),
      getBatch('logs'),
    ]);
    const traces2 = await getBatch('traces');
    const traces = JSON.stringify([traces1, traces2]);
    const logsJson = JSON.stringify(logs);

    const pageUrl = `http://localhost:${port}/url_sanitization_disabled.html?token=pagesecret&page=1#access_token=fragsecret`;
    expect(logsJson).toContain(`"stringValue":"${pageUrl}"`);
    expect(traces).toContain(`"stringValue":"${pageUrl}"`);
    expect(traces).toContain(
      `"stringValue":"http://localhost:${port}/logo.png?api_key=fetchsecret&q=a%20b&flag"`,
    );
    expect(traces + logsJson).not.toContain('REDACTED');
  });
});
