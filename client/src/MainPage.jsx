import React, { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import './App.css'
import WSClient from './modules/wsClient.js'
import {
  Box,
  Button, Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell, TableContainer,
  TableRow, useTheme,
} from '@mui/material'
import Footer from './components/Footer.jsx'
import styleStore from './store/styleStore.js'
import EditDialog from './components/EditDialog.jsx'
import Header from './components/Header.jsx'
import AddTaskButton from './components/AddTaskButton.jsx'
import useUserStore from './store/userStore.js'
import useSettingsStore from './store/settingsStore.js'
import Calendar from './components/Calendar.jsx'
import ListToDay from './components/ListToDay.jsx'

function MainPage () {
  const user = useUserStore()
  const theme = useTheme();
  const [doc, setDoc] = useState(() => [])
  const [currentTab, setCurrentTab] = useState(0)
  const wsClient = useRef(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const isMobile = styleStore((state) => state.isMobile)
  const [currentData, setCurrentData] = useState({})

  const { seePosition, seeCalendar } = useSettingsStore()

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

  const wsMessages = {
    add: (message) => {
      wsClient.current.addMessage(message)
    },
    edit: (id, message) => {
      wsClient.current.editMessage(id, message)
    },
    delete: (id) => {
      wsClient.current.deleteMessage(id)
    },
    export: () => {wsClient.current.exportData()},
    import: (event) => {
      const file = event.target.files[0]
      if (file) {
        wsClient.current.importData(file)
      }
    },
  }

  const [availableMessages, setAvailableMessages] = useState([])
  useEffect(() => {
    const messages = !seePosition ? doc.filter((msg) => !msg.belongsTo || +msg.belongsTo === user.id) : doc
    setAvailableMessages(messages)
  }, [doc, seePosition, user.id])

  const getFormattedMessages = (type) => {
    if (!availableMessages) return []
    return availableMessages.filter((msg) => msg.type === type).
      sort((a, b) => new Date(a.date) - new Date(b.date)).
      reduce((acc, msg) => {
        if (!acc[msg.date]) acc[msg.date] = []
        acc[msg.date].push(msg)
        return acc
      }, {})
  }


  const openEditModal = (data) => {
    setCurrentData({ ...data })
    setIsEditModalOpen(true)
  }



  return (
    <Box>
      <Header importCallback={wsMessages.import}
              exportCallback={wsMessages.export}/>
      <Box className="messages-container" sx={{
        padding: '35px 0 70px',
      }}>
        {['type1', 'type2', 'type3'].map((type, indexType) => (
          <Box key={type} className="message-type-section"
               sx={{
                 boxShadow: theme.palette.boxShadow,
               }}
               hidden={isMobile && type !== 'type' + (currentTab + 1)}>
            {(type === 'type1' && seeCalendar) ? (
              <Box sx={{
                marginBottom: '20px',
              }}>
                <Calendar messages={availableMessages.filter((msg) => msg.type === type)} deleteMessageCallback={wsMessages.delete} openEditModal={openEditModal}/>
              </Box>
            ) : null}

            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              padding: '0 5px'
            }}>
              <AddTaskButton onClick={() => {
                openEditModal({ type: type })
              }}/>
            </Box>
            <Box sx={{
              padding: '0 7px'
            }}>
              {Object.entries(getFormattedMessages(type)).
                map(([date, messages]) => (
                    <Box key={date}>
                      <ListToDay date={date} openEditModal={openEditModal} messages={messages} type={type} deleteMessageCallback={wsMessages.delete}/>
                    </Box>
                  ),
                )}
            </Box>
            </Box>

        ))}
      </Box>
      <Footer currentTab={currentTab} setCurrentTab={setCurrentTab}/>

      <EditDialog
        open={isEditModalOpen}
        closeCallback={() => setIsEditModalOpen(false)}
        addMessageCallback={wsMessages.add}
        editMessageCallback={wsMessages.edit}
        currentData={currentData}
      />
    </Box>
  )
}

export default MainPage
