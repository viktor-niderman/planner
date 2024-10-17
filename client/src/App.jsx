import React, { useEffect, useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import './App.css'
import WSClient from './modules/wsClient.js'
import {
  Box,
  Button,
  List, ListItem, ListItemButton, ListItemText,
  Tab,
  Tabs,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Delete, Send } from '@mui/icons-material'
import useUserStore from '../store/userStore.js'

function App () {
  const [doc, setDoc] = useState(() => [])
  const [input, setInput] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editDate, setEditDate] = useState('')
  const [currentTab, setCurrentTab] = useState(0)
  const wsClient = useRef(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const refsOfInputs = useRef([])
  const effectRan = useRef(false)

  const user = useUserStore();

  useEffect(() => {
    if (effectRan.current) return
    effectRan.current = true

    wsClient.current = new WSClient(
      `${process.env.SERVER_HOST}:${process.env.PORT}`)

    wsClient.current.addChangeListener((newDoc) => {
      setDoc(newDoc.messages || [])
    })

    return () => {
      if (wsClient.current) {
        wsClient.current.ws.close()
      }
    }
  }, [])

  const handleClickOutside = (event) => {
    if (editingId && !event.target.closest('.edit-section')) {
      saveEdit(editingId)
    }
  }

  const addMessage = (inputKey, type, isUseData = false) => {
    const textValue = refsOfInputs.current[inputKey].value
    if (textValue.trim() === '') return

    const newId = uuidv4()
    const message = {
      id: newId,
      text: textValue,
      description: '',
      type: type,
      date: isUseData ? selectedDate ?? null : null,
    }

    wsClient.current.addMessage(message)
    refsOfInputs.current[inputKey].value = ''
  }

  const startEditing = (id, currentText, currentDate) => {
    setEditingId(id)
    setEditText(currentText)
    setEditDate(currentDate ?? '')
  }

  const saveEdit = (id) => {
    if (editText.trim() === '') return

    wsClient.current.editMessage(id, editText, editDate)
    setEditingId(null)
    setEditText('')
    setEditDate('')
  }

  const deleteMessage = (id) => {
    wsClient.current.deleteMessage(id)
  }

  const addMessageWithDate = (inputKey, date, type) => {
    const textValue = refsOfInputs.current[inputKey].value
    if (textValue.trim() === '') return

    const newId = uuidv4()
    const message = {
      id: newId,
      text: textValue,
      description: '',
      type,
      date,
    }

    wsClient.current.addMessage(message)
    refsOfInputs.current[inputKey].value = ''
  }

  const getFormattedMessages = (type) => {
    if (!doc) return []
    return doc.filter((msg) => msg.type === type).
      sort((a, b) => new Date(a.date) - new Date(b.date)).
      reduce((acc, msg) => {
        if (!acc[msg.date]) acc[msg.date] = []
        acc[msg.date].push(msg)
        return acc
      }, {})
  }

  const getFormattedDate = (date) => {
    let formattedDate = 'no-date'
    if (date) {
      try {
        formattedDate = format(new Date(date), 'd MMMM (EEE)')
      } catch (e) {
        console.error(e)
      }
    }
    return formattedDate
  }

  return (
    <div className="app-container" onClick={handleClickOutside}>
      <div className="header">
        <div className="import-export-section">
          <button onClick={wsClient?.current?.exportData}
                  className="export-button">Export JSON
          </button>
          <input type="file" accept=".json"
                 onChange={wsClient?.current?.importData}
                 className="import-input"/>
        </div>
      </div>
      <div className="messages-container">
        {['type1', 'type2', 'type3'].map((type, indexType) => (
          <Box key={type} className="message-type-section"
               hidden={isMobile && type !== 'type' + (currentTab + 1)}>

            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              <TextField
                label="Enter a message"
                variant="standard"
                sx={{ width: '250px' }}
                inputRef={(el) => (refsOfInputs.current[`${indexType}`] = el)}
              />
              {type === 'type1' &&
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="date-input"
                />
              }
              <Button variant="contained"
                      onClick={() => addMessage(`${indexType}`, type, type === 'type1')}
                      endIcon={<Send/>}>
                Send
              </Button>
            </Box>

            {Object.entries(getFormattedMessages(type)).
              map(([date, messages], indexDate) => (
                  <div key={date} className="date-section">
                    {type === 'type1' &&
                    <strong>{getFormattedDate(date)}</strong>
                    }
                    <List>
                      {messages.map((msg) => (
                        <ListItem key={msg.id} className="message-item"
                                  sx={{ padding: '0' }}>
                          {editingId === msg.id ? (
                            <Box sx={{ display: 'flex', width: '100%' }}
                                 className="edit-section">
                              <TextField
                                variant="standard"
                                sx={{ width: '100%' }}
                                onChange={e => setEditText(e.target.value)}
                                value={editText}
                              />
                              <input
                                type="date"
                                value={editDate}
                                onChange={e => setEditDate(e.target.value)}
                                className="edit-date-input"
                              />
                            </Box>
                          ) : (
                            <ListItemButton
                              sx={{ padding: '0', borderTop: '1px solid #ccc' }}
                              onClick={() => startEditing(msg.id, msg.text,
                                msg.date)}>
                              <ListItemText primary={msg.text}/>
                              <Button sx={{ padding: '0' }} variant="text"
                                      color="error"
                                      onClick={() => deleteMessage(msg.id)}>
                                <Delete/>
                              </Button>
                            </ListItemButton>
                          )}
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ display: 'flex' }}>
                      <TextField
                        variant="standard"
                        sx={{ width: '100%' }}
                        inputRef={(el) => (refsOfInputs.current[`${indexType}-${indexDate}`] = el)}
                      />
                      <Button variant="outlined" color="success" endIcon={<Send/>}
                              onClick={() => addMessageWithDate(`${indexType}-${indexDate}`, date, type)}/>
                    </Box>
                  </div>
                ),
              )}
          </Box>
        ))}
      </div>
      {
        isMobile && <Box sx={{
          position: 'fixed',
          bottom: 'env(safe-area-inset-bottom)',
          inset: 'auto 0 0 0',
          width: '100vw',
          background: 'white',
          boxShadow: '-2px 1px 1px 1px black',
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Tabs value={currentTab} onChange={(e, tab) => {setCurrentTab(tab)}}>
              <Tab label="Current"/>
              <Tab label="Future"/>
              <Tab label="To Buy"/>
            </Tabs>
          </Box>
        </Box>}

    </div>
  )
}

export default App
