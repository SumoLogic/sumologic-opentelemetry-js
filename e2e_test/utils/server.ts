import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Server } from 'http';

interface StartServerResult {
  server: Server;
  port: number;
}

export const startServer = () => {
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
    res.sendFile(path.join(__dirname, '../static/logo.png'));
  });

  app.get('/logo-delay.png', (req, res) => {
    setTimeout(() => {
      res.sendFile(path.join(__dirname, '../static/logo.png'));
    }, 1000);
  });

  app.get('/logo-delay.png', (req, res) => {
    setTimeout(() => {
      res.sendFile(path.join(__dirname, '../static/logo.png'));
    }, 1000);
  });

  app.get('/:filename.html', async (req, res, next) => {
    let file = await fs.readFile(
      path.join(__dirname, '../static', `${req.params.filename}.html`),
      'utf-8',
    );
    file = file.replace(/{{port}}/g, String(port));
    res.contentType('html');
    res.send(file);
  });

  app.get('/rum.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/browser.js'));
  });

  let resolveTraces: (value: any) => void;
  let tracesPromise = new Promise<any>((resolve) => {
    resolveTraces = resolve;
  });

  app.post('/traces', (req, res) => {
    resolveTraces(req.body);
    res.send('');
  });

  app.get('/traces', async (req, res) => {
    res.send(await tracesPromise);
  });

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
