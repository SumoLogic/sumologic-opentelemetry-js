import { ExportResult } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';

const TELEMETRY_SDK_EXPORT_TIMESTAMP = 'telemetry.sdk.export_timestamp';

export class ExportTimestampEnrichmentExporter implements SpanExporter {
  private readonly _exporter: SpanExporter;

  constructor(exporter: SpanExporter) {
    this._exporter = exporter;
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ) {
    const exportTimestamp = Date.now();
    spans.forEach((span) => {
      span.attributes[TELEMETRY_SDK_EXPORT_TIMESTAMP] = exportTimestamp;
    });
    this._exporter.export(spans, resultCallback);
  }

  shutdown() {
    this._exporter.shutdown();
  }
}
