# Understanding sumologic-opentelemetry-js (RUM SDK)

> Written for frontend developers new to OpenTelemetry and Sumo Logic tracing.

---

## What is this repo?

This is the **Sumo Logic RUM (Real User Monitoring) SDK** — a small JavaScript library that you drop into a website to automatically track what users are doing and send that data to Sumo Logic so it shows up in the Trace Analytics UI.

RUM = "Real User Monitoring" = watching real users in production, not synthetic tests.

---

## The big picture (one paragraph)

When a user visits your website, things happen: the page loads, they click buttons, API calls fire, JavaScript errors throw. Normally these events disappear with no record. This SDK hooks into the browser and records all of those events as **spans** (timed, labelled records of work). It groups related spans into **traces** (e.g. "the user clicked Login, then 3 API calls happened"). Every few seconds it batches those traces and POSTs them — over HTTP — to a Sumo Logic collector URL. The backend (`rum-receiver` + `span-ingest` in the monorepo) receives them, processes them, and stores them so engineers can query traces to debug slow pages or errors.

---

## Core concepts (no prior knowledge assumed)

### Span

A single timed event. Think of it like a row in a log file but with a start time, end time, and a bag of key-value attributes.

```
Span: "HTTP GET /api/users"
  start:       10:00:00.100
  end:         10:00:00.350   (250ms)
  attributes:
    http.url:  https://api.example.com/users
    http.status_code: 200
    rum.session_id: abc123
```

### Trace

A tree of spans that belong to one user action. The root span is the action (e.g. "user clicked Submit"), and child spans are everything that happened because of it (API calls, etc.).

```
[click Submit]  ← root span
  └─ [HTTP POST /api/login]  ← child span
  └─ [HTTP GET /api/profile] ← child span
  └─ [longtask: 60ms]        ← the browser froze briefly
```

### Context

A context is a small invisible "sticky note" that the SDK attaches to the current moment of execution. It says: "right now, we are inside _this_ span." Any new span created while that sticky note is present automatically becomes a child of that span.

Think of it like a call stack, but for tracing instead of function calls. When a user clicks a button, the SDK puts a sticky note saying "we're inside the Login click span." Anything that happens because of that click — an API call, a state update, a re-render — reads the sticky note and says "my parent is the Login click span."

### Context propagation

How that sticky note travels across async JavaScript. This is the hard part.

In synchronous code it's easy — the sticky note is just a variable, and while your function runs the variable holds the right span. But JavaScript is mostly async: `fetch()` callbacks, `.then()` chains, `setTimeout`, event listeners — by the time those run, the original function is long gone and the sticky note variable has moved on.

Context propagation means: **capture the sticky note at the moment you schedule async work, and restore it when that work actually runs.** The SDK patches browser APIs to do this automatically so you never have to think about it.

Without context propagation you'd have a trace full of disconnected orphan spans — you'd see an API call happened, but no way to know which button click caused it.

### OTLP

OpenTelemetry Protocol — a standard JSON format for sending spans and logs over HTTP. The SDK serializes spans into OTLP JSON and POSTs to `{collectionSourceUrl}/v1/traces`.

Think of it like a standardized shipping box. No matter which company made the telemetry SDK, the backend always receives the same box shape and knows exactly where to find the data inside. See the FAQ for a real payload example.

---

## The script you inject

This is what you add to a website's `<head>`:

```html
<script src="https://rum.sumologic.com/sumologic-rum.js"></script>
<script>
  window.sumoLogicOpenTelemetryRum.initialize({
    collectionSourceUrl:
      'https://collectors.sumologic.com/receiver/v1/http/YOUR_TOKEN',
    serviceName: 'my-frontend-app',
    propagateTraceHeaderCorsUrls: ['https://api.myapp.com'],
    collectErrors: true,
  });
</script>
```

`collectionSourceUrl` is the only required field — it's the Sumo Logic HTTP Source endpoint where data gets sent.

