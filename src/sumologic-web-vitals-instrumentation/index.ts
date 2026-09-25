import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals-v6';
import type { Metric } from 'web-vitals-v6';
import { trace, context, ROOT_CONTEXT } from '@opentelemetry/api';

const PACKAGE_NAME = '@sumologic/opentelemetry-web-vitals';
const PACKAGE_VERSION = '0.1.0';

export class WebVitalsInstrumentation extends InstrumentationBase {
  constructor(config = {}) {
    super(PACKAGE_NAME, PACKAGE_VERSION, config);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

  override enable() {
    console.log('[WebVitalsInstrumentation] enable() called');
    const tracer = trace.getTracer(PACKAGE_NAME, PACKAGE_VERSION);

    const report = (metric: Metric) => {
      // Use ROOT_CONTEXT so this span is not grouped with any active trace and
      // is not held by trace-processor waiting for child spans (30s timeout).
      // Web vitals are point-in-time measurements — fire-and-forget.
      console.log(
        '[WebVitalsInstrumentation] metric fired:',
        metric.name,
        metric.value,
      );
      context.with(ROOT_CONTEXT, () => {
        const span = tracer.startSpan('webVitals');
        span.setAttributes({
          'web.vital.name': metric.name,
          'web.vital.value': metric.value,
          'web.vital.rating': metric.rating,
          'web.vital.delta': metric.delta,
          'web.vital.id': metric.id,
        });
        span.end();
        console.log(
          '[WebVitalsInstrumentation] span ended:',
          span.spanContext().traceId,
          span.spanContext().spanId,
        );
      });
    };

    // reportAllChanges: false — emit only the final value per metric per page session
    // FID excluded — documentLoad instrumentation already captures it as firstInputDelay
    onCLS(report, { reportAllChanges: false });
    onFCP(report);
    onINP(report, { reportAllChanges: false });
    onLCP(report, { reportAllChanges: false });
    onTTFB(report);
  }

  // web-vitals callbacks cannot be unregistered after registration
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override disable() {}
}
