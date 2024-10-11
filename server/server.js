// server/server.js
import { WebSocketServer } from 'ws';
import * as Automerge from '@automerge/automerge';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'

// For correct handling of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to SQLite database (creates the file if it doesn't exist)
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Create table to store the document if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS automerge_doc (
    id INTEGER PRIMARY KEY,
    doc BLOB NOT NULL
  )
`).run();

// Function to load the document from the database
function loadDocument() {
  // TODO - Load last saved document from the database
  const row = db.prepare('SELECT doc FROM automerge_doc WHERE id = 1').get();
  if (row) {
    try {
      const binary = new Uint8Array(row.doc);
      const loadedDoc = Automerge.load(binary);
      console.log('Document loaded from the database.');
      return loadedDoc;
    } catch (error) {
      console.error('Error loading document from the database:', error);
      // If loading fails, initialize a new document
    }
  }
  // Initialize a new document if it doesn't exist in the database
  let doc = Automerge.init();
  doc = Automerge.change(doc, doc => {
    doc.messages = [];
  });
  saveDocument(doc);
  console.log('Created a new document and saved it to the database.');
  return doc;
}

// Function to save the document to the database
function saveDocument(doc) {
  const binary = Automerge.save(doc);
  const buffer = Buffer.from(binary);
  // Use UPSERT to insert or update the record with id = 1
  db.prepare(`
    INSERT INTO automerge_doc (id, doc) VALUES (1, @doc)
    ON CONFLICT(id) DO UPDATE SET doc = @doc
  `).run({ doc: buffer });
  console.log('Document saved to the database.');
}

// Initialize WebSocket server
const wss = new WebSocketServer({ port: process.env.PORT });
console.log('WebSocket server started at ws://localhost:'+process.env.PORT);

// Load the document from the database
let doc = loadDocument();

const clients = new Set();

wss.on('connection', ws => {
  console.log('New client connected');
  clients.add(ws);

  // Send the current state of the document to the new client
  const fullDoc = Automerge.save(doc);
  ws.send(fullDoc);

  ws.on('message', async (message) => {
    try {
      // Convert the received data to Uint8Array
      const binaryChange = new Uint8Array(message);

      // Apply the changes to the document
      const [newDoc, patch] = Automerge.applyChanges(doc, [binaryChange]);
      doc = newDoc;

      // Save the updated document to the database
      saveDocument(doc);

      // Broadcast the changes to all other clients
      for (const client of clients) {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(binaryChange);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});
