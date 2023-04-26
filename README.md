# Sumo Logic OpenTelemetry RUM

The [Sumo Logic](https://www.sumologic.com/) OpenTelemetry auto-instrumentation for JavaScript library enables tracing
in the browser.

## Features

- XMLHttpRequest and Fetch APIs auto-instrumentation
- user interactions like click, submit, drop etc.
- document load with fetched resources
- History API and hash change support
- web-vitals
- session id
- longtasks with automatic context attaching
- uncaught exceptions, unhandled rejections, document errors and console errors
- support for manual instrumentation
- automatic context carrying through timers, promises, native async-await, events, observers and more
- 103 KB (31 KB gzipped)

## Installation

The easiest way to start collecting traces from your website is to put the code below inside the `<head></head>` tags on
your website:

```html
<script
  src="https://rum.sumologic.com/sumologic-rum.js"
  type="text/javascript"
></script>
<script>
  window.sumoLogicOpenTelemetryRum &&
    window.sumoLogicOpenTelemetryRum.initialize({
      collectionSourceUrl: 'sumo_logic_traces_collector_source_url',
      serviceName: 'name_of_your_web_service',
      propagateTraceHeaderCorsUrls: [
        'list_of_domains_to_receive_trace_context',
      ],
      collectErrors: true,
    });
</script>
```

See [configuration](#Configuration) for all supported options.

There are no other required actions needed to take. With properly provided `collectionSourceUrl` and `serviceName` your
website is ready and will send collected traces to the specified Sumo Logic collector.

You can load the script asynchronously using the script below, but some functionalities like user interactions or
requests made before script run will be limited.

```html
<script>
  (function (w, s, d, r, e, n) {
    (w[s] = w[s] || {
      readyListeners: [],
      onReady: function (e) {
        w[s].readyListeners.push(e);
      },
    }),
      ((e = d.createElement('script')).async = 1),
      (e.src = r),
      (n = d.getElementsByTagName('script')[0]).parentNode.insertBefore(e, n);
  })(
    window,
    'sumoLogicOpenTelemetryRum',
    document,
    'https://rum.sumologic.com/sumologic-rum.js',
  );
  window.sumoLogicOpenTelemetryRum.onReady(function () {
    window.sumoLogicOpenTelemetryRum.initialize({
      collectionSourceUrl: 'sumo_logic_traces_collector_source_url',
      serviceName: 'name_of_your_web_service',
      propagateTraceHeaderCorsUrls: [
        'list_of_domains_to_receive_trace_context',
      ],
      collectErrors: true,
    });
  });
</script>
```

**Note**: XHR and navigation/route changes support as well as errors collection requires RUM script in version 4 or
higher (https://rum.sumologic.com/sumologic-rum-v4.js). Please ensure you are using the correct version in your pages.
For automatic updates use https://rum.sumologic.com/sumologic-rum.js.

**Note**: Above examples omit the version of the script in the `src` attribute and automatically uses most up to date
version of it. If you want to manually control versioning of the script please use:

- https://rum.sumologic.com/sumologic-rum-vX.js (e.g. https://rum.sumologic.com/sumologic-rum-v4.js) for major version
  control (no breaking changes),
- https://rum.sumologic.com/sumologic-rum-vX.Y.js (e.g. https://rum.sumologic.com/sumologic-rum-v4.0.js) for major
  version control (only bugfixes are automatically included),
- https://rum.sumologic.com/sumologic-rum-vX.Y.Z.js (e.g. https://rum.sumologic.com/sumologic-rum-v4.0.0.js) for major
  version control (strict version control).

## Manual installation

The other option is to bundle this library inside your project and initialize it.

Inside your project directory execute `npm install @sumologic/opentelemetry-rum`.

RUM needs to be initialized preferably before other functionalities in your code:

```javascript
import { initialize } from '@sumologic/opentelemetry-rum';

initialize({
  collectionSourceUrl: 'sumo_logic_traces_collector_source_url',
  serviceName: 'name_of_your_web_service',
  propagateTraceHeaderCorsUrls: ['list_of_domains_to_receive_trace_context'],
});
```

## Configuration

Both `script` tag and manual installation can be configured with following parameters:

| Parameter                       | Type                                                                                                                                                                                     | Default     | Description                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| collectionSourceUrl             | `string`                                                                                                                                                                                 | _required_  | Sumo Logic collector source url                                                                              |
| authorizationToken              | `string`                                                                                                                                                                                 |             | Sumo Logic collector authorization token                                                                     |
| serviceName                     | `string`                                                                                                                                                                                 | `"unknown"` | Name of your web service                                                                                     |
| applicationName                 | `string`                                                                                                                                                                                 |             | Name of your application                                                                                     |
| deploymentEnvironment           | `string`                                                                                                                                                                                 |             | The software deployment (e.g. `staging`, `production`)                                                       |
| defaultAttributes               | `object`                                                                                                                                                                                 | `{}`        | Attributes added to each span                                                                                |
| samplingProbability             | `number`                                                                                                                                                                                 | `1`         | `1` means all traces are sent, `0` - no traces are send, `0.5` - there is 50% change for a trace to be sent  |
| bufferMaxSpans                  | `number`                                                                                                                                                                                 | `2048`      | Maximum number of spans waiting to be send                                                                   |
| maxExportBatchSize              | `number`                                                                                                                                                                                 | `50`        | Maximum number of spans in one request                                                                       |
| bufferTimeout                   | `number`                                                                                                                                                                                 | `2000`ms    | Time in milliseconds for spans waiting to be send                                                            |
| ignoreUrls                      | `(string\|RegExp)[]`                                                                                                                                                                     | `[]`        | List of XHR URLs to ignore (e.g. analytics)                                                                  |
| propagateTraceHeaderCorsUrls    | `(string\|RegExp)[]`                                                                                                                                                                     | `[]`        | List of URLs where [W3C Trace Context](https://www.w3.org/TR/trace-context/) HTTP header will be injected    |
| collectSessionId                | `boolean`                                                                                                                                                                                | `true`      | Enables collecting `rum.session_id` attribute                                                                |
| dropSingleUserInteractionTraces | `boolean`                                                                                                                                                                                | `true`      | Automatically drops traces with only one span coming from the user-interaction instrumentation (click etc.)  |
| collectErrors                   | `boolean`                                                                                                                                                                                | `true`      | Automatically collect and send uncaught exceptions, unhandled rejections, document errors and console errors |
| userInteractionElementNameLimit | `number`                                                                                                                                                                                 | `20`        | Limit for user interaction element name, after which the name will be truncated with `...` suffix.           |
| getOverriddenServiceName        | <code>(span: [Span](https://github.com/SumoLogic/opentelemetry-js/blob/0bc25fa930d358bda42026bd66bed23b7a4dc9bb/packages/opentelemetry-sdk-trace-base/src/Span.ts#L39)) => string</code> |             | Function used for overridding the service name of a span during its creation.                                |

## Trace context propagation

By default, trace context propagation, allowing creation of end to and front end to backend traces for cross-origin
requests is not enabled because of browser CORS security restrictions. To propagate tracing context to create front-end
to back-end traces, set exact URLs or URL patterns in the `propagateTraceHeaderCorsUrls` configuration option. You must
configure your server to return accept and return following CORS headers in its response:
`Access-Control-Allow-Headers: traceparent, tracestate`. Read [W3C Trace Context](https://www.w3.org/TR/trace-context/)
for more details. Sumo Logic cannot perform any validation correct configuration of services of other origins, so,
please be careful when configuring this. You should always try enabling CORS in a test environment before setting it up
in production.

For example:

```javascript
// propagates trace context in requests made to https://api.sumologic.com or http://localhost:3000/api URLs
propagateTraceHeaderCorsUrls: [
  /^https:\/\/api\.sumologic.com\/.*/,
  /^http:\/\/localhost:3000\/api\/.*/,
],
```

### Baggage

Baggage is contextual information that’s passed between spans. It’s a key-value store that resides alongside span
context in a trace, making values available to any span created within that trace.

Imagine you want to have a `customerId` attribute on every span in your trace, which involves multiple services;
however, `customerId` is only available in one specific service. To accomplish your goal, you can use OpenTelemetry
Baggage to propagate this value across your system. In that sense it is different than `defaultAttributes`, which does
not allow for data to be added dynamically. It could be said that `setDefaultAttribute()` serves similar function as
Baggage (as attributes can be defined dynamically); however it will not add attributes retroactively (spans sent before
calling `setDefaultAttribute()`).

OpenTelemetry uses Context Propagation to pass Baggage around, and each of the different library implementations has
propagators that parse and make that Baggage available without you needing to explicitly implement it.

Baggage can be used by accessing methods in our `window.sumoLogicOpenTelemetryRum` pulled from OpenTelemetry upstream:

```javascript
const baggage =
  window.sumoLogicOpenTelemetryRum.api.propagation.getBaggage(
    window.sumoLogicOpenTelemetryRum.api.context.active(),
  ) || window.sumoLogicOpenTelemetryRum.api.propagation.createBaggage();

baggage.setEntry('customerId', { value: 'customer-id-value' });
window.sumoLogicOpenTelemetryRum.api.propagation.setBaggage(
  window.sumoLogicOpenTelemetryRum.api.context.active(),
  baggage,
);
```

Useful links:

- https://opentelemetry.io/docs/concepts/signals/baggage/
- https://scoutapm.com/blog/opentelemetry-in-javascript

## Manual instrumentation

When initialized by the `<script />` tag, window attribute `sumoLogicOpenTelemetryRum` is exposed. It gives possibility
to create spans manually. Global `sumoLogicOpenTelemetryRum` objects contains:

- `api` - exposed [@opentelemetry/api](https://www.npmjs.com/package/@opentelemetry/api) module
- `tracer` - an instance of a `Tracer`
  from [@opentelemetry/tracing](https://www.npmjs.com/package/@opentelemetry/tracing)
- `recordError` - a function to create an error with the given message and optional attributes.

Example:

```javascript
const { tracer, api, recordError } = sumoLogicOpenTelemetryRum;
const span = tracer.startSpan('fetchUserData', {
  attributes: { organization: 'client-a' },
});
api.context.with(api.trace.setSpan(api.context.active(), span), () => {
  // long running operation
});
recordError('Cannot load data', { organization: 'test' });
```

Using in production, make sure your website works when `sumoLogicOpenTelemetryRum` is not defined (e.g. blocked by a
browser extension).

## Disable instrumentation

Instrumentation can be disabled and enabled again in runtime using `registerInstrumentations()`
and `disableInstrumentations()` methods.

```javascript
sumoLogicOpenTelemetryRum.disableInstrumentations();
// some code with instrumentations disabled
sumoLogicOpenTelemetryRum.registerInstrumentations();
```

## Public API

All method are available under the `window.sumoLogicOpenTelemetryRum` object.

### setDefaultAttribute(key, value)

Extends the list of default attributes specified during initialization.

Example: `window.sumoLogicOpenTelemetryRum.setDefaultAttribute('user_id', userId)`

### getCurrentSessionId()

Returns current value of the `rum.session_id` attribute. Returned value may change in time, so don't cache it.

Example: `window.sumoLogicOpenTelemetryRum.getCurrentSessionId()`

### recordError()

Sends an error with the given message and optional attributes.

Example: `window.sumoLogicOpenTelemetryRum.recordError('Cannot load data', { organization: 'test' })`

# License

This project is released under the [Apache 2.0 License](./LICENSE).

# Contributing

Please refer to our [Contributing](./CONTRIBUTING.md) documentation to get started.

# Code Of Conduct

Please refer to our [Code of Conduct](./CODE_OF_CONDUCT.md).
