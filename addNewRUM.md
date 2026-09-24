# Migration Plan: Adopt @opentelemetry/browser-instrumentation

## Why migrate?

The upstream OTel community has built `@opentelemetry/browser-instrumentation` (v0.8.1, experimental) which provides a complete, standards-compliant browser observability library. It solves several known issues with the current implementation:

- **INP support** — FID is deprecated (March 2024), new library supports INP via `web-vitals` v6
- **Race condition** — current `documentLoad` span can end before CLS/INP values arrive on `pagehide` (listener ordering bug)
- **Correct semantics** — Web Vitals, errors, navigation, and resource timing are log records, not span events. Spans model work with duration; these are point-in-time measurements
- **Richer data** — captures `console.warn/info/debug` (not just `console.error`), all resource timing throughout page lifetime (not just at load), SPA route changes as log records
- **Less custom code** — removes the need for `SumoLogicLogsInstrumentation`, custom Web Vitals in the submodule fork, and eventually `SumoLogicLogsExporter`

---

## Full breakdown: what the new library offers

### 1. WebVitalsInstrumentation

**Emits**: Log records  
**Event name**: `web.vitals`  
**Metrics captured**: CLS, INP, LCP, FCP, TTFB (uses `web-vitals` v6.2.2)  
**Note**: FID is gone — deprecated by Google, not included  
**Log record shape**:

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

**What it replaces**: Web Vitals span events/attributes on `documentLoad` (our submodule fork)  
**Key improvement**: Fixes the `pagehide` race condition — the library manages its own timing internally. INP (not available in current impl) is now supported.

---

### 2. ErrorsInstrumentation

**Emits**: Log records  
**Event name**: `exception`  
**Captures**: `window.onerror` (uncaught errors) + `unhandledrejection` (unhandled Promise rejections)  
**Log record shape**:

```json
{
  "eventName": "exception",
  "severityNumber": 17,
  "attributes": {
    "exception.type": "TypeError",
    "exception.message": "Cannot read property 'x' of undefined",
    "exception.stacktrace": "TypeError: ...\n    at ..."
  }
}
```

Uses OTel standard semantic conventions (`exception.*`).  
**What it replaces**: `SumoLogicLogsInstrumentation` (currently captures same events but with custom attribute shape: `type`, `error.name`, `error.message`)  
**Key improvement**: Standard attribute names, custom attributes hook (`applyCustomAttributes`).

---

### 3. ConsoleInstrumentation

**Emits**: Log records  
**Event name**: `console.log`  
**Captures**: `console.log`, `console.warn`, `console.error`, `console.info`, `console.debug` (all configurable)  
**Severity mapping**: DEBUG → debug, INFO → log/info, WARN → warn, ERROR → error  
**Log record shape**:

```json
{
  "eventName": "console.log",
  "severityNumber": 17,
  "body": "User clicked submit button",
  "attributes": {
    "console.method": "error"
  }
}
```

**What it replaces**: `SumoLogicLogsInstrumentation` currently only captures `console.error`. This adds `warn`, `info`, `log`, `debug`.  
**Config**: Custom message serializer, custom list of methods to monitor.

---

### 4. NavigationInstrumentation

**Emits**: Log records  
**Event name**: `browser.navigation`  
**Captures**:

- Initial page load (`DOMContentLoaded`)
- SPA route changes via `history.pushState()` / `history.replaceState()`
- Back/forward navigation (`popstate` events)
- Hash changes (`#section1` → `#section2`)

Uses modern Navigation API when available, falls back to history patching.  
**Attributes**: Full URL (optionally sanitized), navigation type (`push`/`replace`/`traverse`/`reload`), whether same-document, whether hash change.  
**What it replaces**: Nothing direct — current `UserInteractionInstrumentation` creates spans for clicks but does not track SPA route changes as log records. This is **new capability**.

---

### 5. NavigationTimingInstrumentation

**Emits**: Log records  
**Event name**: `navigationTiming`  
**Captures**: Full `PerformanceNavigationTiming` API data:

- DNS lookup, TCP connection, TLS handshake, request, response phases
- DOM interactive, DOM complete, DOMContentLoaded, load event timings
- Transfer size, encoded/decoded body size
- Navigation type, redirect count, total duration

Retries with exponential backoff (up to 5 attempts) if timing data not yet available. Falls back and emits partial data if page unloads before finalization.  
**What it replaces**: Timing events on `documentLoad` span (fetchStart, domInteractive, loadEventEnd etc.)  
**Key improvement**: Richer data, independent of span lifetime, more resilient emission.

---

### 6. ResourceTimingInstrumentation

