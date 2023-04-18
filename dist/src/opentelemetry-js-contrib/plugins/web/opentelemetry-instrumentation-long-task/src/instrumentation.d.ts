import { InstrumentationBase } from '@opentelemetry/instrumentation';
import type { LongtaskInstrumentationConfig } from './types';
export declare class LongTaskInstrumentation extends InstrumentationBase {
    readonly component: string;
    readonly version: string;
    moduleName: string;
    private _observer?;
    _config: LongtaskInstrumentationConfig;
    /**
     *
     * @param config
     */
    constructor(config?: LongtaskInstrumentationConfig);
    init(): void;
    private isSupported;
    private _createSpanFromEntry;
    enable(): void;
    disable(): void;
}
