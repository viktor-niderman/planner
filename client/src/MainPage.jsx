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

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'

const MainPage = () => {
  const { openModal } = useModalStore()
  const theme = useTheme()
  const [currentTab, setCurrentTab] = useState(0)

  const { isMobile } = styleStore()
  const { showCalendar } = useSettingsStore()
  const { visibleMessages, wsMessages } = useWSStore()

  // Функция для валидации даты
  const sanitizeDate = (date) => {
    if (!date) return null
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    return dateRegex.test(date) ? date : null
  }

  // Группировка сообщений
  const formattedMessages = useMemo(() => {
    return ['type1', 'type2', 'type3'].reduce((acc, type) => {
      const messagesByType = visibleMessages.filter(msg => msg.type === type)
      .sort((a, b) => new Date(a.date || '1970-01-01') - new Date(b.date || '1970-01-01'))

      if (type === 'type1') {
        // Группировка по дате для type1
        const groupedByDate = messagesByType.reduce((innerAcc, msg) => {
          const sanitizedDate = sanitizeDate(msg.date)
          const listId = sanitizedDate ? `${type}-${sanitizedDate}` : `${type}-no-date`
          if (!innerAcc[listId]) innerAcc[listId] = []
          innerAcc[listId].push(msg)
          return innerAcc
        }, {})
        acc[type] = groupedByDate
      } else {
        // Для type2 и type3 все сообщения в одном списке
        acc[type] = {
          [`${type}-all`]: messagesByType
        }
      }
      return acc
    }, {})
  }, [visibleMessages])

  // Состояние для активного элемента перетаскивания
  const [activeItem, setActiveItem] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Обработчик начала перетаскивания
  const handleDragStart = (event) => {
    const { active } = event
    setActiveItem(active.id)
  }

  // Обработчик завершения перетаскивания
  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    console.log('Drag End:', { activeId, overId })

    // Найти исходное сообщение
    const sourceMessage = visibleMessages.find(msg => msg.id === activeId)
    if (!sourceMessage) {
      console.error('Source message not found')
      return
    }

    // Найти целевое сообщение
    const targetMessage = visibleMessages.find(msg => msg.id === overId)
    if (!targetMessage) {
      console.error('Target message not found')
      return
    }

    // Определить новый тип и дату на основе целевого сообщения
    let newType = targetMessage.type
    let newDate = null

    if (newType === 'type1') {
      newDate = sanitizeDate(targetMessage.date)
      if (!newDate) {
        console.warn(`Target message type1 has invalid date: ${targetMessage.date}`)
        // Можно решить, что делать в этом случае. Например, не обновлять сообщение
        return
      }
    } else {
      // Для type2 и type3 дата не нужна
      newDate = null
    }

    console.log('Updating message:', { id: activeId, newType, newDate })

    // Обновить сообщение в глобальном состоянии
    wsMessages.edit(activeId, { type: newType, date: newDate })
  }

  const handleDragCancel = () => {
    setActiveItem(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
          {['type1', 'type2', 'type3'].map((type) =>
            !isMobile || type === `type${currentTab + 1}` ? (
              <Box
                key={type}
                className="message-type-section"
                sx={{
                  boxShadow: theme.palette.boxShadow,
                  padding: '10px',
                  marginBottom: '20px',
                }}
              >
                {type === 'type1' && showCalendar ? (
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
                  <AddTaskButton
                    onClick={() => {
                      openModal(EditMessageModal, { currentData: { type } })
                    }}
                  />
                </Box>
                <Box sx={{ padding: '0 7px' }}>
                  {Object.entries(formattedMessages[type] || {}).map(
                    ([listId, messages]) => {
                      // Извлечь дату из listId для type1
                      let date = null
                      if (type === 'type1') {
                        const parts = listId.split('-')
                        date = parts.length === 2 ? parts[1] : null
                      }
                      return (
                        <SortableContext
                          key={listId}
                          items={messages.map((msg) => msg.id)}
                          strategy={rectSortingStrategy}
                        >
                          <ListToDay
                            listId={listId}
                            date={type === 'type1' ? date : null}
                            messages={messages}
                            type={type}
                          />
                        </SortableContext>
                      )
                    }
                  )}
                </Box>
              </Box>
            ) : null
          )}
        </Box>
        <Footer currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </Box>
      <DragOverlay>
        {activeItem ? (
          <Box
            sx={{
              padding: '8px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {(() => {
              const activeMsg = visibleMessages.find(msg => msg.id === activeItem)
              return activeMsg ? activeMsg.text : null
            })()}
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default React.memo(MainPage)
