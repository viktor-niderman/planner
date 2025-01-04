import React, { useState, useMemo } from 'react'
import { Box, useTheme } from '@mui/material'
import '@src/App.css'
import Header from '@src/components/Header.jsx'
import Footer from '@src/components/Footer.jsx'
import Calendar from '@src/components/Calendar.jsx'
import ListToDay from '@src/components/ListToDay.jsx'
import useWSStore from '@src/store/wsStore.js'
import { DragDropContext } from '@hello-pangea/dnd'
import { handleDragEnd } from '@src/modules/dnd.js'
import messagesTypes from '@src/modules/messagesTypes.js'

const MainPage = () => {
  const { messages, wsMessages, visibleMessages } = useWSStore()

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

          <Box sx={{width: '100%'}}>
            {(currentTab === 0) && (
              <Box sx={{ }}>
                <Calendar
                  messages={visibleMessages.filter(
                    msg => msg.type === messagesTypes.calendar)}/>
              </Box>
            )}

            {(currentTab === 1) && (
              <ListToDay
                title={'Future tasks'}
                droppableId={`${messagesTypes.tasks}`}
                messages={visibleMessages.filter(
                  msg => msg.type === messagesTypes.tasks)}
                type={messagesTypes.tasks}
              />
            )}

            {(currentTab === 2) && (
              <ListToDay
                title={'To Buy'}
                droppableId={`${messagesTypes.toBuy}`}
                messages={visibleMessages.filter(
                  msg => msg.type === messagesTypes.toBuy)}
                type={messagesTypes.toBuy}
              />
            )}
          </Box>
        </Box>
        <Footer currentTab={currentTab} setCurrentTab={setCurrentTab}/>
      </Box>
    </DragDropContext>
  )
}

export default React.memo(MainPage)
