import * as Automerge from '@automerge/automerge'
import Database from 'better-sqlite3'
import { dbPath } from '../helpers/constants.js'
import bcrypt from 'bcrypt'

class AutomergeDatabaseManager {
  constructor () {
    this.db = new Database(dbPath)

    // Create table to store the document if it doesn't exist
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS automerge_doc (
        id INTEGER PRIMARY KEY,
        doc BLOB NOT NULL
      )
    `).run()

    this.db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `).run()
  }

  addUser (login, password) {
    const hashedPassword = bcrypt.hashSync(password, 10)

    const insert = this.db.prepare(
      'INSERT INTO users (login, password) VALUES (?, ?)')

    try {
      insert.run(login, hashedPassword)
      console.log(`User "${login}" added.`)
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        console.error('User already exists.')
      } else {
        console.error('Can\'t add user:', err.message)
      }
    }
  }

  // Load the document from the database
  loadDocument () {
    const row = this.db.prepare('SELECT doc FROM automerge_doc WHERE id = 1').
      get()
    if (row) {
      try {
        const binary = new Uint8Array(row.doc)
        const loadedDoc = Automerge.load(binary)
        console.log('Document loaded from the database.')
        return loadedDoc
      } catch (error) {
        console.error('Error loading document from the database:', error)
      }
    }

    // Initialize a new document if it doesn't exist in the database
    let doc = Automerge.init()
    doc = Automerge.change(doc, doc => {
      doc.messages = []
    })
    this.saveDocument(doc)
    console.log('Created a new document and saved it to the database.')
    return doc
  }

  // Save the document to the database
  saveDocument (doc) {
    const binary = Automerge.save(doc)
    const buffer = Buffer.from(binary)
    this.db.prepare(`
      INSERT INTO automerge_doc (id, doc) VALUES (1, @doc)
      ON CONFLICT(id) DO UPDATE SET doc = @doc
    `).run({ doc: buffer })
    console.log('Document saved to the database.')
  }
}

export default AutomergeDatabaseManager
