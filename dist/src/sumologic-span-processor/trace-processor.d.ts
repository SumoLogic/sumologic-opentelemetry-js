import { Context } from '@opentelemetry/api';
import { ReadableSpan, Span as SdkTraceSpan } from '@opentelemetry/sdk-trace-base';
import { SumoLogicSpanProcessor } from '.';
declare type TraceId = string;
interface InternalTraceRecord {
    traceId: TraceId;
    timeout: number;
    /** Only the first root span is recorded  */
    rootSpan?: SdkTraceSpan;
    /** Call it when metrics are calculated and the root span is ready to be send */
    send?: () => void;
    /** All ended spans in a trace */
    spans: SdkTraceSpan[];
}
export declare type TraceRecord = Pick<InternalTraceRecord, 'rootSpan' | 'spans'>;
export declare enum TraceProcessorResult {
    DROP_ROOT_SPAN = 0
}
export declare type TraceProcessor = (rootSpan: SdkTraceSpan, spans: SdkTraceSpan[], spanProcessor: SumoLogicSpanProcessor) => TraceProcessorResult | void;
export declare const getTraceById: (traceId: TraceId) => TraceRecord | undefined;
export declare const createTraceProcessor: (spanProcessor: SumoLogicSpanProcessor) => {
    onStart: (span: SdkTraceSpan, context?: Context | undefined) => void;
    onEnd: (readableSpan: ReadableSpan, superOnEnd: (span: ReadableSpan) => void) => void;
};
export {};
