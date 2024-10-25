import React from 'react'
import AddTaskButton from './AddTaskButton.jsx'
import {
  Box,
} from '@mui/material'
import { format } from 'date-fns'
import ListMessages from './ListMessages.jsx'
import useModalManager from '../hooks/useModalManager.jsx'
import EditDialog from './EditDialog.jsx'

function ListToDay (props) {
  const {
    openModalWithData: openEditModal,
    ModalWrapper: EditModal,
  } = useModalManager(EditDialog)
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
              openEditModal({ type: props.type, date: props.date })
            }}/>
          </Box>
        }
      </Box>


      <ListMessages messages={props.messages}/>
      {EditModal}
    </div>
  )
}

export default ListToDay
