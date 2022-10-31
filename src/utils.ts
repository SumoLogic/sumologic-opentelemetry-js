import { DEFAULT_USER_INTERACTION_ELEMENT_NAME_LIMIT } from './constants';

export const getUserInteractionSpanName = (
  eventType: keyof HTMLElementEventMap,
  element: HTMLElement,
  userInteractionElementNameLimit?: number,
): string | undefined => {
  let id = '';
  let scanElement: HTMLElement | null = element;
  while (scanElement && !id) {
    id =
      scanElement.getAttribute('aria-label') ||
      scanElement.id ||
      scanElement.textContent ||
      '';
    id = id.trim();
    scanElement = scanElement.parentElement;
  }
  if (id) {
    const limit = tryNumber(userInteractionElementNameLimit) ?? DEFAULT_USER_INTERACTION_ELEMENT_NAME_LIMIT;
    if (limit > 0 && id.length > limit) {
      id = `${id.slice(0, limit - 3)}...`;
    }
    return `${eventType} on '${id}'`;
  }
};

export const tryNumber = (input?: string | number): number | undefined => {
  if (typeof input === 'number') {
    return input;
  }
  return input != null && Number.isFinite(+input) ? +input : undefined;
};

export const getCollectionSourceUrl = (sourceUrl: string): string => {
  const url = new URL(sourceUrl);
  url.pathname = url.pathname.replace(/\/v1\/(traces|metrics|logs)\/?$/, '');
  if (!url.pathname.endsWith('/')) {
    url.pathname += '/';
  }
  return url.href;
};