That JS file (`sumologic-rum.js`) IS the compiled output of this repo. It's built by `npm run build` and produces `dist/browser.js`.

### Data-attribute shortcut

You can also skip the second `<script>` block entirely by putting config on the script tag itself:

```html
<script
  src="https://rum.sumologic.com/sumologic-rum.js"
  data-collection-source-url="https://..."
  data-service-name="my-app"
></script>
```

The SDK reads `document.currentScript.dataset.*` and calls `initialize()` automatically.

---

## What gets auto-collected

Once `initialize()` runs, the SDK silently watches for:

| Event type        | What it records                                                   |
| ----------------- | ----------------------------------------------------------------- |
| Page load         | Full navigation timing, all resource loads (images, JS, CSS)      |
| XHR / Fetch calls | Every API call: URL, method, status code, duration                |
| User interactions | click, submit, drop, play, pause, dragstart — creates a root span |
| Long tasks        | Any time the browser froze >50ms (jank)                           |
| JS errors         | Uncaught exceptions, unhandled promise rejections                 |
| Console errors    | `console.error(...)` calls                                        |
| Resource errors   | Broken `<img>`, `<link>`, `<script>` that failed to load          |

You don't write any code for these — they're all automatic.

---

## How data flows: browser → Sumo Logic

```
User action (click, page load, XHR...)
        │
        ▼
Auto-instrumentation creates a Span
(from vendored @opentelemetry/instrumentation-* packages)
        │
        ▼
SumoLogicContextManager
  Context is carried across setTimeout/Promise/addEventListener
  so child spans know which root span they belong to
        │
        ▼
SumoLogicSpanProcessor.onStart()
  • Adds rum.session_id (from cookie)
  • Adds location.href
  • Adds document.visibilityState
  • Records the span in a per-trace buffer
        │
        ▼
[span finishes]
        │
        ▼
SumoLogicSpanProcessor.onEnd()
  • Re-parents orphan longtask spans to their closest concurrent span
  • Copies root span info (URL, action type) onto child spans
  • Holds back the root span — waits for ALL child spans to finish
        │
        ▼  (when all children done, or 30s timeout, or page unload)
TraceProcessors — calculate summary stats before sending
  • Noise filter: if the user just clicked but nothing else happened
    (no API calls, no XHR) → drop the whole trace, it's not useful
  • Jank summary: add up all the times the browser froze (longtasks)
    and attach the total as one number on the root span → http.longtasks_sum
  • XHR timing: stamp three useful numbers on the root span so Sumo Logic
    dashboards can show them without re-computing from raw spans:
      - http.time_to_first_xhr  → how long after the click did the first API call start?
      - http.time_in_xhr_calls  → total time spent waiting on API calls (non-overlapping)
        │
        ▼
BatchSpanProcessor — the sending queue
  Spans don't get sent one by one (too noisy). They sit in memory
  and get flushed in batches: every 2 seconds, or when 50 spans pile up,
  whichever comes first.
        │
        ▼
ExportTimestampEnrichmentExporter — stamps the send time
  Adds one extra field: "what time did the SDK actually try to send this?"
  (sumologic.telemetry.sdk.export_timestamp)
  This is different from when the span ended. If the browser was offline
  for 10 seconds and then reconnected, the backend can see that gap.
        │
        ▼
OTLPTraceExporter — the actual HTTP POST
  Serializes everything to OTLP JSON and POSTs to
  {collectionSourceUrl}/v1/traces
        │
        ▼
Sumo Logic backend (rum-receiver → span-ingest)
  Receives, processes, stores → visible in Trace Analytics UI

Errors take a separate path:
  window 'error' / 'unhandledrejection' / console.error
        │
        ▼
  SumoLogicLogsInstrumentation → SumoLogicLogsExporter
        │
        ▼
  navigator.sendBeacon (fire-and-forget, survives page close)
        │
        ▼
  HTTP POST → {collectionSourceUrl}/v1/logs
```

---

## Session tracking

