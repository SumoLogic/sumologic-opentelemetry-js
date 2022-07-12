import { hrTime, hrTimeToNanoseconds } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import * as api from '@opentelemetry/api';
import type { Attributes, Span } from '@opentelemetry/api';
import { name, version } from '../../package.json';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';

interface SumoLogicLogsExporterOptions {
  resource: Resource;
  collectorUrl: string;
  maxQueueSize: number;
  scheduledDelayMillis: number;
}

export interface LogRecord {
  type:
    | 'uncaughtException'
    | 'unhandledRejection'
    | 'consoleError'
    | 'documentError'
    | 'customError';
  message: string;
  arguments?: any[];
  element?: {
    xpath: string;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  attributes?: Record<string, any>;
}

export interface CustomError {
  message: string;
  attributes?: Record<string, any>;
}

type ProtoValue =
  | { stringValue: string }
  | { boolValue: boolean }
  | { intValue: number }
  | { doubleValue: number }
  | { arrayValue: { values: ProtoValue[] } }
  | { kvlistValue: { values: ProtoAttribute[] } };

interface ProtoAttribute {
  key: string;
  value: ProtoValue;
}

interface ProtoLogRecord {
  timeUnixNano: number;
  severityNumber?: ProtoSeverityNumber;
  severityText?: string;
  name?: string;
  body?: ProtoValue;
  attributes?: ProtoAttribute[];
  droppedAttributesCount: number;
  traceId?: string;
  spanId?: string;
}

enum ProtoSeverityNumber {
  SEVERITY_NUMBER_UNSPECIFIED,
  SEVERITY_NUMBER_TRACE,
  SEVERITY_NUMBER_TRACE2,
  SEVERITY_NUMBER_TRACE3,
  SEVERITY_NUMBER_TRACE4,
  SEVERITY_NUMBER_DEBUG,
  SEVERITY_NUMBER_DEBUG2,
  SEVERITY_NUMBER_DEBUG3,
  SEVERITY_NUMBER_DEBUG4,
  SEVERITY_NUMBER_INFO,
  SEVERITY_NUMBER_INFO2,
  SEVERITY_NUMBER_INFO3,
  SEVERITY_NUMBER_INFO4,
  SEVERITY_NUMBER_WARN,
  SEVERITY_NUMBER_WARN2,
  SEVERITY_NUMBER_WARN3,
  SEVERITY_NUMBER_WARN4,
  SEVERITY_NUMBER_ERROR,
  SEVERITY_NUMBER_ERROR2,
  SEVERITY_NUMBER_ERROR3,
  SEVERITY_NUMBER_ERROR4,
  SEVERITY_NUMBER_FATAL,
  SEVERITY_NUMBER_FATAL2,
  SEVERITY_NUMBER_FATAL3,
  SEVERITY_NUMBER_FATAL4,
}

const protoValue = (value: unknown): ProtoValue => {
  switch (typeof value) {
    case 'number':
      if (Number.isInteger(value)) {
        return { intValue: value };
      }
      return { doubleValue: value };
    case 'boolean':
      return { boolValue: value };
    case 'object':
      if (Array.isArray(value)) {
        return {
          arrayValue: { values: value.map((item) => protoValue(item)) },
        };
      }
      if (value != null) {
        return {
          kvlistValue: {
            values: Object.entries(value).map(([key, keyValue]) =>
              protoAttribute(key, keyValue),
            ),
          },
        };
      }
    default:
      return { stringValue: String(value) };
  }
};

const protoAttribute = (key: string, value: unknown): ProtoAttribute => ({
  key,
  value: protoValue(value),
});

const protoAttributes = (object: Attributes): ProtoAttribute[] =>
  Object.entries(object).map(([key, value]) => protoAttribute(key, value));

const isReadableSpan = (span: object): span is ReadableSpan =>
  'name' in span && 'instrumentationLibrary' in span;

let maxBeaconDataSize = Infinity;
const sendData = (url: string, json: string) => {
  const blob = new Blob([json], { type: 'application/json' });
  if (blob.size >= maxBeaconDataSize || !navigator.sendBeacon(url, blob)) {
    maxBeaconDataSize = blob.size;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: json,
    });
  }
};

export class SumoLogicLogsExporter {
  private resource: Resource;
  private collectorUrl: string;
  private maxQueueSize: number;
  private scheduledDelayMillis: number;
  private logs: ProtoLogRecord[];
  private timer: number | undefined;

  constructor({
    resource,
    collectorUrl,
    maxQueueSize,
    scheduledDelayMillis,
  }: SumoLogicLogsExporterOptions) {
    this.resource = resource;
    this.collectorUrl = collectorUrl;
    this.maxQueueSize = maxQueueSize;
    this.scheduledDelayMillis = scheduledDelayMillis;
    this.logs = [];
  }

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.export();
    }
  };

  private onPageHide = () => {
    this.export();
  };

  enable() {
    if (document != null) {
      this.disable();
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      document.addEventListener('pagehide', this.onPageHide);
    }
  }

  disable() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    document.removeEventListener('pagehide', this.onPageHide);
  }

  private exportWhenNeeded() {
    if (this.logs.length >= this.maxQueueSize) {
      this.export();
    } else if (this.timer === undefined) {
      this.timer = Number(
        setTimeout(() => this.export(), this.scheduledDelayMillis),
      );
    }
  }

  recordLog(log: LogRecord) {
    const attributes: ProtoLogRecord['attributes'] = [
      protoAttribute('type', log.type),
      protoAttribute('http.url', location.href),
    ];

    const span = api.trace.getSpan(api.context.active());
    if (span && isReadableSpan(span)) {
      attributes.push(protoAttribute('operation', span.name));
    }

    if (log.element) {
      attributes.push(protoAttribute('element.xpath', log.element.xpath));
    }

    if (log.error) {
      attributes.push(protoAttribute('error.name', log.error.name));
      attributes.push(protoAttribute('error.message', log.error.message));
      if (log.error.stack) {
        attributes.push(protoAttribute('error.stack', log.error.stack));
      }
    }

    if (log.arguments) {
      attributes.push(protoAttribute('arguments', log.arguments));
    }

    if (log.attributes) {
      Object.entries(log.attributes).forEach(([key, value]) => {
        attributes.push(protoAttribute(key, value));
      });
    }

    this.logs.push({
      timeUnixNano: hrTimeToNanoseconds(hrTime()),
      severityNumber: ProtoSeverityNumber.SEVERITY_NUMBER_ERROR,
      body: {
        stringValue: log.message,
      },
      attributes,
      droppedAttributesCount: 0,
      traceId: span?.spanContext().traceId,
      spanId: span?.spanContext().spanId,
    });

    this.exportWhenNeeded();
  }

  recordCustomError = (message: string, attributes?: Record<string, any>) => {
    this.recordLog({
      type: 'customError',
      message,
      attributes,
    });
  };

  private export() {
    clearTimeout(this.timer);
    this.timer = undefined;
    const { logs } = this;
    if (!logs.length) return;
    this.logs = [];
    const json = JSON.stringify({
      resourceLogs: [
        {
          resource: {
            attributes: protoAttributes(this.resource.attributes),
          },
          instrumentationLibraryLogs: [
            {
              instrumentationLibrary: {
                name,
                version,
              },
              logs,
            },
          ],
        },
      ],
    });
    sendData(this.collectorUrl, json);
  }
}
