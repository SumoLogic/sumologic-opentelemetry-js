import { test, expect } from '@playwright/test';
import { Server } from 'http';
import axios from 'axios';
import { startServer } from '../../utils/server';

test.describe('url sanitization of web vitals logs', () => {
  let server: Server;
  let port: number;

  test.beforeAll(async () => {
    ({ server, port } = await startServer({ basedir: __dirname }));
  });

  test.afterAll(async () => {
    await server.close();
  });

  test('redacts http.url of every web vital log', async ({ page }) => {
    page.on('console', (message) => console.log(message.text()));
    page.on('pageerror', (error) => console.error(error));
    // same lifecycle as comparePageWithFixtureTest: visible page, trusted click for INP, then flush
    await page.bringToFront();
    // secret is in the loaded url, which web vitals report as navigationURL
    await page.goto(
      `http://localhost:${port}/url_sanitization_web_vitals.html?token=vitalsecret&page=1`,
    );
    const inpTarget = (await page.$('#inp-target'))!;
    await inpTarget.waitForElementState('visible');
    // let web-vitals attach its input listeners before the click (same as comparePageWithFixtureTest);
    // the /logs request below then waits for the actual export, so no timing guess there
    await new Promise((resolve) => setTimeout(resolve, 500));
    await inpTarget.click();
    await page.waitForSelector('#vitals-flushed', {
      state: 'attached',
      timeout: 10_000,
    });

    const logs = await axios
      .get(`http://localhost:${port}/logs`, { timeout: 5_000 })
      .then((response) => response.data);

    const vitals = logs.resourceLogs
      .flatMap((r: any) => r.scopeLogs)
      .flatMap((s: any) => s.logRecords)
      .map((record: any) =>
        Object.fromEntries(
          record.attributes.map((a: any) => [a.key, a.value.stringValue]),
        ),
      )
      .filter((attrs: any) => attrs.type === 'webVital');

    expect(vitals.length).toBeGreaterThan(0);
    for (const attrs of vitals) {
      expect(attrs['http.url']).toBe(
        `http://localhost:${port}/url_sanitization_web_vitals.html?token=REDACTED&page=1`,
      );
    }
    // LCP attribution `url` is the image url, with its secret redacted
    const lcp = vitals.find(
      (attrs: any) => attrs['browser.web_vital.name'] === 'lcp',
    );
    expect(lcp['browser.web_vital.attribution.url']).toBe(
      `http://localhost:${port}/lcp-image.png?sig=REDACTED&w=200`,
    );

    // raw entry objects are documented as not sanitized: exported exactly as captured
    const ttfb = vitals.find(
      (attrs: any) => attrs['browser.web_vital.name'] === 'ttfb',
    );
    expect(ttfb['browser.web_vital.attribution.navigationEntry']).toContain(
      `"name":"http://localhost:${port}/url_sanitization_web_vitals.html?token=vitalsecret&page=1"`,
    );

    // every other place the page url appears is redacted
    const withoutRawEntries = JSON.stringify(logs).replace(
      /browser\.web_vital\.attribution\.navigationEntry[^}]*}/g,
      '',
    );
    expect(withoutRawEntries).not.toContain('vitalsecret');
    expect(JSON.stringify(logs)).not.toContain('imagesecret');
  });
});
