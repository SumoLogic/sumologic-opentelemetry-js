# Plan: Migrate Web Vitals to @opentelemetry/browser-instrumentation

## Context

The upstream OTel community is building `@opentelemetry/browser-instrumentation` (v0.8.1, experimental) which provides event/log-based Web Vitals instrumentation — the correct semantic model for these metrics (as discussed in https://github.com/open-telemetry/opentelemetry-browser/issues/18).

Currently this repo:

- Embeds Web Vitals as span events/attributes on the `documentLoad` span (inside `instrumentation-document-load` submodule fork)
- Uses `web-vitals` v2.1.4 (no INP support)
- Has a race condition where CLS/INP values may be lost if `endSpan` fires before the web-vitals callback on `pagehide`
- Ships custom Sumo Logic implementation of Web Vitals in the submodule fork

The new library captures CLS, INP, LCP, FCP, TTFB as **standalone log records** (not attached to a span), using `web-vitals` v6.2.2. This is the correct long-term approach and avoids the race condition entirely.

---

## Key difference: spans vs log records

| Current approach                                        | New approach                                                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Web Vitals are span events/attributes on `documentLoad` | Web Vitals are independent log records via `SumoLogicLogsExporter`                                               |
| `span.addEvent('largestContentfulPaint', 400)`          | `logger.emit({ eventName: 'web.vitals', attributes: { 'web.vital.name': 'LCP', 'web.vital.value': 400, ... } })` |
| Tied to span lifetime (race condition on pagehide)      | Fire-and-forget, emitted whenever the metric fires                                                               |
| Backend reads span events/tags → histogram metrics      | Backend needs new log-based extractor                                                                            |

---

## Maturity / Risk assessment

`@opentelemetry/browser-instrumentation` is **v0.8.1 and experimental**. This means:

- API may change before stable release
- No guarantees of backward compatibility between minor versions
- Not production-hardened yet

**Recommended approach**: adopt the library but wrap it so the old span-based metrics remain as a backward-compatible fallback until backend can migrate its extractor from span events → log records.

---

## Log record shape emitted by the new library

```json
{
  "eventName": "web.vitals",
  "severityNumber": 9,
  "attributes": {
    "web.vital.name": "LCP",
    "web.vital.value": 2400,
    "web.vital.delta": 2400,
    "web.vital.rating": "good",
    "web.vital.id": "v3-1234567890-1",
    "web.vital.navigation_type": "navigate"
  }
}
```

Metrics captured: **CLS, INP, LCP, FCP, TTFB** (note: FID is gone — deprecated by Google, not in the new library).

---

## Implementation plan

### Phase 1: Add new log-based Web Vitals (backward compatible)

#### 1. Add dependency

In root `package.json`:

```json
"@opentelemetry/browser-instrumentation": "^0.8.1"
```

#### 2. Wire up `WebVitalsInstrumentation` in `src/index.ts`

The new library uses OTel Logs API (`@opentelemetry/api-logs`). The existing `SumoLogicLogsExporter` already handles log records — wire `WebVitalsInstrumentation` to emit through it.

In `src/index.ts`, inside `registerInstrumentations()`:

```ts
import { WebVitalsInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/web-vitals';

// Add alongside existing instrumentations:
new WebVitalsInstrumentation({ enabled: false });
```

The logs pipeline is already set up (`SumoLogicLogsExporter` + `SumoLogicLogsInstrumentation`) so the log records will flow through the existing `sendBeacon` export path.

#### 3. Keep old span-based Web Vitals as-is (backward compat)

Do NOT touch `instrumentation-document-load/src/utils.ts` yet. Old `firstInputDelay`, `largestContentfulPaint`, `cumulativeLayoutShift` etc. continue to ship on the `documentLoad` span. Backend dashboards keep working.

---

### Phase 2: Backend migration (separate backend PR)

Backend needs a new log-based extractor that reads `web.vitals` log records instead of span events/tags.

The new extractor would look for:

- `log.eventName = "web.vitals"`
- `web.vital.name` attribute for metric type
- `web.vital.value` for the metric value

New metric names to emit (to be decided with backend team — could reuse existing names or add new ones):

- `web.vital.name = "LCP"` → `browser_time_to_lcp` (same as today, or new name)
- `web.vital.name = "INP"` → `browser_time_inp` (new)
- `web.vital.name = "CLS"` → `browser_cls` (same as today)
- `web.vital.name = "FCP"` → `browser_time_to_fcp` (same as today)
- `web.vital.name = "TTFB"` → `browser_time_to_fb` (same as today)

---

### Phase 3: Remove old span-based Web Vitals (after backend migrated)

Once backend is reading from log records:

1. Remove `getCLS/getFCP/getFID/getLCP/getTTFB` from `instrumentation-document-load/src/utils.ts`
2. Remove `vitalsMetricNames`, `missedMetrics` for web vitals, `vitalsMetricAsAttributes`
3. Remove `FIRST_INPUT_DELAY`, `LARGEST_CONTENTFUL_PAINT` etc from `EventNames.ts`
4. The `documentLoad` span becomes pure page-load timing again (no Web Vitals attached)
5. Remove the `web-vitals` direct dependency from root `package.json`

This also fixes the race condition — the new library handles its own `pagehide` timing internally without conflicting with the span's `endSpan`.

---

## Open questions before starting

1. **`SumoLogicLogsExporter` compatibility**: ❌ **Not compatible — bridge required.**
   `WebVitalsInstrumentation` extends `InstrumentationBase` and calls `this.logger.emit()` which requires a real OTel `LoggerProvider` registered globally via `logs.setGlobalLoggerProvider(...)`.
   `SumoLogicLogsExporter` is a hand-rolled class with its own `recordLog({ type, message })` interface — it is not an OTel `LoggerProvider` and cannot receive `logger.emit()` calls.

   Two options:

   - **Option A (recommended)**: Use `@opentelemetry/sdk-logs` — create a standard `LoggerProvider` + `BatchLogRecordProcessor` + `OTLPLogExporter`, register globally. Web Vitals flow through a proper OTel logs pipeline to `/v1/logs`. Clean, no glue code, fully standard.
   - **Option B**: Write a ~30-line `LoggerProvider` shim that forwards `logger.emit()` calls into `SumoLogicLogsExporter.recordLog()`. Reuses existing sendBeacon pipeline but is custom glue code.

   Option A is the right long-term choice since it removes the custom `SumoLogicLogsExporter` dependency entirely over time.

2. **Backend timeline**: Phase 1 can ship independently (new log records arrive at collector, currently ignored). Phase 3 (removing old span metrics) is blocked on backend. Agree on timeline with backend team before proceeding.

3. **`reportAllChanges`**: The new library supports `reportAllChanges: true` for INP/CLS (emit every update, not just final). Decision needed: do we want per-update records or just final? Final is simpler for backend aggregation.

---

## Verification

```bash
npm install
node scripts/bundle.js
npm run test:ut
npm run build
```

Manual check: open test page, interact, check DevTools Network. Should see:

1. `documentLoad` span with old Web Vitals attributes (backward compat — unchanged)
2. New OTLP logs POST containing `web.vitals` log records with `web.vital.name`, `web.vital.value` attributes
