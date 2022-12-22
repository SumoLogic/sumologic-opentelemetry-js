import { Span } from '@opentelemetry/sdk-trace-base';
import { Context } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { DEFAULT_SERVICE_NAME } from '../constants';

interface ExtraConfig {
  getOverriddenServiceName?: (span: Span) => string;
  defaultServiceName: string;
}

export const onStart = (
  span: Span,
  context: Context | undefined,
  config: ExtraConfig,
): void => {
  const serviceName = config?.getOverriddenServiceName?.(span);

  if (serviceName !== undefined) {
    span.setAttribute(SemanticResourceAttributes.SERVICE_NAME, serviceName);
    span.setAttribute(DEFAULT_SERVICE_NAME, config.defaultServiceName);
  }
};