Every span gets a `rum.session_id` attribute stamped on it. This is how Sumo Logic knows that 10 different page loads all belonged to the same user sitting in the same browser tab.

### What a session is

A session is a continuous stretch of user activity. As long as the user keeps doing things (clicking, navigating, triggering API calls), they stay in the same session. If they walk away and come back after **5 minutes of doing nothing**, the old session ends and a new one starts with a fresh ID.

### How it's stored

The session ID lives in a browser cookie named `sumoLogicOpenTelemetryRumSessionId`. The cookie value looks like:

```
abc123def456...-1748438457829
│                │
└── session ID   └── timestamp of last activity (Unix ms)
```

Two values in one cookie, separated by `-`. The timestamp is there so the SDK can check on the next page load whether the session has gone stale.

### What happens on every span

When any span starts, the SDK calls `getCurrentSessionId()` which does three things in order:

1. **Read the cookie.** If there's no cookie yet, skip to step 3.
2. **Check inactivity.** How long since the last activity timestamp?
   - More than **5 minutes** → session is stale, throw it away, go to step 3
   - More than **30 seconds** but less than 5 minutes → still the same session, but update the timestamp in the cookie so it doesn't expire while the user is active
   - Less than **30 seconds** → do nothing, reuse as-is (avoids rewriting the cookie on every single span)
3. **No valid session → create one.** Generate a new random ID, set the timestamp to now, write the cookie.

### Why a cookie and not localStorage?

Cookies survive page navigations and are automatically sent with the page — the SDK can read the session ID on the very first line of code before `initialize()` even runs. localStorage would also work but cookies are simpler for this pattern and have been the web standard for session tracking for decades.

### What this looks like in Sumo Logic

In Trace Analytics you can filter by `rum.session_id = "abc123..."` and see every single trace that user generated during that session — page loads, clicks, API calls, errors — in chronological order. It's essentially a replay of everything the user did.

---

## Key configuration options

| Option                            | Default     | What it does                                            |
| --------------------------------- | ----------- | ------------------------------------------------------- |
| `collectionSourceUrl`             | required    | Where to POST traces and logs                           |
| `serviceName`                     | `'unknown'` | Labels all spans — use your app name                    |
| `applicationName`                 | —           | Groups services (e.g. `'checkout-frontend'`)            |
| `samplingProbability`             | `1`         | `0.1` = send only 10% of traces (cost control)          |
| `propagateTraceHeaderCorsUrls`    | `[]`        | APIs that should receive W3C trace headers              |
| `ignoreUrls`                      | `[]`        | Skip instrumentation for these URL patterns             |
| `collectErrors`                   | `true`      | Enable error/log collection                             |
| `dropSingleUserInteractionTraces` | `true`      | Skip traces where the user clicked but nothing happened |
| `getOverriddenServiceName`        | —           | Function `(span) => string` for per-span service name   |

`propagateTraceHeaderCorsUrls` is important: if your frontend calls an instrumented backend, add that backend's domain here so Sumo Logic can link the frontend trace to the backend trace as one end-to-end trace. See the FAQ for a detailed explanation.

---

## Repo structure explained

