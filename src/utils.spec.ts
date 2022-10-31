import { getUserInteractionSpanName, getCollectionSourceUrl } from './utils';

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
      expect(getUserInteractionSpanName(eventType, element)).toBe(`click on 'This is DIV'`);
    });

    test('should return user interaction span name with truncated element name', () => {
      const element = createElementWithTextContent('This is DIV element with long content string');
      expect(getUserInteractionSpanName(eventType, element)).toBe(`click on 'This is DIV eleme...'`);
    });

    test('should return user interaction span name with truncated element name based on given limit', () => {
      const element = createElementWithTextContent('This is DIV element with long content string');
      expect(getUserInteractionSpanName(eventType, element, 10)).toBe(`click on 'This is...'`);
    });
  });

  describe('getCollectionSourceUrl', () => {
    test('works with new SumoLogic URLs', () => {
      expect(
        getCollectionSourceUrl(
          'https://stag-rum-events.sumologic.net/receiver/v1/rum/aA-bB_cC==',
        ),
      ).toBe('https://stag-rum-events.sumologic.net/receiver/v1/rum/aA-bB_cC==/');
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
      expect(getCollectionSourceUrl('https://my-api-endpoint/v1/metrics/')).toBe(
        'https://my-api-endpoint/',
      );
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
});
