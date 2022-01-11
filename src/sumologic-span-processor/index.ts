import { Context } from '@opentelemetry/api';
import {
  BatchSpanProcessor,
  Span as SdkTraceSpan,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
import * as dropSingleSpanTraces from './drop-single-span-traces';
import * as documentVisibilityState from './document-visibility-state';
import * as findSpanContext from './find-span-context';

export class SumoLogicSpanProcessor extends BatchSpanProcessor {
  onStart(span: SdkTraceSpan, context?: Context): void {
    dropSingleSpanTraces.onStart(span, context);
    documentVisibilityState.onStart(span, context);
    findSpanContext.onStart(span, context);

    // add attributes to all spans
    span.setAttribute('location.href', location.href);

    super.onStart(span);
  }

  onEnd(span: ReadableSpan): void {
    documentVisibilityState.onEnd(span);
    dropSingleSpanTraces
      .onEnd(span)
      .then(() => {
        if (!findSpanContext.onEnd(span)) return;
        super.onEnd(span);
      })
      .catch(() => {});
  }
}
