import * as api from '@opentelemetry/api';
import { SumoLogicContextManager } from './index';

window.MessagePort = class MessagePort {
  public onmessage: () => void;
  private _secondPort!: MessagePort;

  constructor() {
    this.onmessage = () => {};
  }
  postMessage() {
    this._secondPort.onmessage();
  }
} as any;

window.MessageChannel = class MessageChannel {
  public port1: MessagePort;
  public port2: MessagePort;

  constructor() {
    this.port1 = new MessagePort();
    this.port2 = new MessagePort();

    (this.port1 as any)._secondPort = this.port2;
    (this.port2 as any)._secondPort = this.port1;
  }
};

const NativeMessagePort = window.MessagePort;
const NativeMessageChannel = window.MessageChannel;

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

describe('MessageChannel', () => {
  test('is wrapped', () => {
    expect(MessageChannel).not.toBe(NativeMessageChannel);
  });

  test('toString() is native', () => {
    expect(MessageChannel.toString()).toBe(NativeMessageChannel.toString());
  });

  test('port2 carries context of port1.postMessage', async () => {
    const callbackContext = await new Promise<api.Context>((resolve) => {
      const channel = new MessageChannel();
      channel.port2.onmessage = () => {
        resolve(contextManager.active());
      };
      contextManager.with(context, () => {
        channel.port1.postMessage(null);
      });
    });

    expect(callbackContext).toBe(context);
  });

  test('port1 carries context of port2.postMessage', async () => {
    const callbackContext = await new Promise<api.Context>((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        resolve(contextManager.active());
      };
      contextManager.with(context, () => {
        channel.port2.postMessage(null);
      });
    });

    expect(callbackContext).toBe(context);
  });
});
