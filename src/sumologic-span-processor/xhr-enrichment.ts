import { Context, SpanKind } from '@opentelemetry/api';
import {
  Span as SdkTraceSpan,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';

const MAX_STORED_TRACE_IDS = 50;

const rootSpansByTraceId: Record<string, SdkTraceSpan> = {};
const storedTraceIds: string[] = [];
const xhrSpansToEnrich = new WeakMap<SdkTraceSpan, SdkTraceSpan[]>();

const isXhrSpan = (span: SdkTraceSpan): boolean =>
  span.name.startsWith('HTTP ') && span.kind === SpanKind.CLIENT;

const enrichXhrSpan = (span: SdkTraceSpan, rootSpan: SdkTraceSpan) => {
  const rootSpanHttpUrl =
    rootSpan.attributes['new.location.href'] ||
    rootSpan.attributes['location.href'];
  if (rootSpanHttpUrl) {
    span.attributes['xhr.root_span.operation'] = rootSpan.name;
    span.attributes['xhr.root_span.http.url'] = rootSpanHttpUrl;
  }
};

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  const { parentSpanId } = span;
  if (isXhrSpan(span)) {
    if (span.parentSpanId) {
      const rootSpan = rootSpansByTraceId[span.spanContext().traceId];
      if (rootSpan) {
        rootSpan.setAttribute('xhr.is_root_span', true);
        if (rootSpan.ended) {
          // root span is neded so we can enrich child span
          enrichXhrSpan(span, rootSpan);
        } else {
          // we enrich xhr spans later because 'new.location.href' may appear with some delay (see instrumentation-user-interaction)
          const spansToEnrich = xhrSpansToEnrich.get(rootSpan);
          if (spansToEnrich) {
            spansToEnrich.push(span);
          } else {
            xhrSpansToEnrich.set(rootSpan, [span]);
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
  const childXhrSpans = xhrSpansToEnrich.get(sdkSpan);
  if (childXhrSpans) {
    childXhrSpans.forEach((span) => enrichXhrSpan(span, sdkSpan));
  }
};