```
sumologic-opentelemetry-js/
│
├── src/
│   ├── index.ts                         ← initialize() lives here, public API
│   ├── constants.ts                     ← shared constants
│   ├── utils.ts                         ← URL helpers, span name helpers
│   │
│   ├── sumologic-context-manager/       ← async context propagation (no zone.js)
│   │   ├── index.ts                     ← ContextManager class
│   │   ├── events.ts                    ← patches addEventListener
│   │   ├── promise.ts                   ← patches Promise.then/catch
│   │   ├── timers.ts                    ← patches setTimeout/setInterval/rAF
│   │   ├── message-channel.ts           ← patches MessageChannel
│   │   └── observers.ts                 ← patches MutationObserver etc.
│   │
│   ├── sumologic-span-processor/        ← all span enrichment logic
│   │   ├── index.ts                     ← SumoLogicSpanProcessor (main hub)
│   │   ├── session-id.ts                ← cookie-based session tracking
│   │   ├── trace-processor.ts           ← holds root span until trace is complete
│   │   ├── drop-single-span-traces.ts   ← noise reduction
│   │   ├── longtasks.ts                 ← adds longtask metrics to root span
│   │   ├── xhr.ts                       ← adds XHR timing metrics to root span
│   │   ├── find-longtask-context.ts     ← re-parents orphan longtask spans
│   │   ├── document-visibility-state.ts ← tracks page visibility
│   │   ├── root-to-child-enrichment.ts  ← copies root span metadata to children
│   │   └── utils.ts                     ← span type classification helpers
│   │
│   ├── sumologic-logs-exporter/         ← collects & sends error logs
│   ├── sumologic-logs-instrumentation/  ← patches window.onerror, console.error
│   ├── sumologic-export-timestamp-enrichment-exporter/  ← stamps export time
│   │
│   ├── opentelemetry-js/                ← git submodule: SumoLogic fork of OTel core
│   └── opentelemetry-js-contrib/        ← git submodule: SumoLogic fork of OTel contrib
│
├── scripts/
│   └── bundle.js         ← patches submodule package.jsons for dev/test use
│
├── e2e_test/
│   ├── loadScript/       ← Playwright tests: sync/async/legacy loading, errors, API
│   └── demoApps/         ← Playwright tests: React/Vue/Angular SPA routing
│
├── rollup.config.js      ← bundles src/ → dist/browser.js (IIFE) + dist/index.js (CJS)
├── jest.config.js        ← unit tests, maps @opentelemetry/* → submodule source
└── tsconfig.json         ← path aliases that point imports at submodule source
```

---

## The submodules (opentelemetry-js, opentelemetry-js-contrib)

These are SumoLogic's **own forks** of the OpenTelemetry JavaScript SDK, checked in as git submodules. They contain the actual auto-instrumentation code (DocumentLoad, XHR, Fetch, UserInteraction, LongTask) plus the OTel core SDK (context, propagation, sampling, batch export).

SumoLogic maintains their own forks instead of using the upstream npm packages because they need custom patches (e.g. XHR span naming, specific attribute handling).

**In this repo, they are never compiled separately.** Instead, `scripts/bundle.js` patches their `package.json` files so TypeScript and Jest resolve them directly from `.ts` source — no compilation step needed for development.

---

## Dev workflow quick reference

```bash
# One-time setup after cloning
git submodule update --init --recursive  # initialize submodules
npm install                              # install dev dependencies
node scripts/bundle.js                  # patch submodule package.jsons (REQUIRED)

# Development
npm run test:ut     # unit tests (Jest)
npm run build       # full build → dist/browser.js + dist/index.js
npm run test:e2e    # end-to-end tests (Playwright, needs: npx playwright install first)

# If unit tests fail with "Could not locate module @opentelemetry/api"
# → run: node scripts/bundle.js   (submodule was reset, needs re-patching)
```

---

## How the backend receives this data

In the `sumologic` monorepo:

- **`rum-receiver`** — HTTP endpoint that accepts the OTLP POST from the browser SDK
- **`span-ingest`** — processes incoming spans (initial enrichment, storage routing)
- **`trace-enrichment`** — further enriches spans (e.g. service graph)
- **`trace-forge`** / **`trace-query`** — storage and query layer for Trace Analytics UI

The SDK sends to one of two endpoints:

- `{collectionSourceUrl}/v1/traces` — for trace spans (OTLP JSON)
- `{collectionSourceUrl}/v1/logs` — for error logs (OTLP JSON)

---

## Things that are intentionally NOT done

- **No zone.js** — see FAQ for the full explanation. Short answer: same result, 3x smaller bundle.

- **Root span is held back** — instead of exporting spans as they finish, the SDK waits for the entire trace to be complete before sending the root span. This lets it compute aggregate metrics (total XHR time, longtask sum) and attach them to the root span before export. Cost: up to 30s delay for long traces.

