import React from 'react'
import AddTaskButton from './Buttons/AddTaskButton.jsx'
import {
  Box,
} from '@mui/material'
import { format } from 'date-fns'
import ListMessages from './ListMessages.jsx'
import useModalManager from '../hooks/useModalManager.jsx'
import EditMessageModal from './Modals/EditMessageModal.jsx'

function ListToDay (props) {
  const {
    openModalWithData: openEditMessageModal,
    ModalWrapper: EditMessageModalWrapper,
  } = useModalManager(EditMessageModal)
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
      }}>

        {props.date &&
          <Box>
            <strong>{getFormattedDate(props.date)}</strong>
            <AddTaskButton onClick={() => {
              openEditMessageModal({ type: props.type, date: props.date })
            }}/>
          </Box>
        }
      </Box>


      <ListMessages messages={props.messages}/>
      {EditMessageModalWrapper}
    </div>
  )
}

export default ListToDay
