import { SumoLogicLogsExporter } from '../sumologic-logs-exporter';
interface SumoLogicLogsInstrumentationOptions {
    exporter: SumoLogicLogsExporter;
}
export declare class SumoLogicLogsInstrumentation {
    private exporter;
    private isEnabled;
    constructor({ exporter }: SumoLogicLogsInstrumentationOptions);
    onError: (error: ErrorEvent) => void;
    onUnhandledRejection: ({ reason }: PromiseRejectionEvent) => void;
    onDocumentError: ({ target }: ErrorEvent) => void;
    onConsoleError: (args: any[]) => void;
    enable(): void;
    disable(): void;
}
export {};
