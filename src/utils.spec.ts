import {
  getUserInteractionSpanName,
  getCollectionSourceUrl,
  createUrlSanitizer,
  sanitizeUrlAttributes,
} from './utils';

describe('utils', () => {
  describe('getUserInteractionSpanName', () => {
    const eventType: keyof HTMLElementEventMap = 'click';
    const createElementWithTextContent = (textContent: string) => {
      const element = document.createElement('div');
      element.textContent = textContent;
      return element;
    };

    test('should return user interaction span name', () => {
      const element = createElementWithTextContent('This is DIV');
      expect(getUserInteractionSpanName(eventType, element)).toBe(
        `click on 'This is DIV'`,
      );
    });

    test('should return user interaction span name with truncated element name', () => {
      const element = createElementWithTextContent(
        'This is DIV element with long content string',
      );
      expect(getUserInteractionSpanName(eventType, element)).toBe(
        `click on 'This is DIV eleme...'`,
      );
    });

    test('should return user interaction span name with truncated element name based on given limit', () => {
      const element = createElementWithTextContent(
        'This is DIV element with long content string',
      );
      expect(getUserInteractionSpanName(eventType, element, 10)).toBe(
        `click on 'This is...'`,
      );
    });
  });

  describe('getCollectionSourceUrl', () => {
    test('works with new SumoLogic URLs', () => {
      expect(
        getCollectionSourceUrl(
          'https://stag-rum-events.sumologic.net/receiver/v1/rum/aA-bB_cC==',
        ),
      ).toBe(
        'https://stag-rum-events.sumologic.net/receiver/v1/rum/aA-bB_cC==/',
      );
    });

    test('works with old SumoLogic URLs', () => {
      expect(
        getCollectionSourceUrl(
          'https://stag-rum-events.sumologic.net/receiver/v1/traces/aA-bB_cC==',
        ),
      ).toBe(
        'https://stag-rum-events.sumologic.net/receiver/v1/traces/aA-bB_cC==/',
      );
    });

    test('works with OTLP endpoint', () => {
      expect(getCollectionSourceUrl('https://my-api-endpoint')).toBe(
        'https://my-api-endpoint/',
      );
      expect(getCollectionSourceUrl('https://my-api-endpoint/')).toBe(
        'https://my-api-endpoint/',
      );
    });

    test('works with OTLP traces endpoint', () => {
      expect(getCollectionSourceUrl('https://my-api-endpoint/v1/traces')).toBe(
        'https://my-api-endpoint/',
      );
      expect(getCollectionSourceUrl('https://my-api-endpoint/v1/traces/')).toBe(
        'https://my-api-endpoint/',
      );
    });

    test('works with OTLP metrics endpoint', () => {
      expect(getCollectionSourceUrl('https://my-api-endpoint/v1/metrics')).toBe(
        'https://my-api-endpoint/',
      );
      expect(
        getCollectionSourceUrl('https://my-api-endpoint/v1/metrics/'),
      ).toBe('https://my-api-endpoint/');
    });

    test('works with OTLP logs endpoint', () => {
      expect(getCollectionSourceUrl('https://my-api-endpoint/v1/logs')).toBe(
        'https://my-api-endpoint/',
      );
      expect(getCollectionSourceUrl('https://my-api-endpoint/v1/logs/')).toBe(
        'https://my-api-endpoint/',
      );
    });
  });

  describe('createUrlSanitizer', () => {
    test('returns undefined when disabled', () => {
      expect(createUrlSanitizer(undefined)).toBeUndefined();
      expect(createUrlSanitizer({ enabled: false })).toBeUndefined();
    });

    test('redacts default params and credentials, keeps others', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://u:p@a.com/x?Token=abc&page=2')).toBe(
        'https://REDACTED:REDACTED@a.com/x?Token=REDACTED&page=2',
      );
    });

    test('sensitiveParams adds, excludeDefaultParams removes', () => {
      const fn = createUrlSanitizer({
        enabled: true,
        sensitiveParams: ['MyId'],
        excludeDefaultParams: ['auth'],
      })!;
      expect(fn('https://a.com/?myid=1&auth=2&token=3')).toBe(
        'https://a.com/?myid=REDACTED&auth=2&token=REDACTED',
      );
    });

    test('redacts relative urls', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('/rel?token=abc&a=1')).toBe('/rel?token=REDACTED&a=1');
    });

    test('redacts query-shaped fragments, leaves routes and anchors', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/cb#access_token=abc&state=1')).toBe(
        'https://a.com/cb#access_token=REDACTED&state=1',
      );
      expect(fn('https://a.com/cb#&id_token=abc&state=1')).toBe(
        'https://a.com/cb#&id_token=REDACTED&state=1',
      );
      expect(fn('https://a.com/#/users/1')).toBe('https://a.com/#/users/1');
      expect(fn('https://a.com/#section-2')).toBe('https://a.com/#section-2');
      expect(fn('https://a.com/a?token=t#step2')).toBe(
        'https://a.com/a?token=REDACTED#step2',
      );
    });

    test('redacts fragments of relative urls, keeps anchors after a query', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('/cb#access_token=abc&state=1')).toBe(
        '/cb#access_token=REDACTED&state=1',
      );
      expect(fn('/a.js?token=t#step2')).toBe('/a.js?token=REDACTED#step2');
    });

    test('redacts signed-URL params case-insensitively', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(
        fn('https://x.com/a?AWSAccessKeyId=AK&Signature=s&Expires=1'),
      ).toBe(
        'https://x.com/a?AWSAccessKeyId=REDACTED&Signature=REDACTED&Expires=1',
      );
    });

    test('redacts S3, GCS and Azure SAS signed-URL params', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(
        fn(
          'https://b.s3.amazonaws.com/a.js?X-Amz-Credential=c&X-Amz-Security-Token=t&X-Amz-Signature=s',
        ),
      ).toBe(
        'https://b.s3.amazonaws.com/a.js?X-Amz-Credential=REDACTED&X-Amz-Security-Token=REDACTED&X-Amz-Signature=REDACTED',
      );
      expect(
        fn('https://storage.googleapis.com/b/a.js?X-Goog-Signature=s'),
      ).toBe('https://storage.googleapis.com/b/a.js?X-Goog-Signature=REDACTED');
      expect(
        fn('https://acct.blob.core.windows.net/c/a.js?sv=2024&sig=s'),
      ).toBe('https://acct.blob.core.windows.net/c/a.js?sv=2024&sig=REDACTED');
    });

    test('redacts id_token in fragment and leading & in relative fragment', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://app.example/cb#id_token=abc&state=1')).toBe(
        'https://app.example/cb#id_token=REDACTED&state=1',
      );
      expect(fn('/cb#&access_token=abc&state=1')).toBe(
        '/cb#&access_token=REDACTED&state=1',
      );
    });

    test('leaves urls without sensitive data byte-identical', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      for (const url of [
        'https://A.com',
        'https://a.com:443/x?q=a%20b&flag&q=a+b',
        'https://a.com/x?ok=1#a=b',
        'https://a.com/#/users/1?page=2',
        '/rel/path?x=1',
        'not a url',
        '',
      ]) {
        expect(fn(url)).toBe(url);
      }
    });

    test('only touches redacted values, rest of the url is preserved', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://A.com:443/x?token=1&q=a%20b&flag&q=a+b')).toBe(
        'https://A.com:443/x?token=REDACTED&q=a%20b&flag&q=a+b',
      );
    });

    test('matches percent-encoded param names', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/?api%5Fkey=s&x=1')).toBe(
        'https://a.com/?api%5Fkey=REDACTED&x=1',
      );
    });

    test('redacts credentials without a password', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://u@a.com/')).toBe('https://REDACTED:REDACTED@a.com/');
      expect(fn('https://a.com/x?e=a@b.com')).toBe('https://a.com/x?e=a@b.com');
    });

    test('redacts query inside hash-router fragments', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/#/login?token=abc&next=%2Fhome')).toBe(
        'https://a.com/#/login?token=REDACTED&next=%2Fhome',
      );
      expect(fn('https://a.com/?sig=1#/cb?access_token=t')).toBe(
        'https://a.com/?sig=REDACTED#/cb?access_token=REDACTED',
      );
    });

    test('redacts `;` separated, `[]` suffixed and fragment-route params', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/?a=1;token=x&b=2')).toBe(
        'https://a.com/?a=1;token=REDACTED&b=2',
      );
      expect(fn('https://a.com/?token[]=1&token%5B%5D=2')).toBe(
        'https://a.com/?token[]=REDACTED&token%5B%5D=REDACTED',
      );
      expect(fn('https://a.com/#a/b=1&access_token=x')).toBe(
        'https://a.com/#a/b=1&access_token=REDACTED',
      );
      expect(fn('https://a.com/#a=1?token=2')).toBe(
        'https://a.com/#a=REDACTED', // read as pairs; the value holds a nested query
      );
    });

    test('redacts a url nested in a param value, encoded or not', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/login?next=https://b.com/?token=1&x=2')).toBe(
        'https://a.com/login?next=REDACTED&x=2',
      );
      expect(
        fn('https://a.com/login?next=https%3A%2F%2Fb.com%2F%3Ftoken%3D1&x=2'),
      ).toBe('https://a.com/login?next=REDACTED&x=2');
      expect(fn('https://a.com/?r=https%3A%2F%2Fu%3Ap%40b.com%2F')).toBe(
        'https://a.com/?r=REDACTED',
      );
      expect(fn('https://a.com/#/cb?next=%2Fx%3Fapi_key%3D1')).toBe(
        'https://a.com/#/cb?next=REDACTED',
      );
    });

    test('keeps nested urls without sensitive data byte-identical', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      for (const url of [
        'https://a.com/login?next=https%3A%2F%2Fb.com%2F%3Fpage%3D2',
        'https://a.com/login?next=/home?tab=1',
        'https://a.com/?email=a%40b.com&q=what%3F',
        'https://a.com/?bad=%E0%A4%A&x=1',
      ]) {
        expect(fn(url)).toBe(url);
      }
    });

    test('ignores non-array param lists instead of throwing', () => {
      const fn = createUrlSanitizer({
        enabled: true,
        sensitiveParams: 'sid' as any,
        excludeDefaultParams: 'token' as any,
      })!;
      expect(fn('https://a.com/?sid=1&token=2')).toBe(
        'https://a.com/?sid=1&token=REDACTED',
      );
    });

    test('redacts a password containing @ in full', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://u:p@ss@host/x?e=a@b.com')).toBe(
        'https://REDACTED:REDACTED@host/x?e=a@b.com',
      );
    });

    test('treats - and _ alike, matches bracketed names', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(
        fn('https://a.com/?api-key=1&access-token=2&X-API-KEY=3&keep-me=4'),
      ).toBe(
        'https://a.com/?api-key=REDACTED&access-token=REDACTED&X-API-KEY=REDACTED&keep-me=4',
      );
      expect(fn('https://a.com/?user[password]=1&user[name]=bob')).toBe(
        'https://a.com/?user[password]=REDACTED&user[name]=bob',
      );
      expect(
        createUrlSanitizer({
          enabled: true,
          excludeDefaultParams: ['api-key'],
        })!('https://a.com/?api_key=1'),
      ).toBe('https://a.com/?api_key=1');
    });

    test('ignores non-string entries in param lists instead of throwing', () => {
      const fn = createUrlSanitizer({
        enabled: true,
        sensitiveParams: [1, null, 'sid'] as any,
        excludeDefaultParams: [undefined] as any,
      })!;
      expect(fn('https://a.com/?sid=1&token=2')).toBe(
        'https://a.com/?sid=REDACTED&token=REDACTED',
      );
    });

    test('redacts indexed and dashed names', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/?token[0]=1&ids[0]=2&aws-access-key-id=3')).toBe(
        'https://a.com/?token[0]=REDACTED&ids[0]=2&aws-access-key-id=REDACTED',
      );
    });

    test('deeply nested urls are redacted whole without deep recursion', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      let value = 'x';
      for (let i = 0; i < 40; i++) value = encodeURIComponent(`#?a=${value}`);
      // without the depth cap this input takes minutes; with it, well under a millisecond
      expect(fn(`https://a.com/?page=1&a=${value}`)).toBe(
        'https://a.com/?page=1&a=REDACTED',
      );

      // 3000 levels without encoding must not overflow the stack
      expect(fn(`https://a.com/?${'a=?'.repeat(3000)}`)).toContain(
        'a=REDACTED',
      );
    });

    test('redacts hash routes that start without `/`', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/#login?token=abc')).toBe(
        'https://a.com/#login?token=REDACTED',
      );
      expect(fn('https://a.com/#reset-password?token=abc&next=%2Fhome')).toBe(
        'https://a.com/#reset-password?token=REDACTED&next=%2Fhome',
      );
      expect(fn('https://a.com/#!token=abc')).toBe(
        'https://a.com/#!token=REDACTED',
      );
      expect(fn('https://a.com/#/x&token=1')).toBe(
        'https://a.com/#/x&token=REDACTED',
      );
    });

    test('a hash route with `=` in its path keeps the path', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/#/a=1/b?token=1&x=2')).toBe(
        'https://a.com/#/a=1/b?token=REDACTED&x=2',
      );
      expect(fn('https://a.com/#/filter=open/list')).toBe(
        'https://a.com/#/filter=open/list',
      );
      // OAuth pairs whose value is a path are unaffected
      expect(fn('https://a.com/cb#id_token=S&state=/dash?x=1')).toBe(
        'https://a.com/cb#id_token=REDACTED&state=/dash?x=1',
      );
    });

    test('hash routes and anchors without secrets stay unchanged', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      for (const url of [
        'https://a.com/#/users/1',
        'https://a.com/#section-2',
        'https://a.com/#login?page=2',
        'https://a.com/#!/settings/profile',
        'https://a.com/#/dashboard?tab=overview&range=7d',
        'https://a.com/page#:~:text=hello%20world',
      ]) {
        expect(fn(url)).toBe(url);
      }
    });

    test('matches camelCase names: `_` and `-` are ignored when comparing', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(
        fn(
          'https://a.com/?accessToken=a&refreshToken=b&clientSecret=c&privateKey=d&page=1',
        ),
      ).toBe(
        'https://a.com/?accessToken=REDACTED&refreshToken=REDACTED&clientSecret=REDACTED&privateKey=REDACTED&page=1',
      );
      // still whole-name matching
      expect(fn('https://a.com/?my_token=1&sortKey=2&tokenizer=3')).toBe(
        'https://a.com/?my_token=1&sortKey=2&tokenizer=3',
      );
      // sensitiveParams / excludeDefaultParams follow the same rule
      const custom = createUrlSanitizer({
        enabled: true,
        sensitiveParams: ['mySecret'],
        excludeDefaultParams: ['client-id'],
      })!;
      expect(custom('https://a.com/?my_secret=1&clientId=2')).toBe(
        'https://a.com/?my_secret=REDACTED&clientId=2',
      );
    });

    test('OAuth fragment with a path in another value still redacts the token', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/cb#access_token=S&redirect=/foo?bar')).toBe(
        'https://a.com/cb#access_token=REDACTED&redirect=/foo?bar',
      );
      expect(fn('https://a.com/cb#id_token=S&state=/dash?x=1')).toBe(
        'https://a.com/cb#id_token=REDACTED&state=/dash?x=1',
      );
      expect(fn('https://a.com/#!/login?token=S')).toBe(
        'https://a.com/#!/login?token=REDACTED',
      );
    });

    test('checks every part of a bracketed name', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(
        fn(
          'https://a.com/?user[password][]=S&filter[token][eq]=S&f[name][eq]=x',
        ),
      ).toBe(
        'https://a.com/?user[password][]=REDACTED&filter[token][eq]=REDACTED&f[name][eq]=x',
      );
    });

    test('long bracket-only names are handled in linear time', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      const url = `https://a.com/?${'['.repeat(200_000)}=1`;
      expect(fn(url)).toBe(url); // used to take minutes with a backtracking regex
    });

    test('sanitizing twice gives the same result as once', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      for (const url of [
        'https://u:p@a.com/x?token=1&q=a%20b#/r?sig=2',
        'https://a.com/?next=https%3A%2F%2Fb.com%2F%3Ftoken%3D1',
        'https://a.com/#access_token=x&state=1',
      ]) {
        expect(fn(fn(url))).toBe(fn(url));
      }
    });

    test('custom sanitizeUrl wins', () => {
      const fn = createUrlSanitizer({ enabled: true, sanitizeUrl: () => 'x' })!;
      expect(fn('https://a.com?token=1')).toBe('x');
    });

    test('sanitizeUrlAttributes rewrites known url keys only', () => {
      const attrs: Record<string, unknown> = {
        'http.url': 'https://a.com?token=1',
        other: 'https://a.com?token=1',
      };
      sanitizeUrlAttributes(attrs, createUrlSanitizer({ enabled: true }));
      expect(attrs['http.url']).toBe('https://a.com?token=REDACTED');
      expect(attrs.other).toBe('https://a.com?token=1');
    });

    test('sanitizeUrlAttributes fails closed when a custom sanitizer throws', () => {
      const attrs: Record<string, unknown> = {
        'http.url': 'https://a.com?token=1',
        'url.full': 'https://b.com',
      };
      const throwing = createUrlSanitizer({
        enabled: true,
        sanitizeUrl: () => {
          throw new Error('boom');
        },
      });
      expect(() => sanitizeUrlAttributes(attrs, throwing)).not.toThrow();
      expect(attrs).toEqual({ 'http.url': 'REDACTED', 'url.full': 'REDACTED' });
    });

    test('sanitizeUrlAttributes keeps attributes strings when a custom sanitizer returns a non-string', () => {
      const attrs: Record<string, unknown> = { 'http.url': 'https://a.com' };
      sanitizeUrlAttributes(attrs, (() => undefined) as any);
      expect(attrs['http.url']).toBe('REDACTED');
      sanitizeUrlAttributes(attrs, (() => 42) as any);
      expect(typeof attrs['http.url']).toBe('string');
    });

    test('sanitizeUrlAttributes only touches web vital attribution keys ending in url', () => {
      const custom = createUrlSanitizer({
        enabled: true,
        // a custom sanitizer that throws on anything that isn't an absolute url
        sanitizeUrl: (url) => new URL(url).origin,
      });
      const untouched = {
        'browser.web_vital.attribution.navigationEntry': JSON.stringify({
          name: 'https://a.com/page?token=2',
        }),
        'browser.web_vital.attribution.loadState': 'complete',
        'browser.web_vital.attribution.interactionType': 'pointer',
        'browser.web_vital.attribution.interactionTarget': 'div#x [key="v"]',
        'browser.web_vital.attribution.largestShiftTarget':
          "a[href='https://a.com/?token=1']",
        'browser.web_vital.attribution.timeToFirstByte': 12,
        'browser.web_vital.attribution.weird': `a${'['.repeat(50_000)}`,
      };
      for (const sanitizer of [createUrlSanitizer({ enabled: true }), custom]) {
        const attrs: Record<string, unknown> = {
          ...untouched,
          'browser.web_vital.attribution.url': 'https://a.com/img.png?sig=1',
        };
        sanitizeUrlAttributes(attrs, sanitizer);
        const { 'browser.web_vital.attribution.url': url, ...rest } = attrs;
        expect(rest).toEqual(untouched);
        expect(url).not.toContain('sig=1');
      }
    });

    test('sanitizeUrlAttributes redacts every kind of relative web vital url', () => {
      const cases: [string, string][] = [
        ['a/b.png?sig=1', 'a/b.png?sig=REDACTED'],
        ['./a.png?sig=1', './a.png?sig=REDACTED'],
        ['../x/a.png?sig=1', '../x/a.png?sig=REDACTED'],
        ['assets/app.js?token=1', 'assets/app.js?token=REDACTED'],
        ['index?token=1', 'index?token=REDACTED'],
        ['?token=1', '?token=REDACTED'],
        ['img.png#token=1', 'img.png#token=REDACTED'],
        ['#access_token=1', '#access_token=REDACTED'],
        ['/a b?token=1', '/a b?token=REDACTED'],
        ['/img.png?sig=1', '/img.png?sig=REDACTED'],
      ];
      for (const [value, expected] of cases) {
        const attrs: Record<string, unknown> = {
          'browser.web_vital.attribution.url': value,
        };
        sanitizeUrlAttributes(attrs, createUrlSanitizer({ enabled: true }));
        expect(attrs['browser.web_vital.attribution.url']).toBe(expected);
      }
    });

    test('handles thousands of `#` without recursion', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      for (const url of [
        `https://a.com/${'?#'.repeat(8000)}`,
        `https://a.com/#a${'?b#'.repeat(8000)}`,
        `https://a.com/?a=${'https://b.com/#x?'.repeat(20000)}`,
      ]) {
        expect(() => fn(url)).not.toThrow();
      }
      expect(fn('https://a.com/#/a?x=1#token=2#y=3')).toBe(
        'https://a.com/#/a?x=1#token=REDACTED#y=3',
      );
    });

    test('sanitizeUrlAttributes leaves web vital selectors and other non-url values alone', () => {
      const values = [
        'div#x [key="v"]',
        'button#submit.btn[data-token="1"]',
        'html>body>div#main',
        '#inp-target',
        'complete',
        'dom-content-loaded',
        'button#x[token="1"]',
        'div.card > a[href="/x?token=1"]',
      ];
      const attrs: Record<string, unknown> = Object.fromEntries(
        values.map((v, i) => [`browser.web_vital.attribution.k${i}`, v]),
      );
      const before = { ...attrs };
      sanitizeUrlAttributes(attrs, createUrlSanitizer({ enabled: true }));
      expect(attrs).toEqual(before);
    });

    test('sanitizeUrlAttributes covers url.query, http.target and relative attribution urls', () => {
      const attrs: Record<string, unknown> = {
        'url.query': 'token=1&a=2',
        'http.target': '/p?token=1',
        'browser.web_vital.attribution.url': '/img.png?sig=1',
        'browser.web_vital.attribution.lcpResourceUrl': 'img.png?token=1',
        'browser.web_vital.attribution.loadState': 'complete',
      };
      sanitizeUrlAttributes(attrs, createUrlSanitizer({ enabled: true }));
      expect(attrs).toEqual({
        'url.query': 'token=REDACTED&a=2',
        'http.target': '/p?token=REDACTED',
        'browser.web_vital.attribution.url': '/img.png?sig=REDACTED',
        'browser.web_vital.attribution.lcpResourceUrl':
          'img.png?token=REDACTED',
        'browser.web_vital.attribution.loadState': 'complete',
      });
    });

    test('sanitizeUrlAttributes ignores non-string values', () => {
      const attrs: Record<string, unknown> = { 'http.url': 5 };
      sanitizeUrlAttributes(attrs, () => 'x');
      expect(attrs['http.url']).toBe(5);
    });
  });
});
