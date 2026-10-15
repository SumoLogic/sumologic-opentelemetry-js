import { expect } from '@playwright/test';
import { createComparePageWithFixtureTest } from '../../utils/comparePageWithFixtureTest';

createComparePageWithFixtureTest({
  basedir: __dirname,
  title: 'only URLs from data-allowed-urls are traced',
  name: 'allowed_urls_script_tag',
  flushOnPagehide: true,
  assertTraces: (traces) => {
    const urls: string[] = traces.resourceSpans
      .flatMap((rs: any) => rs.scopeSpans)
      .flatMap((ss: any) => ss.spans)
      .map((span: any) =>
        span.attributes.find((a: any) => a.key === 'url.full'),
      )
      .filter(Boolean)
      .map((a: any) => a.value.stringValue);

    expect(urls.some((url) => url.includes('//localhost:'))).toBe(true);
    expect(urls.filter((url) => url.includes('//127.0.0.1:'))).toEqual([]);
  },
});
