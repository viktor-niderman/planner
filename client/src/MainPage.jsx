import React, { useState, useMemo } from 'react'
import { Box, useTheme } from '@mui/material'
import '@src/App.css'

import Header from '@src/components/Header.jsx'
import Footer from '@src/components/Footer.jsx'
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import AddTaskButton from '@src/components/Buttons/AddTaskButton.jsx'
import Calendar from '@src/components/Calendar.jsx'
import ListToDay from '@src/components/ListToDay.jsx'

import useSettingsStore from '@src/store/settingsStore.js'
import styleStore from '@src/store/styleStore.js'
import useWSStore from '@src/store/wsStore.js'
import useModalStore from '@src/store/modalStore.js'
import { CalendarPage } from '@src/pages/CalendarPage.jsx'
import { TasksPage } from '@src/pages/TasksPage.jsx'
import { ToBuyPage } from '@src/pages/ToBuyPage.jsx'
import { DragDropContext } from '@hello-pangea/dnd'
import { handleDragEnd } from '@src/modules/dnd.js'

const MainPage = () => {
  const { openModal } = useModalStore()
  const { messages, wsMessages, messagesCalendar } = useWSStore()
  const { isMobile } = styleStore()
  const { showCalendar } = useSettingsStore()

  const theme = useTheme()
  const [currentTab, setCurrentTab] = useState(0)

  return (
    <DragDropContext onDragEnd={(r) => handleDragEnd(r, messages, wsMessages)}>
      <Box>
        <Header/>
        <Box
          className="messages-container"
          sx={{
            padding: '35px 0 70px',
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          {
            currentTab === 0 && (
              <CalendarPage/>
            )
          }
          {
            currentTab === 1 && (
              <TasksPage/>
            )
          }
          {
            currentTab === 2 && (
              <ToBuyPage/>
            )
          }
        </Box>
        <Footer currentTab={currentTab} setCurrentTab={setCurrentTab}/>
      </Box>
    </DragDropContext>
  )
}

export default React.memo(MainPage)
