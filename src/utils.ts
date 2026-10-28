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

/** Opt-in redaction of sensitive data in exported urls. See README "URL sanitization". */
export interface UrlSanitizationConfig {
  enabled: boolean;
  /** Extra param names to redact, on top of `DEFAULT_SENSITIVE_PARAMS`. */
  sensitiveParams?: string[];
  /** Names from `DEFAULT_SENSITIVE_PARAMS` that should NOT be redacted. */
  excludeDefaultParams?: string[];
  /**
   * Replaces the built-in sanitizer (the lists above are then ignored).
   * May be called more than once on the same url, so it must return the same
   * result when given its own output.
   */
  sanitizeUrl?: (url: string) => string;
}

/** Param names redacted by default. Matched case-insensitively, `-` and `_` alike. */
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
  'pwd',
  'auth_token',
  'session_id',
  'x_api_key',
  'aws_access_key_id',
];

const REDACTED = 'REDACTED';

// span / log attributes whose whole value is a url
const URL_ATTRIBUTE_KEYS = [
  'url.full',
  'http.url',
  'location.href',
  'new.location.href',
  'root_span.http.url',
  'url.query',
  'http.target',
];

// Web Vitals attribution attributes (`browser.web_vital.attribution.<key>`) hold many
// kinds of values: urls, CSS selectors (`div#main [key="v"]`), plain text (`complete`),
// numbers. Only keys whose name ends in `url` hold a url (e.g. LCP's `url`, the image
// that was the largest paint), so only those are sanitized; everything else is left alone.
const WEB_VITAL_URL_ATTRIBUTE = /^browser\.web_vital\.attribution\.\w*url$/i;

// `https://user:pass@host/` -> captures `https://`; everything up to the last `@`
// before the path is the credentials (a password may itself contain `@`)
const URL_CREDENTIALS = /^((?:[a-z][a-z\d+.-]*:)?\/\/)[^/?#]*@/i;

// characters that only appear in a param value when it carries its own url or query,
// e.g. `?next=https://b.com/?token=..` or `?id=1?token=..`
const NESTED_URL_CHARS = /[?#@]/;

// How many urls-inside-urls deep we look for secrets. Real redirect chains are 1-2
// levels. A value still nested past this depth is redacted whole instead of being
// inspected, which keeps the work and the recursion depth small for crafted urls.
const MAX_NESTED_URL_DEPTH = 3;

// query pairs are separated by `&` (and sometimes `;`); the capture group keeps the
// separators in the split result so joining the parts gives back the original string
const PAIR_SEPARATOR = /([&;])/;

/** Percent-decodes `s`; returns it unchanged if it isn't valid percent-encoding. */
const safeDecode = (s: string): string => {
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  } catch {
    return s;
  }
};

/**
 * Lowercases and drops `_` and `-`, so `accessToken`, `access_token` and `Access-Token`
 * all compare equal. Still a whole-name match: `my_token` does not match `token`.
 */
const normalizeParamName = (name: string): string =>
  name.toLowerCase().replace(/[-_]/g, '');

/**
 * Turns a raw param name from a url into the names we compare against the sensitive list.
 * A bracketed name gives one candidate per part, so a secret in any part is found:
 * `%74oken` -> [`token`], `!token` -> [`token`], `token[0]` -> [`token`, `0`],
 * `filter[token][eq]` -> [`filter`, `token`, `eq`].
 */
const toComparableParamNames = (rawName: string): string[] =>
  safeDecode(rawName)
    // the first pair of a hash-bang fragment includes its `!` (`#!token=x`)
    .replace(/^!/, '')
    // a plain split, not a regex: runs in linear time even for `[[[[...` names in crafted urls
    .split('[')
    .map((part) => normalizeParamName(part.replace(/\]$/, '')));

/** Config may come from untyped JS; anything that isn't a list of strings is ignored. */
const toStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];

/**
 * Returns a function that redacts sensitive data in a url, or `undefined` when the
 * feature is off (callers then skip sanitization entirely).
 *
 * The url is edited as a string, never parsed and re-serialized with `new URL`, so
 * everything that isn't redacted (encoding, case, ports, valueless `flag` params)
 * is exported exactly as captured.
 */
