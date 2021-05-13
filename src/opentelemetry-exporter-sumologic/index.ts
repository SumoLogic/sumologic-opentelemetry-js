import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { CollectorExporterError } from '@opentelemetry/exporter-collector/src/types';
import { createHashChecksumAsync } from './hashcash';

const HASH_QUERY_PARAM = 'hashChecksum';

export class SumoLogicTraceExporter extends CollectorTraceExporter {
  protected _sendData(
    body: string,
    url: string,
    headers: { [key: string]: string },
    onSuccess: () => void,
    onError: (error: CollectorExporterError) => void,
  ) {
    createHashChecksumAsync(body)
      .then((hashChecksum) => {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.append(HASH_QUERY_PARAM, String(hashChecksum));
        super._sendData(body, parsedUrl.href, headers, onSuccess, onError);
      })
      .catch((error) => {
        this.logger.error('createHashChecksum error', error);
        onError(new CollectorExporterError('Cannot calculate hash checksum'));
      });
  }
}
