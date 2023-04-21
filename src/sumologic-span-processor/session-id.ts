import { Context } from '@opentelemetry/api';
import { RandomIdGenerator } from '@opentelemetry/core';
import { Span as SdkTraceSpan } from '@opentelemetry/sdk-trace-base';
import { useDocument } from './utils';

interface Cookie {
  sessionId: string;
  lastActivityTimestamp: number;
}

const SESSION_ID_ATTRIBUTE = 'rum.session_id';
const COOKIE_NAME = 'sumoLogicOpenTelemetryRumSessionId';
const COOKIE_VALUE_SEPARATOR = '-';
const MAX_INACTIVITY_MS = 1000 * 60 * 5; // 5 minutes
const REFRESH_ACTIVITY_TIME_AFTER_MS = 1000 * 30; // 30 seconds

const getCookieValue = (): Cookie | undefined => {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return;
  const [sessionId, lastActivityTimestamp] = cookie
    .split('=')[1]
    .split(COOKIE_VALUE_SEPARATOR);
  return {
    sessionId,
    lastActivityTimestamp: parseInt(lastActivityTimestamp, 10),
  };
};

const setCookieValue = ({ sessionId, lastActivityTimestamp }: Cookie): void => {
  document.cookie = `${COOKIE_NAME}=${sessionId}${COOKIE_VALUE_SEPARATOR}${lastActivityTimestamp}; path=/`;
};

const idGenerator = new RandomIdGenerator();
let cookie: Cookie | undefined;

if (useDocument) {
  cookie = getCookieValue();
}

// exported for unit tests
export const resetSessionIdCookie = () => {
  cookie = undefined;
};

export const getCurrentSessionId = () => {
  const now = Date.now();

  if (cookie) {
    const inactivityDuration = now - cookie.lastActivityTimestamp;
    if (inactivityDuration > MAX_INACTIVITY_MS) {
      // we're no longer interested with session that was inactive for long time
      cookie = undefined;
    } else if (inactivityDuration > REFRESH_ACTIVITY_TIME_AFTER_MS) {
      cookie.lastActivityTimestamp = now;
      setCookieValue(cookie);
    }
  }

  if (!cookie) {
    cookie = {
      sessionId: idGenerator.generateTraceId(),
      lastActivityTimestamp: now,
    };
    setCookieValue(cookie);
  }

  return cookie.sessionId;
};

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  if (!useDocument) return;

  span.setAttribute(SESSION_ID_ATTRIBUTE, getCurrentSessionId());
};
