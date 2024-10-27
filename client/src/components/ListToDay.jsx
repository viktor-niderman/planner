import React from 'react'
import { Box, Typography } from '@mui/material'
import ListMessages from '@src/components/ListMessages.jsx'
import AddTaskButton from '@src/components/Buttons/AddTaskButton.jsx'
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import useModalStore from '@src/store/modalStore.js'
import { format } from 'date-fns'

function ListToDay(props) {
  const { openModal } = useModalStore()

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
    <Box sx={{ marginBottom: '20px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6">{getFormattedDate(props.date)}</Typography>
        <AddTaskButton onClick={() => {
          openModal(EditMessageModal, { currentData: { type: props.type, date: props.date } })
        }}/>
      </Box>

      {/* Передаем уникальный droppableId для каждого списка по дате и индексу */}
      <ListMessages
        messages={props.messages}
        type={props.type}
        droppableId={`${props.type}-${props.date}-${props.dateIndex}`}
      />
    </Box>
  )
}

export default ListToDay
