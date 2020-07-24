import { ExportResult } from "@opentelemetry/core";
import { SpanExporter, ReadableSpan } from "@opentelemetry/tracing";
import * as zipkinTypes from "./types";
import {
  toZipkinSpan,
  statusCodeTagName,
  statusDescriptionTagName,
} from "./transform";

export class SumoLogicExporter implements SpanExporter {
  static readonly DEFAULT_URL = "http://localhost:9411/api/v2/spans";
  private readonly _url: string;
  private readonly _serviceName: string;
  private _isShutdown: boolean;

  constructor(config: zipkinTypes.ExporterConfig) {
    this._url = config.url || SumoLogicExporter.DEFAULT_URL;
    this._serviceName = config.serviceName;
    this._isShutdown = false;
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    if (this._isShutdown) {
      setTimeout(() => resultCallback(ExportResult.FAILED_NOT_RETRYABLE));
      return;
    }
    return this._sendSpans(spans, resultCallback);
  }

  shutdown() {
    if (this._isShutdown) {
      return;
    }
    this._isShutdown = true;
  }

  private _toZipkinSpan(span: ReadableSpan): zipkinTypes.Span {
    return toZipkinSpan(
      span,
      this._serviceName,
      statusCodeTagName,
      statusDescriptionTagName
    );
  }

  /**
   * Transform spans and sends to Zipkin service.
   */
  private _sendSpans(
    spans: ReadableSpan[],
    done?: (result: ExportResult) => void
  ) {
    const zipkinSpans = spans.map((span) => this._toZipkinSpan(span));
    return this._send(zipkinSpans, (result: ExportResult) => {
      if (done) {
        return done(result);
      }
    });
  }

  /**
   * Send spans to the remote Zipkin service.
   */
  private _send(
    zipkinSpans: zipkinTypes.Span[],
    done: (result: ExportResult) => void
  ) {
    if (zipkinSpans.length === 0) {
      return done(ExportResult.SUCCESS);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", this._url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.addEventListener("load", () => {
      const statusCode = xhr.status || 0;

      // Consider 2xx and 3xx as success.
      if (statusCode < 400) {
        return done(ExportResult.SUCCESS);
        // Consider 4xx as failed non-retriable.
      } else if (statusCode < 500) {
        return done(ExportResult.FAILED_NOT_RETRYABLE);
        // Consider 5xx as failed retriable.
      } else {
        return done(ExportResult.FAILED_RETRYABLE);
      }
    });
    xhr.addEventListener("error", () => {
      done(ExportResult.FAILED_RETRYABLE);
    });
    const payload = JSON.stringify(zipkinSpans);
    xhr.send(payload);
  }
}
