import { unwrap } from 'shimmer';
import { copyToStringFrom, wrapWithToString } from './utils';
import { ContextManager } from '@opentelemetry/api';

export const patchPromise = (contextManager: ContextManager) => {
  if (!window.Promise) return;

  wrapWithToString(window, 'Promise', (OriginalPromise) => {
    const PromiseWithContext = class Promise<T> extends OriginalPromise<T> {};

    copyToStringFrom(PromiseWithContext, OriginalPromise);

    wrapWithToString(
      PromiseWithContext.prototype,
      'then',
      (original) =>
        function (this: Promise<any>, ...args) {
          args[0] = contextManager.bind(contextManager.active(), args[0]);
          args[1] = contextManager.bind(contextManager.active(), args[1]);
          return original.apply(this, args);
        } as typeof Promise.prototype.then,
    );

    wrapWithToString(
      PromiseWithContext.prototype,
      'catch',
      (original) =>
        function (this: Promise<any>, ...args) {
          args[0] = contextManager.bind(contextManager.active(), args[0]);
          return original.apply(this, args);
        } as typeof Promise.prototype.catch,
    );

    wrapWithToString(
      PromiseWithContext.prototype,
      'finally',
      (original) =>
        function (this: Promise<any>, ...args) {
          args[0] = contextManager.bind(contextManager.active(), args[0]);
          return original.apply(this, args);
        } as typeof Promise.prototype.finally,
    );

    return PromiseWithContext as unknown as PromiseConstructor;
  });
};

export const unpatchPromise = () => {
  unwrap(window, 'Promise');
};
