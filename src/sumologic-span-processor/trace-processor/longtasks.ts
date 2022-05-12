import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { TraceProcessor } from '../trace-processor';

export const LONGTASKS_SUM = 'http.longtasks_sum';

export const longtasksTraceProcessor: TraceProcessor = (rootSpan, spans) => {
  const longtasks = spans.filter(
    (span) =>
      span.instrumentationLibrary.name ===
        '@opentelemetry/instrumentation-long-task' && span.name === 'longtask',
  );
  if (longtasks.length > 0) {
    const sumDuration = longtasks
      .map((span) => hrTimeToNanoseconds(span.duration))
      .reduce((current, duration) => current + duration, 0);
    rootSpan.attributes[LONGTASKS_SUM] = sumDuration;
  }
};
