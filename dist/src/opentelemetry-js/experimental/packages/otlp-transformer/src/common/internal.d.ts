import type { SpanAttributes } from '@opentelemetry/api';
import { IAnyValue, IKeyValue } from './types';
export declare function toAttributes(attributes: SpanAttributes): IKeyValue[];
export declare function toKeyValue(key: string, value: unknown): IKeyValue;
export declare function toAnyValue(value: unknown): IAnyValue;
export declare function hexToBuf(hex: string): Uint8Array | undefined;
export declare function bufToHex(buf?: Uint8Array | null): string | undefined;
