import { Context, HrTime } from '@opentelemetry/api';
import { hrTime, hrTimeToNanoseconds } from '@opentelemetry/core';
import { Span as SdkTraceSpan } from '@opentelemetry/sdk-trace-base';

const INSTRUMENTATION_FETCH = '@opentelemetry/instrumentation-fetch';
const INSTRUMENTATION_XHR = '@opentelemetry/instrumentation-xml-http-request';
const MAX_STORED_TRACE_IDS = 50;

const rootSpansByTraceId: Record<string, SdkTraceSpan> = {};
const storedTraceIds: string[] = [];

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  const instrumentationName = span.instrumentationLibrary.name;
  const { parentSpanId } = span;
  if (
    // instrument non-root xhr spans
    parentSpanId &&
    (instrumentationName === INSTRUMENTATION_FETCH ||
      instrumentationName === INSTRUMENTATION_XHR)
  ) {
    const rootSpan = rootSpansByTraceId[span.spanContext().traceId];
    if (rootSpan) {
      span.setAttribute('xhr.root_span.operation', rootSpan.name);
      span.setAttribute(
        'xhr.root_span.http.url',
        rootSpan.attributes['location.href'],
      );
    }
  } else if (!parentSpanId) {
    // save root spans for later use
    const { traceId } = span.spanContext();
    rootSpansByTraceId[traceId] = span;
    storedTraceIds.push(traceId);
    if (storedTraceIds.length > MAX_STORED_TRACE_IDS) {
      const traceIdToRemove = storedTraceIds.shift()!;
      delete rootSpansByTraceId[traceIdToRemove];
    }
  }
};
