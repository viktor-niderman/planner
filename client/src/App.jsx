import React, { useEffect, useState, useRef } from 'react';
import * as Automerge from '@automerge/automerge';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import './App.css';

function App() {
  const [doc, setDoc] = useState(() => Automerge.init());
  const [input, setInput] = useState('');
  const [selectedType, setSelectedType] = useState('type1');
  const [selectedDate, setSelectedDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');
  const ws = useRef(null);
  const docRef = useRef(doc);
  const isInitialized = useRef(false);

  useEffect(() => {
    ws.current = new WebSocket(`${process.env.SERVER_HOST}:${process.env.PORT}`);
    ws.current.binaryType = 'arraybuffer';

    ws.current.onopen = () => {
      console.log('Connected to the server');
    };

    ws.current.onmessage = (event) => {
      const data = event.data;
      if (data instanceof ArrayBuffer) {
        const binary = new Uint8Array(data);
        if (!isInitialized.current) {
          const loadedDoc = Automerge.load(binary);
          docRef.current = loadedDoc;
          setDoc(loadedDoc);
          isInitialized.current = true;
        } else {
          const [newDoc, patch] = Automerge.applyChanges(docRef.current, [binary]);
          docRef.current = newDoc;
          setDoc(newDoc);
        }
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from the server');
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendChange = (changes) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      changes.forEach(change => {
        ws.current.send(change);
      });
    }
  };

  const addMessage = () => {
    if (input.trim() === '') return;

    const newId = uuidv4();
    const newDoc = Automerge.change(docRef.current, doc => {
      if (!doc.messages) doc.messages = [];
      doc.messages.push({
        id: newId,
        text: input,
        description: '',
        type: selectedType,
        date: selectedDate ?? null,
      });
    });

    const changes = Automerge.getChanges(docRef.current, newDoc);
    docRef.current = newDoc;
    setDoc(newDoc);
    sendChange(changes);
    setInput('');
  };

  const startEditing = (id, currentText, currentDate) => {
    setEditingId(id);
    setEditText(currentText);
    setEditDate(currentDate ?? '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
    setEditDate('');
  };

  const saveEdit = (id) => {
    if (editText.trim() === '') return;

    const newDoc = Automerge.change(docRef.current, doc => {
      const message = doc.messages.find(msg => msg.id === id);
      if (message) {
        message.text = editText;
        message.date = editDate;
      }
    });

    const changes = Automerge.getChanges(docRef.current, newDoc);
    docRef.current = newDoc;
    setDoc(newDoc);
    sendChange(changes);
    setEditingId(null);
    setEditText('');
    setEditDate('');
  };

  const deleteMessage = (id) => {
    const newDoc = Automerge.change(docRef.current, doc => {
      const index = doc.messages.findIndex(msg => msg.id === id);
      if (index !== -1) {
        doc.messages.splice(index, 1);
      }
    });

    const changes = Automerge.getChanges(docRef.current, newDoc);
    docRef.current = newDoc;
    setDoc(newDoc);
    sendChange(changes);
  };

  const getFormattedMessages = (type) => {
    if (!doc.messages) return [];
    return doc.messages
    .filter(msg => msg.type === type)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, msg) => {
      let formattedDate = 'no-date';
      if (msg.date) {
        formattedDate = format(new Date(msg.date), 'd MMMM (EEE)');
      }
      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(msg);
      return acc;
    }, {});
  };

  const exportData = () => {
    const jsonData = JSON.stringify(docRef.current.messages || []);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'messages.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const importedMessages = JSON.parse(e.target.result);

      const newDoc = Automerge.change(docRef.current, doc => {
        doc.messages = [];
      });

      const updatedDoc = Automerge.change(newDoc, doc => {
        importedMessages.forEach(message => {
          doc.messages.push(message);
        });
      });

      const changes = Automerge.getChanges(docRef.current, updatedDoc);
      docRef.current = updatedDoc;
      setDoc(updatedDoc);
      sendChange(changes);
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Automerge Collaborative Chat</h1>
        <div className="import-export-section">
          <button onClick={exportData} className="export-button">Export JSON</button>
          <input type="file" accept=".json" onChange={importData} className="import-input" />
        </div>
      </div>
      <div className="input-section">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter a message"
          className="message-input"
        />
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="date-input"
        />
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="type-select">
          <option value="type1">Type 1</option>
          <option value="type2">Type 2</option>
          <option value="type3">Type 3</option>
        </select>
        <button onClick={addMessage} className="send-button">
          Send
        </button>
      </div>
      <div className="messages-container">
        {['type1', 'type2', 'type3'].map((type) => (
          <div key={type} className="message-type-section">
            <h2>{type.replace('type', 'Type ')}</h2>
            {Object.entries(getFormattedMessages(type)).map(([date, messages]) => (
              <div key={date} className="date-section">
                <strong>{date}</strong>
                <ul className="message-list">
                  {messages.map((msg) => (
                    <li key={msg.id} className="message-item">
                      {editingId === msg.id ? (
                        <div className="edit-section">
                          <input
                            type="text"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="edit-input"
                          />
                          <input
                            type="date"
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                            className="edit-date-input"
                          />
                          <button onClick={() => saveEdit(msg.id)} className="save-button">
                            Save
                          </button>
                          <button onClick={cancelEditing} className="cancel-button">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="message-content">
                          <span>{msg.text}</span>
                          <div>
                            <button
                              onClick={() => startEditing(msg.id, msg.text, msg.date)}
                              className="edit-button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="delete-button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
