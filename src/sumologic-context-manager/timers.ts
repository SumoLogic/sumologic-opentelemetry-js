import { unwrap } from 'shimmer';
import { wrapWithToString } from './utils';
import { ContextManager } from '@opentelemetry/api';
import { MAX_TIMEOUT } from './constants';

const shouldBindCallbackForTimeout = (ms: number | undefined) =>
  typeof ms !== 'number' || ms <= MAX_TIMEOUT;

export const patchTimers = (contextManager: ContextManager) => {
  wrapWithToString(
    window,
    'setTimeout',
    (original) =>
      function (this: unknown, ...args: Parameters<typeof setTimeout>) {
        if (shouldBindCallbackForTimeout(args[1])) {
          args[0] = contextManager.bind(contextManager.active(), args[0]);
        }
        return original.apply(this, args);
      } as typeof setTimeout,
  );

  wrapWithToString(
    window,
    'setInterval',
    (original) =>
      function (this: unknown, ...args: Parameters<typeof setInterval>) {
        if (shouldBindCallbackForTimeout(args[1])) {
          args[0] = contextManager.bind(contextManager.active(), args[0]);
        }
        return original.apply(this, args);
      } as typeof setInterval,
  );

  wrapWithToString(
    window,
    'setImmediate',
    (original) =>
      function (this: unknown, ...args: Parameters<typeof setImmediate>) {
        args[0] = contextManager.bind(contextManager.active(), args[0]);
        return original.apply(this, args);
      } as typeof setImmediate,
  );

  wrapWithToString(
    window,
    'requestAnimationFrame',
    (original) =>
      function (
        this: unknown,
        ...args: Parameters<typeof requestAnimationFrame>
      ) {
        args[0] = contextManager.bind(contextManager.active(), args[0]);
        return original.apply(this, args);
      } as typeof requestAnimationFrame,
  );

  wrapWithToString(
    window,
    'queueMicrotask',
    (original) =>
      function (this: unknown, ...args: Parameters<typeof queueMicrotask>) {
        args[0] = contextManager.bind(contextManager.active(), args[0]);
        return original.apply(this, args);
      } as typeof queueMicrotask,
  );
};

export const unpatchTimers = () => {
  unwrap(window, 'setTimeout');
  unwrap(window, 'setInterval');
  if (window.setImmediate != null) {
    unwrap(window, 'setImmediate');
  }
  unwrap(window, 'requestAnimationFrame');
  if (window.queueMicrotask != null) {
    unwrap(window, 'queueMicrotask');
  }
};
