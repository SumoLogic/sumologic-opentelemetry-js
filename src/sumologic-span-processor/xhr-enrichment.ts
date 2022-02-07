import { Context, SpanKind } from '@opentelemetry/api';
import { Span as SdkTraceSpan } from '@opentelemetry/sdk-trace-base';

const MAX_STORED_TRACE_IDS = 50;

const rootSpansByTraceId: Record<string, SdkTraceSpan> = {};
const storedTraceIds: string[] = [];

const isXhrSpan = (span: SdkTraceSpan): boolean =>
  span.name.startsWith('HTTP ') && span.kind === SpanKind.CLIENT;

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  const { parentSpanId } = span;
  if (isXhrSpan(span)) {
    if (span.parentSpanId) {
      const rootSpan = rootSpansByTraceId[span.spanContext().traceId];
      if (rootSpan) {
        rootSpan.setAttribute('xhr.is_root_span', true);
        span.setAttribute('xhr.root_span.operation', rootSpan.name);
        span.setAttribute(
          'xhr.root_span.http.url',
          rootSpan.attributes['location.href'],
        );
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
