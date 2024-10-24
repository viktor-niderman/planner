import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/en'; // Set localization to English

// Set locale to English
dayjs.locale('en');

// Function to generate an array of days for the given month
function generateDaysOfMonth(year, month) {
  const startOfMonth = dayjs(new Date(year, month, 1));
  const endOfMonth = startOfMonth.endOf('month');

  const days = [];
  let currentDay = startOfMonth;

  // Fill in empty blocks for days before the first day of the month (starting on Monday)
  const firstDayOfWeek = (currentDay.day() === 0 ? 7 : currentDay.day()) - 1; // Adjust so Monday is the first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }

  // Fill in the days of the month
  while (currentDay.isBefore(endOfMonth) || currentDay.isSame(endOfMonth)) {
    days.push(currentDay);
    currentDay = currentDay.add(1, 'day');
  }

  // Add empty blocks after the last day of the month to complete the last week
  const totalCells = Math.ceil(days.length / 7) * 7; // Ensure complete rows (7 days per week)
  while (days.length < totalCells) {
    days.push(null);
  }

  return days;
}

function Calendar(props) {
  const today = dayjs(); // Current date
  const [currentMonth, setCurrentMonth] = useState(today.month());
  const [currentYear, setCurrentYear] = useState(today.year());

  const days = generateDaysOfMonth(currentYear, currentMonth);

  // Handle switching to the previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Handle switching to the next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Handle returning to the current month
  const handleToday = () => {
    setCurrentMonth(today.month());
    setCurrentYear(today.year());
  };

  // Weekday labels (starting with Monday)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Display current month and year */}
      <Typography variant="h6" gutterBottom>
        {dayjs(new Date(currentYear, currentMonth)).format('MMMM YYYY')}
      </Typography>

      {/* Buttons for navigating months */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button onClick={handlePrevMonth}>Previous Month</Button>
        <Button onClick={handleToday}>Today</Button>
        <Button onClick={handleNextMonth}>Next Month</Button>
      </Box>

      {/* Weekday labels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', mb: 1 }}>
        {weekDays.map((day, index) => (
          <Typography key={index} variant="body1" sx={{ fontWeight: 'bold' }}>
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid with days of the month */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(40px, 1fr))', gap: '1px' }}>
        {days.map((day, index) => (
          <Box
            key={index}
            sx={{
              border: '1px solid #ccc',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderColor: day && day.isSame(today, 'day') ? 'blue' : '#ccc',
              bgcolor: day && day.isSame(today, 'day') ? '#e0f7fa' : '#fff'
            }}
          >
            {day ? (
              <>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'start',
                  height: '100%',
                }}>
                  <Box sx={{
                    alignSelf: 'flex-start',
                  }}>
                    {day.date()}
                  </Box>
                  {props.messages.filter((msg) => dayjs(msg.date).isSame(day, 'day')).map((msg, index) => (
                    <Box key={index} sx={{
                      textAlign: 'left',
                      fontSize: '13px',
                      maxWidth: '50px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}>
                      {msg.text}
                    </Box>
                  ))}

                </Box>
              </>
            ) : null}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Calendar;
