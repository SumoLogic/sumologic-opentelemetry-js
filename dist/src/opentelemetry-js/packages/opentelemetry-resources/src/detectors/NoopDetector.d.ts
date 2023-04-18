import { Resource } from '../Resource';
import { Detector } from '../types';
export declare class NoopDetector implements Detector {
    detect(): Promise<Resource>;
}
export declare const noopDetector: NoopDetector;
