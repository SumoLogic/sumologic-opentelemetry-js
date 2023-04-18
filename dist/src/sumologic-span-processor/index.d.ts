import { Attributes, Context } from '@opentelemetry/api';
import { BatchSpanProcessor, Span as SdkTraceSpan, ReadableSpan, SpanExporter, BatchSpanProcessorBrowserConfig } from '@opentelemetry/sdk-trace-base';
export interface SumoLogicSpanProcessorConfig extends BatchSpanProcessorBrowserConfig {
    defaultAttributes?: Attributes;
    collectSessionId?: boolean;
    dropSingleUserInteractionTraces?: boolean;
    getOverriddenServiceName?: (span: SdkTraceSpan) => string;
    defaultServiceName: string;
}
export declare class SumoLogicSpanProcessor extends BatchSpanProcessor {
    shouldCollectSessionId: boolean;
    shouldDropSingleUserInteractionTraces: boolean;
    getOverriddenServiceName?: (span: SdkTraceSpan) => string;
    defaultServiceName: string;
    private traceProcessor;
    constructor(exporter: SpanExporter, config: SumoLogicSpanProcessorConfig);
    onStart(span: SdkTraceSpan, context?: Context): void;
    onEnd(span: ReadableSpan): void;
}
