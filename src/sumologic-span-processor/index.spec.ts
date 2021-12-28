import {
  BasicTracerProvider,
  Span,
  SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { ROOT_CONTEXT, SpanKind, TraceFlags } from '@opentelemetry/api';
import { SumoLogicSpanProcessor } from './index';

delete window.location;
window.location = new URL('https://www.unit-test-example.com');

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

const setDocumentVisibilityState = (value: string) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: function () {
      return value;
    },
  });
};

let lastUID = 0;
const nextUID = () => String(lastUID++);

describe('SumoLogicSpanProcessor', () => {
  let span: Span;
  let spanProcessor: SumoLogicSpanProcessor;
  let superOnEnd: jest.Mock;

  beforeEach(() => {
    setDocumentVisibilityState('visible');
    document.dispatchEvent(new Event('visibilitychange'));

    const exporter: SpanExporter = {
      export() {},
      shutdown() {
        return Promise.resolve();
      },
    };
    const tracer = new BasicTracerProvider().getTracer('default');
    span = new Span(
      tracer,
      ROOT_CONTEXT,
      'test',
      { spanId: nextUID(), traceId: nextUID(), traceFlags: TraceFlags.SAMPLED },
      SpanKind.INTERNAL,
    );
    spanProcessor = new SumoLogicSpanProcessor(exporter, {});

    superOnEnd = jest.fn();
    Object.getPrototypeOf(Object.getPrototypeOf(spanProcessor)).onEnd =
      superOnEnd;
  });

  test('adds "location.href" attribute', () => {
    spanProcessor.onStart(span);
    expect(span.attributes['location.href']).toBe(
      'https://www.unit-test-example.com/',
    );
  });

  describe('adds "document.visibilityState"', () => {
    test('when page is visible', () => {
      spanProcessor.onStart(span);
      spanProcessor.onEnd(span);
      expect(span.attributes['document.visibilityState']).toBe('visible');
    });

    test('when page becomes hidden using "visibilitychange" event', () => {
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      span.end();
      spanProcessor.onEnd(span);
      expect(span.attributes['document.visibilityState']).toBe('hidden');
    });

    test('when page becomes hidden using "pagehide" event', () => {
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      window.dispatchEvent(new Event('pagehide'));
      span.end();
      spanProcessor.onEnd(span);
      expect(span.attributes['document.visibilityState']).toBe('hidden');
    });

    test('when page was hidden for some time', () => {
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      setDocumentVisibilityState('visible');
      window.dispatchEvent(new Event('pageshow'));
      span.end();
      spanProcessor.onEnd(span);
      expect(span.attributes['document.visibilityState']).toBe('hidden');
    });
  });

  describe('adds "pageshow" and "pagehide" events', () => {
    test('when page becomes hidden using "visibilitychange" event', () => {
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      span.end();
      spanProcessor.onEnd(span);
      expect(span.events.length).toBe(1);
      expect(span.events[0].name).toBe('pagehide');
    });

    test('when page becomes hidden using "pagehide" event', () => {
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      window.dispatchEvent(new Event('pagehide'));
      span.end();
      spanProcessor.onEnd(span);
      expect(span.events.length).toBe(1);
      expect(span.events[0].name).toBe('pagehide');
    });

    test('when page was hidden for some time', () => {
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      setDocumentVisibilityState('visible');
      window.dispatchEvent(new Event('pageshow'));
      span.end();
      spanProcessor.onEnd(span);
      expect(span.events.length).toBe(2);
      expect(span.events[1].name).toBe('pagehide');
      expect(span.events[0].name).toBe('pageshow');
    });
  });

  test('drops root spans from instrumentation-user-interaction when there is no children', () => {
    (span.instrumentationLibrary as any).name =
      '@opentelemetry/instrumentation-user-interaction';
    spanProcessor.onStart(span);
    spanProcessor.onEnd(span);
    jest.runAllTimers();
    expect(superOnEnd).not.toBeCalled();
  });
});
