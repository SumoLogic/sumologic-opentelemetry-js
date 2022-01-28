import {
  BasicTracerProvider,
  Span,
  SpanExporter,
  Tracer,
} from '@opentelemetry/sdk-trace-base';
import { ROOT_CONTEXT, SpanKind, TraceFlags } from '@opentelemetry/api';
import { SumoLogicSpanProcessor, SumoLogicSpanProcessorConfig } from './index';
import { resetSessionIdCookie } from './session-id';

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
  let tracer: Tracer;
  let exporter: SpanExporter;
  let span: Span;
  let spanProcessor: SumoLogicSpanProcessor;
  let superOnEnd: jest.Mock;

  beforeEach(() => {
    setDocumentVisibilityState('visible');
    document.dispatchEvent(new Event('visibilitychange'));

    exporter = {
      export() {},
      shutdown() {
        return Promise.resolve();
      },
    };
    tracer = new BasicTracerProvider().getTracer('default');
    span = new Span(
      tracer,
      ROOT_CONTEXT,
      'test',
      { spanId: nextUID(), traceId: nextUID(), traceFlags: TraceFlags.SAMPLED },
      SpanKind.INTERNAL,
    );

    createSpanProcessor({});
  });

  const createSpanProcessor = (config: SumoLogicSpanProcessorConfig) => {
    spanProcessor = new SumoLogicSpanProcessor(exporter, config);

    superOnEnd = jest.fn();
    Object.getPrototypeOf(Object.getPrototypeOf(spanProcessor)).onEnd =
      superOnEnd;
  };

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

  test('drops root spans from instrumentation-user-interaction when there is no children', async () => {
    (span as any).instrumentationLibrary = {
      name: '@opentelemetry/instrumentation-user-interaction',
      version: undefined,
    };
    spanProcessor.onStart(span);
    spanProcessor.onEnd(span);
    jest.runAllTimers();
    await Promise.resolve();
    expect(superOnEnd).not.toBeCalled();
  });

  test('does not drops root spans from instrumentation-user-interaction when dropSingleUserInteractionTraces option is disabled', async () => {
    createSpanProcessor({ dropSingleUserInteractionTraces: false });
    (span as any).instrumentationLibrary = {
      name: '@opentelemetry/instrumentation-user-interaction',
      version: undefined,
    };
    spanProcessor.onStart(span);
    spanProcessor.onEnd(span);
    jest.runAllTimers();
    await Promise.resolve();
    expect(superOnEnd).toBeCalled();
  });

  test('finds context for longtask spans', async () => {
    (span as any).instrumentationLibrary = {
      name: '@opentelemetry/instrumentation-long-task',
      version: undefined,
    };
    const parent = new Span(
      tracer,
      ROOT_CONTEXT,
      'parent test span',
      { spanId: nextUID(), traceId: nextUID(), traceFlags: TraceFlags.SAMPLED },
      SpanKind.INTERNAL,
    );

    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    superOnEnd.mockImplementation((spanToEnd) => {
      if (spanToEnd === parent) {
        resolvePromise();
      }
    });

    spanProcessor.onStart(span);
    spanProcessor.onStart(parent);
    span.end();
    spanProcessor.onEnd(span);
    parent.end();
    spanProcessor.onEnd(parent);

    await promise;

    expect(span.parentSpanId).toBe(parent.spanContext().spanId);
    expect(span.spanContext().traceId).toBe(parent.spanContext().traceId);
  });

  test('longtask spans without context are dropped', () => {
    (span as any).instrumentationLibrary = {
      name: '@opentelemetry/instrumentation-long-task',
      version: undefined,
    };
    spanProcessor.onStart(span);
    spanProcessor.onEnd(span);
    jest.runAllTimers();
    expect(superOnEnd).not.toBeCalled();
  });

  test('enrich non-root xhr spans', () => {
    const xhrSpan = new Span(
      tracer,
      ROOT_CONTEXT,
      'HTTP GET',
      {
        spanId: nextUID(),
        traceId: span.spanContext().traceId,
        traceFlags: TraceFlags.SAMPLED,
      },
      SpanKind.CLIENT,
      span.spanContext().spanId,
    );

    spanProcessor.onStart(span);
    span.attributes['location.href'] =
      'https://www.unit-test-example.com/signup';

    spanProcessor.onStart(xhrSpan);

    expect('xhr.is_root_span' in xhrSpan.attributes).toBe(false);
    expect(xhrSpan.attributes['xhr.root_span.operation']).toBe('test');
    expect(xhrSpan.attributes['xhr.root_span.http.url']).toBe(
      'https://www.unit-test-example.com/signup',
    );
  });

  test('enrich root xhr spans', () => {
    const xhrSpan = new Span(
      tracer,
      ROOT_CONTEXT,
      'HTTP GET',
      {
        spanId: nextUID(),
        traceId: span.spanContext().traceId,
        traceFlags: TraceFlags.SAMPLED,
      },
      SpanKind.CLIENT,
      span.spanContext().spanId,
    );

    spanProcessor.onStart(span);
    span.attributes['location.href'] =
      'https://www.unit-test-example.com/signup';

    spanProcessor.onStart(xhrSpan);

    expect(span.attributes['xhr.is_root_span']).toBe(true);
    expect('xhr.root_span.operation' in span.attributes).toBe(false);
    expect('xhr.root_span.http.url' in span.attributes).toBe(false);

    expect('xhr.is_root_span' in xhrSpan.attributes).toBe(false);
  });

  describe('rum.session_id', () => {
    beforeEach(() => {
      resetSessionIdCookie();
    });

    test('is not added when collectSessionId option is disabled', () => {
      createSpanProcessor({ collectSessionId: false });
      spanProcessor.onStart(span);
      expect('rum.session_id' in span.attributes).toBe(false);
    });

    test('is consistent in started spans', () => {
      const span2 = new Span(
        tracer,
        ROOT_CONTEXT,
        'test2',
        {
          spanId: nextUID(),
          traceId: nextUID(),
          traceFlags: TraceFlags.SAMPLED,
        },
        SpanKind.INTERNAL,
      );
      spanProcessor.onStart(span);
      spanProcessor.onStart(span2);
      expect(typeof span.attributes['rum.session_id']).toBe('string');
      expect(String(span.attributes['rum.session_id']).length).toBe(32);
      expect(span.attributes['rum.session_id']).toBe(
        span2.attributes['rum.session_id'],
      );
    });

    test('is consistent between spans with 5 minutes delay', () => {
      const span2 = new Span(
        tracer,
        ROOT_CONTEXT,
        'test2',
        {
          spanId: nextUID(),
          traceId: nextUID(),
          traceFlags: TraceFlags.SAMPLED,
        },
        SpanKind.INTERNAL,
      );
      jest.setSystemTime(new Date('2022-01-01 10:00').valueOf());
      spanProcessor.onStart(span);
      jest.setSystemTime(new Date('2022-01-01 10:05').valueOf());
      spanProcessor.onStart(span2);
      expect(typeof span.attributes['rum.session_id']).toBe('string');
      expect(span.attributes['rum.session_id']).toBe(
        span2.attributes['rum.session_id'],
      );
    });

    test('is different between spans with more than 5 minutes delay', () => {
      const span2 = new Span(
        tracer,
        ROOT_CONTEXT,
        'test2',
        {
          spanId: nextUID(),
          traceId: nextUID(),
          traceFlags: TraceFlags.SAMPLED,
        },
        SpanKind.INTERNAL,
      );
      jest.setSystemTime(new Date('2022-01-01 10:00').valueOf());
      spanProcessor.onStart(span);
      jest.setSystemTime(new Date('2022-01-01 10:05:01').valueOf());
      spanProcessor.onStart(span2);
      expect(typeof span.attributes['rum.session_id']).toBe('string');
      expect(typeof span2.attributes['rum.session_id']).toBe('string');
      expect(span.attributes['rum.session_id']).not.toBe(
        span2.attributes['rum.session_id'],
      );
    });
  });
});
