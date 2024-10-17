import { WebSocketServer } from 'ws'
import * as Automerge from '@automerge/automerge'
import AutomergeDatabaseManager from './database/automergeDatabase.js'
import 'dotenv/config'
import killProcessOnPort from './helpers/killProcess.js'
import { parse } from 'url'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const automergeDbManager = new AutomergeDatabaseManager()

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

  let document = automergeDbManager.loadDocument()
  const clients = new Set()

  wss.on('connection', (ws, req) => {
    ws.sendJSON = (data) => ws.send(JSON.stringify(data))
    const query = parse(req.url, true).query
    const token = query.token
    console.log(`Client connected${token ? ' with token' : ''}`)

    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET)
        if (!user) {
          throw new Error('Invalid token')
        }
        clients.add(ws)

        const fullDoc = Automerge.save(document)
        ws.send(fullDoc)
      } catch (error) {
        ws.sendJSON({
          error: error.message || 'Authentication failed',
          status: 401,
          type: 'login',
        })
        ws.close()
        return
      }
    }

    // Handle incoming messages from the client
    ws.on('message', async (data, isBinary) => {
      if (isBinary) {
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
}

/**
 * Handles binary messages (Automerge changes) from clients.
 * @param {Buffer} data - The binary data received.
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {Set} clients - The set of connected clients.
 */
const handleBinaryMessage = (data, ws, clients) => {
  try {
    const binaryChange = new Uint8Array(data)

    // Apply the received change to the document
    const [newDoc, patch] = Automerge.applyChanges(document, [binaryChange])
    document = newDoc

    // Save the updated document to the database
    automergeDbManager.saveDocument(document)

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

/**
 * Handles text messages (e.g., ping/pong, login) from clients.
 * @param {Buffer} data - The text data received.
 * @param {WebSocket} ws - The WebSocket connection.
 */
const handleTextMessage = (data, ws) => {
  try {
    const message = data.toString()
    const parsed = JSON.parse(message)

    switch (parsed.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break

      case 'login':
        const authResponse = authenticateUser(parsed.login, parsed.password)
        ws.send(JSON.stringify({ ...authResponse, type: 'login' }))
        break

      default:
        console.warn('Received unknown message type:', parsed.type)
        ws.send(
          JSON.stringify({
            error: 'Unknown message type',
            status: 400,
          }),
        )
    }
  } catch (error) {
    console.error('Error processing text message:', error)
    ws.send(
      JSON.stringify({
        error: 'Invalid message format',
        status: 400,
      }),
    )
  }
}

/**
 * Authenticates a user with the provided login and password.
 * @param {string} login - The user's login identifier.
 * @param {string} password - The user's password.
 * @returns {Object} - Authentication result containing token and user info or error.
 */
const authenticateUser = (login, password) => {
  const user = automergeDbManager.db.prepare(
    'SELECT * FROM users WHERE login = ?').get(login)

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
    { expiresIn: '3m' },
  )

  return {
    token,
    status: 200,
    user: { id: user.id, login: user.login },
  }
}

// Start the WebSocket server
startWebSocketServer()
