import { ExportResult } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
export declare class ExportTimestampEnrichmentExporter implements SpanExporter {
    private readonly _exporter;
    constructor(exporter: SpanExporter);
    export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void;
    shutdown(): Promise<void>;
}
