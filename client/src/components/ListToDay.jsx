import React from 'react'
import AddTaskButton from '@src/components/Buttons/AddTaskButton.jsx'
import {
  Box,
} from '@mui/material'
import { format } from 'date-fns'
import ListMessages from '@src/components/ListMessages.jsx'
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import useModalStore from '@src/store/modalStore.js'

// Импортируем Draggable для элементов внутри ListMessages
import { Draggable } from '@hello-pangea/dnd'

function ListToDay (props) {
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
    <div className="date-section">
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        {props.date &&
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <strong>{getFormattedDate(props.date)}</strong>
            <AddTaskButton onClick={() => {
              openModal(EditMessageModal,
                { currentData: { type: props.type, date: props.date } })
            }
            }/>
          </Box>
        }
      </Box>

      <ListMessages messages={props.messages} type={props.type} />
    </div>
  )
}

export default ListToDay
