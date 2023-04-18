import { Context } from '@opentelemetry/api';
import { Span as SdkTraceSpan, ReadableSpan } from '@opentelemetry/sdk-trace-base';
export declare const onStart: (span: SdkTraceSpan, context?: Context | undefined) => void;
export declare const onEnd: (span: ReadableSpan) => void;
