import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals-v6/attribution';
import type {
  CLSMetricWithAttribution,
  FCPMetricWithAttribution,
  INPMetricWithAttribution,
  LCPMetricWithAttribution,
  TTFBMetricWithAttribution,
  MetricWithAttribution,
} from 'web-vitals-v6/attribution';
import { SumoLogicLogsExporter } from '../sumologic-logs-exporter';
import { SeverityNumber } from '@opentelemetry/api-logs';

const PACKAGE_NAME = '@sumologic/opentelemetry-web-vitals-logs';
const PACKAGE_VERSION = '0.1.0';
// Shared by reference so all web-vitals log records batch into one scopeLogs
// entry on export — the serializer groups by instrumentationScope object identity.
const SCOPE = { name: PACKAGE_NAME, version: PACKAGE_VERSION };

const WEB_VITAL_ATTR = {
  NAME: 'browser.web_vital.name',
  VALUE: 'browser.web_vital.value',
  RATING: 'browser.web_vital.rating',
  DELTA: 'browser.web_vital.delta',
  ID: 'browser.web_vital.id',
  NAVIGATION_TYPE: 'browser.web_vital.navigation_type',
  TARGET: 'browser.web_vital.target',
  ATTRIBUTION_PREFIX: 'browser.web_vital.attribution.',
} as const;

function getAttributionTarget(
  metric: MetricWithAttribution,
): string | undefined {
  switch (metric.name) {
    case 'CLS':
      return (metric as CLSMetricWithAttribution).attribution
        .largestShiftTarget;
    case 'INP':
      return (metric as INPMetricWithAttribution).attribution.interactionTarget;
    case 'LCP':
      return (metric as LCPMetricWithAttribution).attribution.target;
    default:
      return undefined;
  }
}

// Attribution key unions are inlined as string literals rather than derived via
// `keyof LCPMetricWithAttribution['attribution']` because this package publishes
// TypeScript declarations (types field in package.json). keyof derivations would
// reference web-vitals-v6/attribution in the emitted .d.ts, which is a
// devDependency and not installed in consumers' node_modules — causing TS errors.
// The _Assert* types below keep these unions in sync with the library at build time.
type LCPAttributionKeys =
  | 'target'
  | 'url'
  | 'navigationEntry'
  | 'lcpResourceEntry'
  | 'lcpEntry'
  | 'resourceBufferSize'
  | 'timeToFirstByte'
  | 'resourceLoadDelay'
  | 'resourceLoadDuration'
  | 'elementRenderDelay';
type CLSAttributionKeys =
  | 'largestShiftTarget'
  | 'largestShiftTime'
  | 'largestShiftValue'
  | 'largestShiftEntry'
  | 'largestShiftSource'
  | 'loadState';
type INPAttributionKeys =
  | 'interactionTarget'
  | 'interactionTime'
  | 'interactionType'
  | 'nextPaintTime'
  | 'processedEventEntries'
  | 'inputDelay'
  | 'processingDuration'
  | 'presentationDelay'
  | 'loadState'
  | 'longAnimationFrameEntries'
  | 'longestScript'
  | 'totalScriptDuration'
  | 'totalStyleAndLayoutDuration'
  | 'totalPaintDuration'
  | 'totalUnattributedDuration';
type FCPAttributionKeys =
  | 'timeToFirstByte'
  | 'firstByteToFCP'
  | 'loadState'
  | 'fcpEntry'
  | 'navigationEntry';
type TTFBAttributionKeys =
  | 'waitingDuration'
  | 'cacheDuration'
  | 'dnsDuration'
  | 'connectionDuration'
  | 'requestDuration'
  | 'navigationEntry';

// Compile-time assertions: if web-vitals-v6 adds new attribution keys these will
// fail at build time, reminding us to update the unions above.
// Compile-time exhaustiveness check: resolves to `true` if our union covers all
// library keys; resolves to `never` (causing a type error) if the library adds
// a new key we haven't added to the union above.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _: [
  keyof LCPMetricWithAttribution['attribution'] extends LCPAttributionKeys
    ? true
    : never,
  keyof CLSMetricWithAttribution['attribution'] extends CLSAttributionKeys
    ? true
    : never,
  keyof INPMetricWithAttribution['attribution'] extends INPAttributionKeys
    ? true
    : never,
  keyof FCPMetricWithAttribution['attribution'] extends FCPAttributionKeys
    ? true
    : never,
  keyof TTFBMetricWithAttribution['attribution'] extends TTFBAttributionKeys
    ? true
    : never,
] = [true, true, true, true, true];

export interface WebVitalsConfig {
  enabled?: boolean;
  lcp?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    durationThreshold?: number;
    includeRawAttribution?: LCPAttributionKeys[];
  };
  cls?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    durationThreshold?: number;
    includeRawAttribution?: CLSAttributionKeys[];
  };
  inp?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    durationThreshold?: number;
    includeRawAttribution?: INPAttributionKeys[];
  };
  fcp?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    durationThreshold?: number;
    includeRawAttribution?: FCPAttributionKeys[];
  };
  ttfb?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    durationThreshold?: number;
    includeRawAttribution?: TTFBAttributionKeys[];
  };
}

