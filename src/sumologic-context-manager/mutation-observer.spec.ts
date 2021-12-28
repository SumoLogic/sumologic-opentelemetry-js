import * as api from '@opentelemetry/api';
import { SumoLogicContextManager } from './index';

const NativeMutationObserver = window.MutationObserver;

describe('MutationObserver', () => {
  let contextManager: SumoLogicContextManager;

  beforeEach(() => {
    contextManager = new SumoLogicContextManager();
    contextManager.enable();
  });

  afterEach(() => {
    contextManager.disable();
  });

  test('is wrapped', () => {
    expect(MutationObserver).not.toBe(NativeMutationObserver);
  });

  test('toString() is native', () => {
    expect(MutationObserver.toString()).toBe(NativeMutationObserver.toString());
  });

  test('callback carries context', async () => {
    const context = contextManager
      .active()
      .setValue(Symbol.for('test key'), '');
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve(contextManager.active());
        });
        observer.observe(document.body, { attributes: true });
        document.body.setAttribute('a', '');
      });
    });

    expect(callbackContext).toBe(context);
  });
});
