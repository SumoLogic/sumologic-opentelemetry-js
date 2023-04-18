import { Context } from '@opentelemetry/api';
export declare const wrapWithToString: <Nodule extends object, FieldName extends keyof Nodule>(nodule: Nodule, name: FieldName, wrapper: (original: Nodule[FieldName]) => Nodule[FieldName]) => Nodule[FieldName];
export declare const copyToStringFrom: <T>(target: T, source: object) => void;
export declare const getObjectContext: (object: object) => Context | undefined;
/**
 * All method called on the given object will have the given context.
 */
export declare const setObjectContext: (object: object, context: Context) => WeakMap<object, Context>;
