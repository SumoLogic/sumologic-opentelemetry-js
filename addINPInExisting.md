# Plan: Add INP Support (replace deprecated FID)

## Context

FID (First Input Delay) is deprecated by Google as of March 2024 and replaced by INP (Interaction to Next Paint). INP measures responsiveness throughout the entire page session (worst interaction latency, not just first interaction).

Current state:

- `web-vitals` pinned at `^2.1.4` in root `package.json` — v2 has no INP support
- `getFID` is imported and used in `instrumentation-document-load/src/utils.ts`
- `EventNames` enum has no INP entry
- `vitalsMetricNames` map has no INP entry
- `missedMetrics` set includes `'FID'` as a required metric
- FID is kept alongside INP (backward compat, deprecated later)

**Backend finding**: The backend does NOT auto-detect new span attributes. Each metric has an explicit entry in `TraceMetricType.scala` and a `case` in `extractDocumentLoadDataPoint`. Backend changes are required to produce an `browser_time_inp` histogram. Both SDK and backend changes must land together (or backend first).

**Span lifecycle — when does `documentLoad` start and end?**

| Moment    | What happens                                                                                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Start** | `span.startTime = PTN.FETCH_START` — the navigation fetch timestamp from `PerformanceNavigationTiming`. This is essentially `t=0` for the page, before the HTML even starts downloading. |
| **End**   | Whichever comes first: (a) all `missedMetrics` fire → `endSpan()` called immediately, OR (b) `visibilitychange` (tab hidden) / `pagehide` (tab closed/navigated away) → forced end       |

So the span is **not just page load time**. It stays open for the entire user session on that page — minutes or hours — waiting for Web Vitals to fire. CLS and INP benefit from this because they need to observe the whole session.

**How CLS is currently measured (SDK → backend)**:

- SDK: `onCLS(handleNewMetric)` fires at page end with final cumulative score
- CLS is in `vitalsMetricAsAttributes` → stored as `span.setAttribute('cumulativeLayoutShift', 0.05)` — a **tag on the span**, not a timestamped event (because CLS is a score, not a point in time)
- Backend reads it via `getSpanMetricDatapointFromTags(span, "cumulativeLayoutShift")` in `RumTraceMetricsExtractor.scala:237`
- Emits metric `browser_cls`

**INP follows this exact same pattern** — stored as a span attribute (`interactionToNextPaint`), read from tags by backend, emits `browser_time_inp`.

---

## The pagehide race condition (known issue in this approach)

The current code registers listeners in this order:

```ts
// Line 111-112: endSpan listeners registered FIRST
document.addEventListener('visibilitychange', endSpan);
globalThis.addEventListener('pagehide', endSpan);

// Line 114-118: web-vitals callbacks registered SECOND
getCLS(handleNewMetric); // ← registers its own pagehide listener internally
onINP(handleNewMetric); // ← same
```

Because `endSpan` is registered before the web-vitals internal listeners, on `pagehide` they fire in this order:

```
1. endSpan()         ← fires first (registered first)
   → spanIsEnded = true
   → span attributes written with whatever metrics{} holds at this moment
   → span.end() — span is exported

2. getCLS callback   ← fires second (registered inside getCLS internals)
   → CLS value = 0.08 arrives
   → handleNewMetric called → metrics{CLS: 0.08} stored
   → endSpan() called again
   → BUT: spanIsEnded = true → guard blocks it
   → CLS value is LOST
```

**Concrete timeline:**

```
t=0ms    page loads, span starts
t=200ms  TTFB fires  → missedMetrics: [FCP, FID, LCP, CLS, INP]
t=350ms  FCP fires   → missedMetrics: [FID, LCP, CLS, INP]
t=400ms  LCP fires   → missedMetrics: [FID, CLS, INP]
t=1200ms user clicks → FID fires, INP fires → missedMetrics: [CLS]

         ← span is still open, waiting for CLS

t=30s    user closes tab → pagehide fires

         Listener 1 (endSpan):
           metrics{} = {TTFB, FCP, LCP, FID, INP}  ← NO CLS YET
           spanIsEnded = true
           span ends and exports — CLS missing ✗

         Listener 2 (getCLS internal):
           CLS = 0.08 arrives
           endSpan() called → blocked by spanIsEnded guard
           CLS dropped ✗
```

**Why it sometimes works:**

The race condition depends on browser listener firing order, which is not guaranteed. It works in these cases:

1. **`visibilitychange` vs `pagehide`** — when a user switches tabs (not closes), some browsers fire web-vitals callbacks _before_ the `visibilitychange` event completes, so CLS/INP values land in `metrics{}` before `endSpan` runs. Values are captured correctly.

2. **`web-vitals` v3+ fires more eagerly** — `onCLS` fires on every `visibilitychange` to `hidden`. If the user hides the tab briefly and comes back, CLS fires early and is already stored before the page actually closes.

