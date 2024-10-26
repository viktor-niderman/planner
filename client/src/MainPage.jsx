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

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

const MainPage = () => {
  const { openModal } = useModalStore()
  const theme = useTheme()
  const { wsMessages } = useWSStore()
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId !== overId) {
      // Разделите overId на type и date
      const [overType, overDate] = overId.split('_')

      console.log(overType, overDate)

      wsMessages.update(activeId, { type: overType, date: overDate })
    }
  }

  return (
    <Box>
      <Header/>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Box
          className="messages-container"
          sx={{
            padding: '35px 0 70px',
          }}
        >
          {['type1', 'type2', 'type3'].map((type) =>
            !isMobile || type === `type${currentTab + 1}` ? (
              <SortableContext
                key={type}
                items={Object.keys(formattedMessages[type] || {})}
                strategy={verticalListSortingStrategy}
              >
                <Box
                  key={type}
                  className="message-type-section"
                  sx={{
                    boxShadow: theme.palette.boxShadow,
                  }}
                >
                  {type === 'type1' && showCalendar ? (
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
                    <AddTaskButton
                      onClick={() => {
                        openModal(EditMessageModal, { currentData: { type } })
                      }}
                    />
                  </Box>
                  <Box sx={{ padding: '0 7px' }}>
                    {Object.entries(formattedMessages[type] || {}).
                      map(([date, messages]) => (
                        <Box key={`${type}-${date}`} id={`${type}-${date}`}>
                          <ListToDay date={date} messages={messages}
                                     type={type}/>
                        </Box>
                      ))}
                  </Box>
                </Box>
              </SortableContext>
            ) : null,
          )}
        </Box>
      </DndContext>
      <Footer currentTab={currentTab} setCurrentTab={setCurrentTab}/>
    </Box>
  )
}

export default React.memo(MainPage)
