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

    test('falls back to regex for unparseable urls', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('/rel?token=abc&a=1')).toBe('/rel?token=REDACTED&a=1');
    });

    test('redacts query-shaped fragments, leaves routes and anchors', () => {
      const fn = createUrlSanitizer({ enabled: true })!;
      expect(fn('https://a.com/cb#access_token=abc&state=1')).toBe(
        'https://a.com/cb#access_token=REDACTED&state=1',
      );
      expect(fn('https://a.com/cb#&id_token=abc&state=1')).toBe(
        'https://a.com/cb#id_token=REDACTED&state=1',
      );
      expect(fn('https://a.com/#/users/1')).toBe('https://a.com/#/users/1');
      expect(fn('https://a.com/#section-2')).toBe('https://a.com/#section-2');
      expect(fn('https://a.com/a?token=t#step2')).toBe(
        'https://a.com/a?token=REDACTED#step2',
      );
    });

    test('regex fallback handles fragments and keeps them after a query', () => {
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
      expect(attrs['http.url']).toBe('https://a.com/?token=REDACTED');
      expect(attrs.other).toBe('https://a.com?token=1');
    });
  });
});
