import React from 'react'
import {
  Dialog,
  DialogContent,
} from '@mui/material'
import ListToDay from '@src/components/ListToDay.jsx'
import dayjs from 'dayjs'
import useWSStore from '@src/store/wsStore.js'

function CalendarDayModal ({
  open,
  closeCallback,
  currentData,
}) {
  const { visibleMessages } = useWSStore()
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
        <ListToDay date={currentData.date}
                   messages={visibleMessages.filter(
                     (msg) => dayjs(msg.date).isSame(currentData.date, 'day'))} type={'type1'}/>
      </DialogContent>
    </Dialog>
  )
}


export default CalendarDayModal
