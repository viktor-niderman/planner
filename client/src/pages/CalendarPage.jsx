import { Box, useTheme } from '@mui/material'
import Calendar from '@src/components/Calendar.jsx'

export const CalendarPage = () => {
  const theme = useTheme()
  return (
    <>
      {
        <Box
          className="message-type-section"
          sx={{
            boxShadow: theme.palette.boxShadow,
          }}
        >
          <Box sx={{ marginBottom: '20px' }}>
            <Calendar/>
          </Box>
        </Box>
      }

    </>
  )
}
