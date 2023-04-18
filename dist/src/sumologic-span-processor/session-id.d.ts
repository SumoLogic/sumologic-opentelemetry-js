import { Context } from '@opentelemetry/api';
import { Span as SdkTraceSpan } from '@opentelemetry/sdk-trace-base';
export declare const resetSessionIdCookie: () => void;
export declare const getCurrentSessionId: () => string;
export declare const onStart: (span: SdkTraceSpan, context?: Context | undefined) => void;
