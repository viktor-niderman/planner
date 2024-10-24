import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Box, useTheme } from '@mui/material'
import './App.css'

import WSClient from './modules/wsClient.js'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import EditDialog from './components/EditDialog.jsx'
import AddTaskButton from './components/AddTaskButton.jsx'
import Calendar from './components/Calendar.jsx'
import ListToDay from './components/ListToDay.jsx'

import useUserStore from './store/userStore.js'
import useSettingsStore from './store/settingsStore.js'
import styleStore from './store/styleStore.js'

const MainPage = () => {
  const user = useUserStore()
  const theme = useTheme()
  const [doc, setDoc] = useState([])
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

  const addMessage = useCallback((message) => {
    wsClient.current.addMessage(message)
  }, [])

  const editMessage = useCallback((id, message) => {
    wsClient.current.editMessage(id, message)
  }, [])

  const deleteMessage = useCallback((id) => {
    wsClient.current.deleteMessage(id)
  }, [])

  const exportData = useCallback(() => {
    wsClient.current.exportData()
  }, [])

  const importData = useCallback((event) => {
    const file = event.target.files[0]
    if (file) {
      wsClient.current.importData(file)
    }
  }, [])

  const wsMessages = useMemo(() => ({
    add: addMessage,
    edit: editMessage,
    delete: deleteMessage,
    export: exportData,
    import: importData,
  }), [addMessage, editMessage, deleteMessage, exportData, importData])

  const availableMessages = useMemo(() => {
    return !seePosition
      ? doc.filter((msg) => !msg.belongsTo || +msg.belongsTo === user.id)
      : doc
  }, [doc, seePosition, user.id])

  const formattedMessages = useMemo(() => {
    return ['type1', 'type2', 'type3'].reduce((acc, type) => {
      acc[type] = availableMessages.filter((msg) => msg.type === type).
        sort((a, b) => new Date(a.date) - new Date(b.date)).
        reduce((innerAcc, msg) => {
          if (!innerAcc[msg.date]) innerAcc[msg.date] = []
          innerAcc[msg.date].push(msg)
          return innerAcc
        }, {})
      return acc
    }, {})
  }, [availableMessages])

  const openEditModal = useCallback((data) => {
    setCurrentData({ ...data })
    setIsEditModalOpen(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false)
  }, [])

  return (
    <Box>
      <Header
        importCallback={wsMessages.import}
        exportCallback={wsMessages.export}
      />
      <Box
        className="messages-container"
        sx={{
          padding: '35px 0 70px',
        }}
      >
        {['type1', 'type2', 'type3'].map(type => (
          (!isMobile || type === `type${currentTab + 1}`) && (
            <Box
              key={type}
              className="message-type-section"
              sx={{
                boxShadow: theme.palette.boxShadow,
              }}
            >
              {(type === 'type1' && seeCalendar) ? (
                <Box sx={{ marginBottom: '20px' }}>
                  <Calendar
                    messages={availableMessages.filter(
                      (msg) => msg.type === type)}
                    deleteMessageCallback={wsMessages.delete}
                    openEditModal={openEditModal}
                  />
                </Box>
              ) : null}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  padding: '0 5px',
                }}
              >
                <AddTaskButton onClick={() => openEditModal({ type })}/>
              </Box>
              <Box sx={{ padding: '0 7px' }}>
                {Object.entries(formattedMessages[type] || {}).
                  map(([date, messages]) => (
                    <Box key={`${type}-${date}`}>
                      <ListToDay
                        date={date}
                        openEditModal={openEditModal}
                        messages={messages}
                        type={type}
                        deleteMessageCallback={wsMessages.delete}
                      />
                    </Box>
                  ))}
              </Box>
            </Box>
          )
        ))}
      </Box>
      <Footer currentTab={currentTab} setCurrentTab={setCurrentTab}/>

      <EditDialog
        open={isEditModalOpen}
        closeCallback={closeEditModal}
        addMessageCallback={wsMessages.add}
        editMessageCallback={wsMessages.edit}
        currentData={currentData}
      />
    </Box>
  )
}

export default React.memo(MainPage)
