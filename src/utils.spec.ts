import { getCollectionSourceUrl } from './utils';

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
