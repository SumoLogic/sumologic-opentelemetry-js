import { unwrap } from 'shimmer';
import { copyToStringFrom, wrapWithToString } from './utils';
import { ContextManager } from '@opentelemetry/api';

export const patchMutationObserver = (contextManager: ContextManager) => {
  if (!window.MutationObserver) return;

  wrapWithToString(window, 'MutationObserver', (OriginalMutationObserver) => {
    const MutationObserverWithContext = class MutationObserver extends OriginalMutationObserver {
      constructor(
        ...args: ConstructorParameters<typeof OriginalMutationObserver>
      ) {
        args[0] = contextManager.bind(contextManager.active(), args[0]);
        super(...args);
      }
    };

    copyToStringFrom(MutationObserverWithContext, OriginalMutationObserver);

    return MutationObserverWithContext;
  });
};

export const unpatchMutationObserver = () => {
  unwrap(window, 'MutationObserver');
};
