# CHANGELOG

## 4.6.2

- fix xhr metrics issue for XMLHttpRequest

## 4.6.1

- added support to ignore URLs from being instrumented

## 4.6.0

- updated logs proto 0.9 -> 0.19

## 4.5.0

- updated OT-JS to API 1.8.0 / Core 1.22.0 / Experimental 0.49.0

## 4.4.0

- added support for [OpenTelemetry Baggage](https://opentelemetry.io/docs/concepts/signals/baggage/)
- upload source map file for JS script to CDN
- bug fixes

## 4.3.0

- updated OT-JS to 0.35.0

## 4.2.1

- fixed longtask `http.action_type` classification
- fixed missing root span operation for some longtask spans

## 4.2.0

- new property in the `initialize` function: `getOverriddenServiceName`, which allows to override the service name of a span during its creation

## 4.1.1

- fixed patching `addEventListener` in instrumentation-user-interaction

## 4.1.0

- added `userInteractionElementNameLimit` initialization option
- fixed handling navigation event

## 4.0.0

- support for collecting uncaught exceptions, unhandled rejections, document errors and console errors
- new properties in the `initialize` function: `deploymentEnvironment` and `collectErrors`
- fixed `document.visibilityState` for pages open in background

## 3.1.0

- extended `document.visbilityState` discoverability for root spans
- fixed broken span timings on some browsers
- XHR & longtask metrics

## 3.0.0

- updated `@opentelemetry/api` to `1.1.0` - breaking changes
- updated `opentelemetry-js` to `1.0.1`
- updated `opentelemetry-js-contrib` to `935149c`
- added `sumologic.rum.version` default attribute
- added `sumoLogicOpenTelemetryRum.getCurrentSessionId()`
- added attribute `new.location.href` to `Navigation: *` spans

Check "Manual instrumentation" in README for new instructions.

## 2.1.1

- fixed 'Error: timeout' logs

## 2.1.0

- reduced size to 88 KB (26 KB gzipped)
- support for more user interactions like dblclick, submit, drop etc.
- full History API and hash change support
- web-vitals
- session id (can be disabled using the `collectSessionId` option)
- longtasks with automatic context attaching
- added 'setDefaultAttribute' method
- added 'maxExportBatchSize' configuration option and changed default values of current exporter-related configuration
- automatic removing of single user interaction traces (can be disabled using the `dropSingleUserInteractionTraces`
  option)
- new context manager with better support for native async-await, observers and more
- new attribute 'document.visibilityState' and span events 'pageshow' and 'pagehide'

## 2.0.1

- `samplingProbability` property in the `initialize` function's options argument can be a string.

## 2.0.0

- renamed package to `@sumologic/opentelemetry-rum`
- renamed global variable to `sumoLogicOpenTelemetryRum`
- changed the way script can be configured
- updated OT-JS to 0.24.0

## 1.4.4

- fixed doubled instrumentation-document-load traces when the script is loading asynchronously

## 1.4.3

- fixed manual installation

## 1.4.1

- fixed manual installation

## 1.4.0

- added `registerInstrumentations()` and `disableInstrumentations()` methods to turn on and off instrumentations in
  runtime

## 1.3.0

- added `http.url` and `http.user_agent` attributes to the documentFetch spans
- fixed propagating trace header cors to all domains by default

## 1.2.0

- added `sampling.probability` default attribute
- added support for manual instrumentation
- added first paint, first contentful paint and largest contentful paint events to `documentLoad`

## 1.1.0

- bump [opentelemetry-js](https://github.com/SumoLogic/opentelemetry-js) version to 0.18.2
- bump [opentelemetry-js-contrib](https://github.com/SumoLogic/opentelemetry-js-contrib) version to 0.15.0
- bump [opentelemetry-js-api](https://github.com/SumoLogic/opentelemetry-js-api) version to 1.0.0-rc0

## 1.0.0

- [BREAKING CHANGE] changed exporter
  to [@opentelemetry/exporter-collector](https://www.npmjs.com/package/@opentelemetry/exporter-collector)
- bump [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) version to 0.16.0
- bump [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib) version to 0.12.1
- added new config options: `authorizationToken` and `applicationName`

## 0.2.0

- added `sumologic.telemetry.sdk.export_timestamp` tag with a timestamp of spans being exported (#5)

## 0.1.0

- bump [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) version to 0.10.2
- bump [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib) version to 0.9.0
- enable [@opentelemetry/plugin-fetch](https://www.npmjs.com/package/@opentelemetry/plugin-fetch) plugin
