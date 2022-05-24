import { Context } from '@opentelemetry/api';
import {
  BatchSpanProcessor,
  Span as SdkTraceSpan,
  ReadableSpan,
  SpanExporter,
  BatchSpanProcessorBrowserConfig,
} from '@opentelemetry/sdk-trace-base';
import * as documentVisibilityState from './document-visibility-state';
import * as findLongTaskContext from './find-longtask-context';
import * as xhrEnrichment from './xhr-enrichment';
import { createTraceProcessor } from './trace-processor';
import * as sessionId from './session-id';

export interface SumoLogicSpanProcessorConfig
  extends BatchSpanProcessorBrowserConfig {
  collectSessionId?: boolean;
  dropSingleUserInteractionTraces?: boolean;
}

export class SumoLogicSpanProcessor extends BatchSpanProcessor {
  public shouldCollectSessionId: boolean;
  public shouldDropSingleUserInteractionTraces: boolean;
  private traceProcessor: ReturnType<typeof createTraceProcessor>;

  constructor(exporter: SpanExporter, config?: SumoLogicSpanProcessorConfig) {
    super(exporter, config);
    this.shouldCollectSessionId = config?.collectSessionId ?? true;
    this.shouldDropSingleUserInteractionTraces =
      config?.dropSingleUserInteractionTraces ?? true;
    this.traceProcessor = createTraceProcessor(this);
  }

  onStart(span: SdkTraceSpan, context?: Context): void {
    documentVisibilityState.onStart(span, context);
    xhrEnrichment.onStart(span, context);
    this.traceProcessor.onStart(span, context);
    if (this.shouldCollectSessionId) {
      sessionId.onStart(span, context);
    }

    // add attributes to all spans
    span.setAttribute('location.href', location.href);

    super.onStart(span);
  }

  onEnd(span: ReadableSpan): void {
    documentVisibilityState.onEnd(span);
    xhrEnrichment.onEnd(span);

    // we use callbacks instead of Promises, because even immediately resolved Promise won't be executed synchronously
    // which will break when spans are ended before closing a page
    findLongTaskContext.onEnd(span, (span2) => {
      this.traceProcessor.onEnd(span2, (span3) => {
        super.onEnd(span3);
      });
    });
  }
}
