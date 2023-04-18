import { Resource } from './Resource';
import { ResourceDetectionConfig } from './config';
import { SpanAttributes } from '@opentelemetry/api';
/**
 * Interface for Resource attributes.
 * General `Attributes` interface is added in api v1.1.0.
 * To backward support older api (1.0.x), the deprecated `SpanAttributes` is used here.
 */
export declare type ResourceAttributes = SpanAttributes;
/**
 * Interface for a Resource Detector. In order to detect resources in parallel
 * a detector returns a Promise containing a Resource.
 */
export interface Detector {
    detect(config?: ResourceDetectionConfig): Promise<Resource>;
}
