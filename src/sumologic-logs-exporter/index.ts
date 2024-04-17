import { hrTime } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import * as api from '@opentelemetry/api';
import type { Attributes } from '@opentelemetry/api';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { createExportLogsServiceRequest } from '@opentelemetry/otlp-transformer';
import { SeverityNumber } from '@opentelemetry/api-logs';

import { name, version } from '../../package.json';
import { getTraceById } from '../sumologic-span-processor/trace-processor';
import {
  HTTP_ACTION_TYPE,
  ROOT_SPAN_HTTP_URL,
  ROOT_SPAN_OPERATION,
} from '../constants';
import {
  getSpanHttpUrl,
  getTraceHttpActionType,
} from '../sumologic-span-processor/utils';

interface SumoLogicLogsExporterOptions {
  resource: Resource;
  attributes: Attributes;
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
  private defaultAttributes: Attributes;
  private collectorUrl: string;
  private maxQueueSize: number;
  private scheduledDelayMillis: number;
  private logs: ReadableLogRecord[];
  private timer: number | undefined;

  constructor({
    resource,
    attributes,
    collectorUrl,
    maxQueueSize,
    scheduledDelayMillis,
  }: SumoLogicLogsExporterOptions) {
    this.resource = resource;
    this.defaultAttributes = attributes;
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
    let attributes: ReadableLogRecord['attributes'] = {
      ...this.defaultAttributes,
      type: log.type,
      'http.url': location.href,
    };

    const span = api.trace.getSpan(api.context.active());
    if (span && isReadableSpan(span)) {
      const rootSpan = getTraceById(span.spanContext().traceId)?.rootSpan;
      if (rootSpan) {
        attributes[ROOT_SPAN_OPERATION] = rootSpan.name;
        const httpUrl = getSpanHttpUrl(rootSpan);
        if (httpUrl) {
          attributes[ROOT_SPAN_HTTP_URL] = httpUrl;
        }
        const actionType = getTraceHttpActionType(rootSpan);
        if (actionType) {
          attributes[HTTP_ACTION_TYPE] = actionType;
        }
      }
    }

    if (log.element) {
      attributes['element.xpath'] = log.element.xpath;
    }

    if (log.error) {
      attributes['error.name'] = log.error.name;
      attributes['error.message'] = log.error.message;
      if (log.error.stack) {
        attributes['error.stack'] = log.error.stack;
      }
    }

    if (log.arguments) {
      attributes.arguments = log.arguments;
    }

    if (log.attributes) {
      attributes = {
        ...attributes,
        ...log.attributes,
      };
    }

    const ht = hrTime();
    this.logs.push({
      hrTime: ht,
      hrTimeObserved: ht,
      resource: this.resource,
      severityNumber: SeverityNumber.ERROR,
      attributes,
      body: log.message,
      droppedAttributesCount: 0,
      instrumentationScope: {
        name,
        version,
      },
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
    const json = JSON.stringify(createExportLogsServiceRequest(logs));
    sendData(this.collectorUrl, json);
  }
}
