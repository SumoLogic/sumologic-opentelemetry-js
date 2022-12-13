import { Span } from '@opentelemetry/sdk-trace-base';
import { Context } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const onStart = (
  span: Span,
  context?: Context,
  getOverriddenServiceName?: (span: Span) => string,
): void => {
  const serviceName = getOverriddenServiceName?.(span);

  if (serviceName !== undefined) {
    span.setAttribute(SemanticResourceAttributes.SERVICE_NAME, serviceName);
  }
};
