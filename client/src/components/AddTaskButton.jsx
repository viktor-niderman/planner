import React from 'react'
import {
  IconButton,
} from '@mui/material'
import AddTaskIcon from '@mui/icons-material/AddTask'

function AddTaskButton (props) {
  return (
    <IconButton
      onClick={props.onClick}
      color="primary"
    >
      <AddTaskIcon/>
    </IconButton>
  )
}

export default AddTaskButton
