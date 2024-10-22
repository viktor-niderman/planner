import React, { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import './App.css'
import WSClient from './modules/wsClient.js'
import {
  Box,
  Button, IconButton,
  List, ListItem, ListItemButton, ListItemText,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import useUserStore from './store/userStore.js'
import Footer from './components/Footer.jsx'
import styleStore from './store/styleStore.js'
import EditDialog from './components/EditDialog.jsx'
import AddTaskIcon from '@mui/icons-material/AddTask'

function MainPage () {
  const [doc, setDoc] = useState(() => [])
  const [currentTab, setCurrentTab] = useState(0)
  const wsClient = useRef(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const user = useUserStore()
  const isMobile = styleStore((state) => state.isMobile)
  const [currentData, setCurrentData] = useState({})

  useEffect(() => {
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

  const addMessage = (message) => {
    wsClient.current.addMessage(message)
  }

  const editMessage = (id, message) => {
    wsClient.current.editMessage(id, message)
  }

  const deleteMessage = (id) => {
    wsClient.current.deleteMessage(id)
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
    <div className="app-container">
      <Box className="header" sx={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 5px 0',
      }}>
        <div className="import-export-section">
          <button onClick={wsClient?.current?.exportData}
                  className="export-button">Export JSON
          </button>
          <input type="file" accept=".json"
                 onChange={wsClient?.current?.importData}
                 className="import-input"/>
        </div>
        <div>
          {user.name}
        </div>
      </Box>
      <div className="messages-container">
        {['type1', 'type2', 'type3'].map((type, indexType) => (
          <Box key={type} className="message-type-section"
               hidden={isMobile && type !== 'type' + (currentTab + 1)}>

            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <IconButton
                color="primary"
                onClick={() => {
                  setCurrentData({ type: type })
                  setIsEditModalOpen(true)
                }}>
                <AddTaskIcon/>
              </IconButton>
            </Box>

            {Object.entries(getFormattedMessages(type)).
              map(([date, messages], indexDate) => (
                  <div key={date} className="date-section">
                    {type === 'type1' &&
                      <div>
                        <strong>{getFormattedDate(date)}</strong>
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setCurrentData({ type: type, date: date })
                            setIsEditModalOpen(true)
                          }}>
                          <AddTaskIcon/>
                        </IconButton>
                      </div>
                    }
                    <List>
                      {messages.map((msg) => (
                        <ListItem key={msg.id} className="message-item"
                                  sx={{ padding: '0' }}>
                          <ListItemButton
                            sx={{ padding: '0', borderTop: '1px solid #ccc' }}
                            onClick={() => {
                              setCurrentData(msg)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <ListItemText
                              primary={msg.text}
                            />
                            <Button sx={{ padding: '0' }} variant="text"
                                    color="error"
                                    onClick={(event) => {event.stopPropagation(); deleteMessage(msg.id)}}>
                              <Delete/>
                            </Button>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </div>
                ),
              )}
          </Box>
        ))}
      </div>
      <Footer currentTab={currentTab} setCurrentTab={setCurrentTab}/>

      <EditDialog
        open={isEditModalOpen}
        closeCallback={() => setIsEditModalOpen(false)}
        addMessageCallback={addMessage}
        editMessageCallback={editMessage}
        currentData={currentData}
      />
    </div>
  )
}

export default MainPage
