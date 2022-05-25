import { Context, SpanKind } from '@opentelemetry/api';
import {
  Span as SdkTraceSpan,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';

const INSTRUMENTATION_LONG_TASK = '@opentelemetry/instrumentation-long-task';
const ROOT_SPAN_OPERATION = 'root_span.operation';
const ROOT_SPAN_HTTP_URL = 'root_span.http.url';
const XHR_IS_ROOT_SPAN = 'xhr.is_root_span';
const LONGTASK_TYPE = 'longtask.type';
const MAX_STORED_TRACE_IDS = 50;

const rootSpansByTraceId: Record<string, SdkTraceSpan> = {};
const storedTraceIds: string[] = [];
const childSpansToEnrich = new WeakMap<SdkTraceSpan, SdkTraceSpan[]>();

const isXhrSpan = (span: SdkTraceSpan): boolean =>
  span.name.startsWith('HTTP ') && span.kind === SpanKind.CLIENT;

const isLongtaskSpan = (span: SdkTraceSpan): boolean =>
  span.instrumentationLibrary.name === INSTRUMENTATION_LONG_TASK;

const enrichChildSpan = (span: SdkTraceSpan, rootSpan: SdkTraceSpan) => {
  const rootSpanHttpUrl =
    rootSpan.attributes['new.location.href'] ||
    rootSpan.attributes['location.href'];
  if (rootSpanHttpUrl) {
    span.attributes[ROOT_SPAN_OPERATION] = rootSpan.name;
    span.attributes[ROOT_SPAN_HTTP_URL] = rootSpanHttpUrl;
  }
};

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  const { parentSpanId } = span;
  const isXhr = isXhrSpan(span);
  const isLongtask = isLongtaskSpan(span);
  if (isXhr || isLongtask) {
    if (span.parentSpanId) {
      const rootSpan = rootSpansByTraceId[span.spanContext().traceId];
      if (rootSpan) {
        if (isXhr) {
          // root span of a xhr span gets this special attribute to indicate that it contains xhr spans
          rootSpan.attributes[XHR_IS_ROOT_SPAN] = true;
        }

        if (isLongtask) {
          // longtasks can be assigned either to documentLoad trace or a trace with xhr spans
          // this special attribute is required to calculate longtask metric with proper dimensions
          if (rootSpan.name === 'documentLoad') {
            span.setAttribute(LONGTASK_TYPE, 'documentLoad');
          } else if (rootSpan.attributes[XHR_IS_ROOT_SPAN]) {
            span.setAttribute(LONGTASK_TYPE, 'xhr');
          }
        }

        if (rootSpan.ended) {
          // root span is neded so we can enrich child span
          enrichChildSpan(span, rootSpan);
        } else {
          // we enrich child spans later because 'new.location.href' may appear with some delay (see instrumentation-user-interaction)
          const spansToEnrich = childSpansToEnrich.get(rootSpan);
          if (spansToEnrich) {
            spansToEnrich.push(span);
          } else {
            childSpansToEnrich.set(rootSpan, [span]);
          }
        }
      }
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

export const onEnd = (span: ReadableSpan): void => {
  const sdkSpan = span as SdkTraceSpan;
  const childSpans = childSpansToEnrich.get(sdkSpan);
  if (childSpans) {
    childSpans.forEach((span) => enrichChildSpan(span, sdkSpan));
  }
};
