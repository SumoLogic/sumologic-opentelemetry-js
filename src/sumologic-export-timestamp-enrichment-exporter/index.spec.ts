import { SpanKind, SpanStatusCode, TraceFlags } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { ExportTimestampEnrichmentExporter } from '.';

const nativePerformance = performance;

beforeAll(() => {
  const ms = new Date('2020-10-01').getTime();
  jest.useFakeTimers('modern').setSystemTime(ms);
  Object.defineProperty(nativePerformance, 'timeOrigin', {
    configurable: true,
    get: () => ms,
  });
  Object.defineProperty(nativePerformance, 'now', {
    configurable: true,
    get: () => () => 0,
  });
});

afterAll(() => {
  jest.useRealTimers();
});

describe('ExportTimestampEnrichmentExporter', () => {
  let exporter: SpanExporter;
  let originalExporter: jest.Mocked<SpanExporter>;
  const resultCallback = () => {};
  const readableSpan: ReadableSpan = {
    name: 'my-span',
    kind: SpanKind.INTERNAL,
    spanContext: () => ({
      traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      spanId: '6e0c63257de34c92',
      traceFlags: TraceFlags.NONE,
    }),
    startTime: [1566156729, 709],
    endTime: [1566156731, 709],
    ended: true,
    status: {
      code: SpanStatusCode.OK,
    },
    attributes: {},
    parentSpanId: '3e0c63257de34c92',
    links: [
      {
        context: {
          traceId: 'a4cda95b652f4a1592b449d5929fda1b',
          spanId: '3e0c63257de34c92',
          traceFlags: TraceFlags.NONE,
        },
      },
    ],
    events: [],
    duration: [32, 800000000],
    resource: Resource.empty(),
    instrumentationLibrary: {
      name: 'default',
      version: '0.0.1',
    },
  };

  beforeEach(() => {
    originalExporter = {
      export: jest.fn(),
      shutdown: jest.fn(),
    };
    exporter = new ExportTimestampEnrichmentExporter(originalExporter);
  });

  test('call shutdown on the original exporter', () => {
    exporter.shutdown();
    expect(originalExporter.shutdown.mock.calls).toEqual([[]]);
  });

  test('calls export on the original exporter', () => {
    const spans: ReadableSpan[] = [];
    exporter.export(spans, resultCallback);
    expect(originalExporter.export.mock.calls).toEqual([
      [spans, resultCallback],
    ]);
  });

  test('fills the given spans with sumologic.telemetry.sdk.export_timestamp resource attribute and pass it to the original exporter', () => {
    const resource1 = Resource.empty();
    const resource2 = new Resource({ label1: 'first value' });
    const spans: ReadableSpan[] = [
      {
        ...readableSpan,
        resource: resource1,
      },
      {
        ...readableSpan,
        resource: resource2,
      },
    ];

    originalExporter.export.mockImplementation((spans) => {
      expect(spans).toEqual([
        {
          ...readableSpan,
          resource: new Resource({
            'sumologic.telemetry.sdk.export_timestamp': 1601510400000,
          }),
        },
        {
          ...readableSpan,
          resource: new Resource({
            label1: 'first value',
            'sumologic.telemetry.sdk.export_timestamp': 1601510400000,
          }),
        },
      ]);
    });

    exporter.export(spans, resultCallback);
    expect(originalExporter.export.mock.calls).toEqual([
      [spans, resultCallback],
    ]);
  });
});
