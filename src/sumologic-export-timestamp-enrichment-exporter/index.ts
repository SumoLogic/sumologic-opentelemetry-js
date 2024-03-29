import {
  ExportResult,
  hrTime,
  hrTimeToMilliseconds,
} from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';

const TELEMETRY_SDK_EXPORT_TIMESTAMP =
  'sumologic.telemetry.sdk.export_timestamp';

export class ExportTimestampEnrichmentExporter implements SpanExporter {
  private readonly _exporter: SpanExporter;

  constructor(exporter: SpanExporter) {
    this._exporter = exporter;
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ) {
    const exportTimestamp = hrTimeToMilliseconds(hrTime());
    spans.forEach((span) => {
      span.resource.attributes[TELEMETRY_SDK_EXPORT_TIMESTAMP] =
        exportTimestamp;
    });
    this._exporter.export(spans, resultCallback);
  }

  async shutdown() {
    return this._exporter.shutdown();
  }
}
