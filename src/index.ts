import {
  HttpTraceContextPropagator,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/core';
import { BatchSpanProcessor, Tracer } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { ExportTimestampEnrichmentExporter } from './opentelemetry-export-timestamp-enrichment';
import { registerInstrumentations as registerOpenTelemetryInstrumentations } from '@opentelemetry/instrumentation/src';
import * as api from '@opentelemetry/api';
import { CollectorExporterConfigBase } from '@opentelemetry/exporter-collector/src/types';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

declare global {
  interface Window {
    opentelemetry: {
      api: typeof api;
      tracer: Tracer;
      registerInstrumentations: () => void;
      disableInstrumentations: () => void;
    };
  }
}

const UNKNOWN_SERVICE_NAME = 'unknown';
const BUFFER_MAX_SPANS = 100;
const BUFFER_TIMEOUT = 2_000;

interface InitializeOptions {
  collectionSourceUrl: string;
  authorizationToken?: string;
  serviceName?: string;
  applicationName?: string;
  defaultAttributes?: api.SpanAttributes;
  samplingProbability?: number;
  bufferMaxSpans?: number;
  bufferTimeout?: number;
  ignoreUrls?: (string | RegExp)[];
  propagateTraceHeaderCorsUrls?: (string | RegExp)[];
}

export const initializeTracing = ({
  collectionSourceUrl,
  authorizationToken,
  serviceName,
  applicationName,
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
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
        serviceName ?? UNKNOWN_SERVICE_NAME,
    }),
    sampler: new TraceIdRatioBasedSampler(samplingProbability),
  });

  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new HttpTraceContextPropagator(),
  });

  const headers: CollectorExporterConfigBase['headers'] = {};
  if (authorizationToken) {
    headers.Authorization = authorizationToken;
  }

  const attributes: CollectorExporterConfigBase['attributes'] = {
    ...defaultAttributes,

    // This is a temporary solution not covered by the specification.
    // Was requested in https://github.com/open-telemetry/opentelemetry-specification/pull/570 .
    ['sampling.probability']: samplingProbability,
  };
  if (applicationName) {
    attributes.application = applicationName;
  }

  const collectorExporter = new CollectorTraceExporter({
    url: collectionSourceUrl,
    attributes,
    headers,
  });
  const exporter = new ExportTimestampEnrichmentExporter(collectorExporter);

  provider.addSpanProcessor(
    new BatchSpanProcessor(exporter, {
      maxQueueSize: bufferMaxSpans,
      scheduledDelayMillis: bufferTimeout,
    }),
  );

  let disableOpenTelemetryInstrumentations: (() => void) | undefined;

  const disableInstrumentations = () => {
    disableOpenTelemetryInstrumentations?.();
    disableOpenTelemetryInstrumentations = undefined;
  };

  const registerInstrumentations = () => {
    disableInstrumentations();
    disableOpenTelemetryInstrumentations = registerOpenTelemetryInstrumentations(
      {
        tracerProvider: provider,
        instrumentations: [
          new DocumentLoadInstrumentation(),
          new UserInteractionInstrumentation(),
          new XMLHttpRequestInstrumentation({
            propagateTraceHeaderCorsUrls,
            ignoreUrls: [collectionSourceUrl, ...ignoreUrls],
          }),
          new FetchInstrumentation({
            propagateTraceHeaderCorsUrls,
            ignoreUrls,
          }),
        ],
      },
    );
  };

  const tracer = provider.getTracer('default');
  registerInstrumentations();

  return { api, tracer, registerInstrumentations, disableInstrumentations };
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

const tryRegExpsList = (input?: string): RegExp[] | undefined =>
  (tryJson(input) || tryList(input))?.map((str: string) => new RegExp(str));

const { currentScript } = document;

if (
  currentScript &&
  (currentScript.getAttribute('src')?.indexOf('sumologic') ?? -1) >= 0
) {
  const {
    collectionSourceUrl,
    authorizationToken,
    serviceName,
    applicationName,
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

  window.opentelemetry = initializeTracing({
    collectionSourceUrl,
    authorizationToken,
    serviceName,
    applicationName,
    defaultAttributes: tryJson(defaultAttributes),
    samplingProbability: tryNumber(samplingProbability),
    bufferMaxSpans: tryNumber(bufferMaxSpans),
    bufferTimeout: tryNumber(bufferTimeout),
    ignoreUrls: tryRegExpsList(ignoreUrls),
    propagateTraceHeaderCorsUrls: tryRegExpsList(propagateTraceHeaderCorsUrls),
  });
}
