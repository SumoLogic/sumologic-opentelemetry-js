import { TraceProcessor, TraceProcessorResult } from '../trace-processor';

const INSTRUMENTATION_USER_INTERACTION =
  '@opentelemetry/instrumentation-user-interaction';

export const dropSingleSpanTracesTraceProcessor: TraceProcessor = (
  rootSpan,
  spans,
  spanProcessor,
) => {
  if (
    spanProcessor.shouldDropSingleUserInteractionTraces &&
    rootSpan.instrumentationLibrary.name === INSTRUMENTATION_USER_INTERACTION &&
    spans.length === 1
  ) {
    return TraceProcessorResult.DROP_ROOT_SPAN;
  }
};
