import { Context, trace, Span } from '@opentelemetry/api';
import {
  Span as SdkTraceSpan,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';

const INSTRUMENTATION_USER_INTERACTION =
  '@opentelemetry/instrumentation-user-interaction';
const SPANS_CHILDREN_AMOUNT = new WeakMap<Span | ReadableSpan, number>();
const WAIT_FOR_CHILDREN_TIMEOUT = 1000;

export const onStart = (span: SdkTraceSpan, context?: Context): void => {
  SPANS_CHILDREN_AMOUNT.set(span, 0);
  // this should be mostly true; the alternative would be to create a mapping for parentSpanId but we couldn't use WeakMap
  const parentSpan = context && trace.getSpan(context);
  if (parentSpan && parentSpan.spanContext().spanId === span.parentSpanId) {
    SPANS_CHILDREN_AMOUNT.set(
      parentSpan,
      (SPANS_CHILDREN_AMOUNT.get(parentSpan) ?? 0) + 1,
    );
  }
};

export const shouldSpanBeProcessed = (span: ReadableSpan): Promise<boolean> =>
  new Promise((resolve) => {
    // drop spans comming from user-interaction without children
    if (span.instrumentationLibrary.name === INSTRUMENTATION_USER_INTERACTION) {
      if (!SPANS_CHILDREN_AMOUNT.get(span)) {
        setTimeout(() => {
          if (SPANS_CHILDREN_AMOUNT.get(span)) {
            resolve(true);
          } else {
            resolve(false);
          }
        }, WAIT_FOR_CHILDREN_TIMEOUT);
        return;
      }
    }

    resolve(true);
  });
