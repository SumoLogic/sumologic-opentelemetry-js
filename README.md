# Sumo Logic OpenTelemetry RUM

The [Sumo Logic](https://www.sumologic.com/) OpenTelemetry auto-instrumentation for JavaScript library enables tracing in the browser.

Note: This feature is in Beta. To participate contact your Sumo account executive or email us at tracing-eap@sumologic.com.

## Installation

The easiest way to start collecting traces from your website is to put the code below inside the `<head></head>` tags on your website:

```html
<script src="script_src" type="text/javascript"></script>
<script>
  window.sumoLogicOpenTelemetryRum &&
    window.sumoLogicOpenTelemetryRum.initialize({
      collectionSourceUrl: 'sumo_logic_traces_collector_source_url',
      serviceName: 'name_of_your_web_application',
    });
</script>
```

Contact [SumoLogic](https://www.sumologic.com/) and ask for the `script_src` valid for your account.

See [functionalities](#Functionalities) for informations about the script size and [configuration](#Configuration) for all supported options.

There are no other required actions needed to take. With properly provided `collectionSourceUrl` and `serviceName` your website is ready and will send collected traces to the specified Sumo Logic collector.

You can load the script asynchronously using the script below but some functionalities like user interactions or requests made before script run will be limited.

```html
<script>
  (function (w,s,d,r,e,n) {w[s]=w[s]||{readyListeners:[],onReady:function(e){w[s].readyListeners.push(e)}},(e=d.createElement("script")).async=1,e.src=r,(n=d.getElementsByTagName("script")[0]).parentNode.insertBefore(e,n)})(window, 'sumoLogicOpenTelemetryRum', document, "script_src");
  window.sumoLogicOpenTelemetryRum.onReady(function() {
    window.sumoLogicOpenTelemetryRum.initialize({
      collectionSourceUrl: 'sumo_logic_traces_collector_source_url',
      serviceName: 'name_of_your_web_application',
    });
  })
</script>
```

## Manual installation

The other option is to bundle this library inside your project and initialize it.

Inside your project directory execute `npm install @sumologic/opentelemetry-rum`.

RUM needs to be initialized preferably before other functionalities in your code:

```javascript
import { initialize } from '@sumologic/opentelemetry-rum';

initialize({
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

By default, trace context propagation, allowing creation of end to and front end to backend traces for cross-origin requests is not enabled because of browser CORS security restrictions. To propagate tracing context to create front-end to back-end traces, set domain(s) to propagate W3C tracing context to in the `propagateTraceHeaderCorsUrls` configuration option.
You must configure your server to return accept and return following CORS headers in its response:
`Access-Control-Allow-Headers: traceparent, tracestate`.
Sumo Logic cannot perform any validation correct configuration of services of other origins, so, please be careful when configuring this.
You should always try enabling CORS in a test environment before setting it up in production.

## Configuration

Both `script` tag and manual installation can be configured with following parameters:

| Parameter                    | Type                 | Default     | Description                                                                                                 |
| ---------------------------- | -------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| collectionSourceUrl          | `string`             | _required_  | Sumo Logic collector source url                                                                             |
| authorizationToken           | `string`             |             | Sumo Logic collector authorization token                                                                    |
| serviceName                  | `string`             | `"unknown"` | Name of your web service                                                                                    |
| applicationName              | `string`             |             | Name of your application                                                                                    |
| defaultAttributes            | `object`             | `{}`        | Attributes added to each span                                                                               |
| samplingProbability          | `number`             | `1`         | `1` means all traces are sent, `0` - no traces are send, `0.5` - there is 50% change for a trace to be sent |
| bufferMaxSpans               | `number`             | `100`       | Maximum number of spans waiting to be send                                                                  |
| bufferTimeout                | `number`             | `2000`ms    | Maximum time in milliseconds for spans waiting to be send                                                   |
| ignoreUrls                   | `(string\|RegExp)[]` | `[]`        | List of URLs from which traces will not be collected                                                        |
| propagateTraceHeaderCorsUrls | `(string\|RegExp)[]` | `[]`        | List of URLs where [W3C Trace Context](https://www.w3.org/TR/trace-context/) HTTP headers will be injected  |

## Manual instrumentation

When initialized by the `<script />` tag, window attribute `sumoLogicOpenTelemetryRum` is exposed. It gives possibility to create spans manually. Global `sumoLogicOpenTelemetryRum` objects contains:

- `api` - exposed [@opentelemetry/api](https://www.npmjs.com/package/@opentelemetry/api) module
- `tracer` - an instance of a `Tracer` from [@opentelemetry/tracing](https://www.npmjs.com/package/@opentelemetry/tracing).

Example:

```javascript
const span = sumoLogicOpenTelemetryRum.tracer.startSpan('fetchUserData', {
  attributes: { organization: 'client-a' },
});
sumoLogicOpenTelemetryRum.api.context.with(api.setSpan(api.context.active(), span), () => {
  // long running operation
});
```

## Disable instrumentation

Instrumentation can be disabled and enabled again in runtime using `registerInstrumentations()` and `disableInstrumentations()` methods.

```javascript
sumoLogicOpenTelemetryRum.disableInstrumentations();
// some code with instrumentations disabled
sumoLogicOpenTelemetryRum.registerInstrumentations();
```

# License

This project is released under the [Apache 2.0 License](./LICENSE).

# Contributing

Please refer to our [Contributing](./CONTRIBUTING.md) documentation to get started.

# Code Of Conduct

Please refer to our [Code of Conduct](./CODE_OF_CONDUCT.md).
