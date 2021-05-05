# Sumo Logic OpenTelemetry auto-instrumentation for JavaScript

The [Sumo Logic](https://www.sumologic.com/) OpenTelemetry auto-instrumentation for JavaScript library enables tracing in the browser.

Note: This feature is in Beta. To participate contact your Sumo account executive or email us at tracing-eap@sumologic.com.

## Installation

The easiest way to start collecting traces from your website is to put the code below inside the `<head></head>` tags on your website:

```html
<script
  src="script_src"
  data-collection-source-url="sumo_logic_traces_collector_source_url"
  data-service-name="name_of_your_web_application"
>
```

Contact [SumoLogic](https://www.sumologic.com/) and ask for the `script_src` valid for your account.

See [functionalities](#Functionalities) for informations about the script size and [configuration](#Configuration) for all supported options.

There are no other required actions needed to take. With properly provided `data-collection-source-url` and `data-service-name` your website is ready and will send collected traces to the specified Sumo Logic collector.

You can load the script asynchronously by adding the `async` flag but some functionalities like user interactions or requests made before script run will be limited.

## Manual installation

The other option is to bundle this library inside your project and initialize it.

Inside your project directory execute `npm install @sumologic/opentelemetry-tracing`.

Tracing needs to be initialized preferably before other functionalities in your code:

```javascript
import { initializeTracing } from '@sumologic/opentelemetry-tracing';

initializeTracing({
  collectionSourceUrl: 'sumo_logic_traces_collector_source_url',
  serviceName: 'name_of_your_web_service',
});
```

## Functionalities

This library contains built-in OpenTelemetry packages:

- [@opentelemetry/core](https://www.npmjs.com/package/@opentelemetry/core)
- [@opentelemetry/tracing](https://www.npmjs.com/package/@opentelemetry/tracing)
- [@opentelemetry/web](https://www.npmjs.com/package/@opentelemetry/web)
- [@opentelemetry/instrumentation-xml-http-request](https://www.npmjs.com/package/@opentelemetry/instrumentation-xml-http-request)
- [@opentelemetry/context-zone](https://www.npmjs.com/package/@opentelemetry/context-zone)
- [@opentelemetry/instrumentation-document-load](https://www.npmjs.com/package/@opentelemetry/instrumentation-document-load)
- [@opentelemetry/instrumentation-user-interaction](https://www.npmjs.com/package/@opentelemetry/instrumentation-user-interaction)

See [@opentelemetry/instrumentation-xml-http-request](https://www.npmjs.com/package/@opentelemetry/instrumentation-xml-http-request), [@opentelemetry/instrumentation-document-load](https://www.npmjs.com/package/@opentelemetry/instrumentation-document-load) and [@opentelemetry/instrumentation-user-interaction](https://www.npmjs.com/package/@opentelemetry/instrumentation-user-interaction) for more details about auto-instrumented functionalities.

To connect your traces with backend operations, make sure you support [W3C Trace Context](https://www.w3.org/TR/trace-context/) HTTP headers.

## Configuration

Both `script` tag and manual installation can be configured with following parameters:

| Parameter                    | `data-` Attribute                     | Type                 | Default     | Description                                                                                                 |
| ---------------------------- | ------------------------------------- | -------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| collectionSourceUrl          | data-collection-source-url            | `string`             | _required_  | Sumo Logic collector source url                                                                             |
| authorizationToken           | data-authorization-token              | `string`             |             | Sumo Logic collector authorization token                                                                    |
| serviceName                  | data-service-name                     | `string`             | `"unknown"` | Name of your web service                                                                                    |
| applicationName              | data-application-name                 | `string`             |             | Name of your application                                                                                    |
| defaultAttributes            | data-default-attributes               | `object`             | `{}`        | Attributes added to each span                                                                               |
| samplingProbability          | data-sampling-probability             | `number`             | `1`         | `1` means all traces are sent, `0` - no traces are send, `0.5` - there is 50% change for a trace to be sent |
| bufferMaxSpans               | data-buffer-max-spans                 | `number`             | `100`       | Maximum number of spans waiting to be send                                                                  |
| bufferTimeout                | data-buffer-timeout                   | `number`             | `2000`ms    | Maximum time in milliseconds for spans waiting to be send                                                   |
| ignoreUrls                   | data-ignore-urls                      | `(string\|RegExp)[]` | `[]`        | List of URLs from which traces will not be collected                                                        |
| propagateTraceHeaderCorsUrls | data-propagate-trace-header-cors-urls | `(string\|RegExp)[]` | `[/.*/]`    | List of URLs where [W3C Trace Context](https://www.w3.org/TR/trace-context/) HTTP headers will be injected  |

# License

This project is released under the [Apache 2.0 License](./LICENSE).

# Contributing

Please refer to our [Contributing](./CONTRIBUTING.md) documentation to get started.

# Code Of Conduct

Please refer to our [Code of Conduct](./CODE_OF_CONDUCT.md).
