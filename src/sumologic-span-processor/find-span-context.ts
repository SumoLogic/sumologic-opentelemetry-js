import { Context, trace, Span, HrTime } from '@opentelemetry/api';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import {
  Span as SdkTraceSpan,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';

const INSTRUMENTATION_LONG_TASK = '@opentelemetry/instrumentation-long-task';
const LONGTASK_PRECISION_NS = 1e7; // 10 milliseconds
const MAX_DELAY_FOR_SPAN_ATTACHEMENT_NS = 1e9; // 1 second
const MAX_SPANS_SIZE = 100;

const spans: SdkTraceSpan[] = [];

const findBestSpanInTime = (
  startTimeHrTime: HrTime,
  endTimeHrTime: HrTime,
): SdkTraceSpan | undefined => {
  const startTime = hrTimeToNanoseconds(startTimeHrTime);
  const endTime = hrTimeToNanoseconds(endTimeHrTime);

  // span where the whole longtask fit is the perfect choice
  for (let i = spans.length - 1; i >= 0; i -= 1) {
    const span = spans[i];
    if (
      span.instrumentationLibrary.name !== INSTRUMENTATION_LONG_TASK &&
      hrTimeToNanoseconds(span.startTime) - LONGTASK_PRECISION_NS <=
        startTime &&
      (!span.ended ||
        hrTimeToNanoseconds(span.endTime) + LONGTASK_PRECISION_NS >= endTime)
    ) {
      return span;
    }
  }

  // if not we will attach it to the span that ends no longer than some timeout
  for (let i = spans.length - 1; i >= 0; i -= 1) {
    const span = spans[i];
    if (
      span.instrumentationLibrary.name !== INSTRUMENTATION_LONG_TASK &&
      !span.parentSpanId &&
      hrTimeToNanoseconds(span.startTime) - LONGTASK_PRECISION_NS <=
        startTime &&
      (!span.ended ||
        hrTimeToNanoseconds(span.endTime) + MAX_DELAY_FOR_SPAN_ATTACHEMENT_NS >=
          startTime)
    ) {
      return span;
    }
  }
};

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  spans.push(span);
  if (spans.length > MAX_SPANS_SIZE) {
    spans.shift();
  }
};

export const onEnd = (span: ReadableSpan): void => {
  if (
    span.instrumentationLibrary.name === INSTRUMENTATION_LONG_TASK &&
    !span.parentSpanId
  ) {
    const bestParentSpan = findBestSpanInTime(span.startTime, span.endTime);
    if (bestParentSpan) {
      (span as any).parentSpanId = bestParentSpan.spanContext().spanId;
      span.spanContext().traceId = bestParentSpan.spanContext().traceId;
    }
  }
};
