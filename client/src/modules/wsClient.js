// wsClient.js
import * as Automerge from '@automerge/automerge';

class WSClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'arraybuffer';
    this.isInitialized = false;
    this.doc = Automerge.init();
    this.listeners = [];

    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
  }

  handleOpen = () => {
    console.log('Connected to the server');
  };

  handleMessage = (event) => {
    const data = event.data;
    if (data instanceof ArrayBuffer) {
      const binary = new Uint8Array(data);
      if (!this.isInitialized) {
        this.doc = Automerge.load(binary);
        this.isInitialized = true;
      } else {
        const [newDoc, patch] = Automerge.applyChanges(this.doc, [binary]);
        this.doc = newDoc;
      }
      this.notifyListeners();
    }
  };

  handleClose = () => {
    console.log('Disconnected from the server');
  };

  sendChange = (changes) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      changes.forEach((change) => {
        this.ws.send(change);
      });
    }
  };

  addChangeListener = (listener) => {
    this.listeners.push(listener);
  };

  notifyListeners = () => {
    this.listeners.forEach((listener) => listener(this.doc));
  };

  addMessage = (message) => {
    const newDoc = Automerge.change(this.doc, (doc) => {
      if (!doc.messages) doc.messages = [];
      doc.messages.push(message);
    });
    const changes = Automerge.getChanges(this.doc, newDoc);
    this.doc = newDoc;
    this.sendChange(changes);
    this.notifyListeners();
  };

  deleteMessage = (id) => {
    const newDoc = Automerge.change(this.doc, (doc) => {
      const index = doc.messages.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        doc.messages.splice(index, 1);
      }
    });
    const changes = Automerge.getChanges(this.doc, newDoc);
    this.doc = newDoc;
    this.sendChange(changes);
    this.notifyListeners();
  };

  editMessage = (id, newText, newDate) => {
    const newDoc = Automerge.change(this.doc, (doc) => {
      const message = doc.messages.find((msg) => msg.id === id);
      if (message) {
        message.text = newText;
        message.date = newDate;
      }
    });
    const changes = Automerge.getChanges(this.doc, newDoc);
    this.doc = newDoc;
    this.sendChange(changes);
    this.notifyListeners();
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
      const importedMessages = JSON.parse(e.target.result);

      const newDoc = Automerge.change(this.doc, (doc) => {
        doc.messages = [];
      });

      const updatedDoc = Automerge.change(newDoc, (doc) => {
        importedMessages.forEach((message) => {
          doc.messages.push(message);
        });
      });

      const changes = Automerge.getChanges(this.doc, updatedDoc);
      this.doc = updatedDoc;
      this.sendChange(changes);
      this.notifyListeners();
    };
    reader.readAsText(file);
  };
}

export default WSClient;
