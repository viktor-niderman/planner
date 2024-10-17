import * as Automerge from '@automerge/automerge'
import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'
import { dbPath } from '../helpers/constants.js'

class DatabaseManager {
  constructor () {
    this.db = new Database(dbPath)

    this.users = {
      initTable: () => {
        this.db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `).run()
      },
      add: (login, password) => {
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
      },
      getByLogin: (login) => {
        return this.db.prepare('SELECT * FROM users WHERE login = ?').get(login)
      },
    }
    this.document = {
      initTable: () => {
        this.db.prepare(`
      CREATE TABLE IF NOT EXISTS automerge_doc (
        id INTEGER PRIMARY KEY,
        doc BLOB NOT NULL
      )
    `).run()
      },
      load: () => {
        const row = this.db.prepare(
          'SELECT doc FROM automerge_doc WHERE id = 1').
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

        let doc = Automerge.init()
        doc = Automerge.change(doc, doc => {
          doc.messages = []
        })
        this.document.save(doc)
        console.log('Created a new document and saved it to the database.')
        return doc
      },
      save: (doc) => {
        const binary = Automerge.save(doc)
        const buffer = Buffer.from(binary)
        this.db.prepare(`
      INSERT INTO automerge_doc (id, doc) VALUES (1, @doc)
      ON CONFLICT(id) DO UPDATE SET doc = @doc
    `).run({ doc: buffer })
        console.log('Document saved to the database.')
      },
    }

    this.document.initTable()
    this.users.initTable()
  }
}

export default DatabaseManager