- **sendBeacon for errors** — `navigator.sendBeacon` is fire-and-forget and works even during `pagehide` (tab close). Used for error logs specifically because errors often happen at page unload time.

---

## FAQ

### Q: What does the actual OTLP payload look like that gets sent to Sumo Logic?

It's a JSON POST body shaped like a nested list: the whole payload → grouped by service → grouped by which instrumentation created the spans → the individual spans.

```
POST {collectionSourceUrl}/v1/traces
Content-Type: application/json

{
  "resourceSpans": [{          ← one entry per service/SDK combo
    "resource": {
      "attributes": [...]      ← service.name, rum version, export timestamp
                               ← same for every span in this batch
    },
    "scopeSpans": [{           ← grouped by instrumentation library
      "scope": { "name": "@opentelemetry/instrumentation-document-load" },
      "spans": [{              ← the actual timed events
        "traceId":      "55180c44...",   ← shared by all spans from one user action
        "spanId":       "e01ad391...",   ← unique to this span
        "parentSpanId": "3c0d6980...",   ← which span caused this (empty = root)
        "name":         "documentFetch",
        "startTimeUnixNano": "1788438454799700097",
        "endTimeUnixNano":   "1788438454802200097",
        "attributes": [
          { "key": "rum.session_id", "value": { "stringValue": "43ed7b1b..." } },
          { "key": "location.href",  "value": { "stringValue": "https://myapp.com" } }
        ],
        "events": [
          { "name": "fetchStart",  "timeUnixNano": "..." },
          { "name": "connectEnd",  "timeUnixNano": "..." }
        ]
      }]
    }]
  }]
}
```

The `events` inside a span are sub-timestamps — for a page load span, these are the browser's own navigation timing milestones (DNS lookup, TCP connect, first byte, etc.).

Errors take a nearly identical shape but go to `/v1/logs` instead of `/v1/traces`, and use `resourceLogs` → `scopeLogs` → `logRecords`.

### Q: What exactly is a "context"? Why do we need it?

A context is an invisible sticky note that the SDK attaches to the current moment of execution. It says: "right now, we are inside _this_ span." Any new span created while that note is present automatically becomes a child.

Without context, you'd have a pile of unrelated spans — you'd see "an API call took 300ms" but no way to know which user action caused it. Context is what turns a pile of spans into a meaningful tree showing cause and effect.

In practice: the user clicks Login → the SDK creates a "Login click" span and sets context = that span → your code calls `fetch('/api/login')` → the XHR instrumentation reads the context and creates the XHR span as a child of "Login click" → the trace makes sense.

### Q: What is zone.js? Why doesn't this SDK use it?

zone.js is a library (used by Angular) that patches every async API in the browser globally, creating named "zones" — execution scopes that automatically carry data (like the active component) through async boundaries.

It works for the same reason this SDK's context manager works: it wraps `setTimeout`, `Promise`, `addEventListener`, etc. so callbacks remember where they came from.

Why this SDK doesn't use it:

- It's ~100KB — too heavy for a RUM script that aims to be 31KB gzipped
- It patches everything, including things the RUM SDK doesn't need
- It has known compatibility issues with some browser APIs
- This SDK only needs to track 10 or so specific APIs, with explicit cutoffs (no timer >1500ms, no observer >300ms), which zone.js doesn't support

The result is the same — async context propagation works — with far less overhead.

### Q: How does context propagation actually work? How does a child span know which root span it belongs to?

The SDK keeps one variable representing "which span is active right now." When a span starts (e.g. user clicks a button), that span becomes the active one. Any new span created while it's active automatically becomes a child.

The tricky part is async code. By the time `setTimeout` fires or a `fetch()` resolves, the original span is long gone. The SDK solves this by **capturing the active span at the moment you schedule async work, and restoring it when that work runs** — not at execution time.

