import { W3CTraceContextPropagator } from '@opentelemetry/core';
import {
  Span,
  Tracer,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { SumoLogicContextManager } from './sumologic-context-manager';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ExportTimestampEnrichmentExporter } from './sumologic-export-timestamp-enrichment-exporter';
import { registerInstrumentations as registerOpenTelemetryInstrumentations } from '@opentelemetry/instrumentation';
import * as api from '@opentelemetry/api';
import { Resource, ResourceAttributes } from '@opentelemetry/resources';
import {
  SemanticAttributes,
  SemanticResourceAttributes,
} from '@opentelemetry/semantic-conventions';
import { SumoLogicSpanProcessor } from './sumologic-span-processor';
import { LongTaskInstrumentation } from '@opentelemetry/instrumentation-long-task';
import { SumoLogicLogsExporter } from './sumologic-logs-exporter';
import { SumoLogicLogsInstrumentation } from './sumologic-logs-instrumentation';
import {
  BUFFER_MAX_SPANS,
  BUFFER_TIMEOUT,
  DEFAULT_USER_INTERACTION_ELEMENT_NAME_LIMIT,
  INSTRUMENTED_EVENT_NAMES,
  MAX_EXPORT_BATCH_SIZE,
  UNKNOWN_SERVICE_NAME,
} from './constants';
import {
  getCollectionSourceUrl,
  getUserInteractionSpanName,
  tryNumber,
} from './utils';
import { version } from '../package.json';
import { getCurrentSessionId } from './sumologic-span-processor/session-id';
import { Attributes } from '@opentelemetry/api';
import { CompositePropagator, W3CBaggagePropagator } from '@opentelemetry/core';

type ReadyListener = () => void;

declare global {
  interface Window {
    sumoLogicOpenTelemetryRum: {
      initialize: (options: InitializeOptions) => void;
      readyListeners: ReadyListener[];
      onReady: (callback: ReadyListener) => void;
      api: typeof api;
      tracer: Tracer;
      registerInstrumentations: () => void;
      disableInstrumentations: () => void;
      setDefaultAttribute: (
        key: string,
        value: api.AttributeValue | undefined,
      ) => void;
      getCurrentSessionId: () => string;
      recordError: (message: string, attributes?: Record<string, any>) => void;
    };
  }
}

interface InitializeOptions {
  collectionSourceUrl: string;
  authorizationToken?: string;
  serviceName?: string;
  applicationName?: string;
  deploymentEnvironment?: string;
  defaultAttributes?: api.Attributes;
  samplingProbability?: number | string;
  bufferMaxSpans?: number;
  maxExportBatchSize?: number;
  bufferTimeout?: number;
  ignoreUrls?: (string | RegExp)[];
  propagateTraceHeaderCorsUrls?: (string | RegExp)[];
  collectSessionId?: boolean;
  dropSingleUserInteractionTraces?: boolean;
  collectErrors?: boolean;
  userInteractionElementNameLimit?: number;
  getOverriddenServiceName?: (span: Span) => string;
}

const useWindow = typeof window === 'object' && window != null;

let contextManager: SumoLogicContextManager | undefined;

if (useWindow) {
  window.sumoLogicOpenTelemetryRum = window.sumoLogicOpenTelemetryRum || {};

  // create context manager right now to patch APIs for situations when 'initialize' is called later
  contextManager = new SumoLogicContextManager();
  contextManager.enable();
}

