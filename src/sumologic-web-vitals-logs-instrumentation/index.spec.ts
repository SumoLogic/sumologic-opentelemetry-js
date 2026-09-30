import { WebVitalsLogsInstrumentation } from './index';
import type { SumoLogicLogsExporter } from '../sumologic-logs-exporter';

// Capture callbacks and opts registered by web-vitals-v6 so we can fire them in tests
const vitalsCallbacks: Record<string, (metric: object) => void> = {};
const vitalsOpts: Record<string, object> = {};
jest.mock('web-vitals-v6/attribution', () => ({
  onCLS: (cb: (m: object) => void, opts?: object) => {
    vitalsCallbacks['CLS'] = cb;
    if (opts) vitalsOpts['CLS'] = opts;
  },
  onFCP: (cb: (m: object) => void, opts?: object) => {
    vitalsCallbacks['FCP'] = cb;
    if (opts) vitalsOpts['FCP'] = opts;
  },
  onINP: (cb: (m: object) => void, opts?: object) => {
    vitalsCallbacks['INP'] = cb;
    if (opts) vitalsOpts['INP'] = opts;
  },
  onLCP: (cb: (m: object) => void, opts?: object) => {
    vitalsCallbacks['LCP'] = cb;
    if (opts) vitalsOpts['LCP'] = opts;
  },
  onTTFB: (cb: (m: object) => void, opts?: object) => {
    vitalsCallbacks['TTFB'] = cb;
    if (opts) vitalsOpts['TTFB'] = opts;
  },
}));

const makeMetric = (
  name: string,
  attribution: Record<string, unknown> = {},
) => ({
  name,
  value: 123.45,
  rating: 'good',
  delta: 10,
  id: `v6-${name}-abc`,
  navigationType: 'navigate',
  attribution,
});

const makeExporter = () =>
  ({ recordLog: jest.fn() } as unknown as SumoLogicLogsExporter);

const BASE_ATTRS = (name: string) => ({
  'browser.web_vital.name': name.toLowerCase(),
  'browser.web_vital.value': 123.45,
  'browser.web_vital.rating': 'good',
  'browser.web_vital.delta': 10,
  'browser.web_vital.id': `v6-${name}-abc`,
  'browser.web_vital.navigation_type': 'navigate',
});

