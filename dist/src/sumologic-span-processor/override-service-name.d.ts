import { Span } from '@opentelemetry/sdk-trace-base';
import { Context } from '@opentelemetry/api';
interface ExtraConfig {
    getOverriddenServiceName?: (span: Span) => string;
    defaultServiceName: string;
}
export declare const onStart: (span: Span, context: Context | undefined, config: ExtraConfig) => void;
export {};
