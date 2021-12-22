import express from 'express';
import path from 'path';
import { Server } from 'http';

export const startServer = ({ port }: { port: number }) => {
  const app = express();

  app.use(express.json());

  app.get('/loadScript/logo-delay.png', (req, res) => {
    setTimeout(() => {
      res.sendFile(path.join(__dirname, '../static/loadScript/logo.png'));
    }, 1000);
  });

  app.use(
    express.static(path.join(__dirname, '../static'), {
      maxAge: 0,
      lastModified: false,
      etag: false,
      cacheControl: false,
    }),
  );

  app.get('/loadScript/rum.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/browser.js'));
  });

  app.get('/demoApps/*/rum.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/browser.js'));
  });

  let postCounter = 0;
  let getCounter = 0;
  let resolveTracesFirstBatch: (value: any) => void;
  let resolveTracesSecondBatch: (value: any) => void;
  let tracesFirstBatch = new Promise<any>((resolve) => {
    resolveTracesFirstBatch = resolve;
  });
  let tracesSecondBatch = new Promise<any>((resolve) => {
    resolveTracesSecondBatch = resolve;
  });

  app.post('/traces', (req, res) => {
    ++postCounter;

    let resolveFunctionToCall =
      postCounter === 1 ? resolveTracesFirstBatch : resolveTracesSecondBatch;

    resolveFunctionToCall(req.body);

    res.send('');
  });

  app.get('/traces', async (req, res) => {
    ++getCounter;

    let promiseToResolve =
      getCounter === 1 ? tracesFirstBatch : tracesSecondBatch;

    res.send(await promiseToResolve);
  });

  return new Promise<Server>((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
      resolve(server);
    });
  });
};
