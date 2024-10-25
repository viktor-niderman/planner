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

import useSettingsStore from './store/settingsStore.js'
import styleStore from './store/styleStore.js'
import useWSStore from './store/wsStore.js'

const MainPage = () => {
  const theme = useTheme()
  const [currentTab, setCurrentTab] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const isMobile = styleStore((state) => state.isMobile)
  const [currentData, setCurrentData] = useState({})

  const { seeCalendar } = useSettingsStore()
  const {visibleMessages, wsMessages} = useWSStore();

  const formattedMessages = useMemo(() => {
    return ['type1', 'type2', 'type3'].reduce((acc, type) => {
      acc[type] = visibleMessages.filter((msg) => msg.type === type).
        sort((a, b) => new Date(a.date) - new Date(b.date)).
        reduce((innerAcc, msg) => {
          if (!innerAcc[msg.date]) innerAcc[msg.date] = []
          innerAcc[msg.date].push(msg)
          return innerAcc
        }, {})
      return acc
    }, {})
  }, [visibleMessages])

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