describe('WebVitalsLogsInstrumentation', () => {
  beforeEach(() => {
    for (const k of Object.keys(vitalsCallbacks)) delete vitalsCallbacks[k];
    for (const k of Object.keys(vitalsOpts)) delete vitalsOpts[k];
  });

  it('disables logging by default — no callbacks registered, no recordLog calls', () => {
    const exporter = makeExporter();
    const inst = new WebVitalsLogsInstrumentation(exporter, { enabled: false });
    inst.enable();
    expect(Object.keys(vitalsCallbacks)).toHaveLength(0);
    expect(exporter.recordLog).not.toHaveBeenCalled();
  });

  it('registers callbacks for all 5 vitals when disableLogging is explicitly false', () => {
    const inst = new WebVitalsLogsInstrumentation(
      makeExporter(),
      { enabled: false },
      { disableLogging: false },
    );
    inst.enable();
    expect(Object.keys(vitalsCallbacks).sort()).toEqual([
      'CLS',
      'FCP',
      'INP',
      'LCP',
      'TTFB',
    ]);
  });

  describe('recordLog payload', () => {
    const vitals = ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'];

    vitals.forEach((name) => {
      it(`calls recordLog with correct base shape for ${name}`, () => {
        const exporter = makeExporter();
        const inst = new WebVitalsLogsInstrumentation(
          exporter,
          { enabled: false },
          { disableLogging: false },
        );
        inst.enable();

        vitalsCallbacks[name](makeMetric(name));

        expect(exporter.recordLog).toHaveBeenCalledTimes(1);
        const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];

        expect(log.type).toBe('webVital');
        expect(log.message).toBe(`webVital: ${name.toLowerCase()}`);
        expect(log.scope).toEqual({
          name: '@sumologic/opentelemetry-web-vitals-logs',
          version: '0.1.0',
        });
        expect(log.attributes).toEqual(BASE_ATTRS(name));
      });
    });
  });

  describe('browser.web_vital.target (default attribution)', () => {
    const makeEnabled = (exporter: SumoLogicLogsExporter) => {
      const inst = new WebVitalsLogsInstrumentation(
        exporter,
        { enabled: false },
        { disableLogging: false },
      );
      inst.enable();
      return inst;
    };

    it('includes target for LCP from attribution.target', () => {
      const exporter = makeExporter();
      makeEnabled(exporter);
      vitalsCallbacks['LCP'](makeMetric('LCP', { target: 'img.hero' }));
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(log.attributes['browser.web_vital.target']).toBe('img.hero');
    });

    it('includes target for CLS from attribution.largestShiftTarget', () => {
      const exporter = makeExporter();
      makeEnabled(exporter);
      vitalsCallbacks['CLS'](
        makeMetric('CLS', { largestShiftTarget: 'div.banner' }),
      );
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(log.attributes['browser.web_vital.target']).toBe('div.banner');
    });

    it('includes target for INP from attribution.interactionTarget', () => {
      const exporter = makeExporter();
      makeEnabled(exporter);
      vitalsCallbacks['INP'](
        makeMetric('INP', { interactionTarget: 'button#submit' }),
      );
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(log.attributes['browser.web_vital.target']).toBe('button#submit');
    });

    it('omits target for FCP (no affected element)', () => {
      const exporter = makeExporter();
      makeEnabled(exporter);
      vitalsCallbacks['FCP'](makeMetric('FCP'));
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(log.attributes).not.toHaveProperty('browser.web_vital.target');
    });

    it('omits target for TTFB (no affected element)', () => {
      const exporter = makeExporter();
      makeEnabled(exporter);
      vitalsCallbacks['TTFB'](makeMetric('TTFB'));
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(log.attributes).not.toHaveProperty('browser.web_vital.target');
    });

    it('omits target when attribution target is undefined', () => {
      const exporter = makeExporter();
      makeEnabled(exporter);
      vitalsCallbacks['LCP'](makeMetric('LCP', { target: undefined }));
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(log.attributes).not.toHaveProperty('browser.web_vital.target');
    });
  });

  describe('includeRawAttribution', () => {
    it('emits primitive attribution keys as-is', () => {
      const exporter = makeExporter();
      const inst = new WebVitalsLogsInstrumentation(
        exporter,
        { enabled: false },
        {
          lcp: {
            includeRawAttribution: ['timeToFirstByte', 'elementRenderDelay'],
          },
        },
      );
      inst.enable();
      vitalsCallbacks['LCP'](
        makeMetric('LCP', { timeToFirstByte: 200, elementRenderDelay: 50 }),
      );
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(
        log.attributes['browser.web_vital.attribution.timeToFirstByte'],
      ).toBe(200);
      expect(
        log.attributes['browser.web_vital.attribution.elementRenderDelay'],
      ).toBe(50);
    });

    it('JSON-stringifies object attribution keys (entry fields)', () => {
      const exporter = makeExporter();
      const lcpEntry = { startTime: 800, size: 50000 };
      const inst = new WebVitalsLogsInstrumentation(
        exporter,
        { enabled: false },
        {
          lcp: { includeRawAttribution: ['lcpEntry'] },
        },
      );
      inst.enable();
      vitalsCallbacks['LCP'](makeMetric('LCP', { lcpEntry }));
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(log.attributes['browser.web_vital.attribution.lcpEntry']).toBe(
        JSON.stringify(lcpEntry),
      );
    });

    it('JSON-stringifies array attribution keys', () => {
      const exporter = makeExporter();
      const frames = [{ duration: 120 }, { duration: 80 }];
      const inst = new WebVitalsLogsInstrumentation(
        exporter,
        { enabled: false },
        {
          inp: { includeRawAttribution: ['longAnimationFrameEntries'] },
        },
      );
      inst.enable();
      vitalsCallbacks['INP'](
        makeMetric('INP', { longAnimationFrameEntries: frames }),
      );
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(
        log.attributes[
          'browser.web_vital.attribution.longAnimationFrameEntries'
        ],
      ).toBe(JSON.stringify(frames));
    });

    it('omits attribution key when value is undefined', () => {
      const exporter = makeExporter();
      const inst = new WebVitalsLogsInstrumentation(
        exporter,
        { enabled: false },
        {
          inp: { includeRawAttribution: ['longestScript'] },
        },
      );
      inst.enable();
      // longestScript not present in attribution — should be omitted
      vitalsCallbacks['INP'](makeMetric('INP', {}));
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(log.attributes).not.toHaveProperty(
        'browser.web_vital.attribution.longestScript',
      );
    });

    it('emits string attribution keys for CLS', () => {
      const exporter = makeExporter();
      const inst = new WebVitalsLogsInstrumentation(
        exporter,
        { enabled: false },
        {
          cls: {
            includeRawAttribution: [
              'largestShiftTarget',
              'largestShiftValue',
              'loadState',
            ],
          },
        },
      );
      inst.enable();
      vitalsCallbacks['CLS'](
        makeMetric('CLS', {
          largestShiftTarget: 'div.ad',
          largestShiftValue: 0.12,
          loadState: 'dom-interactive',
        }),
      );
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(
        log.attributes['browser.web_vital.attribution.largestShiftTarget'],
      ).toBe('div.ad');
      expect(
        log.attributes['browser.web_vital.attribution.largestShiftValue'],
      ).toBe(0.12);
      expect(log.attributes['browser.web_vital.attribution.loadState']).toBe(
        'dom-interactive',
      );
    });

    it('emits primitive attribution keys for TTFB', () => {
      const exporter = makeExporter();
      const inst = new WebVitalsLogsInstrumentation(
        exporter,
        { enabled: false },
        {
          ttfb: {
            includeRawAttribution: [
              'waitingDuration',
              'dnsDuration',
              'connectionDuration',
              'requestDuration',
            ],
          },
        },
      );
      inst.enable();
      vitalsCallbacks['TTFB'](
        makeMetric('TTFB', {
          waitingDuration: 10,
          dnsDuration: 5,
          connectionDuration: 20,
          requestDuration: 100,
        }),
      );
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(
        log.attributes['browser.web_vital.attribution.waitingDuration'],
      ).toBe(10);
      expect(log.attributes['browser.web_vital.attribution.dnsDuration']).toBe(
        5,
      );
      expect(
        log.attributes['browser.web_vital.attribution.connectionDuration'],
      ).toBe(20);
      expect(
        log.attributes['browser.web_vital.attribution.requestDuration'],
      ).toBe(100);
    });

    it('emits primitive attribution keys for FCP', () => {
      const exporter = makeExporter();
      const inst = new WebVitalsLogsInstrumentation(
        exporter,
        { enabled: false },
        {
          fcp: {
            includeRawAttribution: [
              'timeToFirstByte',
              'firstByteToFCP',
              'loadState',
            ],
          },
        },
      );
      inst.enable();
      vitalsCallbacks['FCP'](
        makeMetric('FCP', {
          timeToFirstByte: 150,
          firstByteToFCP: 300,
          loadState: 'loading',
        }),
      );
      const [log] = (exporter.recordLog as jest.Mock).mock.calls[0];
      expect(
        log.attributes['browser.web_vital.attribution.timeToFirstByte'],
      ).toBe(150);
      expect(
        log.attributes['browser.web_vital.attribution.firstByteToFCP'],
      ).toBe(300);
      expect(log.attributes['browser.web_vital.attribution.loadState']).toBe(
        'loading',
      );
    });
  });

  describe('webVitalsConfig options', () => {
    it('passes reportAllChanges, reportSoftNavs and durationThreshold opts to each vital', () => {
      const inst = new WebVitalsLogsInstrumentation(
        makeExporter(),
        { enabled: false },
        {
          lcp: {
            reportAllChanges: true,
            reportSoftNavs: true,
            durationThreshold: 100,
          },
          cls: { reportAllChanges: false, reportSoftNavs: false },
          inp: { reportAllChanges: true, durationThreshold: 0 },
          fcp: { reportSoftNavs: true },
          ttfb: { reportAllChanges: true, reportSoftNavs: false },
        },
      );
      inst.enable();
      expect(vitalsOpts['LCP']).toMatchObject({
        reportAllChanges: true,
        reportSoftNavs: true,
        durationThreshold: 100,
      });
      expect(vitalsOpts['CLS']).toMatchObject({
        reportAllChanges: false,
        reportSoftNavs: false,
      });
      expect(vitalsOpts['INP']).toMatchObject({
        reportAllChanges: true,
        durationThreshold: 0,
      });
      expect(vitalsOpts['FCP']).toMatchObject({ reportSoftNavs: true });
      expect(vitalsOpts['TTFB']).toMatchObject({
        reportAllChanges: true,
        reportSoftNavs: false,
      });
    });

    it('disableLogging suppresses all recordLog calls', () => {
      const exporter = makeExporter();
      const inst = new WebVitalsLogsInstrumentation(
        exporter,
        { enabled: false },
        { disableLogging: true },
      );
      inst.enable();
      // No callbacks should be registered when logging is disabled
      expect(Object.keys(vitalsCallbacks)).toHaveLength(0);
      expect(exporter.recordLog).not.toHaveBeenCalled();
    });
  });

  it('does not call recordLog if metric callback never fires', () => {
    const exporter = makeExporter();
    const inst = new WebVitalsLogsInstrumentation(
      exporter,
      { enabled: false },
      { disableLogging: false },
    );
    inst.enable();
    expect(exporter.recordLog).not.toHaveBeenCalled();
  });

  it('calls recordLog once per firing (no double-report)', () => {
    const exporter = makeExporter();
    const inst = new WebVitalsLogsInstrumentation(
      exporter,
      { enabled: false },
      { disableLogging: false },
    );
    inst.enable();

    vitalsCallbacks['LCP'](makeMetric('LCP'));
    vitalsCallbacks['LCP'](makeMetric('LCP'));

    expect(exporter.recordLog).toHaveBeenCalledTimes(2);
  });

  it('disable() does not throw', () => {
    const inst = new WebVitalsLogsInstrumentation(makeExporter(), {
      enabled: false,
    });
    inst.enable();
    expect(() => inst.disable()).not.toThrow();
  });
});