It does this by wrapping: `addEventListener`, `setTimeout`/`setInterval`/`requestAnimationFrame`, `Promise.then`/`.catch`/`.finally`, `MessageChannel`, and `MutationObserver`/`IntersectionObserver`/`ResizeObserver`.

**One important cutoff:** `setTimeout` callbacks longer than **1500ms** are NOT bound to the current context. A span from a button click shouldn't be the parent of a polling timer that fires 5 seconds later — that would produce nonsensically long traces.

---

### Q: What is W3C TraceContext and what is `propagateTraceHeaderCorsUrls`?

**The problem it solves**

Imagine a user clicks "Place Order" on your website. Your frontend calls your backend, which calls a payment service, which calls a database. That's four different systems. If something goes wrong — say the payment was slow — you want to see the entire chain in one place in Sumo Logic, not four separate unconnected logs.

For that to work, every service in the chain needs to pass a shared ID to the next one. But historically, every company invented their own format:

- Zipkin used `X-B3-TraceId`
- AWS used `X-Amzn-Trace-Id`
- Datadog used `x-datadog-trace-id`

If your frontend used one format and your backend used another, the chain broke. W3C TraceContext is the official web standard that said: **everyone use this one format**, so any two systems can talk to each other regardless of which library or language they use.

---

**What the header actually looks like**

When the SDK makes an API call to a domain in `propagateTraceHeaderCorsUrls`, it adds this header to the HTTP request:

```
traceparent: 00-55180c44c4f5a5df5e2884f6d864d600-e01ad3910b4fd496-01
```

Breaking it down piece by piece:

```
traceparent: 00  -  55180c44c4f5a5df5e2884f6d864d600  -  e01ad3910b4fd496  -  01
             │       │                                    │                    │
             │       │                                    │                    └── sampling flag
             │       │                                    │                        01 = "yes, record this"
             │       │                                    │                        00 = "no, skip this"
             │       │                                    │
             │       │                                    └── spanId (16 hex chars)
             │       │                                        the specific span that made this request
             │       │
             │       └── traceId (32 hex chars)
             │           shared by every span in this entire user action
             │           frontend + backend + any other service
             │
             └── version, always 00
```

The `traceId` is the glue. The backend reads it, creates its own spans, and marks them as children of the same trace. Sumo Logic then stitches everything into one tree.

---

**A real example: Place Order flow**

Without `propagateTraceHeaderCorsUrls`:

```
Sumo Logic shows TWO separate, unlinked traces:

Frontend trace                    Backend trace
──────────────────                ─────────────────────────────
[click "Place Order"]             [POST /api/orders]  ← no idea this came from a click
  └─ [HTTP POST /api/orders]        └─ [validate cart]
                                      └─ [charge payment]  ← was this slow? no way to tell
```

With `propagateTraceHeaderCorsUrls: ['https://api.myapp.com']`:

```
Sumo Logic shows ONE connected trace:

[click "Place Order"]                          ← frontend span
  └─ [HTTP POST /api/orders]                   ← frontend span (the XHR)
       └─ [POST /api/orders handler]           ← backend span, same traceId
            └─ [validate cart]                 ← backend span
            └─ [charge payment — 1.2s slow!]  ← backend span, you can see it here
```

Now when a user complains "checkout was slow," you open that trace in Sumo Logic and immediately see it was the payment service that took 1.2 seconds — not the frontend, not the order handler.

---

**The CORS requirement**

`traceparent` is a custom HTTP header. Browsers block custom headers on cross-origin requests (requests to a different domain) unless the backend explicitly says "I allow this header." Your backend needs:

```
Access-Control-Allow-Headers: traceparent, baggage
```

If this is missing, the browser will block the request entirely with a CORS error. So before adding a domain to `propagateTraceHeaderCorsUrls`, confirm with the backend team that those headers are allowed.

The option accepts strings (exact match) or RegExp patterns:

```js
propagateTraceHeaderCorsUrls: [
  'https://api.myapp.com', // exact string match
  /https:\/\/.*\.myapp\.com/, // regex: any subdomain
];
```
