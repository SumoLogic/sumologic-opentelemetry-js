import { Attributes, Context, ROOT_CONTEXT } from '@opentelemetry/api';
import {
  BatchSpanProcessor,
  Span as SdkTraceSpan,
  ReadableSpan,
  SpanExporter,
  BatchSpanProcessorBrowserConfig,
} from '@opentelemetry/sdk-trace-base';
import * as documentVisibilityState from './document-visibility-state';
import * as overrideServiceName from './override-service-name';
import * as findLongTaskContext from './find-longtask-context';
import * as rootToChildEnrichment from './root-to-child-enrichment';
import { createTraceProcessor } from './trace-processor';
import * as sessionId from './session-id';

export interface SumoLogicSpanProcessorConfig
  extends BatchSpanProcessorBrowserConfig {
  defaultAttributes?: Attributes;
  collectSessionId?: boolean;
  dropSingleUserInteractionTraces?: boolean;
  getOverriddenServiceName?: (span: SdkTraceSpan) => string;
  defaultServiceName: string;
}

export class SumoLogicSpanProcessor extends BatchSpanProcessor {
  public shouldCollectSessionId: boolean;
  public shouldDropSingleUserInteractionTraces: boolean;

  public getOverriddenServiceName?: (span: SdkTraceSpan) => string;
  public defaultServiceName: string;

  private traceProcessor: ReturnType<typeof createTraceProcessor>;

  constructor(exporter: SpanExporter, config: SumoLogicSpanProcessorConfig) {
    super(exporter, config);
    this.shouldCollectSessionId = config.collectSessionId ?? true;
    this.shouldDropSingleUserInteractionTraces =
      config.dropSingleUserInteractionTraces ?? true;

    this.getOverriddenServiceName = config.getOverriddenServiceName;
    this.defaultServiceName = config.defaultServiceName;

    this.traceProcessor = createTraceProcessor(this);
  }

  onStart(span: SdkTraceSpan, context: Context = ROOT_CONTEXT): void {
    documentVisibilityState.onStart(span, context);
    rootToChildEnrichment.onStart(span, context);
    this.traceProcessor.onStart(span, context);
    if (this.shouldCollectSessionId) {
      sessionId.onStart(span, context);
    }
    overrideServiceName.onStart(span, context, {
      getOverriddenServiceName: this.getOverriddenServiceName,
      defaultServiceName: this.defaultServiceName,
    });

    // add attributes to all spans
    span.setAttribute('location.href', location.href);

    super.onStart(span, context);
  }

  onEnd(span: ReadableSpan): void {
    documentVisibilityState.onEnd(span);

    // we use callbacks instead of Promises, because even immediately resolved Promise won't be executed synchronously
    // which will break when spans are ended before closing a page
    findLongTaskContext.onEnd(span, (span2) => {
      rootToChildEnrichment.onEnd(span2);
      this.traceProcessor.onEnd(span2, (span3) => {
        super.onEnd(span3);
      });
    });
  }
}
