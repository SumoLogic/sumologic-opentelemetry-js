# CLAUDE.md — sumologic-opentelemetry-js

## What this repo is

Sumo Logic RUM (Real User Monitoring) SDK. A browser JavaScript library that auto-instruments user actions, XHR/fetch calls, errors, and page loads — serializes them as OpenTelemetry spans — and POSTs them to a Sumo Logic collector via OTLP HTTP.

The compiled output (`dist/browser.js`) is served as `https://rum.sumologic.com/sumologic-rum.js` and injected into customer websites via a `<script>` tag.

## Repo structure

```
src/
  index.ts                        ← initialize() entry point, public API
  sumologic-context-manager/      ← async context propagation (patches Promise/setTimeout/addEventListener etc.)
  sumologic-span-processor/       ← span enrichment hub (session ID, longtasks, XHR timing, trace buffering)
  sumologic-logs-exporter/        ← error log batching + sendBeacon export
  sumologic-logs-instrumentation/ ← patches window.onerror, unhandledrejection, console.error
  sumologic-export-timestamp-enrichment-exporter/ ← stamps export time on resource attributes
  opentelemetry-js/               ← git submodule: SumoLogic fork of OTel core SDK
  opentelemetry-js-contrib/       ← git submodule: SumoLogic fork of OTel contrib (auto-instrumentations)

scripts/
  bundle.js     ← REQUIRED pre-build step: patches submodule package.jsons so TS/Jest resolve from .ts source

e2e_test/
  loadScript/   ← Playwright tests: sync/async/data-attr loading, errors, public API
  demoApps/     ← Playwright tests: React/Vue/Angular SPA routing (hash + History API)
```

## Key source files

| File                                                    | What it does                                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/index.ts`                                          | `initialize()`, wires up all instrumentation, exposes public API on `window.sumoLogicOpenTelemetryRum` |
| `src/sumologic-span-processor/index.ts`                 | Central span enrichment: session ID, location.href, visibility state, ignore URLs                      |
| `src/sumologic-span-processor/session-id.ts`            | Cookie-based session tracking (`sumoLogicOpenTelemetryRumSessionId`), 5-min idle timeout               |
| `src/sumologic-span-processor/trace-processor.ts`       | Holds root span until all child spans finish (or 30s timeout / pagehide)                               |
| `src/sumologic-span-processor/find-longtask-context.ts` | Re-parents orphan longtask spans to the closest concurrent span                                        |
| `src/sumologic-context-manager/index.ts`                | `SumoLogicContextManager` — stores `_currentContext`, implements `with()`                              |
| `src/sumologic-context-manager/promise.ts`              | Patches `Promise.then/catch/finally` to carry context                                                  |
| `src/sumologic-context-manager/timers.ts`               | Patches `setTimeout/setInterval/rAF/queueMicrotask` (cutoff: 1500ms)                                   |
| `src/sumologic-context-manager/events.ts`               | Patches `EventTarget.prototype.addEventListener` + XHR/WebSocket/IDB `on*` props                       |
| `src/sumologic-context-manager/observers.ts`            | Patches MutationObserver/IntersectionObserver/ResizeObserver (cutoff: 300ms)                           |

## Dev setup (one-time after clone)

```bash
git submodule update --init --recursive   # pull submodules
npm install                               # install devDeps
node scripts/bundle.js                   # patch submodule package.jsons — REQUIRED
```

## Common commands

```bash
npm run test:ut    # Jest unit tests
npm run build      # rollup build → dist/browser.js (IIFE) + dist/index.js (CJS)
npm run test:e2e   # Playwright e2e (npx playwright install first)
```

## Common gotcha

If unit tests fail with `Could not locate module @opentelemetry/api`:
→ run `node scripts/bundle.js` (submodule was reset to its original state)

The submodule `package.json` files normally point `"main"` to a compiled `build/` directory that doesn't exist in dev. `bundle.js` rewrites them to point at `.ts` source and deletes conflicting `tsconfig.json` files. These changes in the submodule are expected and intentional — do not revert them.

## Architecture decisions to know

- **No zone.js** — context propagated by selectively monkey-patching browser APIs with explicit cutoffs
- **Root span held back** — `trace-processor.ts` delays exporting the root span until all children finish so aggregate metrics (longtask sum, XHR timing) can be computed and attached
- **sendBeacon for errors** — fire-and-forget, survives `pagehide` / tab close
- **Submodules never compiled** — `scripts/bundle.js` makes Jest/TS resolve them from TypeScript source directly

## Path aliases

`tsconfig.json` maps `@opentelemetry/*` imports to `src/opentelemetry-js/...` and `src/opentelemetry-js-contrib/...`. `jest.config.js` mirrors these via `pathsToModuleNameMapper`. This is how the main codebase imports OTel types without installing them from npm.

## Data destinations

| Data type      | Endpoint                                                   |
| -------------- | ---------------------------------------------------------- |
| Spans (traces) | `{collectionSourceUrl}/v1/traces` — OTLP JSON              |
| Error logs     | `{collectionSourceUrl}/v1/logs` — OTLP JSON via sendBeacon |

## Backend modules (sumologic monorepo)

- `rum-receiver` — accepts OTLP POST from browser
- `span-ingest` — initial span processing and storage routing
- `trace-enrichment` — further span enrichment
- `trace-forge` / `trace-query` — storage and query layer (Trace Analytics UI)

## Documentation

Full explanation for new engineers: `UNDERSTANDING.md` in this repo.
Confluence page: https://sumologic.atlassian.net/wiki/spaces/PM1/pages/3315171593/Understanding+RUM+sumologic+opentelemetry-js
