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
import * as overrideSpanName from './override-xhr-span-name';
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
  ignoreUrls?: (string | RegExp)[]; // Allow both strings and RegExp
}

export class SumoLogicSpanProcessor extends BatchSpanProcessor {
  public shouldCollectSessionId: boolean;
  public shouldDropSingleUserInteractionTraces: boolean;

  public getOverriddenServiceName?: (span: SdkTraceSpan) => string;
  public defaultServiceName: string;

  private traceProcessor: ReturnType<typeof createTraceProcessor>;

  private static ignoreUrls: RegExp[] = [];

  constructor(exporter: SpanExporter, config: SumoLogicSpanProcessorConfig) {
    super(exporter, config);
    this.shouldCollectSessionId = config.collectSessionId ?? true;
    this.shouldDropSingleUserInteractionTraces =
      config.dropSingleUserInteractionTraces ?? true;

    this.getOverriddenServiceName = config.getOverriddenServiceName;
    this.defaultServiceName = config.defaultServiceName;

    this.traceProcessor = createTraceProcessor(this);
    if (config.ignoreUrls) {
      const normalizedUrls = config.ignoreUrls.map((url) =>
        typeof url === 'string'
          ? new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          : url,
      );
      SumoLogicSpanProcessor.ignoreUrls.push(...normalizedUrls);
    }
  }

  private shouldIgnoreSpan(span: SdkTraceSpan | ReadableSpan): boolean {
    const url = span.attributes['http.url'] as string;
    if (!url) return false;
    return SumoLogicSpanProcessor.ignoreUrls.some((pattern) =>
      pattern.test(url),
    );
  }

  onStart(span: SdkTraceSpan, context: Context = ROOT_CONTEXT): void {
    // Check if the span should be ignored
    if (this.shouldIgnoreSpan(span)) {
      // Skip processing this span
      return;
    }

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

    // update the span name to append HTTP for XHR request

    overrideSpanName.onStart(span);

    // add attributes to all spans
    span.setAttribute('location.href', location.href);

    super.onStart(span, context);
  }

  onEnd(span: ReadableSpan): void {
    // Check if the span should be ignored
    if (this.shouldIgnoreSpan(span)) {
      // Skip processing this span
      return;
    }

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