export class WebVitalsLogsInstrumentation extends InstrumentationBase {
  private logsExporter: SumoLogicLogsExporter;
  private webVitalsConfig: WebVitalsConfig;
  private _isEnabled = false;
  private _listenersRegistered = false;

  constructor(
    logsExporter: SumoLogicLogsExporter,
    config = {},
    webVitalsConfig: WebVitalsConfig = { enabled: false },
  ) {
    // Must be constructed with { enabled: false } so super() does not call enable() prematurely.
    // super() calls enable() when config.enabled is true (the default), which would fire before
    // this.webVitalsConfig is assigned — causing enabled and includeRawAttribution to be ignored.
    // registerOpenTelemetryInstrumentations() in index.ts calls enable() after construction,
    // by which point webVitalsConfig is fully assigned.
    super(PACKAGE_NAME, PACKAGE_VERSION, config);
    this.logsExporter = logsExporter;
    this.webVitalsConfig = webVitalsConfig;
  }

  init() {
    return [];
  }

  override enable() {
    if (!this.webVitalsConfig.enabled) return;

    this._isEnabled = true;

    if (this._listenersRegistered) return;
    this._listenersRegistered = true;

    const report = (
      metric: MetricWithAttribution,
      attributionKeys?: string[],
    ) => {
      if (!this._isEnabled) return;
      const target = getAttributionTarget(metric);
      const attributes: Record<string, unknown> = {
        [WEB_VITAL_ATTR.NAME]: metric.name.toLowerCase(),
        [WEB_VITAL_ATTR.VALUE]: metric.value,
        [WEB_VITAL_ATTR.RATING]: metric.rating,

        // `delta` equals `value` on the first emission; subsequent emissions report only the change
        [WEB_VITAL_ATTR.DELTA]: metric.delta,
        [WEB_VITAL_ATTR.ID]: metric.id,
        [WEB_VITAL_ATTR.NAVIGATION_TYPE]: metric.navigationType,
        // For soft-nav metrics, navigationURL is the URL of the route being measured —
        // which may differ from location.href by the time recordLog() is called.
        ...(metric.navigationURL !== undefined && {
          'http.url': metric.navigationURL,
        }),
        ...(target !== undefined && { [WEB_VITAL_ATTR.TARGET]: target }),
      };

      if (attributionKeys?.length) {
        for (const key of attributionKeys) {
          const val = metric.attribution[key] as unknown;
          if (val !== undefined) {
            attributes[`${WEB_VITAL_ATTR.ATTRIBUTION_PREFIX}${key}`] =
              val !== null && typeof val === 'object'
                ? JSON.stringify(val)
                : (val as string | number | boolean);
          }
        }
      }

      this.logsExporter.recordLog({
        severityNumber: SeverityNumber.INFO,
        type: 'webVital',
        message: `webVital: ${metric.name.toLowerCase()}`,
        scope: SCOPE,

        // browser.web_vital.* attributes are development-stability per OTel semconv
        // https://opentelemetry.io/docs/specs/semconv/browser/browser-events/#webvital-event

        attributes,
      });
    };

    const { lcp, cls, inp, fcp, ttfb } = this.webVitalsConfig;

    onLCP((m) => report(m, lcp?.includeRawAttribution), {
      reportAllChanges: lcp?.reportAllChanges,
      reportSoftNavs: lcp?.reportSoftNavs,
      durationThreshold: lcp?.durationThreshold,
    });

    // CLS is only supported in Chromium. See:
    // https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#browser-support
    onCLS((m) => report(m, cls?.includeRawAttribution), {
      reportAllChanges: cls?.reportAllChanges,
      reportSoftNavs: cls?.reportSoftNavs,
      durationThreshold: cls?.durationThreshold,
    });
    onINP((m) => report(m, inp?.includeRawAttribution), {
      reportAllChanges: inp?.reportAllChanges,
      reportSoftNavs: inp?.reportSoftNavs,
      durationThreshold: inp?.durationThreshold,
    });
    onFCP((m) => report(m, fcp?.includeRawAttribution), {
      reportAllChanges: fcp?.reportAllChanges,
      reportSoftNavs: fcp?.reportSoftNavs,
      durationThreshold: fcp?.durationThreshold,
    });
    onTTFB((m) => report(m, ttfb?.includeRawAttribution), {
      reportAllChanges: ttfb?.reportAllChanges,
      reportSoftNavs: ttfb?.reportSoftNavs,
      durationThreshold: ttfb?.durationThreshold,
    });
  }
  // web-vitals callbacks cannot be unregistered; disable() gates emission instead
  override disable() {
    this._isEnabled = false;
  }
}
