import { wrap } from 'shimmer';
import { Context } from '@opentelemetry/api';

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
  copyToStringFrom(nodule[name], original);
  return nodule[name];
};

export const copyToStringFrom = <T>(target: T, source: object): void => {
  const originalToString = source.toString;
  Object.defineProperty(target, 'toString', {
    enumerable: false,
    configurable: true,
    writable: true,
    value() {
      return originalToString.call(this === target ? source : this);
    },
  });
};

const objectContexts = new WeakMap<object, Context>();

export const getObjectContext = (object: object): Context | undefined =>
  objectContexts.get(object);

/**
 * All method called on the given object will have the given context.
 */
export const setObjectContext = (object: object, context: Context) =>
  objectContexts.set(object, context);