**Emits**: Log records (one per resource)  
**Event name**: `resourceTiming`  
**Captures**: All resource requests throughout page lifetime — scripts, stylesheets, images, fonts, XHR/fetch  
**Data**: DNS lookup → TCP → TLS → request → response timing, transfer sizes, protocol, redirect info  
**Performance**: Batches entries, processes during idle time via `requestIdleCallback`, configurable batch size and queue limits  
**Filtering**: By initiator type (script, link, img, etc.) or URL patterns  
**What it replaces**: `resourceFetch` child spans on `documentLoad` (currently only captures resources at initial page load)  
**Key improvement**: Captures resources loaded after initial page load (lazy-loaded images, async scripts, XHR responses). Batched for performance.

---

### 7. UserActionInstrumentation

**Emits**: Log records  
**Event name**: click event name  
**Captures**: Click events by default (configurable to other actions)  
**Attributes**:

- `pageX`, `pageY` — click coordinates
- Element tag name and CSS selector
- Mouse button (left/middle/right)
- `data-otel-*` attributes — any HTML attribute prefixed with `data-otel-` is automatically extracted (`data-otel-userId="123"` → `userId: "123"`)

Skips disabled elements.  
**Config**: `autoCapturedActions` (default `['click']`), `applyCustomLogRecordData` hook  
**What it replaces**: `UserInteractionInstrumentation` (currently creates **spans** per click)  
**⚠️ Key difference**: Current impl creates spans → enables distributed tracing (W3C `traceparent` injected into subsequent XHR/fetch). New impl creates log records → no traceparent, no distributed trace correlation from click to backend. **Confirm with team before replacing.**

---

### 8. FetchInstrumentation

**Emits**: Spans (`SpanKind.CLIENT`)  
**Captures**: All `fetch()` calls  
**Attributes**: HTTP method, full URL, server address/port, response status, request body size, error type  
**Context propagation**: Yes — injects `traceparent` header into outgoing requests (CORS-aware, allowlist configurable)  
**Custom hooks**: `applyCustomAttributesOnSpan`, request hooks  
**What it replaces**: `FetchInstrumentation` from `@opentelemetry/instrumentation-fetch` (our submodule)  
**Change**: Essentially the same — both span-based with traceparent. Likely a drop-in replacement.

---

### 9. XhrInstrumentation

**Emits**: Spans (`SpanKind.CLIENT`)  
**Captures**: All `XMLHttpRequest` calls (patches `open` and `send`)  
**Attributes**: HTTP method, full URL, server address/port, response status, request body size, error/timeout  
**Context propagation**: Yes — injects `traceparent` header (same-origin by default, CORS allowlist configurable)  
**Custom hooks**: `applyCustomAttributesOnSpan`  
**What it replaces**: `XMLHttpRequestInstrumentation` from `@opentelemetry/instrumentation-xml-http-request` (our submodule)  
**Change**: Essentially the same — both span-based with traceparent. Likely a drop-in replacement.

---

## Architecture change: spans → log records

**Current**: Web Vitals, errors, navigation, resource timing attached to spans or emitted via `SumoLogicLogsExporter` (hand-rolled, not OTel standard).

**New**: These become independent log records via the OTel Logs API (`LoggerProvider` + `BatchLogRecordProcessor` + `OTLPLogExporter`), posted to `/v1/logs`.

`SumoLogicLogsExporter` is **not compatible** with the new library — it does not implement the OTel `LoggerProvider` interface. A standard OTel logs pipeline must replace it (Phase 1).

---

## Migration phases

### Phase 1 — Wire up OTel logs pipeline (prerequisite)

Replace `SumoLogicLogsExporter` with a standard OTel logs pipeline:

```
LoggerProvider
  └── BatchLogRecordProcessor
        └── OTLPLogExporter → POST /v1/logs
```

Register via `logs.setGlobalLoggerProvider(...)`. All subsequent phases depend on this.  
**Backend impact**: None — same OTLP JSON format to `/v1/logs`.

---

### Phase 2 — Add new instrumentations alongside existing ones (backward compat)

Wire up new instrumentations one by one, keeping old ones in parallel:

1. `WebVitalsInstrumentation` — new log records, old span events still ship
2. `ErrorsInstrumentation` — alongside `SumoLogicLogsInstrumentation`
3. `ConsoleInstrumentation` — new warn/info/debug coverage, error alongside existing
4. `NavigationInstrumentation` — new data, no conflict
5. `NavigationTimingInstrumentation` — alongside existing `documentLoad` span
6. `ResourceTimingInstrumentation` — alongside existing `resourceFetch` spans
7. `FetchInstrumentation` + `XhrInstrumentation` — replace submodule versions

**Backend impact**: New log record types start arriving. Backend adds extractors for each. Old data continues — no dashboards break.

---

