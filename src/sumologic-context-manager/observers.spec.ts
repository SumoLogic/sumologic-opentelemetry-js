import * as api from '@opentelemetry/api';
import { ROOT_CONTEXT } from '@opentelemetry/api';
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

    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  test('is wrapped', () => {
    expect(MutationObserver).not.toBe(NativeMutationObserver);
  });

  test('name is not changed', () => {
    expect(MutationObserver.name).toBe('MutationObserver');
  });

  test('toString() is native', () => {
    expect(MutationObserver.toString()).toBe(NativeMutationObserver.toString());
  });

  test('callback carries context', async () => {
    const context = contextManager.active().setValue(Symbol(), '');
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve(contextManager.active());
        });
        observer.observe(document.body, { childList: true });
        document.body.appendChild(document.createElement('div'));
      });
    });

    expect(callbackContext).toBe(context);
  });

  test('context is not carried by callback after 300ms', async () => {
    const context = contextManager.active().setValue(Symbol(), '');
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve(contextManager.active());
        });
        setTimeout(() => {
          observer.observe(document.body, { childList: true });
          document.body.appendChild(document.createElement('div'));
        }, 300);
      });
    });

    expect(callbackContext).toBe(ROOT_CONTEXT);
  });
});
