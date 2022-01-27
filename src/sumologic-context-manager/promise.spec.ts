import * as api from '@opentelemetry/api';
import { SumoLogicContextManager } from './index';

const NativePromise = window.Promise;
const NativePromiseThen = window.Promise.prototype.then;
const NativePromiseCatch = window.Promise.prototype.catch;
const NativePromiseFinally = window.Promise.prototype.finally;

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

describe('Promise', () => {
  test('is wrapped', () => {
    expect(Promise).not.toBe(NativePromise);
  });

  test('toString() is native', () => {
    expect(Promise.toString()).toBe(NativePromise.toString());
  });

  describe('then()', () => {
    test('is wrapped', () => {
      expect(Promise.prototype.then).not.toBe(NativePromiseThen);
    });

    test('toString() is native', () => {
      expect(Promise.prototype.then.toString()).toBe(
        NativePromiseThen.toString(),
      );
    });

    test('callback carries context in onfulfilled', async () => {
      const callbackContext = await new Promise<api.Context>((resolve) => {
        const promise = new Promise((subResolve) => {
          subResolve(null);
        });
        contextManager.with(context, () => {
          promise.then(() => {
            resolve(contextManager.active());
          });
        });
      });

      expect(callbackContext).toBe(context);
    });

    test('callback carries context in onrejected', async () => {
      const callbackContext = await new Promise<api.Context>((resolve) => {
        const promise = new Promise((subResolve, subReject) => {
          subReject();
        });
        contextManager.with(context, () => {
          promise.then(
            () => {},
            () => {
              resolve(contextManager.active());
            },
          );
        });
      });

      expect(callbackContext).toBe(context);
    });
  });

  describe('catch()', () => {
    test('is wrapped', () => {
      expect(Promise.prototype.catch).not.toBe(NativePromiseCatch);
    });

    test('toString() is native', () => {
      expect(Promise.prototype.catch.toString()).toBe(
        NativePromiseCatch.toString(),
      );
    });

    test('callback carries context', async () => {
      const callbackContext = await new Promise<api.Context>((resolve) => {
        const promise = new Promise((subResolve, subReject) => {
          subReject();
        });
        contextManager.with(context, () => {
          promise.catch(() => {
            resolve(contextManager.active());
          });
        });
      });

      expect(callbackContext).toBe(context);
    });
  });

  describe('finally()', () => {
    test('is wrapped', () => {
      expect(Promise.prototype.finally).not.toBe(NativePromiseFinally);
    });

    test('toString() is native', () => {
      expect(Promise.prototype.finally.toString()).toBe(
        NativePromiseFinally.toString(),
      );
    });

    test('callback carries context', async () => {
      const callbackContext = await new Promise<api.Context>((resolve) => {
        const promise = new Promise((subResolve) => {
          subResolve(null);
        });
        contextManager.with(context, () => {
          promise.finally(() => {
            resolve(contextManager.active());
          });
        });
      });

      expect(callbackContext).toBe(context);
    });
  });
});
