import {
  BasicTracerProvider,
  Span,
  SpanExporter,
  Tracer,
} from '@opentelemetry/sdk-trace-base';
import { HrTime, ROOT_CONTEXT, SpanKind, TraceFlags } from '@opentelemetry/api';
import { hrTime, InstrumentationLibrary } from '@opentelemetry/core';
import { SumoLogicSpanProcessor, SumoLogicSpanProcessorConfig } from './index';
import { resetSessionIdCookie } from './session-id';
import { resetSavedSpans } from './find-longtask-context';
import { resetDocumentVisibilityStateChanges } from './document-visibility-state';

delete window.location;
window.location = new URL('https://www.unit-test-example.com');

const nativePerformance = performance;
jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

const setSystemTime = (value: string) => {
  const ms = new Date(value).valueOf();
  jest.setSystemTime(ms);
  Object.defineProperty(nativePerformance, 'timeOrigin', {
    configurable: true,
    get: () => ms,
  });
  Object.defineProperty(nativePerformance, 'now', {
    configurable: true,
    get: () => () => 0,
  });
};

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

  const setInstrumentationLibrary = (
    span: Span,
    instrumentationLibrary: InstrumentationLibrary,
  ): void => {
    (span as any).instrumentationLibrary = instrumentationLibrary;
  };

  const createSpan = (name = 'test', parentSpan?: Span, startTime?: HrTime) =>
    new Span(
      tracer,
      ROOT_CONTEXT,
      name,
      {
        spanId: nextUID(),
        traceId: parentSpan?.spanContext().traceId ?? nextUID(),
        traceFlags: TraceFlags.SAMPLED,
      },
      SpanKind.INTERNAL,
      parentSpan?.spanContext().spanId,
      [],
      startTime,
    );

  const createXhrSpan = (name: string, parentSpan?: Span): Span => {
    const span = createSpan(name, parentSpan);
    (span as any).kind = SpanKind.CLIENT;
    return span;
  };

  const createLongtaskSpan = (): Span => {
    const span = createSpan('longtask');
    setInstrumentationLibrary(span, {
      name: '@opentelemetry/instrumentation-long-task',
      version: undefined,
    });
    return span;
  };

  beforeEach(() => {
    setSystemTime('2022-01-01 10:00');
    resetSavedSpans();
    setDocumentVisibilityState('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    resetDocumentVisibilityStateChanges();

    exporter = {
      export() {},
      shutdown() {
        return Promise.resolve();
      },
    };
    tracer = new BasicTracerProvider().getTracer('default');
    span = createSpan();

    createSpanProcessor({});
  });

  afterEach(() => {
    jest.runAllTimers();
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
      jest.runAllTimers();
      expect(span.attributes['document.visibilityState']).toBe('visible');
    });

    test('when page becomes hidden using "visibilitychange" event', () => {
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      span.end();
      spanProcessor.onEnd(span);
      jest.runAllTimers();
      expect(span.attributes['document.visibilityState']).toBe('hidden');
    });

    test('when page was initially open hidden', () => {
      setDocumentVisibilityState('hidden');
      resetDocumentVisibilityStateChanges();
      // span can be created with a timestamp before RUM script run, e.g. in document-load
      setSystemTime('2022-01-01 09:00');
      span = createSpan();
      spanProcessor.onStart(span);
      setSystemTime('2022-01-01 09:02');
      span.end();
      spanProcessor.onEnd(span);
      jest.runAllTimers();
      expect(span.attributes['document.visibilityState']).toBe('hidden');
    });

    test('when page becomes hidden using "pagehide" event', () => {
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      window.dispatchEvent(new Event('pagehide'));
      span.end();
      spanProcessor.onEnd(span);
      jest.runAllTimers();
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
      jest.runAllTimers();
      expect(span.attributes['document.visibilityState']).toBe('hidden');
    });

    test('for child span ended with custom time', () => {
      setSystemTime('2022-01-01 10:00');
      spanProcessor.onStart(span);
      const childSpan = createSpan('child span', span);
      spanProcessor.onStart(childSpan);
      setSystemTime('2022-01-01 10:01');
      const endTime = hrTime();
      setSystemTime('2022-01-01 10:02');
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      span.end();
      spanProcessor.onEnd(span);
      childSpan.end(endTime); // end time is before page was hidden
      spanProcessor.onEnd(childSpan);
      jest.runAllTimers();
      expect(span.attributes['document.visibilityState']).toBe('hidden');
      expect(childSpan.attributes['document.visibilityState']).toBe('visible');
    });

    test('for root span ended with custom time', () => {
      setSystemTime('2022-01-01 10:00');
      spanProcessor.onStart(span);
      setSystemTime('2022-01-01 10:01');
      const endTime = hrTime();
      setSystemTime('2022-01-01 10:02');
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      span.end(endTime); // end time is before page was hidden
      spanProcessor.onEnd(span);
      jest.runAllTimers();

      // Although page was hidden after span end time, we still marked it as 'hidden'.
      // It's a special case that only applies for root spans.
      // It was introduced to support `documentLoad` page visibility.
      // Because `documentLoad` span ends when page was loaded, there are may be gaps in spans, so there would be no span
      // where we may put the 'pagehide' event.
      expect(span.attributes['document.visibilityState']).toBe('hidden');
    });

    test('for span started with custom time', () => {
      setSystemTime('2022-01-01 10:00');
      setDocumentVisibilityState('hidden'); // page is initially hidden
      document.dispatchEvent(new Event('visibilitychange'));

      setSystemTime('2022-01-01 10:01');
      const startTime = hrTime(); // our root span will start at this point

      setSystemTime('2022-01-01 10:02');
      setDocumentVisibilityState('visible'); // page is visible when span is creating
      document.dispatchEvent(new Event('visibilitychange'));
      span = createSpan('root', undefined, startTime);
      spanProcessor.onStart(span);
      setSystemTime('2022-01-01 10:03');
      span.end();
      spanProcessor.onEnd(span);

      jest.runAllTimers();
      expect(span.attributes['document.visibilityState']).toBe('hidden');
    });
  });

  describe('adds "pageshow" and "pagehide" events', () => {
    test('when page becomes hidden using "visibilitychange" event', () => {
      setSystemTime('2022-01-02 10:00');
      span = createSpan();
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      span.end();
      spanProcessor.onEnd(span);
      jest.runAllTimers();
      expect(span.events.length).toBe(1);
      expect(span.events[0].name).toBe('pagehide');
    });

    test('when page becomes hidden using "pagehide" event', () => {
      setSystemTime('2022-01-03 10:00');
      span = createSpan();
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      window.dispatchEvent(new Event('pagehide'));
      span.end();
      spanProcessor.onEnd(span);
      jest.runAllTimers();
      expect(span.events.length).toBe(1);
      expect(span.events[0].name).toBe('pagehide');
    });

    test('when page was hidden for some time', () => {
      setSystemTime('2022-01-04 10:00');
      span = createSpan();
      spanProcessor.onStart(span);
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      setDocumentVisibilityState('visible');
      window.dispatchEvent(new Event('pageshow'));
      span.end();
      spanProcessor.onEnd(span);
      jest.runAllTimers();
      expect(span.events.length).toBe(2);
      expect(span.events[1].name).toBe('pagehide');
      expect(span.events[0].name).toBe('pageshow');
    });

    test('with visibility changes triggered only between child span start time and end time', () => {
      setSystemTime('2022-01-05 10:00');
      spanProcessor.onStart(span);
      const childSpan = createSpan('child span', span);
      spanProcessor.onStart(childSpan);
      setSystemTime('2022-01-05 10:01');
      const endTime = hrTime();
      setSystemTime('2022-01-05 10:02');
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      span.end();
      spanProcessor.onEnd(span);
      childSpan.end(endTime); // end time is before page was hidden
      spanProcessor.onEnd(childSpan);
      jest.runAllTimers();
      expect(childSpan.events.length).toBe(0);
    });

    test('with visibility changes triggered between root span start time and current time', () => {
      setSystemTime('2022-01-06 10:00');
      spanProcessor.onStart(span);
      setSystemTime('2022-01-06 10:01');
      const endTime = hrTime();
      setSystemTime('2022-01-06 10:02');
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      span.end(endTime); // end time is before page was hidden
      spanProcessor.onEnd(span);
      jest.runAllTimers();
      expect(span.events.length).toBe(1);
      expect(span.events[0].name).toBe('pagehide');
      expect(span.events[0].time[0]).toBeGreaterThan(endTime[0]);
    });
  });

  test('drops root spans from instrumentation-user-interaction when there is no children', () => {
    setInstrumentationLibrary(span, {
      name: '@opentelemetry/instrumentation-user-interaction',
      version: undefined,
    });
    spanProcessor.onStart(span);
    span.end();
    spanProcessor.onEnd(span);
    jest.runAllTimers();
    expect(superOnEnd).not.toBeCalled();
  });

  test('does not drop root spans from instrumentation-user-interaction when dropSingleUserInteractionTraces option is disabled', () => {
    createSpanProcessor({ dropSingleUserInteractionTraces: false });
    setInstrumentationLibrary(span, {
      name: '@opentelemetry/instrumentation-user-interaction',
      version: undefined,
    });
    spanProcessor.onStart(span);
    span.end();
    spanProcessor.onEnd(span);
    jest.runAllTimers();
    expect(superOnEnd).toBeCalled();
  });

  test('finds context for longtask spans', () => {
    setInstrumentationLibrary(span, {
      name: '@opentelemetry/instrumentation-long-task',
      version: undefined,
    });
    const parent = new Span(
      tracer,
      ROOT_CONTEXT,
      'parent test span',
      { spanId: nextUID(), traceId: nextUID(), traceFlags: TraceFlags.SAMPLED },
      SpanKind.INTERNAL,
    );

    spanProcessor.onStart(span);
    spanProcessor.onStart(parent);
    span.end();
    spanProcessor.onEnd(span);
    parent.end();
    spanProcessor.onEnd(parent);

    jest.runAllTimers();
    expect(superOnEnd.mock.calls).toEqual([[span], [parent]]);

    expect(span.parentSpanId).toBe(parent.spanContext().spanId);
    expect(span.spanContext().traceId).toBe(parent.spanContext().traceId);
  });

  test('finds context for longtask spans on spans ended after the longtask', () => {
    setInstrumentationLibrary(span, {
      name: '@opentelemetry/instrumentation-long-task',
      version: undefined,
    });
    const parent = createSpan('parent test span');

    spanProcessor.onStart(parent);
    spanProcessor.onStart(span);
    span.end();
    spanProcessor.onEnd(span);
    parent.end();
    spanProcessor.onEnd(parent);

    jest.runAllTimers();
    expect(superOnEnd.mock.calls).toEqual([[span], [parent]]);

    expect(span.parentSpanId).toBe(parent.spanContext().spanId);
    expect(span.spanContext().traceId).toBe(parent.spanContext().traceId);
  });

  test('longtask spans without context are dropped', () => {
    setInstrumentationLibrary(span, {
      name: '@opentelemetry/instrumentation-long-task',
      version: undefined,
    });
    const parent = createSpan('parent test span');

    // in this case the parent span is not ended so longtask should not be attached
    spanProcessor.onStart(parent);
    spanProcessor.onStart(span);
    spanProcessor.onEnd(span);
    jest.runAllTimers();
    expect(superOnEnd).not.toBeCalled();
  });

  test('enrich non-root xhr span', () => {
    const xhrSpan = createXhrSpan('HTTP GET', span);

    spanProcessor.onStart(span);
    span.attributes['location.href'] =
      'https://www.unit-test-example.com/signup';

    spanProcessor.onStart(xhrSpan);

    span.end();
    spanProcessor.onEnd(span);
    spanProcessor.onEnd(xhrSpan);

    expect(span.attributes['xhr.is_root_span']).toBe(true);
    expect('xhr.is_root_span' in xhrSpan.attributes).toBe(false);

    expect(xhrSpan.attributes['root_span.operation']).toBe('test');
    expect(xhrSpan.attributes['root_span.http.url']).toBe(
      'https://www.unit-test-example.com/signup',
    );
  });

  test('does not enrich root xhr span', () => {
    const xhrSpan = createXhrSpan('HTTP GET');

    spanProcessor.onStart(xhrSpan);
    spanProcessor.onEnd(xhrSpan);

    expect('xhr.is_root_span' in xhrSpan.attributes).toBe(false);
    expect('root_span.operation' in xhrSpan.attributes).toBe(false);
    expect('root_span.http.url' in xhrSpan.attributes).toBe(false);
  });

  test('enrich non-root longtask span', () => {
    const longtaskSpan = createLongtaskSpan();

    spanProcessor.onStart(span);
    span.attributes['location.href'] =
      'https://www.unit-test-example.com/signup';

    spanProcessor.onStart(longtaskSpan);

    span.end();
    spanProcessor.onEnd(span);
    longtaskSpan.end();
    spanProcessor.onEnd(longtaskSpan);

    expect('xhr.is_root_span' in span.attributes).toBe(false);
    expect('xhr.is_root_span' in longtaskSpan.attributes).toBe(false);

    expect(longtaskSpan.attributes['root_span.operation']).toBe('test');
    expect(longtaskSpan.attributes['root_span.http.url']).toBe(
      'https://www.unit-test-example.com/signup',
    );
    expect('longtask.type' in longtaskSpan.attributes).toBe(false);
  });

  test('enrich longtask span in documentLoad trace', () => {
    span.name = 'documentLoad';
    setInstrumentationLibrary(span, {
      name: '@opentelemetry/instrumentation-document-load',
    });

    const longtaskSpan = createLongtaskSpan();

    spanProcessor.onStart(span);
    spanProcessor.onStart(longtaskSpan);

    span.end();
    spanProcessor.onEnd(span);
    longtaskSpan.end();
    spanProcessor.onEnd(longtaskSpan);

    expect(longtaskSpan.attributes['http.action_type']).toBe('document_loads');
    expect(longtaskSpan.attributes['root_span.operation']).toBe('documentLoad');
    expect(longtaskSpan.attributes['root_span.http.url']).toBe(
      'https://www.unit-test-example.com/',
    );
  });

  test('enrich longtask span in xhr trace', () => {
    const xhrSpan = createXhrSpan('HTTP POST', span);
    const longtaskSpan = createLongtaskSpan();

    spanProcessor.onStart(span);
    spanProcessor.onStart(xhrSpan);
    spanProcessor.onStart(longtaskSpan);

    longtaskSpan.end();
    spanProcessor.onEnd(longtaskSpan);
    span.end();
    spanProcessor.onEnd(span);
    xhrSpan.end();
    spanProcessor.onEnd(xhrSpan);

    expect(span.attributes['xhr.is_root_span']).toBe(true);
    expect(longtaskSpan.attributes['http.action_type']).toBe('xhr_requests');
  });

  test('enrich longtask span in navigation trace', () => {
    span.name = 'Navigation: /hello';
    setInstrumentationLibrary(span, {
      name: '@opentelemetry/instrumentation-user-interaction',
    });

    const xhrSpan = createXhrSpan('HTTP POST', span);
    const longtaskSpan = createLongtaskSpan();

    spanProcessor.onStart(span);
    spanProcessor.onStart(xhrSpan);
    spanProcessor.onStart(longtaskSpan);

    longtaskSpan.end();
    spanProcessor.onEnd(longtaskSpan);
    span.end();
    spanProcessor.onEnd(span);
    xhrSpan.end();
    spanProcessor.onEnd(xhrSpan);

    expect(span.attributes['xhr.is_root_span']).toBe(true);
    expect(longtaskSpan.attributes['http.action_type']).toBe('route_changes');
  });

  test('enrich longtask span in trace, that was updated as navigation trace', () => {
    span.name = `click on 'This is DIV'`;
    setInstrumentationLibrary(span, {
      name: '@opentelemetry/instrumentation-user-interaction',
    });

    const xhrSpan = createXhrSpan('HTTP POST', span);
    const longtaskSpan = createLongtaskSpan();

    spanProcessor.onStart(span);
    spanProcessor.onStart(xhrSpan);
    spanProcessor.onStart(longtaskSpan);

    longtaskSpan.end();
    spanProcessor.onEnd(longtaskSpan);

    xhrSpan.end();
    spanProcessor.onEnd(xhrSpan);

    expect(longtaskSpan.attributes['http.action_type']).toBe('xhr_requests');

    span.name = 'Navigation: /hello';

    span.end();
    spanProcessor.onEnd(span);

    expect(longtaskSpan.attributes['http.action_type']).toBe('route_changes');
  });

  test('does not enrich root longtask span', () => {
    const longtaskSpan = createLongtaskSpan();

    spanProcessor.onStart(longtaskSpan);
    longtaskSpan.end();
    spanProcessor.onEnd(longtaskSpan);

    expect('longtask.type' in longtaskSpan.attributes).toBe(false);
    expect('root_span.operation' in longtaskSpan.attributes).toBe(false);
    expect('root_span.http.url' in longtaskSpan.attributes).toBe(false);
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
      const span2 = createSpan('test2');
      spanProcessor.onStart(span);
      spanProcessor.onStart(span2);
      expect(typeof span.attributes['rum.session_id']).toBe('string');
      expect(String(span.attributes['rum.session_id']).length).toBe(32);
      expect(span.attributes['rum.session_id']).toBe(
        span2.attributes['rum.session_id'],
      );
    });

    test('is consistent between spans with 5 minutes delay', () => {
      const span2 = createSpan('test2');
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
      const span2 = createSpan('test2');
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

  test('http.longtasks_sum metric is properly calculated', () => {
    setSystemTime('2022-01-01 10:00');
    const longtask1 = createLongtaskSpan();
    spanProcessor.onStart(span);
    spanProcessor.onStart(longtask1);

    setSystemTime('2022-01-01 10:10');
    longtask1.end();
    spanProcessor.onEnd(longtask1);

    setSystemTime('2022-01-01 10:15');
    const longtask2 = createLongtaskSpan();
    spanProcessor.onStart(longtask2);

    setSystemTime('2022-01-01 10:16');
    span.end();
    spanProcessor.onEnd(span);

    setSystemTime('2022-01-01 10:20');
    longtask2.end();
    spanProcessor.onEnd(longtask2);

    jest.runAllTimers();

    // the root span (span) is ended at last even though originally it was called after longtask1
    expect(superOnEnd.mock.calls).toEqual([[longtask1], [longtask2], [span]]);

    expect(span.attributes['http.longtasks_sum']).toBe(
      (10 + 5) * 60 * 1000_000_000, // 10 seconds of longtask1, 5 seconds of longtask2 in nanoseconds
    );
  });
});
