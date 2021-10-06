const ANY_STRING_KEYS = new Set(['traceId', 'spanId', 'parentSpanId']);
const ANY_STRING_PATHS = new Set([
  'resourceSpans.instrumentationLibrarySpans.spans.attributes.http.user_agent.value.stringValue',
]);
const ANY_NUMBER_KEYS = new Set([
  'timeUnixNano',
  'startTimeUnixNano',
  'endTimeUnixNano',
]);
const ANY_NUMBER_PATHS = new Set([
  'resourceSpans.resource.attributes.sumologic.telemetry.sdk.export_timestamp.value.doubleValue',
  'resourceSpans.instrumentationLibrarySpans.spans.attributes.http.response_content_length.value.intValue',
]);

export const deepEqualOtelJson = (
  resp1: any,
  resp2: any,
  path: string[] = [],
) => {
  const lastPathElement = path[path.length - 1];
  const pathAsString = path.join('.');

  const fail = () => {
    throw new Error(
      `${JSON.stringify(resp1)} is not equal ${JSON.stringify(
        resp2,
      )} in ${pathAsString}`,
    );
  };

  if (lastPathElement) {
    if (
      ANY_STRING_KEYS.has(lastPathElement) ||
      ANY_STRING_PATHS.has(pathAsString)
    ) {
      if (
        typeof resp1 !== 'string' ||
        typeof resp2 !== 'string' ||
        !resp1 ||
        !resp2
      ) {
        fail();
      }
      return;
    }

    if (
      ANY_NUMBER_KEYS.has(lastPathElement) ||
      ANY_NUMBER_PATHS.has(pathAsString)
    ) {
      if (!Number.isFinite(resp1) || !Number.isFinite(resp2)) {
        fail();
      }
      return;
    }
  }

  if (typeof resp1 !== typeof resp2) {
    fail();
  } else if (Array.isArray(resp1) && Array.isArray(resp2)) {
    if (resp1.length !== resp2.length) {
      fail();
    }
    resp1.forEach((element, index) =>
      deepEqualOtelJson(element, resp2[index], path),
    );
  } else if (typeof resp1 === 'object' && resp1 != null && resp2 != null) {
    const objectPath = resp1.key;
    Object.keys(resp1).forEach((key) => {
      const value1 = resp1[key];
      const value2 = resp2[key];

      deepEqualOtelJson(
        value1,
        value2,
        [...path, objectPath, key].filter(Boolean),
      );
    });
  } else if (resp1 !== resp2) {
    fail();
  }
};
