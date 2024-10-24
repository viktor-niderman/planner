import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
} from '@mui/material'
import dayjs from 'dayjs';
import useUserStore from '../store/userStore.js'
import ListToDay from './ListToDay.jsx'

// Function to generate days of the month
const generateDaysOfMonth = (year, month) => {
  const startOfMonth = dayjs(new Date(year, month, 1));
  const endOfMonth = startOfMonth.endOf('month');

  const days = [];
  let currentDay = startOfMonth;

  // Empty cells before the first day of the month
  const firstDayOfWeek = (currentDay.day() === 0 ? 7 : currentDay.day()) - 1;
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }

  // Days of the month
  while (currentDay.isBefore(endOfMonth) || currentDay.isSame(endOfMonth)) {
    days.push(currentDay);
    currentDay = currentDay.add(1, 'day');
  }

  // Empty cells after the last day of the month
  const totalCells = Math.ceil(days.length / 7) * 7;
  while (days.length < totalCells) {
    days.push(null);
  }

  return days;
}

const Calendar = ({ messages, openEditModal, deleteMessageCallback }) => {
  const user = useUserStore();
  const today = useMemo(() => dayjs(), []);
  const [currentMonth, setCurrentMonth] = useState(today.month());
  const [currentYear, setCurrentYear] = useState(today.year());
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState({
    date: '',
    messages: []
  });

  // Generate days of the month
  const days = useMemo(() => generateDaysOfMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  // Handlers for navigation buttons
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 0) {
        setCurrentYear(prevYear => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 11) {
        setCurrentYear(prevYear => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCurrentMonth(today.month());
    setCurrentYear(today.year());
  }, [today]);

  // Group messages by date
  const messagesByDate = useMemo(() => {
    const map = {};
    messages.forEach(msg => {
      const date = dayjs(msg.date).format('YYYY-MM-DD');
      if (!map[date]) {
        map[date] = [];
      }
      map[date].push(msg);
    });
    return map;
  }, [messages]);

  // Handler to open modal window
  const handleOpenModal = useCallback((day) => {
    if (day) {
      const formattedDay = day.format('YYYY-MM-DD');
      const filteredMessages = messages.filter(msg => dayjs(msg.date).isSame(day, 'day'));
      setModalData({
        date: formattedDay,
        messages: filteredMessages
      });
      setOpen(true);
    }
  }, [messages]);

  // Handler to close modal window
  const handleCloseModal = useCallback(() => {
    setOpen(false);
  }, []);

  // Week days
  const weekDays = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], []);

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

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', mb: 1 }}>
          {weekDays.map((day, index) => (
            <Typography key={index} variant="body1" sx={{ fontWeight: 'bold' }}>
              {day}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))', gap: '1px' }}>
          {days.map((day, index) => {
            const currentMessages = day ? messagesByDate[day.format('YYYY-MM-DD')] || [] : [];
            return (
              <Box
                key={day ? day.format('YYYY-MM-DD') : `empty-${index}`}
                onClick={() => handleOpenModal(day)}
                sx={{
                  border: '1px solid #ccc',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  borderColor: day && day.isSame(today, 'day') ? 'primary.main' : 'divider',
                  bgcolor: day && day.isSame(today, 'day') ? 'background.paper' : 'background.default',
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
                    <Box sx={{ mt: 0.5, width: '100%' }}>
                      {currentMessages.map((msg) => (
                        <Box
                          key={msg.id || msg.text + msg.date}
                          sx={{
                            textAlign: 'left',
                            fontSize: '10px',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            bgcolor: (msg.belongsTo && +msg.belongsTo !== user.id)
                              ? 'background.notMyTasks'
                              : 'background.default',
                            margin: '2px 0',
                            borderRadius: '3px',
                            boxShadow: '0px .6px 1px #745a5a',
                            padding: '0 2px'
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

      <Dialog
        open={open}
        onClose={handleCloseModal}
        PaperProps={{
          sx: {
            position: 'absolute',
            top: '5%',
            width: { xs: '90%', sm: '60%', md: '40%' },
          },
        }}
      >
        <DialogContent>
          <ListToDay
            date={modalData.date}
            openEditModal={openEditModal}
            deleteMessageCallback={deleteMessageCallback}
            messages={modalData.messages}
            type={'type1'}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default React.memo(Calendar);
