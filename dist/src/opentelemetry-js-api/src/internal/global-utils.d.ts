import { ContextManager } from '../context/types';
import { DiagLogger } from '../diag';
import { TextMapPropagator } from '../propagation/TextMapPropagator';
import type { TracerProvider } from '../trace/tracer_provider';
export declare function registerGlobal<Type extends keyof OTelGlobalAPI>(type: Type, instance: OTelGlobalAPI[Type], diag: DiagLogger, allowOverride?: boolean): boolean;
export declare function getGlobal<Type extends keyof OTelGlobalAPI>(type: Type): OTelGlobalAPI[Type] | undefined;
export declare function unregisterGlobal(type: keyof OTelGlobalAPI, diag: DiagLogger): void;
declare type OTelGlobalAPI = {
    version: string;
    diag?: DiagLogger;
    trace?: TracerProvider;
    context?: ContextManager;
    propagation?: TextMapPropagator;
};
export {};