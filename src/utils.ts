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
    const limit =
      tryNumber(userInteractionElementNameLimit) ??
      DEFAULT_USER_INTERACTION_ELEMENT_NAME_LIMIT;
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

export interface UrlSanitizationConfig {
  enabled: boolean;
  // extra query param names to redact, on top of the built-in list
  sensitiveParams?: string[];
  // built-in param names that should NOT be redacted
  excludeDefaultParams?: string[];
  // full override; when set, the lists above are ignored
  sanitizeUrl?: (url: string) => string;
}

export const DEFAULT_SENSITIVE_PARAMS = [
  'password',
  'passwd',
  'secret',
  'api_key',
  'apikey',
  'auth',
  'authorization',
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'jwt',
  'session',
  'sessionid',
  'key',
  'private_key',
  'client_secret',
  'client_id',
  'signature',
  'hash',
  'AWSAccessKeyId',
  'sig',
  'X-Amz-Signature',
  'X-Amz-Credential',
  'X-Amz-Security-Token',
  'X-Goog-Signature',
];

const URL_ATTRIBUTE_KEYS = [
  'url.full',
  'http.url',
  'location.href',
  'new.location.href',
  'root_span.http.url',
];

const QUERY_SHAPED_FRAGMENT = /^&*[^=&/]+=/;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createUrlSanitizer = (
  config?: UrlSanitizationConfig,
): ((url: string) => string) | undefined => {
  if (!config?.enabled) return undefined;
  if (config.sanitizeUrl) return config.sanitizeUrl;

  const excluded = new Set(
    (config.excludeDefaultParams ?? []).map((p) => p.toLowerCase()),
  );
  const params = new Set(
    [
      ...DEFAULT_SENSITIVE_PARAMS.filter((p) => !excluded.has(p.toLowerCase())),
      ...(config.sensitiveParams ?? []),
    ].map((p) => p.toLowerCase()),
  );

  // true if anything was redacted. Case-insensitive; collect keys first, mutating while iterating is unsafe
  const redactParams = (searchParams: URLSearchParams): boolean => {
    const keys = new Set(
      Array.from(searchParams.keys()).filter((k) =>
        params.has(k.toLowerCase()),
      ),
    );
    keys.forEach((k) => searchParams.set(k, 'REDACTED'));
    return keys.size > 0;
  };

  return (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.username || urlObj.password) {
        urlObj.username = 'REDACTED';
        urlObj.password = 'REDACTED';
      }
      redactParams(urlObj.searchParams);
      // only query-shaped fragments (OAuth `#access_token=..`); SPA routes (`#/users/1`) and anchors stay untouched
      const fragment = urlObj.hash.slice(1);
      if (QUERY_SHAPED_FRAGMENT.test(fragment)) {
        const fragmentParams = new URLSearchParams(fragment);
        if (redactParams(fragmentParams)) {
          urlObj.hash = fragmentParams.toString();
        }
      }
      return urlObj.toString();
    } catch {
      let sanitized = url.replace(
        /\/\/[^:/@]+:[^/@]+@/,
        '//REDACTED:REDACTED@',
      );
      params.forEach((p) => {
        sanitized = sanitized.replace(
          new RegExp(`([?&#]${escapeRegExp(p)}(?:%3D|=))[^&#]*`, 'gi'),
          '$1REDACTED',
        );
      });
      return sanitized;
    }
  };
};

export const sanitizeUrlAttributes = (
  attributes: Record<string, unknown>,
  sanitizeUrl?: (url: string) => string,
) => {
  if (!sanitizeUrl) return;
  for (const key of URL_ATTRIBUTE_KEYS) {
    const value = attributes[key];
    if (typeof value === 'string') {
      attributes[key] = sanitizeUrl(value);
    }
  }
};
