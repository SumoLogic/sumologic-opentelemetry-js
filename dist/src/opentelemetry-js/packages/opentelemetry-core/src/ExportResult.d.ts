export interface ExportResult {
    code: ExportResultCode;
    error?: Error;
}
export declare enum ExportResultCode {
    SUCCESS = 0,
    FAILED = 1
}
