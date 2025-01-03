import React from 'react'
import {
  Dialog,
  DialogContent,
} from '@mui/material'
import ListToDay from '@src/components/ListToDay.jsx'
import dayjs from 'dayjs'
import useWSStore from '@src/store/wsStore.js'
import { format } from 'date-fns'
import messagesTypes from '@src/modules/messagesTypes.js'

function CalendarDayModal ({
  open,
  closeCallback,
  currentData,
  messages
}) {

  const getFormattedDate = (date) => {
    let formattedDate = 'no-date'
    if (date) {
      try {
        formattedDate = format(new Date(date), 'd MMMM (EEE)')
      } catch (e) {
        console.error(e)
      }
    }
    return formattedDate
  }

  return (
    <Dialog
      open={open}
      onClose={closeCallback}
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
          title={getFormattedDate(currentData.date)}
          date={currentData.date}
          messages={currentData.messages}
          droppableId={`${messagesTypes.calendar}_${currentData.date}`}
        />
      </DialogContent>
    </Dialog>
  )
}

export default CalendarDayModal
