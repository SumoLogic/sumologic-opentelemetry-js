import type { Span } from '@opentelemetry/api';
import type { InstrumentationConfig } from '@opentelemetry/instrumentation';
export interface PerformanceLongTaskTiming extends PerformanceEntry {
    attribution: TaskAttributionTiming[];
}
export interface TaskAttributionTiming extends PerformanceEntry {
    containerType: string;
    containerSrc: string;
    containerId: string;
    containerName: string;
}
export interface ObserverCallbackInformation {
    longtaskEntry: PerformanceLongTaskTiming;
}
export declare type ObserverCallback = (span: Span, information: ObserverCallbackInformation) => void;
export interface LongtaskInstrumentationConfig extends InstrumentationConfig {
    /** Callback for adding custom attributes to span */
    observerCallback?: ObserverCallback;
}
