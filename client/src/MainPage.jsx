// MainPage.jsx
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

// Импортируем необходимые компоненты из @dnd-kit/core
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

const MainPage = () => {
  const { openModal } = useModalStore()
  const theme = useTheme()
  const [currentTab, setCurrentTab] = useState(0)
  const [activeId, setActiveId] = useState(null)

  const { isMobile } = styleStore()
  const { showCalendar } = useSettingsStore()
  const { visibleMessages, setMessages } = useWSStore()

  const formattedMessages = useMemo(() => {
    return ['type1', 'type2', 'type3'].reduce((acc, type) => {
      acc[type] = visibleMessages
      .filter((msg) => msg.type === type)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .reduce((innerAcc, msg) => {
        if (!innerAcc[msg.date]) innerAcc[msg.date] = []
        innerAcc[msg.date].push(msg)
        return innerAcc
      }, {})
      return acc
    }, {})
  }, [visibleMessages])

  // Настройка сенсоров для мыши и сенсорных экранов
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  // Обработчик события dragStart
  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  // Обработчик события dragOver
  const handleDragOver = (event) => {
    const { active, over } = event
    if (over) {
      const overId = over.id
      const activeId = active.id
      console.log(`Элемент ${activeId} перетягивается над элементом ${overId}`)
    }
  }

  // Обработчик события dragEnd
  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    if (over && active.id !== over.id) {
      console.log(`Элемент ${active.id} был перемещен над элементом ${over.id}`)

      // Определение списка и позиции для активного и целевого элементов
      const activeMessage = visibleMessages.find(msg => msg.id === active.id)
      const overMessage = visibleMessages.find(msg => msg.id === over.id)

      if (activeMessage && overMessage) {
        // Если оба элемента существуют, перемещаем их в новом порядке
        const activeType = activeMessage.type
        const overType = overMessage.type

        if (activeType === overType) {
          // Перемещение внутри одного типа
          const messagesOfType = visibleMessages.filter(msg => msg.type === activeType)
          const activeIndex = messagesOfType.findIndex(msg => msg.id === active.id)
          const overIndex = messagesOfType.findIndex(msg => msg.id === over.id)

          if (activeIndex !== -1 && overIndex !== -1) {
            const newOrder = arrayMove(messagesOfType, activeIndex, overIndex)
            // Обновляем порядок сообщений
            const otherMessages = visibleMessages.filter(msg => msg.type !== activeType)
            setMessages([...otherMessages, ...newOrder])
          }
        } else {
          // Перемещение между разными типами
          // Реализуйте логику перемещения между типами, если необходимо
          console.log(`Перемещение между типами ${activeType} и ${overType} не реализовано`)
        }
      }
    }
  }

  // Обработчик события dragCancel
  const handleDragCancel = () => {
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Box>
        <Header />
        <Box
          className="messages-container"
          sx={{
            padding: '35px 0 70px',
          }}
        >
          {['type1', 'type2', 'type3'].map((type) => (
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
                    <Calendar />
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
                  }} />
                </Box>
                <Box sx={{ padding: '0 7px' }}>
                  {Object.entries(formattedMessages[type] || {}).map(([date, messages]) => (
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
        <Footer currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </Box>
      <DragOverlay>
        {activeId ? (
          <Box
            sx={{
              padding: '8px',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              borderRadius: '4px',
            }}
          >
            {visibleMessages.find(msg => msg.id === activeId)?.text || 'Перетаскивается'}
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default React.memo(MainPage)
