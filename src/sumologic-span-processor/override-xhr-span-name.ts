import { Span } from '@opentelemetry/sdk-trace-base';
import { isXhrFetchSpan } from './utils';

export const onStart = (span: Span): void => {
  const currentName = span.name;

  const updatedName = `HTTP ${currentName.toUpperCase()}`;

  if (isXhrFetchSpan(span)) {
    span.updateName(updatedName);
  }
};
