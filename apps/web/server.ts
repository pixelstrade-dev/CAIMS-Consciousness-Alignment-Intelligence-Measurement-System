/**
 * Custom Next.js server with WebSocket support.
 *
 * Starts a standard HTTP server that delegates all regular requests to Next.js
 * and upgrades /ws/debate/:id connections to WebSocket.
 *
 * Usage:
 *   Development:  npx tsx server.ts
 *   Production:   node server.js  (after `tsc --project tsconfig.server.json`)
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { wsManager } from './lib/websocket/manager';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME ?? 'localhost';
const port = parseInt(process.env.PORT ?? '3000', 10);

// In standalone production builds __dirname is the standalone dir; during dev
// process.cwd() points to the app root — Next.js defaults work for both.
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Validate that a debate ID only contains safe characters
const DEBATE_ID_RE = /^[a-zA-Z0-9_-]+$/;

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url ?? '/', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url ?? '/');
    const match = pathname?.match(/^\/ws\/debate\/([^/]+)$/);

    if (!match || !DEBATE_ID_RE.test(match[1])) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }

    const debateId = match[1];

    wss.handleUpgrade(req, socket, head, ws => {
      wsManager.addClient(debateId, ws);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    if (dev) {
      console.log('> WebSocket endpoint: ws://localhost:' + port + '/ws/debate/<id>');
    }
  });
});
