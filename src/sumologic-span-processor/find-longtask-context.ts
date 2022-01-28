import { Context, HrTime } from '@opentelemetry/api';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import {
  Span as SdkTraceSpan,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';

const INSTRUMENTATION_LONG_TASK = '@opentelemetry/instrumentation-long-task';
const LONGTASK_PRECISION_NS = 1e7; // 10 milliseconds
const MAX_SPANS_SIZE = 100;
const MAX_LONG_TASKS_SIZE = 10;

const spans: SdkTraceSpan[] = [];
const longTasks: ReadableSpan[] = [];

const isTimeRangeInSpan = (
  startTimeNs: number,
  endTimeNs: number,
  span: ReadableSpan,
): boolean => {
  return (
    hrTimeToNanoseconds(span.startTime) - LONGTASK_PRECISION_NS <=
      startTimeNs &&
    hrTimeToNanoseconds(span.endTime) + LONGTASK_PRECISION_NS >= endTimeNs
  );
};

const findBestSpanInTime = (
  startTimeHrTime: HrTime,
  endTimeHrTime: HrTime,
): SdkTraceSpan | undefined => {
  const startTime = hrTimeToNanoseconds(startTimeHrTime);
  const endTime = hrTimeToNanoseconds(endTimeHrTime);

  for (let i = spans.length - 1; i >= 0; i -= 1) {
    const span = spans[i];
    if (isTimeRangeInSpan(startTime, endTime, span)) {
      return span;
    }
  }
};

const findBestLongTaskInTime = (
  startTimeHrTime: HrTime,
  endTimeHrTime: HrTime,
): [longTask: ReadableSpan, index: number] | undefined => {
  const startTime = hrTimeToNanoseconds(startTimeHrTime);
  const endTime = hrTimeToNanoseconds(endTimeHrTime);

  for (let i = longTasks.length - 1; i >= 0; i -= 1) {
    const longTask = longTasks[i];
    if (isTimeRangeInSpan(startTime, endTime, longTask)) {
      return [longTask, i];
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

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  if (span.instrumentationLibrary.name !== INSTRUMENTATION_LONG_TASK) {
    spans.push(span);
    if (spans.length > MAX_SPANS_SIZE) {
      spans.shift();
    }
  }
};

export const onEnd = (
  span: ReadableSpan,
  superOnEnd: (span: ReadableSpan) => void,
): void => {
  if (span.instrumentationLibrary.name === INSTRUMENTATION_LONG_TASK) {
    if (!span.parentSpanId) {
      const bestParentSpan = findBestSpanInTime(span.startTime, span.endTime);
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
    // try previously ended longtasks without context
    const bestLongTaskEntry = findBestLongTaskInTime(
      span.startTime,
      span.endTime,
    );
    if (bestLongTaskEntry) {
      const [longTask, index] = bestLongTaskEntry;
      longTasks.splice(index, 1);
      attachLongTaskToSpan(longTask, span);
      superOnEnd(longTask);
    }
  }

  superOnEnd(span);
};
