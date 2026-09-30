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

type LCPAttributionKeys = keyof LCPMetricWithAttribution['attribution'];
type CLSAttributionKeys = keyof CLSMetricWithAttribution['attribution'];
type INPAttributionKeys = keyof INPMetricWithAttribution['attribution'];
type FCPAttributionKeys = keyof FCPMetricWithAttribution['attribution'];
type TTFBAttributionKeys = keyof TTFBMetricWithAttribution['attribution'];

export interface WebVitalsConfig {
  disableLogging?: boolean;
  lcp?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    includeRawAttribution?: LCPAttributionKeys[];
  };
  cls?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    includeRawAttribution?: CLSAttributionKeys[];
  };
  inp?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    includeRawAttribution?: INPAttributionKeys[];
  };
  fcp?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    includeRawAttribution?: FCPAttributionKeys[];
  };
  ttfb?: {
    reportAllChanges?: boolean;
    reportSoftNavs?: boolean;
    includeRawAttribution?: TTFBAttributionKeys[];
  };
}

export class WebVitalsLogsInstrumentation extends InstrumentationBase {
  private logsExporter: SumoLogicLogsExporter;
  private webVitalsConfig: WebVitalsConfig;

  constructor(
    logsExporter: SumoLogicLogsExporter,
    config = {},
    webVitalsConfig: WebVitalsConfig = { disableLogging: true },
  ) {
    // Must be constructed with { enabled: false } so super() does not call enable() prematurely.
    // super() calls enable() when config.enabled is true (the default), which would fire before
    // this.webVitalsConfig is assigned — causing disableLogging and includeRawAttribution to be ignored.
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
    if (this.webVitalsConfig.disableLogging) return;

    const report = (
      metric: MetricWithAttribution,
      attributionKeys?: string[],
    ) => {
      const target = getAttributionTarget(metric);
      const attributes: Record<string, unknown> = {
        [WEB_VITAL_ATTR.NAME]: metric.name.toLowerCase(),
        [WEB_VITAL_ATTR.VALUE]: metric.value,
        [WEB_VITAL_ATTR.RATING]: metric.rating,

        // `delta` equals `value` on the first emission; subsequent emissions report only the change
        [WEB_VITAL_ATTR.DELTA]: metric.delta,
        [WEB_VITAL_ATTR.ID]: metric.id,
        [WEB_VITAL_ATTR.NAVIGATION_TYPE]: metric.navigationType,
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
        scope: { name: PACKAGE_NAME, version: PACKAGE_VERSION },

        // browser.web_vital.* attributes are development-stability per OTel semconv
        // https://opentelemetry.io/docs/specs/semconv/browser/browser-events/#webvital-event

        attributes,
      });
    };

    const { lcp, cls, inp, fcp, ttfb } = this.webVitalsConfig;

    onLCP((m) => report(m, lcp?.includeRawAttribution), {
      reportAllChanges: lcp?.reportAllChanges,
      reportSoftNavs: lcp?.reportSoftNavs,
    });
    onCLS((m) => report(m, cls?.includeRawAttribution), {
      reportAllChanges: cls?.reportAllChanges,
      reportSoftNavs: cls?.reportSoftNavs,
    });
    onINP((m) => report(m, inp?.includeRawAttribution), {
      reportAllChanges: inp?.reportAllChanges,
      reportSoftNavs: inp?.reportSoftNavs,
    });
    onFCP((m) => report(m, fcp?.includeRawAttribution), {
      reportAllChanges: fcp?.reportAllChanges,
      reportSoftNavs: fcp?.reportSoftNavs,
    });
    onTTFB((m) => report(m, ttfb?.includeRawAttribution), {
      reportAllChanges: ttfb?.reportAllChanges,
      reportSoftNavs: ttfb?.reportSoftNavs,
    });
  }
  // web-vitals callbacks cannot be unregistered after registration
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override disable() {}
}
