import { ExportResult } from '../ExportResult';
export interface Exporter<T> {
    export(arg: T, resultCallback: (result: ExportResult) => void): void;
}
/**
 * @internal
 * Shared functionality used by Exporters while exporting data, including suppresion of Traces.
 */
export declare function _export<T>(exporter: Exporter<T>, arg: T): Promise<ExportResult>;
