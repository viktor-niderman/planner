import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import './App.css';
import WSClient from './modules/wsClient.js'
import { Box, Button, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material'
import { Delete, Send } from '@mui/icons-material'


function App() {
  const [doc, setDoc] = useState(() => []);
  const [input, setInput] = useState('');
  const [selectedType, setSelectedType] = useState('type1');
  const [selectedDate, setSelectedDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const wsClient = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    wsClient.current = new WSClient(`${process.env.SERVER_HOST}:${process.env.PORT}`);

    wsClient.current.addChangeListener((newDoc) => {
      setDoc(newDoc.messages || []);
    });

    return () => {
      if (wsClient.current) {
        wsClient.current.ws.close();
      }
    };
  }, []);

  const handleClickOutside = (event) => {
    if (editingId && !event.target.closest('.edit-section') && !event.target.closest('.message-content')) {
      saveEdit(editingId);
    }
  };

  const addMessage = () => {
    if (input.trim() === '') return;

    const newId = uuidv4();
    const message = {
      id: newId,
      text: input,
      description: '',
      type: selectedType,
      date: selectedDate ?? null,
    };

    wsClient.current.addMessage(message);
    setInput('');
  };

  const startEditing = (id, currentText, currentDate) => {
    setEditingId(id);
    setEditText(currentText);
    setEditDate(currentDate ?? '');
  };

  const saveEdit = (id) => {
    if (editText.trim() === '') return;

    wsClient.current.editMessage(id, editText, editDate);
    setEditingId(null);
    setEditText('');
    setEditDate('');
  };

  const deleteMessage = (id) => {
    wsClient.current.deleteMessage(id);
  };

  const getFormattedMessages = (type) => {
    if (!doc) return [];
    return doc
    .filter((msg) => msg.type === type)
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


    return (
    <div className="app-container" onClick={handleClickOutside}>
      <div className="header">
        <div className="import-export-section">
          <button onClick={wsClient?.current?.exportData} className="export-button">Export JSON</button>
          <input type="file" accept=".json" onChange={wsClient?.current?.importData} className="import-input" />
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
          <option value="type1">Current Tasks</option>
          <option value="type2">Future Tasks</option>
          <option value="type3">Buy list</option>
        </select>
        <Button variant="contained" onClick={addMessage} endIcon={<Send />}>
          Send
        </Button>
      </div>
      <div className="messages-container">
        {['type1', 'type2', 'type3'].map((type) => (
          <Box key={type} className="message-type-section" hidden={isMobile && type !== 'type'+(currentTab+1)}>
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
                           </div>
                         ) : (
                           <div className="message-content">
                             <span onClick={() => startEditing(msg.id, msg.text, msg.date)}>{msg.text}</span>
                             <div>
                               <Button variant="text" color="error" onClick={() => deleteMessage(msg.id)}>
                                 <Delete />
                               </Button>
                             </div>
                           </div>
                         )}
                       </li>
                     ))}
                   </ul>
                 </div>
               ))}
          </Box>
        ))}
      </div>
      {isMobile && <Box sx={{position: 'fixed', bottom: 'env(safe-area-inset-bottom)', inset: 'auto 0 0 0', width: '100vw', background: 'white', boxShadow: '-2px 1px 1px 1px black'}}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Tabs value={currentTab} onChange={(e, tab) => {setCurrentTab(tab)}}>
            <Tab label="Current"/>
            <Tab label="Future"/>
            <Tab label="To Buy"/>
          </Tabs>
        </Box>
      </Box>}

    </div>
    );
}

export default App;
