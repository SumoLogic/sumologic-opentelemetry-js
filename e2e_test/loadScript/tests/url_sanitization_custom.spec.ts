import { test, expect } from '@playwright/test';
import { Server } from 'http';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { startServer } from '../../utils/server';

// The fixture comparison helper treats URL attributes as "any string", so it cannot
// verify redaction. This test asserts on the raw exported payloads instead.
test.describe('url sanitization with a throwing custom sanitizer', () => {
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

  test('a throwing custom sanitizer still exports spans and logs, with urls redacted', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await page.bringToFront();
    await page.goto(`http://localhost:${port}/url_sanitization_custom.html`);
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

    // export still works
    expect(traces).toContain('documentLoad');
    expect(traces).toContain('HTTP GET');
    expect(logsJson).toContain('Custom error');

    // fails closed: no raw url leaks, attribute stays a string
    expect(traces + logsJson).not.toContain('pagesecret');
    expect(traces + logsJson).not.toContain('fetchsecret');
    const urls = new Set<string>();
    collectUrls([traces1, traces2, logs], urls);
    expect(Array.from(urls)).toEqual(['REDACTED']);

    expect(pageErrors.map((e) => e.message)).not.toContain('sanitizer bug');
  });
});
