import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Button,
} from '@mui/material'
import dayjs from 'dayjs'
import useUserStore from '../store/userStore.js'
import useWSStore from '../store/wsStore.js'
import useModalManager from '../hooks/useModalManager.jsx'
import CalendarDayModal from './CalendarDayModal.jsx'

// Function to generate an array of days for the given month
function generateDaysOfMonth (year, month) {
  const startOfMonth = dayjs(new Date(year, month, 1))
  const endOfMonth = startOfMonth.endOf('month')

  const days = []
  let currentDay = startOfMonth

  // Fill in empty blocks for days before the first day of the month (starting on Monday)
  const firstDayOfWeek = (currentDay.day() === 0 ? 7 : currentDay.day()) - 1 // Adjust so Monday is the first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }

  // Fill in the days of the month
  while (currentDay.isBefore(endOfMonth) || currentDay.isSame(endOfMonth)) {
    days.push(currentDay)
    currentDay = currentDay.add(1, 'day')
  }

  // Add empty blocks after the last day of the month to complete the last week
  const totalCells = Math.ceil(days.length / 7) * 7 // Ensure complete rows (7 days per week)
  while (days.length < totalCells) {
    days.push(null)
  }

  return days
}

function Calendar (props) {
  const {
    openModalWithData: openCalendarDayModal,
    ModalWrapper: CalendarDayModalWrapper,
  } = useModalManager(CalendarDayModal)

  const user = useUserStore()
  const { visibleMessages } = useWSStore()
  const today = useMemo(() => dayjs(), [])
  const [currentMonth, setCurrentMonth] = useState(today.month())
  const [currentYear, setCurrentYear] = useState(today.year())
  const [open, setOpen] = useState(false)

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

  // Weekday labels (starting with Monday)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
            let currentMessages = visibleMessages.filter(
              (msg) => dayjs(msg.date).isSame(day, 'day'))
            return (
              <Box
                key={index}
                onClick={() => {
                  if (!day) return
                  openCalendarDayModal(
                    { date: dayjs(day).format('YYYY-MM-DD') })
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
                          key={msg.id || msg.text + msg.date}
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
                          }}
                        >
                          {msg.text}
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

      {CalendarDayModalWrapper}
    </Box>
  )
}

export default Calendar
