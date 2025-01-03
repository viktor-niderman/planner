import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Button,
} from '@mui/material'
import dayjs from 'dayjs'
import useUserStore from '@src/store/userStore.js'
import useWSStore from '@src/store/wsStore.js'
import CalendarDayModal from '@src/components/Modals/CalendarDayModal.jsx'
import useModalStore from '@src/store/modalStore.js'
import { generateDaysOfMonth, weekDays } from '@src/helpers/dates.jsx'
import { groups } from '@src/modules/constants.js'
import messagesTypes from '@src/modules/messagesTypes.js'
import tags from '@src/modules/tags.js'

function Calendar (props) {
  const { openModal } = useModalStore()
  const user = useUserStore()
  const today = useMemo(() => dayjs(), [])
  const [currentMonth, setCurrentMonth] = useState(today.month())
  const [currentYear, setCurrentYear] = useState(today.year())

  const days = generateDaysOfMonth(currentYear, currentMonth)

  // Handle switching to the previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  // Handle switching to the next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Handle returning to the current month
  const handleToday = () => {
    setCurrentMonth(today.month())
    setCurrentYear(today.year())
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {dayjs(new Date(currentYear, currentMonth)).format('MMMM YYYY')}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 1 }}>
          <Button onClick={handlePrevMonth}>Previous Month</Button>
          <Button onClick={handleToday}>Today</Button>
          <Button onClick={handleNextMonth}>Next Month</Button>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          mb: 1,
        }}>
          {weekDays.map((day, index) => (
            <Typography key={index} variant="body1" sx={{ fontWeight: 'bold' }}>
              {day}
            </Typography>
          ))}
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))',
          gap: '1px',
        }}>
          {days.map((day, index) => {
            let currentMessages = props.messages.filter(msg =>
                dayjs(msg.date).isSame(day, 'day'))
            return (
              <Box
                key={index}
                onClick={() => {
                  if (!day) return
                  openModal(CalendarDayModal,
                    {
                      currentData: {
                        date: dayjs(day).format('YYYY-MM-DD'),
                      },
                    })
                }}
                sx={{
                  border: '1px solid #ccc',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  borderColor: day && day.isSame(today, 'day')
                    ? 'primary.main'
                    : 'divider',
                  bgcolor: day && day.isSame(today, 'day')
                    ? 'background.paper'
                    : 'background.default',
                  cursor: day ? 'pointer' : 'default',
                  p: '4px',
                }}
                role="button"
                aria-label={day ? day.format('MMMM D, YYYY') : 'Empty'}
              >
                {day && (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {day.date()}
                    </Typography>
                    <Box sx={{ mt: 0.5, width: '100%', overflow: 'hidden' }}>
                      {currentMessages.map((msg) => (
                        <Box
                          key={msg.id || msg.title + msg.date}
                          sx={{
                            textAlign: 'left',
                            fontSize: '10px',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            bgcolor: (msg.belongsTo && +msg.belongsTo !==
                              user.id)
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
                          {msg.title}
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            )
          })}
        </Box>
      </Box>

    </Box>
  )
}

export default Calendar
