import * as api from '@opentelemetry/api';
import { InstrumentationBase, InstrumentationConfig } from '@opentelemetry/instrumentation';
import { OpenFunction, PropagateTraceHeaderCorsUrls, SendFunction, XhrMem } from './types';
export declare type XHRCustomAttributeFunction = (span: api.Span, xhr: XMLHttpRequest) => void;
/**
 * XMLHttpRequest config
 */
export interface XMLHttpRequestInstrumentationConfig extends InstrumentationConfig {
    /**
     * The number of timing resources is limited, after the limit
     * (chrome 250, safari 150) the information is not collected anymore.
     * The only way to prevent that is to regularly clean the resources
     * whenever it is possible. This is needed only when PerformanceObserver
     * is not available
     */
    clearTimingResources?: boolean;
    /** URLs which should include trace headers when origin doesn't match */
    propagateTraceHeaderCorsUrls?: PropagateTraceHeaderCorsUrls;
    /**
     * URLs that partially match any regex in ignoreUrls will not be traced.
     * In addition, URLs that are _exact matches_ of strings in ignoreUrls will
     * also not be traced.
     */
    ignoreUrls?: Array<string | RegExp>;
    /** Function for adding custom attributes on the span */
    applyCustomAttributesOnSpan?: XHRCustomAttributeFunction;
}
/**
 * This class represents a XMLHttpRequest plugin for auto instrumentation
 */
export declare class XMLHttpRequestInstrumentation extends InstrumentationBase<XMLHttpRequest> {
    readonly component: string;
    readonly version: string;
    moduleName: string;
    private _tasksCount;
    private _xhrMem;
    private _usedResources;
    constructor(config?: XMLHttpRequestInstrumentationConfig);
    init(): void;
    private _getConfig;
    /**
     * Adds custom headers to XMLHttpRequest
     * @param xhr
     * @param spanUrl
     * @private
     */
    private _addHeaders;
    /**
     * Add cors pre flight child span
     * @param span
     * @param corsPreFlightRequest
     * @private
     */
    private _addChildSpan;
    /**
     * Add attributes when span is going to end
     * @param span
     * @param xhr
     * @param spanUrl
     * @private
     */
    _addFinalSpanAttributes(span: api.Span, xhrMem: XhrMem, spanUrl?: string): void;
    private _applyAttributesAfterXHR;
    /**
     * will collect information about all resources created
     * between "send" and "end" with additional waiting for main resource
     * @param xhr
     * @param spanUrl
     * @private
     */
    private _addResourceObserver;
    /**
     * Clears the resource timings and all resources assigned with spans
     *     when {@link XMLHttpRequestInstrumentationConfig.clearTimingResources} is
     *     set to true (default false)
     * @private
     */
    private _clearResources;
    /**
     * Finds appropriate resource and add network events to the span
     * @param span
     */
    private _findResourceAndAddNetworkEvents;
    /**
     * Removes the previous information about span.
     * This might happened when the same xhr is used again.
     * @param xhr
     * @private
     */
    private _cleanPreviousSpanInformation;
    /**
     * Creates a new span when method "open" is called
     * @param xhr
     * @param url
     * @param method
     * @private
     */
    private _createSpan;
    /**
     * Marks certain [resource]{@link PerformanceResourceTiming} when information
     * from this is used to add events to span.
     * This is done to avoid reusing the same resource again for next span
     * @param resource
     * @private
     */
    private _markResourceAsUsed;
    /**
     * Patches the method open
     * @private
     */
    protected _patchOpen(): (original: OpenFunction) => OpenFunction;
    /**
     * Patches the method send
     * @private
     */
    protected _patchSend(): (original: SendFunction) => SendFunction;
    /**
     * implements enable function
     */
    enable(): void;
    /**
     * implements disable function
     */
    disable(): void;
}
