import { Span } from '@opentelemetry/sdk-trace-base';
import { isXhrFetchOrXHRSpan } from './utils';

export const onStart = (span: Span): void => {
  const currentName = span.name;

  const updatedName = `HTTP ${currentName.toUpperCase()}`;

  if (isXhrFetchOrXHRSpan(span)) {
    span.updateName(updatedName);
  }
};
