import React from 'react'
import {
  Dialog,
  DialogContent,
} from '@mui/material'
import ListToDay from '@src/components/ListToDay.jsx'
import messagesTypes from '@src/modules/messagesTypes.js'

function CalendarDayModal ({
  open,
  closeCallback,
  currentData,
}) {
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
          date={currentData.date}
          messages={currentData.messages}
          type={messagesTypes.calendar}
          droppableId={messagesTypes.calendar + props.date}
        />
      </DialogContent>
    </Dialog>
  )
}


export default CalendarDayModal
