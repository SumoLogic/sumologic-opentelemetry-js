import { getElementXPath } from '@opentelemetry/sdk-trace-web';
import { LogRecord, SumoLogicLogsExporter } from '../sumologic-logs-exporter';

const MAX_CONSOLE_STRING_LENGTH = 500;
const MAX_STACK_TRACE_LENGTH = 5000;

interface SumoLogicLogsInstrumentationOptions {
  exporter: SumoLogicLogsExporter;
}

const shortenString = (string: string, limit: number): string =>
  string.length > limit ? `${string.slice(0, limit)}...` : string;

const maybeErrorToObject = (maybeError: any): LogRecord['error'] | undefined =>
  maybeError instanceof Error
    ? {
        name: maybeError.name,
        message: maybeError.message,
        stack: maybeError.stack
          ? shortenString(maybeError.stack, MAX_STACK_TRACE_LENGTH)
          : undefined,
      }
    : undefined;

const consoleValueToString = (value: any, deep = 0): string => {
  if (typeof value === 'string') {
    const string = shortenString(value, MAX_CONSOLE_STRING_LENGTH);
    return deep > 0 ? `"${string}"` : string;
  }
  if (Array.isArray(value)) {
    if (deep > 0) {
      return '...';
    }
    return `[${value
      .map((elem) => consoleValueToString(elem, deep + 1))
      .join(', ')}]`;
  }
  if (value instanceof Error) {
    return consoleValueToString(
      { name: value.name, message: value.message },
      deep,
    );
  }
  if (value != null && typeof value === 'object') {
    if (deep > 0) {
      return '...';
    }
    return `{ ${Object.getOwnPropertyNames(value)
      .map((key) => `${key}: ${consoleValueToString(value[key], deep + 1)}`)
      .join(', ')} }`;
  }
  return String(value);
};

const consoleValueToArgument = (
  value: any,
  usedReferences = new Set<any>(),
): any => {
  const addedToUsedReferences = !usedReferences.has(value);
  usedReferences.add(value);
  if (Array.isArray(value)) {
    return value.map((elem) => consoleValueToArgument(elem, usedReferences));
  }
  if (value != null && typeof value === 'object') {
    const result: Record<string, any> = {};
    Object.getOwnPropertyNames(value).forEach((key) => {
      const keyValue = value[key];
      result[key] =
        usedReferences.has(keyValue) &&
        (keyValue !== value || addedToUsedReferences)
          ? '[Circular]'
          : consoleValueToArgument(keyValue);
    });
    return result;
  }
  return value;
};

export class SumoLogicLogsInstrumentation {
  private exporter: SumoLogicLogsExporter;
  private isEnabled = false;

  constructor({ exporter }: SumoLogicLogsInstrumentationOptions) {
    this.exporter = exporter;

    const nativeConsoleError = console.error;
    console.error = (...args) => {
      if (this.isEnabled) {
        this.onConsoleError(args);
      }
      nativeConsoleError.apply(console, args);
    };
  }

  onError = (error: ErrorEvent) => {
    this.exporter.recordLog({
      type: 'uncaughtException',
      message: error.message,
      error: maybeErrorToObject(error.error),
    });
  };

  onUnhandledRejection = ({ reason }: PromiseRejectionEvent) => {
    if (!reason) return;
    const error = maybeErrorToObject(reason);
    this.exporter.recordLog({
      type: 'unhandledRejection',
      message: error ? `Unhandled rejection ${reason}` : String(reason),
      error,
    });
  };

  onDocumentError = ({ target }: ErrorEvent) => {
    if (!target) return;
    const xpath = getElementXPath(target);
    if (!xpath) return;
    this.exporter.recordLog({
      type: 'documentError',
      message: `Uncaught error in element ${xpath}`,
      element: { xpath },
    });
  };

  onConsoleError = (args: any[]) => {
    const error = args.find(maybeErrorToObject);
    const consoleArguments =
      args.length > 3 ||
      args.find(
        (elem) =>
          elem != null && typeof elem === 'object' && !(elem instanceof Error),
      )
        ? args.map((arg) => consoleValueToArgument(arg))
        : undefined;
    this.exporter.recordLog({
      type: 'consoleError',
      message: args.map((elem) => consoleValueToString(elem)).join(' '),
      arguments: consoleArguments,
      error,
    });
  };

  enable() {
    this.disable();
    window.addEventListener('error', this.onError);
    window.addEventListener('unhandledrejection', this.onUnhandledRejection);
    document.documentElement.addEventListener('error', this.onDocumentError, {
      capture: true,
    });
    this.isEnabled = true;
  }

  disable() {
    window.removeEventListener('error', this.onError);
    window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
    document.documentElement.removeEventListener(
      'error',
      this.onDocumentError,
      { capture: true },
    );
    this.isEnabled = false;
  }
}