export const initialize = ({
  collectionSourceUrl,
  authorizationToken,
  serviceName,
  applicationName,
  deploymentEnvironment,
  defaultAttributes,
  samplingProbability = 1,
  bufferMaxSpans = BUFFER_MAX_SPANS,
  maxExportBatchSize = MAX_EXPORT_BATCH_SIZE,
  bufferTimeout = BUFFER_TIMEOUT,
  ignoreUrls = [],
  propagateTraceHeaderCorsUrls = [],
  collectSessionId,
  dropSingleUserInteractionTraces,
  collectErrors = true,
  userInteractionElementNameLimit = DEFAULT_USER_INTERACTION_ELEMENT_NAME_LIMIT,
  getOverriddenServiceName,
}: InitializeOptions) => {
  if (!useWindow) return;

  if (!collectionSourceUrl) {
    throw new Error(
      'collectionSourceUrl needs to be defined to initialize Sumo Logic OpenTelemetry RUM',
    );
  }

  const samplingProbabilityMaybeNumber = tryNumber(samplingProbability) ?? 1;

  const defaultServiceName = serviceName ?? UNKNOWN_SERVICE_NAME;

  const resourceAttributes: ResourceAttributes = {
    [SemanticResourceAttributes.SERVICE_NAME]: defaultServiceName,
    ['sumologic.rum.version']: version,
  };

  if (applicationName) {
    resourceAttributes.application = applicationName;
  }
  if (deploymentEnvironment) {
    resourceAttributes[SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT] =
      deploymentEnvironment;
  }

  const resource = new Resource(resourceAttributes);

  const tracesResource = resource.merge(
    new Resource({
      ...defaultAttributes,

      // This is a temporary solution not covered by the specification.
      // Was requested in https://github.com/open-telemetry/opentelemetry-specification/pull/570 .
      ['sampling.probability']: samplingProbabilityMaybeNumber,
    }),
  );
  const provider = new WebTracerProvider({
    resource: tracesResource,
    sampler: new TraceIdRatioBasedSampler(samplingProbabilityMaybeNumber),
  });

  const compositePropagator = new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  });

  provider.register({
    contextManager,
    propagator: compositePropagator,
  });

  const runtimeDefaultAttributes: Attributes = { ...defaultAttributes };

  const setDefaultAttribute = (
    key: string,
    value: api.AttributeValue | undefined,
  ) => {
    provider.resource.attributes[key] = value;
    runtimeDefaultAttributes[key] = value;
  };

  const parsedCollectionSourceUrl = getCollectionSourceUrl(collectionSourceUrl);

  const collectorExporter = new OTLPTraceExporter({
    url: `${parsedCollectionSourceUrl}v1/traces`,
    headers: authorizationToken
      ? { Authorization: authorizationToken }
      : undefined,
  });
  const tracesExporter = new ExportTimestampEnrichmentExporter(
    collectorExporter,
  );

  provider.addSpanProcessor(
    new SumoLogicSpanProcessor(tracesExporter, {
      maxQueueSize: bufferMaxSpans,
      maxExportBatchSize,
      scheduledDelayMillis: bufferTimeout,
      collectSessionId,
      dropSingleUserInteractionTraces,
      getOverriddenServiceName,
      defaultServiceName,
    }),
  );

  const logsResource = resource.merge(
    new Resource({
      [SemanticAttributes.HTTP_USER_AGENT]: navigator.userAgent,
    }),
  );
  const logsExporter = new SumoLogicLogsExporter({
    resource: logsResource,
    attributes: runtimeDefaultAttributes,
    collectorUrl: `${parsedCollectionSourceUrl}v1/logs`,
    maxQueueSize: bufferMaxSpans,
    scheduledDelayMillis: bufferTimeout,
  });
  const logsInstrumentation = collectErrors
    ? new SumoLogicLogsInstrumentation({
        exporter: logsExporter,
      })
    : undefined;

  let disableOpenTelemetryInstrumentations: (() => void) | undefined;

  const disableInstrumentations = () => {
    if (disableOpenTelemetryInstrumentations) {
      disableOpenTelemetryInstrumentations();
      logsInstrumentation?.disable();
      logsExporter.disable();
      disableOpenTelemetryInstrumentations = undefined;
    }
  };

  const httpInstrumentationOptions: InstrumentationOption = {
    enabled: true,
    ignoreIncomingRequestHook: () => true,
  };

  const httpInstrumentation = new HttpInstrumentation(
    httpInstrumentationOptions,
  );

  const registerInstrumentations = () => {
    disableInstrumentations();
    logsExporter.enable();
    logsInstrumentation?.enable();
    disableOpenTelemetryInstrumentations =
      registerOpenTelemetryInstrumentations({
        tracerProvider: provider,
        instrumentations: [
          httpInstrumentation,
          new LongTaskInstrumentation({
            enabled: false,
          }),
          new DocumentLoadInstrumentation({ enabled: false }),
          new UserInteractionInstrumentation({
            enabled: false,
            eventNames: INSTRUMENTED_EVENT_NAMES,
            shouldPreventSpanCreation: (eventType, element, span) => {
              const newName = getUserInteractionSpanName(
                eventType,
                element,
                userInteractionElementNameLimit,
              );
              if (newName) {
                span.updateName(newName);
              }
              return false;
            },
          }),
          new XMLHttpRequestInstrumentation({
            enabled: false,
            propagateTraceHeaderCorsUrls,
            ignoreUrls: [collectionSourceUrl, ...ignoreUrls],
          }),
          new FetchInstrumentation({
            enabled: false,
            propagateTraceHeaderCorsUrls,
            ignoreUrls,
          }),
        ],
      });
  };

  const tracer = provider.getTracer('@sumologic/opentelemetry-rum');
  registerInstrumentations();

  const result = {
    readyListeners: [],
    onReady: (callback: ReadyListener) => {
      callback();
    },
    api,
    tracer,
    registerInstrumentations,
    disableInstrumentations,
    setDefaultAttribute,
    getCurrentSessionId,
    recordError: logsExporter.recordCustomError,
  };

  if (useWindow) {
    Object.assign(window.sumoLogicOpenTelemetryRum, result);
  }

  return result;
};

if (useWindow) {
  window.sumoLogicOpenTelemetryRum.initialize = initialize;

  const readyListeners = window.sumoLogicOpenTelemetryRum?.readyListeners;
  if (Array.isArray(readyListeners)) {
    readyListeners.forEach((callback) => callback());
  }
}

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

const tryRegExpsList = (input?: string): RegExp[] | undefined =>
  (tryJson(input) || tryList(input))?.map((str: string) => new RegExp(str));

if (
  typeof document === 'object' &&
  document != null &&
  document.currentScript &&
  document.currentScript.dataset.collectionSourceUrl
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
  } = document.currentScript.dataset;

  (window as any).opentelemetry = initialize({
    collectionSourceUrl,
    authorizationToken,
    serviceName,
    applicationName,
    defaultAttributes: tryJson(defaultAttributes),
    samplingProbability: tryNumber(samplingProbability),
    bufferMaxSpans: tryNumber(bufferMaxSpans),
    bufferTimeout: tryNumber(bufferTimeout),
    ignoreUrls: tryRegExpsList(ignoreUrls),
    propagateTraceHeaderCorsUrls: tryRegExpsList(
      propagateTraceHeaderCorsUrls,
    ) || [/.*/],
  });
}
