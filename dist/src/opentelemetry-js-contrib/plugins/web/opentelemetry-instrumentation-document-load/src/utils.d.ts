import { Span } from '@opentelemetry/api';
import { PerformanceEntries } from '@opentelemetry/sdk-trace-web';
export declare const getPerformanceNavigationEntries: () => PerformanceEntries;
export declare const addSpanPerformancePaintEvents: (span: Span, callback: () => void) => void;
