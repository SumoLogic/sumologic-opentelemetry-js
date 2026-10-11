import { TextEncoder, TextDecoder } from 'util';
import { SumoLogicLogsExporter } from './index';
import { createUrlSanitizer } from '../utils';
import { resourceFromAttributes } from '@opentelemetry/resources';

Object.assign(global, { TextEncoder, TextDecoder });

describe('SumoLogicLogsExporter url sanitization', () => {
  const record = (sanitizeUrl?: (url: string) => string) => {
    const exporter = new SumoLogicLogsExporter({
      resource: resourceFromAttributes({}),
      attributes: {},
      collectorUrl: 'https://collector/v1/logs',
      maxQueueSize: 1, // export immediately
      scheduledDelayMillis: 1000,
      sanitizeUrl,
    });
    exporter.recordLog({
      type: 'customError',
      message: 'boom',
      attributes: { 'http.url': 'https://a.com/x?token=abc#access_token=t' },
    });
  };

  beforeEach(() => {
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: () => false, // force the fetch path so the body is a plain string
    });
    global.fetch = jest.fn() as any;
  });

  const sentBody = () => (global.fetch as jest.Mock).mock.calls[0][1].body;

  test('redacts http.url when a sanitizer is given', () => {
    record(createUrlSanitizer({ enabled: true }));
    const body = sentBody();
    expect(body).toContain('token=REDACTED');
    expect(body).toContain('access_token=REDACTED');
    expect(body).not.toContain('token=abc');
  });

  test('leaves http.url untouched without a sanitizer', () => {
    record();
    expect(sentBody()).toContain('token=abc');
  });
});
