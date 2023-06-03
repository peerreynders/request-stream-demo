import polka from 'polka';
import serveStatic from 'serve-static';
import { createSecureServer } from 'node:http2';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const cert = fileURLToPath(new URL('localhost.pem', import.meta.url));
const key = fileURLToPath(new URL('localhost-key.pem', import.meta.url));
const options = {
  cert: readFileSync(cert, 'utf-8'),
  key: readFileSync(key, 'utf-8'),
};

const receivers = new Map();
const dir = fileURLToPath(new URL('static', import.meta.url));

const { handler } = polka()
  .use(serveStatic(dir))
  .use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache');
    next();
  })
  .post('/send', (req, res) => {
    const channel = req.query.channel;
    if (!channel) {
      res.statusCode = 400;
      res.end('No channel given');
      return;
    }

    res.statusCode = 200;

    req.on('data', (chunk) => {
      const set = receivers.get(channel);
      if (!set) return;
      for (const res of set) res.write(chunk);
    });

    req.on('end', (_chunk) => {
      if (res.writableEnded) return;
      res.end('Ended');
    });
  })
  .get('/receive', (req, res) => {
    const channel = req.query.channel;
    if (!channel) {
      res.statusCode = 400;
      res.end('No channel given');
      return;
    }

    if (!receivers.has(channel)) {
      receivers.set(channel, new Set());
    }

    receivers.get(channel).add(res);

    res.on('close', () => {
      const set = receivers.get(channel);
      set.delete(res);
      if (set.size === 0) receivers.delete(channel);
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
  });

const listener = createSecureServer(options, handler).listen(
  process.env.PORT,
  () => {
    console.log('Your app is listening on port ' + listener.address().port);
  }
);
