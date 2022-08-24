import { Context } from '@opentelemetry/api';
import {
  ReadableSpan,
  Span as SdkTraceSpan,
} from '@opentelemetry/sdk-trace-base';
import { SumoLogicSpanProcessor } from '.';
import { dropSingleSpanTracesTraceProcessor } from './trace-processor/drop-single-span-traces';
import { longtasksTraceProcessor } from './trace-processor/longtasks';
import { xhrTraceProcessor } from './trace-processor/xhr';

type TraceId = string;

interface InternalTraceRecord {
  traceId: TraceId;
  timeout: number;

  /** Only the first root span is recorded  */
  rootSpan?: SdkTraceSpan;

  /** Call it when metrics are calculated and the root span is ready to be send */
  send?: () => void;

  /** All ended spans in a trace */
  spans: SdkTraceSpan[];
}

export type TraceRecord = Pick<InternalTraceRecord, 'rootSpan' | 'spans'>;

export enum TraceProcessorResult {
  DROP_ROOT_SPAN,
}

export type TraceProcessor = (
  rootSpan: SdkTraceSpan,
  spans: SdkTraceSpan[],
  spanProcessor: SumoLogicSpanProcessor,
) => TraceProcessorResult | void;

const TIMEOUT = 30_000; // time to process metrics after last trace span start on end
const PROCESSORS: TraceProcessor[] = [
  dropSingleSpanTracesTraceProcessor,
  longtasksTraceProcessor,
  xhrTraceProcessor,
];

const traces: Record<TraceId, InternalTraceRecord> = {};

export const getTraceById = (traceId: TraceId): TraceRecord | undefined => {
  const record = traces[traceId];
  if (record) {
    const { rootSpan, spans } = record;
    return { rootSpan, spans };
  }
};

export const createTraceProcessor = (spanProcessor: SumoLogicSpanProcessor) => {
  const flush = () => {
    // we may have no other chance to process saved traces so we need to calculate and send them right now
    Object.values(traces).forEach((traceRecord) => {
      processTraceRecord(traceRecord);
    });
  };

  document.addEventListener('visibilitychange', () => {
    flush();
  });

  window.addEventListener('pagehide', () => {
    flush();
  });

  const processTraceRecord = ({
    traceId,
    rootSpan,
    send,
    spans,
  }: InternalTraceRecord) => {
    delete traces[traceId];

    if (!rootSpan || !send) {
      // trace ended but the root span didn't, so we need to drop the whole trace
      return;
    }

    let shouldSend = true;

    PROCESSORS.forEach((producer) => {
      const result = producer(rootSpan, spans, spanProcessor);
      if (result === TraceProcessorResult.DROP_ROOT_SPAN) {
        shouldSend = false;
      }
    });

    if (shouldSend) {
      send();
    }
  };

  const processTraceRecordLater = (traceRecord: InternalTraceRecord) => {
    clearTimeout(traceRecord.timeout);
    traceRecord.timeout = setTimeout(() => {
      processTraceRecord(traceRecord);
    }, TIMEOUT) as unknown as number;
  };

  return {
    onStart: (span: SdkTraceSpan, context?: Context): void => {
      const traceId = span.spanContext().traceId;
      let traceRecord = traces[traceId];
      if (!traceRecord) {
        traceRecord = { traceId, timeout: -1, spans: [] };
        traces[traceId] = traceRecord;
      }
      if (!span.parentSpanId && !traceRecord.rootSpan) {
        traceRecord.rootSpan = span;
      }
      processTraceRecordLater(traceRecord);
    },
    onEnd: (
      readableSpan: ReadableSpan,
      superOnEnd: (span: ReadableSpan) => void,
    ): void => {
      let shouldCallOnEnd = true;
      const span = readableSpan as SdkTraceSpan;
      const traceId = span.spanContext().traceId;
      const traceRecord = traces[traceId];
      if (traceRecord) {
        traceRecord.spans.push(span);
        if (traceRecord.rootSpan === span) {
          shouldCallOnEnd = false;
          traceRecord.send = () => {
            superOnEnd(readableSpan);
          };
        }
        processTraceRecordLater(traceRecord);
      }

      if (shouldCallOnEnd) {
        superOnEnd(readableSpan);
      }
    },
  };
};
