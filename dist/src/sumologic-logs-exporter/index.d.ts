import { Resource } from '@opentelemetry/resources';
import type { Attributes } from '@opentelemetry/api';
interface SumoLogicLogsExporterOptions {
    resource: Resource;
    attributes: Attributes;
    collectorUrl: string;
    maxQueueSize: number;
    scheduledDelayMillis: number;
}
export interface LogRecord {
    type: 'uncaughtException' | 'unhandledRejection' | 'consoleError' | 'documentError' | 'customError';
    message: string;
    arguments?: any[];
    element?: {
        xpath: string;
    };
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
    attributes?: Record<string, any>;
}
export interface CustomError {
    message: string;
    attributes?: Record<string, any>;
}
export declare class SumoLogicLogsExporter {
    private resource;
    private defaultAttributes;
    private collectorUrl;
    private maxQueueSize;
    private scheduledDelayMillis;
    private logs;
    private timer;
    constructor({ resource, attributes, collectorUrl, maxQueueSize, scheduledDelayMillis, }: SumoLogicLogsExporterOptions);
    private onVisibilityChange;
    private onPageHide;
    enable(): void;
    disable(): void;
    private exportWhenNeeded;
    recordLog(log: LogRecord): void;
    recordCustomError: (message: string, attributes?: Record<string, any> | undefined) => void;
    private export;
}
export {};
