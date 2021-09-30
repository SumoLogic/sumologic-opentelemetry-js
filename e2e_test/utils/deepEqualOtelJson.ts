const ANY_STRING_KEYS = new Set(['traceId', 'spanId', 'parentSpanId']);
const ANY_NUMBER_KEYS = new Set([
  'timeUnixNano',
  'startTimeUnixNano',
  'endTimeUnixNano',
  'doubleValue',
  'intValue',
]);

export const deepEqualOtelJson = (
  resp1: any,
  resp2: any,
  path: (string | number)[] = [],
) => {
  const fail = () => {
    throw new Error(
      `${JSON.stringify(resp1)} is not equal ${JSON.stringify(
        resp2,
      )} in ${path.join('.')}`,
    );
  };

  if (typeof resp1 !== typeof resp2) {
    fail();
  } else if (Array.isArray(resp1) && Array.isArray(resp2)) {
    if (resp1.length !== resp2.length) {
      fail();
    }
    resp1.forEach((element, index) =>
      deepEqualOtelJson(element, resp2[index], [...path, index]),
    );
  } else if (typeof resp1 === 'object' && resp1 != null && resp2 != null) {
    Object.keys(resp1).forEach((key) => {
      const value1 = resp1[key];
      const value2 = resp2[key];
      if (ANY_STRING_KEYS.has(key)) {
        if (
          typeof value1 !== 'string' ||
          typeof value2 !== 'string' ||
          !value1 ||
          !value2
        ) {
          fail();
        }
      } else if (ANY_NUMBER_KEYS.has(key)) {
        if (!Number.isFinite(value1) || !Number.isFinite(value2)) {
          fail();
        }
      } else {
        deepEqualOtelJson(value1, value2, [...path, key]);
      }
    });
  } else if (resp1 !== resp2) {
    fail();
  }
};
