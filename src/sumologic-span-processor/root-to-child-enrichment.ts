import { Context, SpanKind } from '@opentelemetry/api';
import {
  Span as SdkTraceSpan,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
import {
  HTTP_ACTION_TYPE,
  ROOT_SPAN_HTTP_URL,
  ROOT_SPAN_OPERATION,
  XHR_IS_ROOT_SPAN,
} from '../constants';
import { getSpanHttpUrl, getTraceHttpActionType } from './utils';

const INSTRUMENTATION_LONG_TASK = '@opentelemetry/instrumentation-long-task';
const MAX_STORED_TRACE_IDS = 50;

const rootSpansByTraceId: Record<string, SdkTraceSpan> = {};
const storedTraceIds: string[] = [];
const childSpansToEnrich = new WeakMap<SdkTraceSpan, SdkTraceSpan[]>();

const getRootSpan = (span: SdkTraceSpan): SdkTraceSpan | undefined =>
  rootSpansByTraceId[span.spanContext().traceId];

const isXhrSpan = (span: SdkTraceSpan): boolean =>
  span.name.startsWith('HTTP ') && span.kind === SpanKind.CLIENT;

const isLongtaskSpan = (span: SdkTraceSpan): boolean =>
  span.instrumentationLibrary.name === INSTRUMENTATION_LONG_TASK;

const enrichChildSpan = (span: SdkTraceSpan, rootSpan: SdkTraceSpan) => {
  const rootSpanHttpUrl = getSpanHttpUrl(rootSpan);

  span.attributes[ROOT_SPAN_OPERATION] = rootSpan.name;
  if (rootSpanHttpUrl) {
    span.attributes[ROOT_SPAN_HTTP_URL] = rootSpanHttpUrl;
  }

  const isLongtask = isLongtaskSpan(span);
  if (isLongtask) {
    // this special attribute is required to calculate longtask metric with proper dimensions
    const actionType = getTraceHttpActionType(rootSpan);
    if (actionType) {
      span.attributes[HTTP_ACTION_TYPE] = actionType;
    }
  }
};

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  const { parentSpanId } = span;
  if (isXhrSpan(span) && parentSpanId) {
    const rootSpan = getRootSpan(span);
    if (rootSpan) {
      // root span of a xhr span gets this special attribute to indicate that it contains xhr spans
      rootSpan.attributes[XHR_IS_ROOT_SPAN] = true;
    }
  }
  if (!parentSpanId) {
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

export const onEnd = (span: ReadableSpan): void => {
  const sdkSpan = span as SdkTraceSpan;

  const childSpans = childSpansToEnrich.get(sdkSpan);
  if (childSpans) {
    childSpans.forEach((span) => enrichChildSpan(span, sdkSpan));
  }

  const isXhr = isXhrSpan(sdkSpan);
  const isLongtask = isLongtaskSpan(sdkSpan);
  if (span.parentSpanId && (isXhr || isLongtask)) {
    const rootSpan = getRootSpan(sdkSpan);
    if (rootSpan) {
      if (rootSpan.ended) {
        // root span is ended so we can enrich child span
        enrichChildSpan(sdkSpan, rootSpan);
      } else {
        // we enrich child spans later because 'new.location.href' may appear with some delay (see instrumentation-user-interaction)
        const spansToEnrich = childSpansToEnrich.get(rootSpan);
        if (spansToEnrich) {
          spansToEnrich.push(sdkSpan);
        } else {
          childSpansToEnrich.set(rootSpan, [sdkSpan]);
        }
      }
    }
  }
};
