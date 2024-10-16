import * as Automerge from '@automerge/automerge';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// For correct handling of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseManager {
  constructor() {
    const dbPath = path.join(__dirname, '../database/storage.db');
    this.db = new Database(dbPath);

    // Create table to store the document if it doesn't exist
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS automerge_doc (
        id INTEGER PRIMARY KEY,
        doc BLOB NOT NULL
      )
    `).run();
  }

  // Load the document from the database
  loadDocument() {
    const row = this.db.prepare('SELECT doc FROM automerge_doc WHERE id = 1').get();
    if (row) {
      try {
        const binary = new Uint8Array(row.doc);
        const loadedDoc = Automerge.load(binary);
        console.log('Document loaded from the database.');
        return loadedDoc;
      } catch (error) {
        console.error('Error loading document from the database:', error);
      }
    }

    // Initialize a new document if it doesn't exist in the database
    let doc = Automerge.init();
    doc = Automerge.change(doc, doc => {
      doc.messages = [];
    });
    this.saveDocument(doc);
    console.log('Created a new document and saved it to the database.');
    return doc;
  }

  // Save the document to the database
  saveDocument(doc) {
    const binary = Automerge.save(doc);
    const buffer = Buffer.from(binary);
    this.db.prepare(`
      INSERT INTO automerge_doc (id, doc) VALUES (1, @doc)
      ON CONFLICT(id) DO UPDATE SET doc = @doc
    `).run({ doc: buffer });
    console.log('Document saved to the database.');
  }
}

export default DatabaseManager;
