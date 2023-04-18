import { OTLPExporterError } from '../../types';
export declare const resetSendWithBeacon: () => void;
/**
 * Send metrics/spans using browser navigator.sendBeacon
 * @param body
 * @param url
 * @param blobPropertyBag
 * @param onSuccess
 * @param onError
 */
export declare function sendWithBeacon(body: string, url: string, blobPropertyBag: BlobPropertyBag): boolean;
/**
 * function to send metrics/spans using browser XMLHttpRequest
 *     used when navigator.sendBeacon is not available
 * @param body
 * @param url
 * @param headers
 * @param onSuccess
 * @param onError
 */
export declare function sendWithXhr(body: string, url: string, headers: Record<string, string>, exporterTimeout: number, onSuccess: () => void, onError: (error: OTLPExporterError) => void): void;
