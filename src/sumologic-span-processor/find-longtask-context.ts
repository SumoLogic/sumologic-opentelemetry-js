import { HrTime } from '@opentelemetry/api';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';

const INSTRUMENTATION_LONG_TASK = '@opentelemetry/instrumentation-long-task';
const LONGTASK_PRECISION_NS = 1e7; // 10 milliseconds
const MAX_SPANS_SIZE = 100;
const MAX_LONG_TASKS_SIZE = 10;

let spans: ReadableSpan[] = [];
let longTasks: ReadableSpan[] = [];

// exported for unit tests
export const resetSavedSpans = () => {
  spans = [];
  longTasks = [];
};

const isTimeRangeInSpan = (
  longtaskStartTimeNs: number,
  spanStartTimeNs: number,
  spanEndTimeNs: number,
): boolean =>
  longtaskStartTimeNs + LONGTASK_PRECISION_NS >= spanStartTimeNs &&
  longtaskStartTimeNs - LONGTASK_PRECISION_NS <= spanEndTimeNs;

const findBestSpanInTime = (
  longtaskStartTimeHrTime: HrTime,
): ReadableSpan | undefined => {
  const longtaskStartTime = hrTimeToNanoseconds(longtaskStartTimeHrTime);

  for (let i = spans.length - 1; i >= 0; i -= 1) {
    const span = spans[i];
    if (
      isTimeRangeInSpan(
        longtaskStartTime,
        hrTimeToNanoseconds(span.startTime),
        hrTimeToNanoseconds(span.endTime),
      )
    ) {
      return span;
    }
  }
};

const attachBestLongTasks = (
  span: ReadableSpan,
  onLongTaskFound: (span: ReadableSpan) => void,
) => {
  const startTime = hrTimeToNanoseconds(span.startTime);
  const endTime = hrTimeToNanoseconds(span.endTime);

  for (let i = longTasks.length - 1; i >= 0; i -= 1) {
    const longTask = longTasks[i];
    if (
      isTimeRangeInSpan(
        hrTimeToNanoseconds(longTask.startTime),
        startTime,
        endTime,
      )
    ) {
      longTasks.splice(i, 1);
      attachLongTaskToSpan(longTask, span);
      onLongTaskFound(longTask);
    }
  }
};

const attachLongTaskToSpan = (
  longTask: ReadableSpan,
  parentSpan: ReadableSpan,
): void => {
  // span.parentSpanId is readonly so we need to cast to 'any'
  (longTask as any).parentSpanId = parentSpan.spanContext().spanId;
  longTask.spanContext().traceId = parentSpan.spanContext().traceId;
};

export const onEnd = (
  span: ReadableSpan,
  superOnEnd: (span: ReadableSpan) => void,
): void => {
  if (span.instrumentationLibrary.name === INSTRUMENTATION_LONG_TASK) {
    if (!span.parentSpanId) {
      const bestParentSpan = findBestSpanInTime(span.startTime);
      if (bestParentSpan) {
        attachLongTaskToSpan(span, bestParentSpan);
      } else {
        // save this longtask for later and don't emit it yet
        longTasks.push(span);
        if (longTasks.length > MAX_LONG_TASKS_SIZE) {
          longTasks.shift();
        }
        return;
      }
    }
  } else {
    // save ended span, so it can be used for further longtasks
    spans.push(span);
    if (spans.length > MAX_SPANS_SIZE) {
      spans.shift();
    }

    // try previously ended longtasks without context
    attachBestLongTasks(span, superOnEnd);
  }

  superOnEnd(span);
};