export const createUrlSanitizer = (
  config?: UrlSanitizationConfig,
): ((url: string) => string) | undefined => {
  if (!config?.enabled) return undefined;
  if (config.sanitizeUrl) return config.sanitizeUrl;

  const excludedParams = new Set(
    toStringList(config.excludeDefaultParams).map(normalizeParamName),
  );
  const sensitiveParams = new Set(
    [
      ...DEFAULT_SENSITIVE_PARAMS.filter(
        (name) => !excludedParams.has(normalizeParamName(name)),
      ),
      ...toStringList(config.sensitiveParams),
    ].map(normalizeParamName),
  );

  // The functions below call each other: a param value can itself be a url, which is
  // sanitized with the same steps. `depth` counts how many urls deep we are.

  /**
   * Should this `name=value` pair be redacted?
   * Yes if the name is sensitive, or if the value is itself a url/query that
   * contains something sensitive (`?next=https://b.com/?token=..`).
   */
  const shouldRedactPair = (
    rawName: string,
    rawValue: string,
    depth: number,
  ): boolean => {
    const names = toComparableParamNames(rawName);
    if (names.some((name) => sensitiveParams.has(name))) return true;

    const value = safeDecode(rawValue);
    if (!NESTED_URL_CHARS.test(value)) return false;
    if (depth >= MAX_NESTED_URL_DEPTH) return true; // too deep to inspect, redact to be safe

    // The value is a url. We redact the whole value instead of just its secret part:
    // it arrived percent-encoded, and editing inside it would mean decoding and
    // re-encoding, which can change bytes that aren't secret.
    return sanitizeUrlAtDepth(value, depth + 1) !== value;
  };

  /**
   * Redacts values in a `name=value&name=value` string (no leading `?`).
   * `a=1&token=x;b=2` -> `a=1&token=REDACTED;b=2`
   */
  const redactParamPairs = (pairs: string, depth: number): string =>
    pairs
      .split(PAIR_SEPARATOR)
      .map((part) => {
        const equalsAt = part.indexOf('=');
        // separators (`&`, `;`) and valueless params (`flag`) are kept as they are
        if (equalsAt < 0) return part;

        const name = part.slice(0, equalsAt);
        const value = part.slice(equalsAt + 1);
        return shouldRedactPair(name, value, depth)
          ? `${name}=${REDACTED}`
          : part;
      })
      .join('');

  /**
   * Redacts the query string of `text`, if it has one; the part before `?` is kept.
   * `/path?token=x&a=1` -> `/path?token=REDACTED&a=1`
   */
  const redactQueryString = (text: string, depth: number): string => {
    const questionMarkAt = text.indexOf('?');
    if (questionMarkAt < 0) return text;

    const beforeQuery = text.slice(0, questionMarkAt + 1); // includes the `?`
    const query = text.slice(questionMarkAt + 1);
    return beforeQuery + redactParamPairs(query, depth);
  };

  /**
   * Redacts the part after `#`. Apps put secrets there in two shapes:
   * - hash-router routes with a query: `#/login?token=x`, `#login?token=x`
   * - OAuth-style pairs: `#access_token=x&state=1`, `#!token=x`
   * We can't reliably tell the shapes apart, so both are checked:
   * 1. the part before the first `?` is read as pairs. A `?` inside a value
   *    (`#access_token=x&state=/dash?tab=1`) stays inside that value. A route
   *    path (`#/a=1/b?..`) has no pairs, so for it only step 2 applies.
   * 2. the part after the first `?` is read as a query.
   * Routes (`#/users/1`) and anchors (`#section-2`) contain no sensitive pairs,
   * so they come out unchanged.
   */
  const redactFragment = (fragment: string, depth: number): string => {
    const questionMarkAt = fragment.indexOf('?');
    if (questionMarkAt < 0) return redactParamPairs(fragment, depth);

    const beforeQuery = fragment.slice(0, questionMarkAt);
    const query = fragment.slice(questionMarkAt + 1);
    // A pair like `state=/dash?tab=1` spans the `?`: check it as one pair. A route
    // (starts with `/`) is a path, never pairs, even with `=` in it (`#/a=1/b?token=..`).
    const isRoutePath = fragment.startsWith('/');
    if (!isRoutePath && beforeQuery.includes('=')) {
      return redactParamPairs(fragment, depth);
    }

    return `${redactParamPairs(beforeQuery, depth)}?${redactParamPairs(
      query,
      depth,
    )}`;
  };

  /** `https://user:pass@host/` -> `https://REDACTED:REDACTED@host/` */
  const redactCredentials = (url: string): string =>
    url.replace(URL_CREDENTIALS, `$1${REDACTED}:${REDACTED}@`);

  /**
   * Redacts credentials, then the query, then each `#` section on its own.
   * Splitting at every `#` (not just the first) means a second `#` starts a new
   * section (`#/a?x=1#token=2`) instead of becoming part of the last value. A loop,
   * not recursion, so a crafted url with thousands of `#` can't overflow the stack.
   */
  const sanitizeUrlAtDepth = (url: string, depth: number): string => {
    const [beforeHash, ...fragments] = redactCredentials(url).split('#');
    return [
      redactQueryString(beforeHash, depth),
      ...fragments.map((fragment) => redactFragment(fragment, depth)),
    ].join('#');
  };

  return (url: string) => sanitizeUrlAtDepth(url, 0);
};

/**
 * Sanitizes, in place, every url-valued attribute of a span or log.
 * No-op when `sanitizeUrl` is undefined (feature off).
 */
export const sanitizeUrlAttributes = (
  attributes: Record<string, unknown>,
  sanitizeUrl?: (url: string) => string,
) => {
  if (!sanitizeUrl) return;

  // A custom `sanitizeUrl` may throw or return a non-string. Fail closed: export
  // `REDACTED` rather than the raw url, keep the attribute a string, and never let
  // the error stop the span or log from being exported.
  const sanitizeOrRedact = (url: string): string => {
    try {
      const result: unknown = sanitizeUrl(url);
      return typeof result === 'string' ? result : REDACTED;
    } catch {
      return REDACTED;
    }
  };

  // attributes whose whole value is a url
  for (const key of URL_ATTRIBUTE_KEYS) {
    const value = attributes[key];
    if (typeof value !== 'string') continue;

    if (key === 'url.query' && !value.startsWith('?')) {
      // `url.query` is only the query, without the leading `?` (`token=1&a=2`);
      // add it so the sanitizer reads it as a query, then remove it again
      attributes[key] = sanitizeOrRedact(`?${value}`).replace(/^\?/, '');
    } else {
      attributes[key] = sanitizeOrRedact(value);
    }
  }

  // Web Vitals attribution keys that hold a url
  for (const key of Object.keys(attributes)) {
    const value = attributes[key];
    if (WEB_VITAL_URL_ATTRIBUTE.test(key) && typeof value === 'string') {
      attributes[key] = sanitizeOrRedact(value);
    }
  }
};
