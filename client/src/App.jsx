import React, { useEffect, useState, useRef } from 'react';
import * as Automerge from '@automerge/automerge';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [doc, setDoc] = useState(() => Automerge.init());
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const ws = useRef(null);
  const docRef = useRef(doc);
  const isInitialized = useRef(false);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:' + process.env.PORT);
    ws.current.binaryType = 'arraybuffer';

    ws.current.onopen = () => {
      console.log('Connected to the server');
    };

    ws.current.onmessage = (event) => {
      const data = event.data;
      if (data instanceof ArrayBuffer) {
        const binary = new Uint8Array(data);
        if (!isInitialized.current) {
          // First message - full state of the document
          const loadedDoc = Automerge.load(binary);
          docRef.current = loadedDoc;
          setDoc(loadedDoc);
          isInitialized.current = true;
        } else {
          // Subsequent messages - changes
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
      doc.messages.push({ id: newId, text: input });
    });

    const changes = Automerge.getChanges(docRef.current, newDoc);
    docRef.current = newDoc;
    setDoc(newDoc);
    sendChange(changes);
    setInput('');
  };

  const startEditing = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = (id) => {
    if (editText.trim() === '') return;

    const newDoc = Automerge.change(docRef.current, doc => {
      const message = doc.messages.find(msg => msg.id === id);
      if (message) {
        message.text = editText;
      }
    });

    const changes = Automerge.getChanges(docRef.current, newDoc);
    docRef.current = newDoc;
    setDoc(newDoc);
    sendChange(changes);
    setEditingId(null);
    setEditText('');
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

  return (
    <div style={{ padding: '20px' }}>
      <h1>Automerge Chat</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter a message"
          style={{ width: '300px', padding: '8px' }}
        />
        <button onClick={addMessage} style={{ marginLeft: '10px', padding: '8px 16px' }}>
          Send
        </button>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {doc.messages && doc.messages.map((msg) => (
          <li key={msg.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            {editingId === msg.id ? (
              <div>
                <input
                  type="text"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  style={{ width: '300px', padding: '8px' }}
                />
                <button onClick={() => saveEdit(msg.id)} style={{ marginLeft: '10px', padding: '8px 16px' }}>
                  Save
                </button>
                <button onClick={cancelEditing} style={{ marginLeft: '5px', padding: '8px 16px' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <span>{msg.text}</span>
                <button
                  onClick={() => startEditing(msg.id, msg.text)}
                  style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '12px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMessage(msg.id)}
                  style={{ marginLeft: '5px', padding: '4px 8px', fontSize: '12px', color: 'red' }}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
