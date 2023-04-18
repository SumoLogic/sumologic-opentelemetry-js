import { Span as SdkTraceSpan } from '@opentelemetry/sdk-trace-base';
import { AttributeValue } from '@opentelemetry/api';
export declare const isXhrSpan: (span: SdkTraceSpan) => boolean;
export declare const isDocumentLoadSpan: (span: SdkTraceSpan) => boolean;
export declare const isNavigationSpan: (span: SdkTraceSpan) => boolean;
/**
 * http.action_type is a Sumo Logic specific attribute describing nature of a trace.
 * It's used to separate different top-level user interactions.
 */
export declare type TraceHttpActionType = 'document_loads' | 'xhr_requests' | 'route_changes';
export declare const getTraceHttpActionType: (rootSpan: SdkTraceSpan) => TraceHttpActionType | undefined;
export declare const getSpanHttpUrl: (span: SdkTraceSpan) => AttributeValue | undefined;
