import * as Automerge from '@automerge/automerge'
import connectTypes from '@src/modules/connectTypes.mjs'
import useUserStore from '@src/store/userStore'
import { defaultInputData } from '@src/modules/constants.js'

const DEFAULT_OPTIONS = {
  reconnectInterval: 100,
  maxReconnectInterval: 5000,
  reconnectDecay: 1.5,
  maxReconnectAttempts: Infinity,
  binaryType: 'arraybuffer',
}

class WSClient {
  constructor (url, options = {}) {
    this.url = url
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.ws = null
    this.isInitialized = false
    this.doc = Automerge.init()
    this.listeners = []
    this.user = useUserStore.getState()

    this.heartbeatInterval = options.heartbeatInterval || 30000
    this.heartbeatTimer = null

    this.reconnectAttempts = 0
    this.shouldReconnect = true
    this.isConnecting = false

    this.connect()
  }

  connect () {
    if (this.isConnecting || this.isWebSocketActive()) {
      return
    }

    const token = localStorage['token'] ?? ''

    this.isConnecting = true
    this.ws = new WebSocket(`${this.url}?token=${token}`)
    this.ws.binaryType = this.options.binaryType

    this.ws.onopen = this.handleOpen
    this.ws.onmessage = this.handleMessage
    this.ws.onclose = this.handleClose
    this.ws.onerror = this.handleError
    this.ws.sendJSON = (data) => this.ws.send(JSON.stringify(data))
  }

  isWebSocketActive () {
    return (
      this.ws &&
      [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.ws.readyState)
    )
  }

  handleOpen = () => {
    console.log('Connected to the server')
    this.isConnecting = false
    this.resetReconnectParams()
    this.startHeartbeat()

    this.login()
  }

  handleMessage = (event) => {
    const data = event.data

    if (data instanceof ArrayBuffer) {
      const binary = new Uint8Array(data)
      console.log('Received binary data')
      try {
        this.updateDocument(binary)
        this.notifyListeners()
      } catch (error) {
        console.error('Failed to apply changes:', error)
        if (error.toLocaleString().
          startsWith('RangeError: error loading change')) {
          window.location.reload()
        }
      }
    } else if (typeof data === 'string') {
      try {
        const message = JSON.parse(data)
        this.handleServerMessage(message)
      } catch (error) {
        console.error('Failed to parse JSON message:', error)
      }
    } else {
      console.warn('Received unknown data type:', data)
    }
  }

  updateDocument (binary) {
    if (!this.isInitialized) {
      this.doc = Automerge.load(binary)
      this.isInitialized = true
    } else {
      const [newDoc] = Automerge.applyChanges(this.doc, [binary])
      this.doc = newDoc
    }
  }

  handleClose = (event) => {
    console.log('Disconnected from the server', event.reason)
    this.isConnecting = false
    this.stopHeartbeat()
    if (this.shouldReconnect) {
      this.scheduleReconnect()
    }
  }

  startHeartbeat () {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.sendJSON({ type: connectTypes.TO_SERVER.PING })
      }
    }, this.heartbeatInterval)
  }

  stopHeartbeat () {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  handleServerMessage (message) {
    switch (message.type) {
      case connectTypes.TO_CLIENT.PONG:
        break
      case connectTypes.TO_CLIENT.LOGIN:
        if (message.status !== 200) {
          console.error('Authentication failed:', message.error)
          useUserStore.getState().clearUser()
          localStorage.removeItem('token')
          this.login()
          return
        }
        if (message.token) {
          localStorage['token'] = message.token
          this.disconnect()
          this.connect()
        }
        break
      case connectTypes.TO_CLIENT.ME:
        if (message.user) {
          useUserStore.getState().setUser({
            id: message.user.id,
            name: message.user.login,
          })
        }
        break
      default:
        console.warn('Unknown message type:', message.type)
    }
  }

  login () {
    if (!localStorage['token'] && this.isWebSocketActive()) {
      const login = prompt('Enter your login:', '')
      const password = prompt('Enter your password:', '')
      this.ws.sendJSON({ type: connectTypes.TO_SERVER.LOGIN, login, password })
    }
  }

  handleError = (error) => {
    console.error('WebSocket error:', error)
    this.closeWebSocket()
  }

  scheduleReconnect () {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.warn('Max reconnect attempts reached. Giving up.')
      return
    }

    const delay = Math.min(
      this.options.reconnectInterval *
      Math.pow(this.options.reconnectDecay, this.reconnectAttempts),
      this.options.maxReconnectInterval,
    )

    console.log(`Reconnecting in ${delay / 1000} seconds...`)
    setTimeout(() => {
      this.reconnectAttempts += 1
      console.log(`Reconnection attempt ${this.reconnectAttempts}`)
      this.connect()
    }, delay)
  }

  resetReconnectParams () {
    this.reconnectAttempts = 0
    this.options.reconnectInterval = DEFAULT_OPTIONS.reconnectInterval
  }

  closeWebSocket () {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnecting = false
  }

  disconnect () {
    this.shouldReconnect = false
    this.closeWebSocket()
  }

  sendChange = (changes) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      changes.forEach((change) => this.ws.send(change))
    }
  }

  addChangeListener = (listener) => {
    if (typeof listener === 'function') {
      this.listeners.push(listener)
    }
  }

  notifyListeners = () => {
    this.listeners.forEach((listener) => listener(this.doc))

  }

  applyLocalChange = (changeFn) => {
    const newDoc = Automerge.change(this.doc, changeFn)
    const changes = Automerge.getChanges(this.doc, newDoc)
    this.doc = newDoc
    this.sendChange(changes)
    this.notifyListeners()
  }

  addMessage = (message) => {
    this.applyLocalChange((doc) => {
      if (!doc.messages) doc.messages = []
      doc.messages.push(message)
    })
  }

  deleteMessage = (id) => {
    this.applyLocalChange((doc) => {
      const index = doc.messages.findIndex((msg) => msg.id === id)
      if (index !== -1) {
        doc.messages.splice(index, 1)
      }
    })
  }

  editMessage = (id, editedMessage) => {
    this.applyLocalChange((doc) => {
      const messageIndex = doc.messages.findIndex((msg) => msg.id === id)
      if (messageIndex !== -1) {
        doc.messages[messageIndex] = {...editedMessage}
      }
    })
  }

  exportData = () => {
    const jsonData = JSON.stringify(this.doc.messages || [])
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'messages.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  importData = (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedMessages = JSON.parse(e.target.result)
        this.applyLocalChange((doc) => {
          const updatedMessages = importedMessages.map((msg, i) => {
            msg = { ...defaultInputData, ...msg }
            if (!msg.belongsTo) {
              msg.belongsTo = defaultInputData.belongsTo
            }
            if (!msg.group) {
              msg.group = defaultInputData.group
            }
            msg.position = i * 1000
            return msg
          })
          console.log('Imported messages:', updatedMessages)
          doc.messages = updatedMessages
        })
      } catch (error) {
        console.error('Failed to import data:', error)
      }
    }
    reader.readAsText(file)
  }
}

export default WSClient
