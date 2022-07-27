import { diffString } from 'json-diff';

const ANY_STRING_KEYS = new Set(['traceId', 'spanId', 'parentSpanId']);
const ANY_STRING_PATHS = new Set([
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/http.user_agent/value/stringValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/http.host/value/stringValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/http.url/value/stringValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/location.href/value/stringValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/new.location.href/value/stringValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/root_span.http.url/value/stringValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/rum.session_id/value/stringValue',
  'resourceLogs/instrumentationLibraryLogs/logRecords/attributes/http.url/value/stringValue',
  'resourceLogs/instrumentationLibraryLogs/logRecords/attributes/error.stack/value/stringValue',
]);
const ANY_NUMBER_KEYS = new Set([
  'timeUnixNano',
  'startTimeUnixNano',
  'endTimeUnixNano',
]);
const ANY_NUMBER_PATHS = new Set([
  'resourceSpans/resource/attributes/sumologic.telemetry.sdk.export_timestamp/value/doubleValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/http.response_content_length/value/intValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/http.time_to_first_xhr/value/intValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/http.time_to_last_xhr/value/intValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/http.time_to_xhr_processing_end/value/intValue',
  'resourceSpans/instrumentationLibrarySpans/spans/attributes/http.time_in_xhr_calls/value/intValue',
]);

const anyStringMapping: Record<string, string> = {};

const prepareOtelJson = (resp1: any, resp2: any, path: string[] = []): any => {
  const lastPathElement = path[path.length - 1];
  const pathAsString = path.join('/');

  if (lastPathElement) {
    if (
      ANY_STRING_KEYS.has(lastPathElement) ||
      ANY_STRING_PATHS.has(pathAsString)
    ) {
      if (typeof resp1 === 'string' && resp1) {
        if (!(resp1 in anyStringMapping)) {
          anyStringMapping[resp1] = resp2;
        }
        return `[consistent string with '${anyStringMapping[resp1]}']`;
      }
    }

    if (
      ANY_NUMBER_KEYS.has(lastPathElement) ||
      ANY_NUMBER_PATHS.has(pathAsString)
    ) {
      if (Number.isFinite(resp1)) {
        return '[any number]';
      }
      return resp1;
    }
  }

  if (Array.isArray(resp1)) {
    return resp1.map((element, index) =>
      prepareOtelJson(element, resp2?.[index], path),
    );
  }

  if (typeof resp1 === 'object' && resp1 != null && resp2 != null) {
    return Object.entries(resp1).reduce((target, [key, keyValue]) => {
      target[key] = prepareOtelJson(
        keyValue,
        resp2[key],
        [...path, resp1.key, key].filter(Boolean),
      );
      return target;
    }, {} as any);
  }

  return resp1;
};

const testOtelJson = (resp1: any, resp2: any, path: string[] = []) => {
  const pathAsString = path.join('/');

  const fail = () => {
    throw new Error(`path ${pathAsString}`);
  };

  if (typeof resp1 !== typeof resp2) {
    fail();
  } else if (Array.isArray(resp1) && Array.isArray(resp2)) {
    if (resp1.length !== resp2.length) {
      fail();
    }
    resp1.forEach((element, index) =>
      testOtelJson(element, resp2[index], path),
    );
  } else if (typeof resp1 === 'object' && resp1 != null && resp2 != null) {
    const resp1Keys = Object.keys(resp1);
    const resp2Keys = Object.keys(resp2);

    if (resp1Keys.length !== resp2Keys.length) {
      fail();
    }

    const objectPath = resp1.key;
    resp1Keys.forEach((key) => {
      const value1 = resp1[key];
      const value2 = resp2[key];

      testOtelJson(value1, value2, [...path, objectPath, key].filter(Boolean));
    });
  } else if (resp1 !== resp2) {
    fail();
  }
};

export const deepEqualOtelJson = (resp1: any, resp2: any, name: string) => {
  const object1 = prepareOtelJson(resp1, resp2);
  const object2 = prepareOtelJson(resp2, resp2);
  try {
    testOtelJson(object1, object2);
  } catch (error: any) {
    throw new Error(
      `Difference found in fixture ${name}, ${error.message}:\n${diffString(
        object1,
        object2,
        {
          full: true,
        },
      )}`,
    );
  }
};
