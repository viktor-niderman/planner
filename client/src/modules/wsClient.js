// wsClient.js
import * as Automerge from '@automerge/automerge';

const DEFAULT_OPTIONS = {
  reconnectInterval: 100,
  maxReconnectInterval: 5000,
  reconnectDecay: 1.5,
  maxReconnectAttempts: Infinity,
  binaryType: 'arraybuffer',
};

class WSClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.ws = null;
    this.isInitialized = false;
    this.doc = Automerge.init();
    this.listeners = [];

    this.heartbeatInterval = options.heartbeatInterval || 30000; // 30 секунд
    this.heartbeatTimer = null;

    this.reconnectAttempts = 0;
    this.shouldReconnect = true;
    this.isConnecting = false;

    this.connect();
  }

  connect() {
    if (this.isConnecting || this.isWebSocketActive()) {
      return;
    }

    this.isConnecting = true;
    this.ws = new WebSocket(this.url);
    this.ws.binaryType = this.options.binaryType;

    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
    this.ws.onerror = this.handleError;
  }

  isWebSocketActive() {
    return this.ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.ws.readyState);
  }

  handleOpen = () => {
    console.log('Connected to the server');
    this.isConnecting = false;
    this.resetReconnectParams();
    this.startHeartbeat();
  };

  handleMessage = (event) => {
    const data = event.data;

    if (data instanceof ArrayBuffer) {
      const binary = new Uint8Array(data);
      console.log('Received binary data:');
      try {
        this.updateDocument(binary);
        this.notifyListeners();
      } catch (error) {
        console.error('Failed to apply changes:', error);
      }
    } else if (typeof data === 'string') {
      try {
        const message = JSON.parse(data);
        this.handleServerMessage(message);
      } catch (error) {
        console.error('Failed to parse JSON message:', error);
      }
    } else {
      console.warn('Received unknown data type:', data);
    }
  };

  updateDocument(binary) {
    if (!this.isInitialized) {
      this.doc = Automerge.load(binary);
      this.isInitialized = true;
    } else {
      const [newDoc] = Automerge.applyChanges(this.doc, [binary]);
      this.doc = newDoc;
    }
  }

  handleClose = (event) => {
    console.log('Disconnected from the server', event.reason);
    this.isConnecting = false;
    this.stopHeartbeat();
    if (this.shouldReconnect) {
      this.scheduleReconnect();
    }
  };

  startHeartbeat() {
    this.stopHeartbeat(); // На всякий случай остановим предыдущий таймер
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  handleServerMessage(message) {
    switch (message.type) {
      case 'ping':
        this.sendPong();
        break;
      case 'pong':
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  sendPong() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'pong' }));
    }
  }

  handleError = (error) => {
    console.error('WebSocket error:', error);
    this.closeWebSocket();
  };

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.warn('Max reconnect attempts reached. Giving up.');
      return;
    }

    const delay = Math.min(
      this.options.reconnectInterval * Math.pow(this.options.reconnectDecay, this.reconnectAttempts),
      this.options.maxReconnectInterval
    );

    console.log(`Reconnecting in ${delay / 1000} seconds...`);
    setTimeout(() => {
      this.reconnectAttempts += 1;
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }

  resetReconnectParams() {
    this.reconnectAttempts = 0;
    this.options.reconnectInterval = DEFAULT_OPTIONS.reconnectInterval;
  }

  closeWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
  }

  disconnect() {
    this.shouldReconnect = false;
    this.closeWebSocket();
  }

  sendChange = (changes) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      changes.forEach((change) => this.ws.send(change));
    }
  };

  addChangeListener = (listener) => {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
  };

  notifyListeners = () => {
    this.listeners.forEach((listener) => listener(this.doc));
  };

  applyLocalChange = (changeFn) => {
    const newDoc = Automerge.change(this.doc, changeFn);
    const changes = Automerge.getChanges(this.doc, newDoc);
    this.doc = newDoc;
    this.sendChange(changes);
    this.notifyListeners();
  };

  addMessage = (message) => {
    this.applyLocalChange((doc) => {
      if (!doc.messages) doc.messages = [];
      doc.messages.push(message);
    });
  };

  deleteMessage = (id) => {
    this.applyLocalChange((doc) => {
      const index = doc.messages.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        doc.messages.splice(index, 1);
      }
    });
  };

  editMessage = (id, newText, newDate) => {
    this.applyLocalChange((doc) => {
      const message = doc.messages.find((msg) => msg.id === id);
      if (message) {
        message.text = newText;
        message.date = newDate;
      }
    });
  };

  exportData = () => {
    const jsonData = JSON.stringify(this.doc.messages || []);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'messages.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedMessages = JSON.parse(e.target.result);
        this.applyLocalChange((doc) => {
          doc.messages = importedMessages;
        });
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    };
    reader.readAsText(file);
  };
}

export default WSClient;
