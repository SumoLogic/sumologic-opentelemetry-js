import { unwrap } from 'shimmer';
import { copyToStringFrom, setObjectContext, wrapWithToString } from './utils';
import { ContextManager, ROOT_CONTEXT } from '@opentelemetry/api';
import { MAX_OBSERVER_CALLBACK_DELAY } from './constants';

const OBSERVERS = [
  'MutationObserver',
  'IntersectionObserver',
  'ResizeObserver',
] as const;

export const patchObservers = (contextManager: ContextManager) => {
  OBSERVERS.forEach((name) => {
    if (globalThis[name]) {
      wrapWithToString(globalThis, name, (OriginalObserver) => {
        const ObserverWithContext = class Observer extends OriginalObserver {
          constructor(...args: ConstructorParameters<typeof OriginalObserver>) {
            args[0] = contextManager.bind(contextManager.active(), args[0]);
            super(...args);

            // callbacks called after the delay won't be attached to the original context
            // to prevent creating long traces when user e.g. scrolled or resized the website after some time
            setTimeout(() => {
              setObjectContext(this, ROOT_CONTEXT);
            }, MAX_OBSERVER_CALLBACK_DELAY);
          }
        };

        Object.defineProperty(ObserverWithContext, 'name', {
          enumerable: false,
          configurable: true,
          writable: false,
          value: name,
        });
        copyToStringFrom(ObserverWithContext, OriginalObserver);

        return ObserverWithContext as typeof globalThis[typeof name];
      });
    }
  });
};

export const unpatchObservers = () => {
  OBSERVERS.forEach((name) => {
    if (globalThis[name]) {
      unwrap(globalThis, name);
    }
  });
};
