import React, { useState } from 'react'
import AddTaskButton from './AddTaskButton.jsx'
import {
  Box,
} from '@mui/material'
import { format } from 'date-fns'
import ListMessages from './ListMessages.jsx'

function ListToDay (props) {
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
              props.openEditModal({ type: props.type, date: props.date })
            }}/>
          </Box>
        }
      </Box>


      <ListMessages messages={props.messages}/>
    </div>
  )
}

export default ListToDay
