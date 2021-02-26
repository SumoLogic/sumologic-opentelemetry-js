import {
  HttpTraceContext,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/core';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { UserInteractionPlugin } from '@opentelemetry/plugin-user-interaction';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { ExportTimestampEnrichmentExporter } from './opentelemetry-export-timestamp-enrichment';
import { registerInstrumentations } from '@opentelemetry/instrumentation/src';
import { Attributes } from '@opentelemetry/api/src';

const UNKNOWN_SERVICE_NAME = 'unknown';
const BUFFER_MAX_SPANS = 100;
const BUFFER_TIMEOUT = 2_000;

interface InitializeOptions {
  collectionSourceUrl: string;
  serviceName?: string;
  defaultAttributes?: Attributes;
  samplingProbability?: number;
  bufferMaxSpans?: number;
  bufferTimeout?: number;
  ignoreUrls?: (string | RegExp)[];
  propagateTraceHeaderCorsUrls?: (string | RegExp)[];
}

export const initializeTracing = ({
  collectionSourceUrl,
  serviceName,
  defaultAttributes,
  samplingProbability = 1,
  bufferMaxSpans = BUFFER_MAX_SPANS,
  bufferTimeout = BUFFER_TIMEOUT,
  ignoreUrls = [],
  propagateTraceHeaderCorsUrls = [/.*/],
}: InitializeOptions) => {
  if (!collectionSourceUrl) {
    throw new Error(
      'collectionSourceUrl needs to be defined to initialize Sumo Logic OpenTelemetry auto-instrumentation for JavaScript',
    );
  }

  const provider = new WebTracerProvider({
    sampler: new TraceIdRatioBasedSampler(samplingProbability),
  });

  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new HttpTraceContext(),
  });

  const collectorExporter = new CollectorTraceExporter({
    url: collectionSourceUrl,
    serviceName: serviceName ?? UNKNOWN_SERVICE_NAME,
    attributes: defaultAttributes,
  });
  const exporter = new ExportTimestampEnrichmentExporter(collectorExporter);

  provider.addSpanProcessor(
    new BatchSpanProcessor(exporter, {
      bufferSize: bufferMaxSpans,
      bufferTimeout: bufferTimeout,
    }),
  );

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new DocumentLoad(),
      new UserInteractionPlugin(),
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls,
        ignoreUrls: [collectionSourceUrl, ...ignoreUrls],
      }),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls,
        ignoreUrls,
      }),
    ],
  });
};

const tryJson = (input: string | undefined): any => {
  if (!input) {
    return undefined;
  }
  try {
    return JSON.parse(input);
  } catch (error) {
    return undefined;
  }
};

const tryList = (input: string | undefined): string[] | undefined => {
  if (typeof input !== 'string') {
    return undefined;
  }
  return input.split(',').map((str) => str.trim());
};

const tryNumber = (input?: string): number | undefined =>
  input != null && Number.isFinite(+input) ? +input : undefined;

const stringsToRegExps = (input: string[]): RegExp[] =>
  input.map((str) => new RegExp(str));

const tryRegExpsList = (input?: string): RegExp[] =>
  stringsToRegExps(tryJson(input) || tryList(input) || []);

const { currentScript } = document;

if (currentScript) {
  const {
    collectionSourceUrl,
    serviceName,
    defaultAttributes,
    samplingProbability,
    bufferMaxSpans,
    bufferTimeout,
    ignoreUrls,
    propagateTraceHeaderCorsUrls,
  } = currentScript.dataset;

  if (!collectionSourceUrl) {
    throw new Error(
      'data-collection-source-url needs to be defined to initialize Sumo Logic OpenTelemetry auto-instrumentation for JavaScript',
    );
  }

  initializeTracing({
    collectionSourceUrl,
    serviceName,
    defaultAttributes: tryJson(defaultAttributes),
    samplingProbability: tryNumber(samplingProbability),
    bufferMaxSpans: tryNumber(bufferMaxSpans),
    bufferTimeout: tryNumber(bufferTimeout),
    ignoreUrls: tryRegExpsList(ignoreUrls),
    propagateTraceHeaderCorsUrls: tryRegExpsList(propagateTraceHeaderCorsUrls),
  });
}