3. **User interacts before leaving** — if FID and INP fire during the session (via user interaction) and CLS fires early due to layout shifts, `missedMetrics` empties naturally and `endSpan` runs cleanly long before tab close. No race at all.

4. **Synthetic monitoring** — automated tests (Playwright, headless Chrome) navigate away rather than close the tab. The listener order can differ from a real user closing a tab, so tests may pass consistently even though the race exists in production.

**In summary:** it works when metrics fire early during the session, and fails when the user closes the tab without having triggered the metrics beforehand — most commonly CLS on pages with no layout shifts after load, and INP on pages where the user never interacted.

**This approach does not fix the race condition.** It exists for CLS today and will exist for INP after this change. Approaches 2 and 3 fix it because the new library manages its own `pagehide` timing internally without conflicting with `endSpan`.

---

## SDK Changes (this repo)

### 1. Root `package.json`

Upgrade `web-vitals` from `^2.1.4` to `^4.2.4`.

Note: v3+ renamed `getFID` → `onFID`, `getCLS` → `onCLS`, etc. All function names change but callback signatures are compatible.

### 2. `src/opentelemetry-js-contrib/packages/instrumentation-document-load/src/enums/EventNames.ts`

Add one entry:

```ts
INTERACTION_TO_NEXT_PAINT = 'interactionToNextPaint',
```

### 3. `src/opentelemetry-js-contrib/packages/instrumentation-document-load/src/utils.ts`

**a) Update import** — add `onINP`, keep `onFID` (backward compat), rename `get*` → `on*`:

```ts
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals';
```

**b) Update `vitalsMetricNames`** — add INP entry alongside FID:

```ts
const vitalsMetricNames: Record<Metric['name'], EventNames> = {
  FCP: EventNames.FIRST_CONTENTFUL_PAINT,
  FID: EventNames.FIRST_INPUT_DELAY,
  INP: EventNames.INTERACTION_TO_NEXT_PAINT, // new
  TTFB: EventNames.TIME_TO_FIRST_BYTE,
  LCP: EventNames.LARGEST_CONTENTFUL_PAINT,
  CLS: EventNames.CUMULATIVE_LAYOUT_SHIFT,
};
```

**c) Update `missedMetrics`** — add `'INP'` to the Chromium block (INP is Chromium-only, same as LCP/CLS). FID stays in the base set:

```ts
const missedMetrics: Set<Metric['name']> = new Set(['FCP', 'FID', 'TTFB']);
if ('chrome' in globalThis) {
  missedMetrics.add('LCP');
  missedMetrics.add('CLS');
  missedMetrics.add('INP');
}
```

**d) Update `vitalsMetricAsAttributes`** — INP is a session-long score (like CLS), store as attribute not event:

```ts
const vitalsMetricAsAttributes = new Set([
  EventNames.CUMULATIVE_LAYOUT_SHIFT,
  EventNames.INTERACTION_TO_NEXT_PAINT,
]);
```

**e) Add `onINP` call alongside existing vitals**:

```ts
onCLS(handleNewMetric);
onFCP(handleNewMetric);
onFID(handleNewMetric);
onINP(handleNewMetric); // new
onLCP(handleNewMetric);
onTTFB(handleNewMetric);
```

---

## Backend Changes (sumologic monorepo — separate PR)

Three files in `trace-ingest` / `trace-common`:

### 1. `trace-common/.../TraceMetricType.scala`

Add constant and include in sets:

```scala
val InteractionToNextPaint: String = "browser_time_inp"

// Add to rumDocumentLoadMetricTypes:
InteractionToNextPaint,

// Add to allPercentileMetrics:
InteractionToNextPaint,
```

### 2. `trace-ingest/.../RumTraceMetricsExtractor.scala`

Add case in `extractDocumentLoadDataPoint`:

```scala
case TraceMetricType.InteractionToNextPaint => extractWebVitalMetric(span, TraceMetricType.InteractionToNextPaint)
```

Add case in `extractWebVitalMetric`:

```scala
case TraceMetricType.InteractionToNextPaint => getSpanMetricDatapointFromTags(span, InteractionToNextPaintTag)
```

### 3. `span-ingest-common/.../RumTraceMetricsExtractorOperations.scala`

Add tag constant:

```scala
val InteractionToNextPaintTag = "interactionToNextPaint"
```

---

## Verification

```bash
npm install                  # picks up web-vitals v4
node scripts/bundle.js       # re-patch submodules
npm run test:ut              # unit tests pass
npm run build                # builds without errors
```

Manual check: open a test page with the SDK, interact with it (click something), capture the OTLP POST in DevTools Network → Payload. The `documentLoad` span's `attributes` array should contain:

```json
{ "key": "interactionToNextPaint", "value": { "doubleValue": <ms> } }
```

Both `interactionToNextPaint` and `firstInputDelay` should be present.

Dashboard metric query to validate end-to-end (after backend lands):

```
_contenttype=RumMetricFromTrace metric=browser_time_inp aggregatedOn=application application=*"your-app"
```
