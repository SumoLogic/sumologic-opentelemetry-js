import { test, expect } from '@playwright/test';
import { Server } from 'http';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { startServer } from '../../utils/server';

// The fixture comparison helper treats URL attributes as "any string", so it cannot
// verify redaction. This test asserts on the raw exported payloads instead.
test.describe('url sanitization', () => {
  let server: Server;
  let port: number;

  test.beforeAll(async () => {
    ({ server, port } = await startServer({ basedir: __dirname }));
  });

  test.afterAll(async () => {
    await server.close();
  });

  // traces may be exported in two batches (document load first, fetch/xhr after);
  // the second request only resolves if a second batch arrives
  const getBatch = (signal: string) =>
    axios
      .get(`http://localhost:${port}/${signal}`, { timeout: 5_000 })
      .then((response) => response.data)
      .catch(() => undefined);

  const URL_KEYS = new Set([
    'url.full',
    'http.url',
    'location.href',
    'new.location.href',
    'root_span.http.url',
  ]);

  // collects every URL attribute value from an OTLP json payload
  const collectUrls = (node: any, urls: Set<string>) => {
    if (Array.isArray(node)) {
      node.forEach((child) => collectUrls(child, urls));
    } else if (node && typeof node === 'object') {
      if (URL_KEYS.has(node.key) && node.value?.stringValue) {
        urls.add(node.value.stringValue.replace(`:${port}`, ':{{port}}'));
      }
      Object.values(node).forEach((child) => collectUrls(child, urls));
    }
  };

  test('redacts sensitive params in page, fetch and xhr urls across traces and logs', async ({
    page,
  }) => {
    await page.bringToFront();
    await page.goto(`http://localhost:${port}/url_sanitization.html`);
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
    const all = traces + logsJson;

    // no secret value leaks anywhere
    for (const secret of [
      'pagesecret',
      'fragsecret',
      'customsecret',
      'fetchsecret',
      'casesecret',
      'googsecret',
      'sigsecret',
      'idsecret',
      'customfetchsecret',
      'xhrsecret',
    ]) {
      expect(all).not.toContain(secret);
    }

    // page url: query + fragment redacted in logs (http.url) and traces (location.href / url.full)
    for (const payload of [logsJson, traces]) {
      expect(payload).toContain('token=REDACTED');
      expect(payload).toContain('custom_secret=REDACTED');
      expect(payload).toContain('access_token=REDACTED');
      expect(payload).toContain('page=1');
      expect(payload).toContain('state=1');
    }

    // fetch / xhr span urls: redacted, non-sensitive params kept
    expect(traces).toContain('api_key=REDACTED');
    expect(traces).toContain('page=2');
    expect(traces).toContain('TOKEN=REDACTED'); // case-insensitive
    expect(traces).toContain('keep=1');
    expect(traces).toContain('X-Goog-Signature=REDACTED');
    expect(traces).toContain('sig=REDACTED');
    expect(traces).toContain('id_token=REDACTED');
    expect(traces).toContain('X-Amz-Signature=REDACTED');
    expect(traces).toContain('planet=3');

    // excludeDefaultParams: built-in `hash` is opted out, so it stays readable
    expect(logsJson).toContain('hash=keepme');
    expect(traces).toContain('hash=hashkept');

    // exact snapshot of every exported url; regenerate with WRITE_FIXTURES=1
    const urls = new Set<string>();
    collectUrls([traces1, traces2, logs], urls);
    const actualUrls = Array.from(urls).sort();
    const fixturePath = path.join(
      __dirname,
      '../fixtures/url_sanitization.urls.json',
    );
    if ('WRITE_FIXTURES' in process.env) {
      await fs.writeFile(fixturePath, JSON.stringify(actualUrls, null, 2));
    } else {
      expect(actualUrls).toEqual(
        JSON.parse(await fs.readFile(fixturePath, 'utf-8')),
      );
    }
  });
});
