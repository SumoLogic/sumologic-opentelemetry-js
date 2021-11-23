import { wrap } from 'shimmer';

export const wrapWithToString = <
  Nodule extends object,
  FieldName extends keyof Nodule,
>(
  nodule: Nodule,
  name: FieldName,
  wrapper: (original: Nodule[FieldName]) => Nodule[FieldName],
): Nodule[FieldName] => {
  const original = nodule[name];
  if (typeof original !== 'function') return original;
  wrap(nodule, name, wrapper);
  Object.defineProperty(nodule[name], 'toString', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: original.toString.bind(original),
  });
  return nodule[name];
};

export const copyToStringFrom = (target: object, source: object): void => {
  Object.defineProperty(target, 'toString', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: source.toString.bind(source),
  });
};