### Phase 3 — Backend migration

Backend adds extractors reading from log records. Key attribute mapping:

| Metric          | Old (span-based)                       | New (log record)                                              |
| --------------- | -------------------------------------- | ------------------------------------------------------------- |
| LCP             | span event `largestContentfulPaint`    | `web.vital.name=LCP`, `web.vital.value`                       |
| INP             | not supported                          | `web.vital.name=INP`, `web.vital.value`                       |
| CLS             | span attribute `cumulativeLayoutShift` | `web.vital.name=CLS`, `web.vital.value`                       |
| Errors          | `type`, `error.name`, `error.message`  | `exception.type`, `exception.message`, `exception.stacktrace` |
| Resource timing | `resourceFetch` child spans            | per-resource log records                                      |

---

### Phase 4 — Remove old instrumentation (after backend migrated per metric)

- Remove Web Vitals from `instrumentation-document-load` submodule fork
- Remove `SumoLogicLogsInstrumentation`
- Remove `SumoLogicLogsExporter`
- Remove `DocumentLoadInstrumentation` (replaced by NavigationTiming + ResourceTiming)
- Remove `UserInteractionInstrumentation` (after span→log tracing decision resolved)
- May be able to stop forking `instrumentation-document-load` entirely

---

## Risks and open questions

1. **Library is experimental (v0.8.1)** — Pin to exact version, not `^`. Monitor upstream for breaking changes before each upgrade.

2. **⚠️ UserAction semantic change** — Current `UserInteractionInstrumentation` creates spans with W3C `traceparent` enabling distributed tracing (click → backend request correlation). New `UserActionInstrumentation` creates log records — no traceparent, correlation is lost. Confirm with team whether backend depends on this before replacing.

3. **`data-otel-*` custom tagging** — New capability for customers to tag HTML elements. Document for customers when shipped.

4. **Backend extractor timeline** — Phases 2 and 3 must be coordinated. Old and new data coexist during transition; some dashboard queries may need updating.

5. **SPA navigation** — `NavigationInstrumentation` adds route change tracking that doesn't exist today. Backend needs new handling for `browser.navigation` log records.

---

## Submodule retirement

Currently this repo has two git submodules (`src/opentelemetry-js` and `src/opentelemetry-js-contrib`) which are SumoLogic forks of upstream OTel. They exist because the upstream packages were missing features when this SDK was first built. The full migration makes both submodules redundant.

### `opentelemetry-js` (core SDK) — can retire today

All Sumo-specific changes have already been upstreamed. The one significant Sumo commit was:

> `feat(tracing): auto flush BatchSpanProcessor on browser` — adds `pagehide`/`visibilitychange` listeners to flush pending spans when the browser tab is closed

This is now merged into upstream OTel at `packages/sdk-trace/src/platform/browser/export/BatchSpanProcessor.ts` by the OTel maintainers. **No Sumo-specific code remains in this submodule.**

Retiring it is a self-contained PR:

- Replace all submodule path aliases (`@opentelemetry/api` → `./src/opentelemetry-js/api` etc.) with direct npm package imports
- Remove the `opentelemetry-js` submodule
- This eliminates ~half of the 111 "changed files" visible in VS Code source control (all from this submodule's patched `package.json` files)
- `scripts/bundle.js` patching for this submodule can be removed

### `opentelemetry-js-contrib` (contrib) — retire after migration complete

Has meaningful Sumo-specific changes in two packages:

| Package                            | Sumo changes                                                                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instrumentation-document-load`    | Web Vitals (LCP/CLS/FCP/FID/TTFB), Safari LCP fix, synthetic monitoring fix, one span per event, http.url on spans                                 |
| `instrumentation-user-interaction` | Removed zone.js, hashchange support, navigation span improvements, always new trace per interaction, WeakMap guard fix, http.url on longtask spans |

Both are fully replaced by `@opentelemetry/browser-instrumentation` after Phases 2–4 complete. All other packages in the contrib fork (long-task, browser-navigation, fetch, XHR etc.) have zero Sumo-specific commits and can be consumed from npm today.

Once the full migration is done:

- Remove `opentelemetry-js-contrib` submodule entirely
- Remove remaining `scripts/bundle.js` logic
- The repo becomes a normal npm-based project with no submodules

---

## Recommended starting point

Phase 1 + `WebVitalsInstrumentation` alone gives immediate value:

- INP support
- Fixes CLS/INP race condition
- Uses web-vitals v6 (latest)
- Minimal blast radius — only adds new log records, nothing removed

In parallel, retiring `opentelemetry-js` submodule is a low-risk cleanup PR that can go out independently and immediately — no feature changes, just dependency housekeeping.

Validate both end-to-end before committing to the full migration.
