import { WebSocketServer } from 'ws'
import * as Automerge from '@automerge/automerge'
import DatabaseManager from './database/DatabaseManager.js'
import 'dotenv/config'
import killProcessOnPort from './helpers/killProcess.js'
import { parse } from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import connectTypes from '../connectTypes.mjs'

const databaseManager = new DatabaseManager()

const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8080
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'
let shouldKillPort = process.env.KILL_PORT_IF_USED === 'true'

const startWebSocketServer = () => {
  if (shouldKillPort) {
    console.log('Checking if port is in use and terminating the process...')
    killProcessOnPort(WEBSOCKET_PORT, startWebSocketServer)
    shouldKillPort = false
    return
  }

  const wss = new WebSocketServer({ port: WEBSOCKET_PORT })
  console.log(`WebSocket server started at ws://localhost:${WEBSOCKET_PORT}`)

  let doc = databaseManager.document.load()
  const clients = new Set()

  wss.on('connection', (ws, req) => {
    ws.sendJSON = (data) => ws.send(JSON.stringify(data))

    const query = parse(req.url, true).query
    const token = query.token
    let authUser

    console.log(`Client connected${token ? ' with token' : ''}`)

    if (token) {
      try {
        authUser = jwt.verify(token, JWT_SECRET)
        if (!authUser) {
          throw new Error('Invalid token')
        }
        clients.add(ws)

        const fullDoc = Automerge.save(doc)
        ws.send(fullDoc)
        ws.sendJSON({
          type: connectTypes.TO_CLIENT.ME,
          status: 200,
          user: { id: authUser.id, login: authUser.login },
        })
      } catch (error) {
        ws.sendJSON({
          error: error.message || 'Authentication failed',
          status: 401,
          type: connectTypes.TO_CLIENT.LOGIN,
        })
        ws.close()
        return
      }
    }

    ws.on('message', async (data, isBinary) => {
      if (isBinary && authUser) {
        handleBinaryMessage(data, ws, clients)
      } else {
        handleTextMessage(data, ws)
      }
    })

    ws.on('close', () => {
      console.log('Client disconnected')
      clients.delete(ws)
    })
  })

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error)
  })

  const handleBinaryMessage = (data, ws, clients) => {
    try {
      const binaryChange = new Uint8Array(data)

      // Apply the received change to the document
      const [newDoc, patch] = Automerge.applyChanges(doc, [binaryChange])
      doc = newDoc

      // Save the updated document to the database
      databaseManager.document.save(doc)

      // Broadcast the change to all other connected clients
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(binaryChange)
        }
      }
    } catch (error) {
      console.error('Error processing binary message:', error)
      ws.send(
        JSON.stringify({
          error: 'Failed to process binary message',
          status: 500,
        }),
      )
    }
  }

  const handleTextMessage = (data, ws) => {
    try {
      const message = data.toString()
      const parsed = JSON.parse(message)

      switch (parsed.type) {
        case connectTypes.TO_SERVER.PING:
          ws.sendJSON({ type: connectTypes.TO_CLIENT.PONG })
          break

        case connectTypes.TO_SERVER.LOGIN:
          const authResponse = authenticateUser(parsed.login, parsed.password)
          ws.sendJSON({ ...authResponse, type: connectTypes.TO_CLIENT.LOGIN })
          break

        default:
          console.warn('Received unknown message type:', parsed.type)
          ws.sendJSON({
            error: 'Unknown message type',
            status: 400,
          })
      }
    } catch (error) {
      console.error('Error processing text message:', error)
      ws.sendJSON({
        error: 'Invalid message format',
        status: 400,
      })
    }
  }

  const authenticateUser = (login, password) => {
    const user = databaseManager.users.getByLogin(login)

    if (!user) {
      return { error: 'User not found.', status: 401 }
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password)

    if (!isPasswordValid) {
      return { error: 'Incorrect password.', status: 401 }
    }

    const token = jwt.sign(
      { id: user.id, login: user.login },
      JWT_SECRET,
      { expiresIn: '180 days' },
    )

    return {
      token,
      status: 200,
    }
  }
}

// Start the WebSocket server
startWebSocketServer()
