import { unwrap } from 'shimmer';
import { setObjectContext, wrapWithToString } from './utils';
import { Context, ContextManager } from '@opentelemetry/api';

interface WrappedMessagePort extends MessagePort {
  __ot_context: Context | null;
}

export const patchMessageChannel = (contextManager: ContextManager) => {
  if (!self.MessageChannel || !self.MessagePort) return;

  const messagePorts = new WeakMap<WrappedMessagePort, WrappedMessagePort>();

  wrapWithToString(
    window,
    'MessageChannel',
    (original) =>
      class MessageChannel extends original {
        constructor(...args: []) {
          super(...args);

          messagePorts.set(
            this.port1 as WrappedMessagePort,
            this.port2 as WrappedMessagePort,
          );
          messagePorts.set(
            this.port2 as WrappedMessagePort,
            this.port1 as WrappedMessagePort,
          );
        }
      },
  );

  wrapWithToString(
    MessagePort.prototype,
    'postMessage',
    (original) =>
      function (this: WrappedMessagePort, ...args: any[]) {
        const targetPort = messagePorts.get(this);
        if (contextManager.active() && targetPort) {
          setObjectContext(targetPort, contextManager.active());
        }
        return original.apply(this, args as any);
      },
  );
};

export const unpatchMessageChannel = () => {
  if (!self.MessageChannel || !self.MessagePort) return;
  unwrap(window, 'MessageChannel');
  unwrap(MessagePort.prototype, 'postMessage');
};
