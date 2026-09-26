import { WebVitalsLogsInstrumentation } from './index';
import type { SumoLogicLogsExporter } from '../sumologic-logs-exporter';

// Capture callbacks registered by web-vitals-v6 so we can fire them in tests
const vitalsCallbacks: Record<string, (metric: object) => void> = {};
jest.mock('web-vitals-v6', () => ({
  onCLS: (cb: (m: object) => void) => {
    vitalsCallbacks['CLS'] = cb;
  },
  onFCP: (cb: (m: object) => void) => {
    vitalsCallbacks['FCP'] = cb;
  },
  onINP: (cb: (m: object) => void) => {
    vitalsCallbacks['INP'] = cb;
  },
  onLCP: (cb: (m: object) => void) => {
    vitalsCallbacks['LCP'] = cb;
  },
  onTTFB: (cb: (m: object) => void) => {
    vitalsCallbacks['TTFB'] = cb;
  },
}));

const makeMetric = (name: string) => ({
  name,
  value: 123.45,
  rating: 'good',
  delta: 10,
  id: `v6-${name}-abc`,
  navigationType: 'navigate',
});

const makeExporter = () =>
  ({ recordLog: jest.fn() } as unknown as SumoLogicLogsExporter);

describe('WebVitalsLogsInstrumentation', () => {
  beforeEach(() => {
    // Clear captured callbacks before each test
    for (const k of Object.keys(vitalsCallbacks)) delete vitalsCallbacks[k];
  });

  it('registers callbacks for all 5 vitals on enable()', () => {
    const inst = new WebVitalsLogsInstrumentation(makeExporter());
    inst.enable();
    expect(Object.keys(vitalsCallbacks).sort()).toEqual([
      'CLS',
      'FCP',
      'INP',
      'LCP',
      'TTFB',
    ]);
  });

  it('registers callbacks immediately when constructed without config (default enabled)', () => {
    new WebVitalsLogsInstrumentation(makeExporter());
    // InstrumentationBase calls enable() in the constructor when enabled is not false
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
      it(`calls recordLog with correct shape for ${name}`, () => {
        const exporter = makeExporter();
        const inst = new WebVitalsLogsInstrumentation(exporter);
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
        expect(log.attributes).toEqual({
          'browser.web_vital.name': name.toLowerCase(),
          'browser.web_vital.value': 123.45,
          'browser.web_vital.rating': 'good',
          'browser.web_vital.delta': 10,
          'browser.web_vital.id': `v6-${name}-abc`,
          'browser.web_vital.navigation_type': 'navigate',
        });
      });
    });
  });

  it('does not call recordLog if metric callback never fires', () => {
    const exporter = makeExporter();
    const inst = new WebVitalsLogsInstrumentation(exporter);
    inst.enable();
    expect(exporter.recordLog).not.toHaveBeenCalled();
  });

  it('calls recordLog once per firing (no double-report)', () => {
    const exporter = makeExporter();
    const inst = new WebVitalsLogsInstrumentation(exporter);
    inst.enable();

    vitalsCallbacks['LCP'](makeMetric('LCP'));
    vitalsCallbacks['LCP'](makeMetric('LCP'));

    expect(exporter.recordLog).toHaveBeenCalledTimes(2);
  });

  it('disable() does not throw', () => {
    const inst = new WebVitalsLogsInstrumentation(makeExporter());
    inst.enable();
    expect(() => inst.disable()).not.toThrow();
  });
});
