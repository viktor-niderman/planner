import React from 'react'
import { Box, Typography } from '@mui/material'
import ListMessages from '@src/components/ListMessages.jsx'
import AddTaskButton from '@src/components/Buttons/AddTaskButton.jsx'
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import useModalStore from '@src/store/modalStore.js'
import { format } from 'date-fns'

function ListToDay(props) {
  const { openModal } = useModalStore()

  return (
    <Box sx={{ marginBottom: '20px', padding: '8px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6">{props.title}</Typography>
        <AddTaskButton onClick={() => {
          openModal(EditMessageModal, { currentData: { type: props.type, date: props.date } })
        }}/>
      </Box>

      <ListMessages
        messages={props.messages}
        droppableId={props.droppableId}
      />
    </Box>
  )
}

export default ListToDay
