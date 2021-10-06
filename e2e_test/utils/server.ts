import express from 'express';
import path from 'path';
import { Server } from 'http';

export const startServer = ({ port }: { port: number }) => {
  const app = express();

  app.use(express.json());

  app.get('/logo-delay.png', (req, res) => {
    setTimeout(() => {
      res.sendFile(path.join(__dirname, '../static/logo.png'));
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

  app.get('/rum.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/browser.js'));
  });

  let resolveTraces: (value: any) => void;
  let tracesPromise = new Promise<any>((resolve) => {
    resolveTraces = resolve;
  });

  app.post('/traces', (req, res) => {
    res.send('');
    resolveTraces(req.body);
  });

  app.get('/traces', async (req, res) => {
    res.send(await tracesPromise);
  });

  return new Promise<Server>((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
      resolve(server);
    });
  });
};
