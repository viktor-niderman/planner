import React, { useState, useMemo } from 'react'
import { Box, useTheme } from '@mui/material'
import './App.css'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import EditMessageModal from './components/Modals/EditMessageModal.jsx'
import AddTaskButton from './components/Buttons/AddTaskButton.jsx'
import Calendar from './components/Calendar.jsx'
import ListToDay from './components/ListToDay.jsx'

import useSettingsStore from './store/settingsStore.js'
import styleStore from './store/styleStore.js'
import useWSStore from './store/wsStore.js'
import useModalStore from './store/modalStore.js'

const MainPage = () => {
  const { openModal } = useModalStore()
  const theme = useTheme()
  const [currentTab, setCurrentTab] = useState(0)

  const { isMobile } = styleStore()
  const { showCalendar } = useSettingsStore()
  const { visibleMessages } = useWSStore()

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

  return (
    <Box>
      <Header/>
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
              {(type === 'type1' && showCalendar) ? (
                <Box sx={{ marginBottom: '20px' }}>
                  <Calendar/>
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
                <AddTaskButton onClick={() => {
                  openModal(EditMessageModal, { currentData: { type } })
                }}/>
              </Box>
              <Box sx={{ padding: '0 7px' }}>
                {Object.entries(formattedMessages[type] || {}).
                  map(([date, messages]) => (
                    <Box key={`${type}-${date}`}>
                      <ListToDay
                        date={date}
                        messages={messages}
                        type={type}
                      />
                    </Box>
                  ))}
              </Box>
            </Box>
          )
        ))}
      </Box>
      <Footer currentTab={currentTab} setCurrentTab={setCurrentTab}/>
    </Box>
  )
}

export default React.memo(MainPage)
