import { Context } from '@opentelemetry/api';
import { ReadableSpan, Span as SdkTraceSpan } from '@opentelemetry/sdk-trace-base';
export declare const resetDocumentVisibilityStateChanges: () => void;
export declare const onStart: (span: SdkTraceSpan, context?: Context | undefined) => void;
export declare const onEnd: (readableSpan: ReadableSpan) => void;
