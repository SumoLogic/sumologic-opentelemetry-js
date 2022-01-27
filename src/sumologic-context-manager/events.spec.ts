import * as api from '@opentelemetry/api';
import { SumoLogicContextManager } from './index';

const NativeAddEventListener = window.EventTarget.prototype.addEventListener;
const NativeRemoveEventListener =
  window.EventTarget.prototype.removeEventListener;

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

describe('EventTarget', () => {
  test('addEventListener is wrapped', () => {
    expect(EventTarget.prototype.addEventListener).not.toBe(
      NativeAddEventListener,
    );
  });

  test('addEventListener toString() is native', () => {
    expect(EventTarget.prototype.addEventListener.toString()).toBe(
      NativeAddEventListener.toString(),
    );
  });

  test('removeEventListener is wrapped', () => {
    expect(EventTarget.prototype.removeEventListener).not.toBe(
      NativeRemoveEventListener,
    );
  });

  test('removeEventListener toString() is native', () => {
    expect(EventTarget.prototype.removeEventListener.toString()).toBe(
      NativeRemoveEventListener.toString(),
    );
  });

  test('callback carries context', async () => {
    const eventTarget = new EventTarget();

    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        eventTarget.addEventListener('test', () => {
          resolve(contextManager.active());
        });
      });

      eventTarget.dispatchEvent(new Event('test'));
    });

    expect(callbackContext).toBe(context);
  });

  test('listener can be removed', () => {
    const eventTarget = new EventTarget();
    const listener = jest.fn();
    eventTarget.addEventListener('test', listener);
    eventTarget.removeEventListener('test', listener);
    eventTarget.dispatchEvent(new Event('test'));
    expect(listener).not.toBeCalled();
  });

  test('object listener can be removed', () => {
    const eventTarget = new EventTarget();
    const listener = jest.fn();
    const eventListenerObject = { handleEvent: listener };
    eventTarget.addEventListener('test', eventListenerObject);
    eventTarget.removeEventListener('test', eventListenerObject);
    eventTarget.dispatchEvent(new Event('test'));
    expect(listener).not.toBeCalled();
  });

  test('the same listener is not added multiple times', () => {
    const eventTarget = new EventTarget();
    const listener = jest.fn();
    eventTarget.addEventListener('test', listener);
    eventTarget.addEventListener('test', listener);
    eventTarget.addEventListener('test', listener);
    eventTarget.dispatchEvent(new Event('test'));
    expect(listener).toBeCalledTimes(1);
  });

  test('property carries context', async () => {
    const xhr = new XMLHttpRequest();

    const callbackContext = await new Promise<api.Context>((resolve) => {
      contextManager.with(context, () => {
        xhr.onload = () => {
          resolve(contextManager.active());
        };
      });

      xhr.dispatchEvent(new Event('load'));
    });

    expect(callbackContext).toBe(context);
  });

  test('property is the same as the set one', () => {
    const xhr = new XMLHttpRequest();
    const listener = () => {};

    xhr.onload = listener;
    expect(xhr.onload).toBe(listener);
  });
});
