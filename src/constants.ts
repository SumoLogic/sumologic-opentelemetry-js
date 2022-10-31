export const UNKNOWN_SERVICE_NAME = 'unknown';
export const BUFFER_MAX_SPANS = 2048;
export const MAX_EXPORT_BATCH_SIZE = 50;
export const BUFFER_TIMEOUT = 2_000;
export const DEFAULT_USER_INTERACTION_ELEMENT_NAME_LIMIT = 20;
export const INSTRUMENTED_EVENT_NAMES: (keyof HTMLElementEventMap)[] = [
  'click',
  'dblclick',
  'submit',
  'reset',
  'pause',
  'play',
  'dragstart',
  'dragend',
  'drop',
];
export const ROOT_SPAN_OPERATION = 'root_span.operation';
export const ROOT_SPAN_HTTP_URL = 'root_span.http.url';
export const XHR_IS_ROOT_SPAN = 'xhr.is_root_span';
export const HTTP_ACTION_TYPE = 'http.action_type';
