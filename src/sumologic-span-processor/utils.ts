import { Span as SdkTraceSpan } from '@opentelemetry/sdk-trace-base';
import { AttributeValue, SpanKind } from '@opentelemetry/api';
import { XHR_IS_ROOT_SPAN } from '../constants';

export const useWindow = typeof window === 'object' && window != null;
export const useDocument = typeof document === 'object' && document != null;

export const isXhrSpan = (span: SdkTraceSpan): boolean =>
  span.name.startsWith('HTTP ') && span.kind === SpanKind.CLIENT;

export const isDocumentLoadSpan = (span: SdkTraceSpan): boolean =>
  span.name === 'documentLoad' &&
  span.instrumentationLibrary.name ===
    '@opentelemetry/instrumentation-document-load';

export const isNavigationSpan = (span: SdkTraceSpan): boolean =>
  span.name.startsWith('Navigation: ') &&
  span.instrumentationLibrary.name ===
    '@opentelemetry/instrumentation-user-interaction';

/**
 * http.action_type is a Sumo Logic specific attribute describing nature of a trace.
 * It's used to separate different top-level user interactions.
 */
export type TraceHttpActionType =
  | 'document_loads'
  | 'xhr_requests'
  | 'route_changes';

export const getTraceHttpActionType = (
  rootSpan: SdkTraceSpan,
): TraceHttpActionType | undefined => {
  if (!rootSpan) return;
  if (isDocumentLoadSpan(rootSpan)) {
    return 'document_loads';
  }
  if (rootSpan.attributes[XHR_IS_ROOT_SPAN]) {
    if (isNavigationSpan(rootSpan)) {
      return 'route_changes';
    }
    return 'xhr_requests';
  }
};

export const getSpanHttpUrl = (
  span: SdkTraceSpan,
): AttributeValue | undefined =>
  span.attributes['new.location.href'] || span.attributes['location.href'];
