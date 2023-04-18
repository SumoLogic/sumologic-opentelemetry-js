import { PerformanceEntries, PerformanceResourceTimingInfo, PropagateTraceHeaderCorsUrls } from './types';
import * as api from '@opentelemetry/api';
/**
 * Helper function to be able to use enum as typed key in type and in interface when using forEach
 * @param obj
 * @param key
 */
export declare function hasKey<O>(obj: O, key: keyof any): key is keyof O;
/**
 * Helper function for starting an event on span based on {@link PerformanceEntries}
 * @param span
 * @param performanceName name of performance entry for time start
 * @param entries
 */
export declare function addSpanNetworkEvent(span: api.Span, performanceName: string, entries: PerformanceEntries): api.Span | undefined;
/**
 * Helper function for adding network events
 * @param span
 * @param resource
 */
export declare function addSpanNetworkEvents(span: api.Span, resource: PerformanceEntries): void;
/**
 * sort resources by startTime
 * @param filteredResources
 */
export declare function sortResources(filteredResources: PerformanceResourceTiming[]): PerformanceResourceTiming[];
/**
 * Get closest performance resource ignoring the resources that have been
 * already used.
 * @param spanUrl
 * @param startTimeHR
 * @param endTimeHR
 * @param resources
 * @param ignoredResources
 * @param initiatorType
 */
export declare function getResource(spanUrl: string, startTimeHR: api.HrTime, endTimeHR: api.HrTime, resources: PerformanceResourceTiming[], ignoredResources?: WeakSet<PerformanceResourceTiming>, initiatorType?: string): PerformanceResourceTimingInfo;
/**
 * The URLLike interface represents an URL and HTMLAnchorElement compatible fields.
 */
export interface URLLike {
    hash: string;
    host: string;
    hostname: string;
    href: string;
    readonly origin: string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    username: string;
}
/**
 * Parses url using URL constructor or fallback to anchor element.
 * @param url
 */
export declare function parseUrl(url: string): URLLike;
/**
 * Parses url using URL constructor or fallback to anchor element and serialize
 * it to a string.
 *
 * Performs the steps described in https://html.spec.whatwg.org/multipage/urls-and-fetching.html#parse-a-url
 *
 * @param url
 */
export declare function normalizeUrl(url: string): string;
/**
 * Get element XPath
 * @param target - target element
 * @param optimised - when id attribute of element is present the xpath can be
 * simplified to contain id
 */
export declare function getElementXPath(target: any, optimised?: boolean): string;
/**
 * Checks if trace headers should be propagated
 * @param spanUrl
 * @private
 */
export declare function shouldPropagateTraceHeaders(spanUrl: string, propagateTraceHeaderCorsUrls?: PropagateTraceHeaderCorsUrls): boolean;
