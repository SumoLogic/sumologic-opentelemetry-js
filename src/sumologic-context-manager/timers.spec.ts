import * as api from '@opentelemetry/api';
import { SumoLogicContextManager } from './index';

window.setImmediate = ((callback: any) => {
  setTimeout(callback);
}) as any;

const NativeSetTimeout = window.setTimeout;
const NativeSetInterval = window.setInterval;
const NativeSetImmediate = window.setImmediate;
const NativeRequestAnimationFrame = window.requestAnimationFrame;
const NativeQueueMicrotask = window.queueMicrotask;

let contextManager: SumoLogicContextManager;
let context: api.Context;

beforeEach(() => {
  contextManager = new SumoLogicContextManager();
  contextManager.enable();
  context = contextManager.active().setValue(Symbol.for('test key'), '');
});

afterEach(() => {
  contextManager.disable();
});

describe('setTimeout', () => {
  test('is wrapped', () => {
    expect(setTimeout).not.toBe(NativeSetTimeout);
  });

  test('toString() is native', () => {
    expect(setTimeout.toString()).toBe(NativeSetTimeout.toString());
  });

  test('callback carries context', async () => {
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        setTimeout(() => {
          resolve(contextManager.active());
        });
      });
    });

    expect(callbackContext).toBe(context);
  });

  test('callback does not carry context when timeout is greater than 1500', async () => {
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        setTimeout(() => {
          resolve(contextManager.active());
        }, 1501);
      });
    });

    expect(callbackContext).not.toBe(context);
  });
});

describe('setInterval', () => {
  test('is wrapped', () => {
    expect(setInterval).not.toBe(NativeSetInterval);
  });

  test('toString() is native', () => {
    expect(setInterval.toString()).toBe(NativeSetInterval.toString());
  });

  test('callback carries context', async () => {
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        const id = setInterval(() => {
          clearInterval(id);
          resolve(contextManager.active());
        });
      });
    });

    expect(callbackContext).toBe(context);
  });

  test('callback does not carry context when timeout is greater than 1500', async () => {
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        const id = setInterval(() => {
          clearInterval(id);
          resolve(contextManager.active());
        }, 1501);
      });
    });

    expect(callbackContext).not.toBe(context);
  });
});

describe('setImmediate', () => {
  test('is wrapped', () => {
    expect(setImmediate).not.toBe(NativeSetImmediate);
  });

  test('toString() is native', () => {
    expect(setImmediate.toString()).toBe(NativeSetImmediate.toString());
  });

  test('callback carries context', async () => {
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        setImmediate(() => {
          resolve(contextManager.active());
        });
      });
    });

    expect(callbackContext).toBe(context);
  });
});

describe('requestAnimationFrame', () => {
  test('is wrapped', () => {
    expect(requestAnimationFrame).not.toBe(NativeRequestAnimationFrame);
  });

  test('toString() is native', () => {
    expect(requestAnimationFrame.toString()).toBe(
      NativeRequestAnimationFrame.toString(),
    );
  });

  test('callback carries context', async () => {
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        requestAnimationFrame(() => {
          resolve(contextManager.active());
        });
      });
    });

    expect(callbackContext).toBe(context);
  });
});

describe('queueMicrotask', () => {
  test('is wrapped', () => {
    expect(queueMicrotask).not.toBe(NativeQueueMicrotask);
  });

  test('toString() is native', () => {
    expect(queueMicrotask.toString()).toBe(NativeQueueMicrotask.toString());
  });

  test('callback carries context', async () => {
    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        queueMicrotask(() => {
          resolve(contextManager.active());
        });
      });
    });

    expect(callbackContext).toBe(context);
  });
});
