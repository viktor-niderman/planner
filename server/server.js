import { WebSocketServer } from 'ws'
import * as Automerge from '@automerge/automerge'
import AutomergeDatabaseManager from './database/automergeDatabase.js'
import 'dotenv/config'
import killProcessOnPort from './helpers/killProcess.js'
import { parse } from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const automergeDbManager = new AutomergeDatabaseManager()
let needToKillPort = process.env.KILL_PORT_IF_USED === 'true'

const startWebSocketServer = () => {
  if (needToKillPort) {
    console.log('Checking if port is in use and killing the process...')
    killProcessOnPort(process.env.WEBSOCKET_PORT, startWebSocketServer)
    needToKillPort = false
    return
  }

  const wss = new WebSocketServer({ port: process.env.WEBSOCKET_PORT })
  console.log(
    'WebSocket server started at ws://localhost:' + process.env.WEBSOCKET_PORT)

  let doc = automergeDbManager.loadDocument()

  const clients = new Set()

  wss.on('connection', (ws, req) => {
      const query = parse(req.url, true).query
      const token = query.token
      console.log('Client connected:', query.token)

      if (token) {
        try {
          const user = jwt.verify(token, process.env.JWT_SECRET)
          if (!user) {
            throw new Error('Invalid token')
          }
          clients.add(ws)
          const fullDoc = Automerge.save(doc)
          ws.send(fullDoc)
        } catch (error) {
          ws.send(JSON.stringify(
            { error: error, status: 401, type: 'login' }))
        }
      }

      ws.on('message', async (data, isBinary) => {
        if (isBinary) {
          try {
            const binaryChange = new Uint8Array(data)

            const [newDoc, patch] = Automerge.applyChanges(doc, [binaryChange])
            doc = newDoc

            automergeDbManager.saveDocument(doc)

            for (const client of clients) {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(binaryChange)
              }
            }
          } catch (error) {
            console.error('Error processing binary message:', error)
          }
          return
        }

        // text message (ping/pong)
        try {
          const message = data.toString()
          const parsed = JSON.parse(message)

          if (parsed.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }))
          } else if (parsed.type === 'login') {
            const auth = login(parsed.login, parsed.password)
            ws.send(JSON.stringify({ ...auth, type: 'login' }))
          } else {
            console.warn('Received unknown text message type:', parsed.type)
          }
        } catch (error) {
          console.error('Error processing text message:', error)
        }

      })

      ws.on('close', () => {
        console.log('Client disconnected')
        clients.delete(ws)
      })
    },
  )

}
startWebSocketServer()

const login = (login, password) => {
  const user = automergeDbManager.db.prepare(
    'SELECT * FROM users WHERE login = ?').get(login)

  if (!user) {
    return { error: 'User not found.', status: 401 }
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password)

  if (!isPasswordValid) {
    return { error: 'Wrong password.', status: 401 }
  }

  const token = jwt.sign({ id: user.id, login: user.login },
    process.env.JWT_SECRET, { expiresIn: '3m' })

  return { token, status: 200, user: { id: user.id, login: user.login } }
}
