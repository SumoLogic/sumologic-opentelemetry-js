import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { Span as SdkTraceSpan } from '@opentelemetry/sdk-trace-base';
import { SpanKind } from '@opentelemetry/api';
import { TraceProcessor } from '../trace-processor';

export const TIME_TO_FIRST_XHR = 'http.time_to_first_xhr';
export const TIME_IN_XHR_CALLS = 'http.time_in_xhr_calls';
export const TIME_TO_LAST_XHR = 'http.time_to_last_xhr';
export const TIME_TO_PROCESSING_END = 'http.time_to_xhr_processing_end';

type SpanInterval = [startTime: number, endTime: number];

const isXhrSpan = (span: SdkTraceSpan): boolean =>
  span.name.startsWith('HTTP ') && span.kind === SpanKind.CLIENT;

export const xhrTraceProcessor: TraceProcessor = (rootSpan, spans) => {
  const xhrSpans = spans
    .filter(isXhrSpan)
    .sort(
      (span1, span2) =>
        hrTimeToNanoseconds(span1.startTime) -
        hrTimeToNanoseconds(span2.startTime),
    );

  if (!xhrSpans.length) return;
  const [firstXhrSpan] = xhrSpans;
  const lastXhrSpan = xhrSpans[xhrSpans.length - 1];

  // TIME_TO_FIRST_XHR - time from a root span to the beginning of the first xhr span
  rootSpan.attributes[TIME_TO_FIRST_XHR] =
    hrTimeToNanoseconds(firstXhrSpan.startTime) -
    hrTimeToNanoseconds(rootSpan.startTime);

  // TIME_TO_LAST_XHR - time from a root span to the end of the last xhr span
  rootSpan.attributes[TIME_TO_LAST_XHR] =
    hrTimeToNanoseconds(lastXhrSpan.endTime) -
    hrTimeToNanoseconds(rootSpan.startTime);

  // TIME_TO_PROCESSING_END - duration of a trace
  const maxEndTime = Math.max(
    ...spans.map((span) => hrTimeToNanoseconds(span.endTime)),
  );
  rootSpan.attributes[TIME_TO_PROCESSING_END] =
    maxEndTime - hrTimeToNanoseconds(rootSpan.startTime);

  // TIME_IN_XHR_CALLS - total duration of xhr spans without overlapping
  const intervals: SpanInterval[] = [];
  xhrSpans.forEach((xhrSpan) => {
    const startTime = hrTimeToNanoseconds(xhrSpan.startTime);
    const endTime = hrTimeToNanoseconds(xhrSpan.endTime);
    const lastInterval = intervals[intervals.length - 1];
    if (!lastInterval || startTime > lastInterval[1]) {
      intervals.push([startTime, endTime]);
    } else if (endTime > lastInterval[1]) {
      lastInterval[1] = endTime;
    }
  });
  rootSpan.attributes[TIME_IN_XHR_CALLS] = intervals.reduce(
    (sum, [startTime, endTime]) => sum + (endTime - startTime),
    0,
  );
};
