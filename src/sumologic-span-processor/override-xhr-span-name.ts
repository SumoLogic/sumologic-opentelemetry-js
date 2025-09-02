import { Span } from '@opentelemetry/sdk-trace-base';
import { isXhrInstrumentationSpan } from './utils';

export const onStart = (span: Span): void => {
  const currentName = span.name;

  const updatedName = `HTTP ${currentName.toUpperCase()}`;

  if (isXhrInstrumentationSpan(span)) {
    span.updateName(updatedName);
  }
};
