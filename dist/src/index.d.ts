import { Span, Tracer } from '@opentelemetry/sdk-trace-base';
import * as api from '@opentelemetry/api';
declare type ReadyListener = () => void;
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
            setDefaultAttribute: (key: string, value: api.AttributeValue | undefined) => void;
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
export declare const initialize: ({ collectionSourceUrl, authorizationToken, serviceName, applicationName, deploymentEnvironment, defaultAttributes, samplingProbability, bufferMaxSpans, maxExportBatchSize, bufferTimeout, ignoreUrls, propagateTraceHeaderCorsUrls, collectSessionId, dropSingleUserInteractionTraces, collectErrors, userInteractionElementNameLimit, getOverriddenServiceName, }: InitializeOptions) => {
    readyListeners: never[];
    onReady: (callback: ReadyListener) => void;
    api: typeof api;
    tracer: Tracer;
    registerInstrumentations: () => void;
    disableInstrumentations: () => void;
    setDefaultAttribute: (key: string, value: api.AttributeValue | undefined) => void;
    getCurrentSessionId: () => string;
    recordError: (message: string, attributes?: Record<string, any> | undefined) => void;
};
export {};
