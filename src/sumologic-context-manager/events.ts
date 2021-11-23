import { unwrap } from 'shimmer';
import { wrapWithToString } from './utils';
import { ContextManager } from '@opentelemetry/api';

const OnProperties = new Map<Object[], string[]>([
  [
    [XMLHttpRequest.prototype],
    [
      'loadstart',
      'progress',
      'abort',
      'error',
      'load',
      'progress',
      'timeout',
      'loadend',
      'readystatechange',
    ],
  ],
  [[MessagePort?.prototype], ['message', 'messageerror']],
  [[WebSocket?.prototype], ['close', 'error', 'open', 'message']],
  [[Worker?.prototype], ['error', 'message']],
  [
    [
      IDBIndex.prototype,
      IDBRequest.prototype,
      IDBOpenDBRequest.prototype,
      IDBDatabase.prototype,
      IDBTransaction.prototype,
      IDBCursor.prototype,
    ],
    [
      'upgradeneeded',
      'complete',
      'abort',
      'success',
      'error',
      'blocked',
      'versionchange',
      'close',
    ],
  ],
]);

type OnListener = (this: unknown, event: Event) => any;

export const patchEvents = (contextManager: ContextManager) => {
  const wrappedOnListeners = new WeakMap<OnListener, OnListener>();

  const patchOnProperty = <O extends Object>(
    object: O,
    property: string,
  ): void => {
    const descriptor = Object.getOwnPropertyDescriptor(object, property);
    if (descriptor) {
      wrapWithToString(
        descriptor,
        'get',
        (original) =>
          function (this: unknown) {
            const listener = original!.call(this);
            return wrappedOnListeners.get(listener) || listener;
          },
      );
      wrapWithToString(
        descriptor,
        'set',
        (original) =>
          function (this: unknown, listener: OnListener | null) {
            let wrappedListener = listener;
            if (listener) {
              wrappedListener = contextManager.bind(
                contextManager.active(),
                listener,
              );
              wrappedOnListeners.set(wrappedListener, listener);
            }
            original!.call(this, wrappedListener);
          },
      );
      Object.defineProperty(object, property, descriptor);
    }
  };

  const patchOnProperties = <O extends Object>(
    object: O,
    properties: string[],
  ): void => {
    properties.forEach((property) => {
      patchOnProperty(object, `on${property}`);
    });
  };

  const wrappedEventListeners = new WeakMap<
    EventListenerOrEventListenerObject,
    EventListenerOrEventListenerObject
  >();

  wrapWithToString(
    EventTarget.prototype,
    'addEventListener',
    (original) =>
      function (this: EventTarget, ...args) {
        const listener = args[1];
        if (listener) {
          let wrappedListener = wrappedEventListeners.get(listener);
          if (!wrappedListener) {
            if (typeof listener === 'function') {
              wrappedListener = contextManager.bind(
                contextManager.active(),
                listener,
              );
            } else if (listener && typeof listener.handleEvent === 'function') {
              wrappedListener = {
                ...listener,
                handleEvent: contextManager.bind(
                  contextManager.active(),
                  listener.handleEvent,
                ),
              };
            }
          }
          if (wrappedListener) {
            wrappedEventListeners.set(listener, wrappedListener);
            args[1] = wrappedListener;
          }
        }
        return original.apply(this, args);
      } as typeof EventTarget.prototype.addEventListener,
  );

  wrapWithToString(
    EventTarget.prototype,
    'removeEventListener',
    (original) =>
      function (this: EventTarget, ...args) {
        const listener = args[1];
        if (listener) {
          const wrappedListener = wrappedEventListeners.get(listener);
          if (wrappedListener) {
            args[1] = wrappedListener;
          }
        }
        return original.apply(this, args);
      } as typeof EventTarget.prototype.removeEventListener,
  );

  OnProperties.forEach((properties, objects) => {
    objects.forEach((object) => {
      patchOnProperties(object, properties);
    });
  });
};

export const unpatchEvents = () => {
  const unpatchOnProperty = <O extends Object>(
    object: O,
    property: string,
  ): void => {
    const descriptor = Object.getOwnPropertyDescriptor(object, property);
    if (descriptor) {
      unwrap(descriptor, 'get');
      unwrap(descriptor, 'set');
      Object.defineProperty(object, property, descriptor);
    }
  };

  const unpatchOnProperties = <O extends Object>(
    object: O,
    properties: string[],
  ): void => {
    properties.forEach((property) => {
      unpatchOnProperty(object, `on${property}`);
    });
  };

  unwrap(EventTarget.prototype, 'addEventListener');
  unwrap(EventTarget.prototype, 'removeEventListener');

  OnProperties.forEach((properties, objects) => {
    objects.forEach((object) => {
      unpatchOnProperties(object, properties);
    });
  });
};
