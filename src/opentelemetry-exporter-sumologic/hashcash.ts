interface WorkerRequest {
  requestId: number;
  seed: string;
}

type WorkerResult = { requestId: number } & (
  | {
      result: number;
    }
  | {
      error: Error;
    }
);

function createHashChecksum(seed: string) {
  const suffixLength = 10;

  function utf8ToBinaryString(str: string) {
    const escstr = encodeURIComponent(str);
    return escstr.replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    );
  }

  function binaryStringToBuffer(
    binaryText: string,
    buffer = new Uint8Array(binaryText.length),
    offset = 0,
  ): Uint8Array {
    const { length } = binaryText;
    for (let i = 0; i < length; i += 1) {
      buffer[i + offset] = binaryText.charCodeAt(i);
    }
    return buffer;
  }

  function utf8ToBuffer(text: string, buffer?: Uint8Array, offset?: number) {
    const binaryText = utf8ToBinaryString(text);
    return binaryStringToBuffer(binaryText, buffer, offset);
  }

  function hash(buffer: Uint8Array) {
    return crypto.subtle.digest('SHA-256', buffer).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    });
  }

  function check(seedBuffer: Uint8Array, need: string, solution: string) {
    const seedLength = seedBuffer.length - suffixLength;
    utf8ToBuffer(solution, seedBuffer, seedLength);
    const buffer = new Uint8Array(
      seedBuffer.buffer,
      0,
      seedLength + solution.length,
    );
    return hash(buffer).then((result) => result.startsWith(need));
  }

  function solve(seed: string, need: string) {
    const seedBuffer = utf8ToBuffer(
      seed + new Array(suffixLength).fill(0).join(''),
    );

    function next(i: number): Promise<number> {
      const solution = i + 1;
      return check(seedBuffer, need, String(solution)).then((result) => {
        return result ? solution : next(solution);
      });
    }
    return next(0);
  }

  return solve(seed, '00');
}

function workerBody() {
  const ctx: Worker = self as any;
  ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const { requestId, seed } = event.data;
    createHashChecksum(seed)
      .then((result) => {
        ctx.postMessage({ requestId, result });
      })
      .catch((error) => {
        ctx.postMessage({ requestId, error });
      });
  };
}

const fullWorkerBody = `${createHashChecksum.toString()}; (${workerBody.toString()})()`;
const blob = new Blob([fullWorkerBody], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
const workerPromises: Record<
  string,
  { resolve: (value: number) => void; reject: (reason: Error) => void }
> = {};
let lastWorkerRequestId = 0;

worker.addEventListener('message', (event: MessageEvent<WorkerResult>) => {
  const { data } = event;
  const { requestId } = data;
  const handler = workerPromises[requestId];
  if (!handler) {
    return;
  }
  delete workerPromises[requestId];
  if ('result' in data) {
    handler.resolve(data.result);
  } else {
    handler.reject(data.error);
  }
});

export const createHashChecksumAsync = (seed: string) =>
  new Promise<number>((resolve, reject) => {
    lastWorkerRequestId += 1;
    workerPromises[lastWorkerRequestId] = { resolve, reject };
    const request: WorkerRequest = { requestId: lastWorkerRequestId, seed };
    worker.postMessage(request);
  });
