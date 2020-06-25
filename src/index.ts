import { HttpTraceContext, ProbabilitySampler } from "@opentelemetry/core";
import { BatchSpanProcessor } from "@opentelemetry/tracing";
import { WebTracerProvider } from "@opentelemetry/web";
import { XMLHttpRequestPlugin } from "@opentelemetry/plugin-xml-http-request";
import { FetchPlugin } from "@opentelemetry/plugin-fetch";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { DocumentLoad } from "@opentelemetry/plugin-document-load";
import { UserInteractionPlugin } from "@opentelemetry/plugin-user-interaction";
import { SumoLogicExporter } from "opentelemetry-exporter-sumologic";

const UNKNOWN_SERVICE_NAME = "unknown";
const BUFFER_MAX_SPANS = 100;
const BUFFER_TIMEOUT = 2_000;

interface InitializeOptions {
  collectionSourceUrl: string;
  serviceName?: string;
  defaultAttributes?: Record<string, unknown>;
  samplingProbability?: number;
  bufferMaxSpans?: number;
  bufferTimeout?: number;
}

const initialize = ({
  collectionSourceUrl,
  serviceName,
  defaultAttributes,
  samplingProbability = 1,
  bufferMaxSpans = BUFFER_MAX_SPANS,
  bufferTimeout = BUFFER_TIMEOUT,
}: InitializeOptions) => {
  const providerWithZone = new WebTracerProvider({
    plugins: [
      new DocumentLoad(),
      new UserInteractionPlugin(),
      new XMLHttpRequestPlugin({
        propagateTraceHeaderCorsUrls: /.*/,
        ignoreUrls: [collectionSourceUrl],
      }),
      new FetchPlugin({
        propagateTraceHeaderCorsUrls: /.*/,
      }),
    ],
    sampler: new ProbabilitySampler(samplingProbability),
    defaultAttributes,
  });

  providerWithZone.register({
    contextManager: new ZoneContextManager(),
    propagator: new HttpTraceContext(),
  });

  const exporter = new SumoLogicExporter({
    url: collectionSourceUrl,
    serviceName: serviceName ?? UNKNOWN_SERVICE_NAME,
  });

  providerWithZone.addSpanProcessor(
    new BatchSpanProcessor(exporter, {
      bufferSize: bufferMaxSpans,
      bufferTimeout: bufferTimeout,
    })
  );
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

const tryNumber = (input?: string): number | undefined =>
  input != null && Number.isFinite(+input) ? +input : undefined;

const { currentScript } = document;

if (currentScript) {
  const {
    collectionSourceUrl,
    serviceName,
    defaultAttributes,
    samplingProbability,
    bufferMaxSpans,
    bufferTimeout,
  } = currentScript.dataset;
  if (!collectionSourceUrl) {
    throw new Error(
      "data-collection-source-url needs to be defined to properly set up SumoLogic JS auto-instrumentation"
    );
  }

  initialize({
    collectionSourceUrl,
    serviceName,
    defaultAttributes: tryJson(defaultAttributes),
    samplingProbability: tryNumber(samplingProbability),
    bufferMaxSpans: tryNumber(bufferMaxSpans),
    bufferTimeout: tryNumber(bufferTimeout),
  });
}
