/**
 * Parses headers from config leaving only those that have defined values
 * @param partialHeaders
 */
export declare function parseHeaders(partialHeaders?: Partial<Record<string, unknown>>): Record<string, string>;
/**
 * Adds path (version + signal) to a no per-signal endpoint
 * @param url
 * @param path
 * @returns url + path
 */
export declare function appendResourcePathToUrl(url: string, path: string): string;
/**
 * Adds root path to signal specific endpoint when endpoint contains no path part and no root path
 * @param url
 * @returns url
 */
export declare function appendRootPathToUrlIfNeeded(url: string): string;
/**
 * Configure exporter trace timeout value from passed in value or environment variables
 * @param timeoutMillis
 * @returns timeout value in milliseconds
 */
export declare function configureExporterTimeout(timeoutMillis: number | undefined): number;
export declare function invalidTimeout(timeout: number, defaultTimeout: number): number;
