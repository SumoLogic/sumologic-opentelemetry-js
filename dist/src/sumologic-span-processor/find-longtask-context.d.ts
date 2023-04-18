import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
export declare const resetSavedSpans: () => void;
export declare const onEnd: (span: ReadableSpan, superOnEnd: (span: ReadableSpan) => void) => void;
