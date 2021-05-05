# CHANGELOG

## 0.1.0

- bump [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) version to 0.10.2
- bump [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib) version to 0.9.0
- enable [@opentelemetry/plugin-fetch](https://www.npmjs.com/package/@opentelemetry/plugin-fetch) plugin

## 0.2.0

- added `sumologic.telemetry.sdk.export_timestamp` tag with a timestamp of spans being exported (#5)

## 1.0.0

- [BREAKING CHANGE] changed exporter to [@opentelemetry/exporter-collector](https://www.npmjs.com/package/@opentelemetry/exporter-collector)
- bump [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) version to 0.16.0
- bump [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib) version to 0.12.1
- added new config options: `authorizationToken` and `applicationName`

## 1.1.0

- bump [opentelemetry-js](https://github.com/SumoLogic/opentelemetry-js) version to 0.18.2
- bump [opentelemetry-js-contrib](https://github.com/SumoLogic/opentelemetry-js-contrib) version to 0.15.0
- bump [opentelemetry-js-api](https://github.com/SumoLogic/opentelemetry-js-api) version to 1.0.0-rc0

## Unreleased

- added `sampling.probability` default attribute
- added support for manual instrumentation
