import { InstrumentationBase, InstrumentationConfig } from '@opentelemetry/instrumentation';
/**
 * This class represents a document load plugin
 */
export declare class DocumentLoadInstrumentation extends InstrumentationBase<unknown> {
    readonly component: string;
    readonly version: string;
    moduleName: string;
    protected _config: InstrumentationConfig;
    private _enabled;
    /**
     *
     * @param config
     */
    constructor(config?: InstrumentationConfig);
    init(): void;
    /**
     * callback to be executed when page is loaded
     */
    private _onDocumentLoaded;
    /**
     * Adds spans for all resources
     * @param rootSpan
     */
    private _addResourcesSpans;
    /**
     * Collects information about performance and creates appropriate spans
     */
    private _collectPerformance;
    /**
     * Helper function for ending span
     * @param span
     * @param performanceName name of performance entry for time end
     * @param entries
     */
    private _endSpan;
    /**
     * Creates and ends a span with network information about resource added as timed events
     * @param resource
     * @param parentSpan
     */
    private _initResourceSpan;
    /**
     * Helper function for starting a span
     * @param spanName name of span
     * @param performanceName name of performance entry for time start
     * @param entries
     * @param parentSpan
     */
    private _startSpan;
    /**
     * executes callback {_onDocumentLoaded} when the page is loaded
     */
    private _waitForPageLoad;
    /**
     * implements enable function
     */
    enable(): void;
    /**
     * implements disable function
     */
    disable(): void;
}
