import React, { useMemo, useState } from 'react'
import {
  Box, Typography, Button,
} from '@mui/material'
import dayjs from 'dayjs'
import useUserStore from '@src/store/userStore.js'
import CalendarDayModal from '@src/components/Modals/CalendarDayModal.jsx'
import useModalStore from '@src/store/modalStore.js'
import { generateDaysOfMonth, weekDays } from '@src/helpers/dates.jsx'
import tags from '@src/modules/tags.js'
import styleStore from '@src/store/styleStore.js'
import { Draggable, Droppable } from '@hello-pangea/dnd'

function Calendar (props) {
  const { openModal } = useModalStore()
  const user = useUserStore()
  const today = useMemo(() => dayjs(), [])
  const [currentMonth, setCurrentMonth] = useState(today.month())
  const [currentYear, setCurrentYear] = useState(today.year())
  const { isMobile } = styleStore()

  const days = generateDaysOfMonth(currentYear, currentMonth)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleToday = () => {
    setCurrentMonth(today.month())
    setCurrentYear(today.year())
  }

  return (<Box>
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0, gap: 1 }}>
          <Button onClick={handlePrevMonth}>⬅️</Button>
          <Button onClick={handleToday}>
            <Typography variant="h6" gutterBottom sx={{ margin: 0 }}>
              {dayjs(new Date(currentYear, currentMonth)).format('MMMM YYYY')}
            </Typography>
          </Button>
          <Button onClick={handleNextMonth}>➡️</Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            mb: 1,
          }}
        >
          {weekDays.map((day, index) => (
            <Typography key={index} variant="body1" sx={{ fontWeight: 'bold' }}>
              {day}
            </Typography>))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))',
            gap: '1px',
            height: '75vh',
            gridAutoRows: '1fr',
          }}
        >
          {days.map((day, index) => {
            const droppableId = day
              ? 'day_' + dayjs(day).format('YYYY-MM-DD')
              : `no-day-${index}`

            const currentMessages = props.messages.filter(
              msg => day && dayjs(msg.date).isSame(day, 'day'))

            return (<Droppable key={droppableId} droppableId={droppableId}>
                {(provided) => (<Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    onClick={() => {
                      if (!day) return
                      openModal(CalendarDayModal, {
                        currentData: {
                          date: dayjs(day).format('YYYY-MM-DD'),
                        },
                      })
                    }}
                    sx={{
                      border: day ? '1px solid #ccc' : 'none',
                      height: '100%',
                      display: 'flex',
                      overflow: 'hidden',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      borderColor: day && day.isSame(today, 'day')
                        ? 'primary.main'
                        : 'divider',
                      bgcolor: !day ? 'background.noDay' : day.isSame(today,
                        'day') ? 'background.paper' : 'background.default',
                      cursor: day ? 'pointer' : 'default',
                      p: '2px',
                    }}
                    role="button"
                    aria-label={day ? day.format('MMMM D, YYYY') : 'Empty'}
                  >
                    {day && (<>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {day.date()}
                        </Typography>

                        <Box sx={{ width: '100%', overflow: 'hidden' }}>
                          {currentMessages.map((msg, msgIndex) => (<Draggable
                              key={msg.id}
                              draggableId={msg.id}
                              index={msgIndex}
                            >
                              {(provided, snapshot) => (<Box
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    textAlign: 'left',
                                    fontSize: isMobile ? '10px' : '14px',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    bgcolor: msg.belongsTo && +msg.belongsTo !==
                                    user.id
                                      ? 'background.notMyTasks'
                                      : 'background.default',
                                    margin: '2px 0',
                                    borderRadius: '3px',
                                    boxShadow: '0px .6px 1px #745a5a',
                                    padding: '0 2px',
                                    border: '1px solid transparent',
                                    borderColor: msg.tags[tags.booleans.is_important]
                                      ? 'red'
                                      : 'transparent',
                                  }}
                                >
                                  {msg.tags.is_birthday ? '🎂' : ''} {msg.title}
                                </Box>)}
                            </Draggable>))}
                        </Box>
                      </>)}
                    {provided.placeholder}
                  </Box>)}
              </Droppable>)
          })}
        </Box>
      </Box>
    </Box>)
}

export default Calendar
