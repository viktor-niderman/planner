import { WebSocketServer } from 'ws';
import * as Automerge from '@automerge/automerge';
import DatabaseManager from './database/automergeDatabase.js';
import 'dotenv/config';
import killProcessOnPort from './helpers/killProcess.js';
import { parse } from 'url';

const startWebSocketServer = () => {
  const wss = new WebSocketServer({ port: process.env.PORT });
  console.log('WebSocket server started at ws://localhost:' + process.env.PORT);

  const dbManager = new DatabaseManager();
  let doc = dbManager.loadDocument();

  const clients = new Set();

  wss.on('connection', (ws, req) => {
    const query = parse(req.url, true).query;
    console.log('Client connected:', query.user);

    clients.add(ws);
    const fullDoc = Automerge.save(doc);
    ws.send(fullDoc);

    ws.on('message', async (data, isBinary) => {
      if (isBinary) {
        try {
          const binaryChange = new Uint8Array(data);

          const [newDoc, patch] = Automerge.applyChanges(doc, [binaryChange]);
          doc = newDoc;

          dbManager.saveDocument(doc);

          for (const client of clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(binaryChange);
            }
          }
        } catch (error) {
          console.error('Error processing binary message:', error);
        }
      } else {
        // text message (ping/pong)
        try {
          const message = data.toString();
          const parsed = JSON.parse(message);

          if (parsed.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          } else {
            console.warn('Received unknown text message type:', parsed.type);
          }
        } catch (error) {
          console.error('Error processing text message:', error);
        }
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
    });
  });
}

if (process.env.KILL_PORT_IF_USED === 'true') {
  console.log('Checking if port is in use and killing the process...');
  killProcessOnPort(process.env.PORT, startWebSocketServer);
} else {
  startWebSocketServer();
}
