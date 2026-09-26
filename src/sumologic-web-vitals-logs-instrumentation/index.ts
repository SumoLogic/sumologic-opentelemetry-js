import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals-v6';
import type { Metric } from 'web-vitals-v6';
import { SumoLogicLogsExporter } from '../sumologic-logs-exporter';

const PACKAGE_NAME = '@sumologic/opentelemetry-web-vitals-logs';
const PACKAGE_VERSION = '0.1.0';

export class WebVitalsLogsInstrumentation extends InstrumentationBase {
  private logsExporter: SumoLogicLogsExporter;

  constructor(logsExporter: SumoLogicLogsExporter, config = {}) {
    super(PACKAGE_NAME, PACKAGE_VERSION, config);
    this.logsExporter = logsExporter;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

  override enable() {
    const report = (metric: Metric) => {
      this.logsExporter.recordLog({
        type: 'webVital',
        message: `webVital: ${metric.name.toLowerCase()}`,
        scope: { name: PACKAGE_NAME, version: PACKAGE_VERSION },

        // browser.web_vital.* attributes are development-stability per OTel semconv
        // https://opentelemetry.io/docs/specs/semconv/browser/browser-events/#webvital-event

        attributes: {
          'browser.web_vital.name': metric.name.toLowerCase(),
          'browser.web_vital.value': metric.value,
          'browser.web_vital.rating': metric.rating,
          'browser.web_vital.delta': metric.delta,
          'browser.web_vital.id': metric.id,
          'browser.web_vital.navigation_type': metric.navigationType,
        },
      });
    };
    // reportAllChanges: false — emit only the final value per metric per page session

    onCLS(report);
    onFCP(report);
    onINP(report);
    onLCP(report);
    onTTFB(report);
  }
  // web-vitals callbacks cannot be unregistered after registration
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override disable() {}
}
