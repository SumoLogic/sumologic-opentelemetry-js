import { Context, HrTime } from '@opentelemetry/api';
import { hrTime, hrTimeToNanoseconds } from '@opentelemetry/core';
import {
  ReadableSpan,
  Span as SdkTraceSpan,
} from '@opentelemetry/sdk-trace-base';

const ATTRIBUTE_NAME = 'document.visibilityState';
const VISIBILITY_STATE_TO_EVENT_NAMES: Record<VisibilityState, string> = {
  visible: 'pageshow',
  hidden: 'pagehide',
};
const MAX_CHANGES = 100;

const changes: {
  timestampInNanoseconds: number;
  timestampInHrTime: HrTime;
  state: VisibilityState;
}[] = [];
let currentState = document.visibilityState;

const updateState = () => {
  const newState = document.visibilityState;
  if (currentState !== newState) {
    currentState = newState;
    const timestampInHrTime = hrTime();
    changes.push({
      timestampInNanoseconds: hrTimeToNanoseconds(timestampInHrTime),
      timestampInHrTime,
      state: newState,
    });
    if (changes.length > MAX_CHANGES) {
      changes.shift();
    }
  }
};

document.addEventListener('visibilitychange', () => {
  updateState();
});

window.addEventListener('pagehide', () => {
  updateState();
});

window.addEventListener('pageshow', () => {
  updateState();
});

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  span.setAttribute(ATTRIBUTE_NAME, currentState);
};

export const onEnd = (readableSpan: ReadableSpan): void => {
  const span = readableSpan as SdkTraceSpan;
  const startTimeInNanoseconds = hrTimeToNanoseconds(span.startTime);
  const endTimeInNanoseconds = hrTimeToNanoseconds(span.endTime);

  for (let i = changes.length - 1; i >= 0; i -= 1) {
    const { timestampInNanoseconds, timestampInHrTime, state } = changes[i];
    if (timestampInNanoseconds <= startTimeInNanoseconds) {
      break;
    }
    if (
      timestampInNanoseconds >= startTimeInNanoseconds &&
      timestampInNanoseconds <= endTimeInNanoseconds
    ) {
      span.events.push({
        name: VISIBILITY_STATE_TO_EVENT_NAMES[state],
        attributes: undefined,
        time: timestampInHrTime,
      });
      if (state === 'hidden' && span.attributes[ATTRIBUTE_NAME] === 'visible') {
        span.attributes[ATTRIBUTE_NAME] = state;
      }
    }
  }
};
