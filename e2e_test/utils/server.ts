import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Server } from 'http';

interface StartServerConfig {
  basedir: string;
}

interface StartServerResult {
  server: Server;
  port: number;
}

export const startServer = ({ basedir }: StartServerConfig) => {
  const app = express();
  let port: number;

  app.use(function (req, res, next) {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
      data += chunk;
    });

    req.on('end', function () {
      req.body = data;
      next();
    });
  });

  app.get('/logo.png', (req, res) => {
    res.sendFile(path.join(basedir, '../static/logo.png'));
  });

  app.get('/logo-delay.png', (req, res) => {
    setTimeout(() => {
      res.sendFile(path.join(basedir, '../static/logo.png'));
    }, 1000);
  });

  app.use(async (req, res, next) => {
    try {
      const requestPath = path.join(basedir, '../static', req.url);
      const stat = await fs.stat(requestPath);
      const filePath = stat.isDirectory()
        ? path.join(requestPath, 'index.html')
        : requestPath;
      let file = await fs.readFile(filePath, 'utf-8');
      file = file.replace(/{{port}}/g, String(port));
      res.contentType('html');
      res.send(file);
    } catch (error) {
      next();
    }
  });

  app.use(
    express.static(path.join(basedir, '../static'), {
      maxAge: 0,
      lastModified: false,
      etag: false,
      cacheControl: false,
    }),
  );

  app.get('*/rum.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/browser.js'));
  });

  const createOtelTelemetry = (telemetrySignalType: string) => {
    let postCounter = 0;
    let getCounter = 0;
    let resolveFirstBatch: (value: any) => void;
    let resolveSecondBatch: (value: any) => void;
    let firstBatch = new Promise<any>((resolve) => {
      resolveFirstBatch = resolve;
    });
    let secondBatch = new Promise<any>((resolve) => {
      resolveSecondBatch = resolve;
    });

    app.post(`/rum/v1/${telemetrySignalType}`, (req, res) => {
      ++postCounter;

      let resolveFunctionToCall =
        postCounter === 1 ? resolveFirstBatch : resolveSecondBatch;

      resolveFunctionToCall(req.body);

      res.send('');
    });

    app.get(`/${telemetrySignalType}`, async (req, res) => {
      ++getCounter;

      let promiseToResolve = getCounter === 1 ? firstBatch : secondBatch;

      res.send(await promiseToResolve);
    });
  };

  createOtelTelemetry('traces');
  createOtelTelemetry('logs');

  return new Promise<StartServerResult>((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address();
      if (address == null || typeof address !== 'object') {
        reject('Unknown server address');
        return;
      }
      ({ port } = address);
      console.log(`Example app listening at http://localhost:${port}`);
      resolve({ server, port });
    });
  });
};
