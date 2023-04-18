import * as api from '@opentelemetry/api';
import { InstrumentationBase, InstrumentationConfig } from '@opentelemetry/instrumentation';
import * as web from '@opentelemetry/sdk-trace-web';
import { FetchError } from './types';
export interface FetchCustomAttributeFunction {
    (span: api.Span, request: Request | RequestInit, result: Response | FetchError): void;
}
/**
 * FetchPlugin Config
 */
export interface FetchInstrumentationConfig extends InstrumentationConfig {
    clearTimingResources?: boolean;
    propagateTraceHeaderCorsUrls?: web.PropagateTraceHeaderCorsUrls;
    /**
     * URLs that partially match any regex in ignoreUrls will not be traced.
     * In addition, URLs that are _exact matches_ of strings in ignoreUrls will
     * also not be traced.
     */
    ignoreUrls?: Array<string | RegExp>;
    /** Function for adding custom attributes on the span */
    applyCustomAttributesOnSpan?: FetchCustomAttributeFunction;
    ignoreNetworkEvents?: boolean;
}
/**
 * This class represents a fetch plugin for auto instrumentation
 */
export declare class FetchInstrumentation extends InstrumentationBase<Promise<Response>> {
    readonly component: string;
    readonly version: string;
    moduleName: string;
    private _usedResources;
    private _tasksCount;
    constructor(config?: FetchInstrumentationConfig);
    init(): void;
    private _getConfig;
    /**
     * Add cors pre flight child span
     * @param span
     * @param corsPreFlightRequest
     */
    private _addChildSpan;
    /**
     * Adds more attributes to span just before ending it
     * @param span
     * @param response
     */
    private _addFinalSpanAttributes;
    /**
     * Add headers
     * @param options
     * @param spanUrl
     */
    private _addHeaders;
    /**
     * Clears the resource timings and all resources assigned with spans
     *     when {@link FetchPluginConfig.clearTimingResources} is
     *     set to true (default false)
     * @private
     */
    private _clearResources;
    /**
     * Creates a new span
     * @param url
     * @param options
     */
    private _createSpan;
    /**
     * Finds appropriate resource and add network events to the span
     * @param span
     * @param resourcesObserver
     * @param endTime
     */
    private _findResourceAndAddNetworkEvents;
    /**
     * Marks certain [resource]{@link PerformanceResourceTiming} when information
     * from this is used to add events to span.
     * This is done to avoid reusing the same resource again for next span
     * @param resource
     */
    private _markResourceAsUsed;
    /**
     * Finish span, add attributes, network events etc.
     * @param span
     * @param spanData
     * @param response
     */
    private _endSpan;
    /**
     * Patches the constructor of fetch
     */
    private _patchConstructor;
    private _applyAttributesAfterFetch;
    /**
     * Prepares a span data - needed later for matching appropriate network
     *     resources
     * @param spanUrl
     */
    private _prepareSpanData;
    /**
     * implements enable function
     */
    enable(): void;
    /**
     * implements unpatch function
     */
    disable(): void;
}
