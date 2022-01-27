import { Context } from '@opentelemetry/api';
import {
  BatchSpanProcessor,
  Span as SdkTraceSpan,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
import * as dropSingleSpanTraces from './drop-single-span-traces';
import * as documentVisibilityState from './document-visibility-state';
import * as findLongTaskContext from './find-longtask-context';
import * as xhrEnrichment from './xhr-enrichment';

export class SumoLogicSpanProcessor extends BatchSpanProcessor {
  onStart(span: SdkTraceSpan, context?: Context): void {
    dropSingleSpanTraces.onStart(span, context);
    documentVisibilityState.onStart(span, context);
    findLongTaskContext.onStart(span, context);
    xhrEnrichment.onStart(span, context);

    // add attributes to all spans
    span.setAttribute('location.href', location.href);

    super.onStart(span);
  }

  onEnd(span: ReadableSpan): void {
    documentVisibilityState.onEnd(span);
    dropSingleSpanTraces
      .shouldSpanBeProcessed(span)
      .then((shouldSpanBeProcessed) => {
        if (
          shouldSpanBeProcessed &&
          findLongTaskContext.shouldSpanBeProcessed(span)
        ) {
          super.onEnd(span);
        }
      });
  }
}
