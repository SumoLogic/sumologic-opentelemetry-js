import { Context } from '@opentelemetry/api';
import {
  BatchSpanProcessor,
  Span as SdkTraceSpan,
  ReadableSpan,
  SpanExporter,
  BatchSpanProcessorBrowserConfig,
} from '@opentelemetry/sdk-trace-base';
import * as dropSingleSpanTraces from './drop-single-span-traces';
import * as documentVisibilityState from './document-visibility-state';
import * as findLongTaskContext from './find-longtask-context';
import * as xhrEnrichment from './xhr-enrichment';
import * as sessionId from './session-id';

export interface SumoLogicSpanProcessorConfig
  extends BatchSpanProcessorBrowserConfig {
  collectSessionId?: boolean;
  dropSingleUserInteractionTraces?: boolean;
}

const resolvedPromise = Promise.resolve(true);

export class SumoLogicSpanProcessor extends BatchSpanProcessor {
  private shouldCollectSessionId: boolean;
  private shouldDropSingleUserInteractionTraces: boolean;

  constructor(exporter: SpanExporter, config?: SumoLogicSpanProcessorConfig) {
    super(exporter, config);
    this.shouldCollectSessionId = config?.collectSessionId ?? true;
    this.shouldDropSingleUserInteractionTraces =
      config?.dropSingleUserInteractionTraces ?? true;
  }

  onStart(span: SdkTraceSpan, context?: Context): void {
    if (this.shouldDropSingleUserInteractionTraces) {
      dropSingleSpanTraces.onStart(span, context);
    }

    documentVisibilityState.onStart(span, context);
    findLongTaskContext.onStart(span, context);
    xhrEnrichment.onStart(span, context);
    if (this.shouldCollectSessionId) {
      sessionId.onStart(span, context);
    }

    // add attributes to all spans
    span.setAttribute('location.href', location.href);

    super.onStart(span);
  }

  onEnd(span: ReadableSpan): void {
    documentVisibilityState.onEnd(span);

    const shouldSpanBeProcessedPromise = this
      .shouldDropSingleUserInteractionTraces
      ? dropSingleSpanTraces.shouldSpanBeProcessed(span)
      : resolvedPromise;

    shouldSpanBeProcessedPromise.then((shouldSpanBeProcessed) => {
      if (
        shouldSpanBeProcessed &&
        findLongTaskContext.shouldSpanBeProcessed(span)
      ) {
        super.onEnd(span);
      }
    });
  }
}
