import React from 'react'
import {
  IconButton,
} from '@mui/material'
import ControlPointIcon from '@mui/icons-material/ControlPoint';

function AddTaskButton (props) {
  return (
    <IconButton
      onClick={props.onClick}
      color="primary"
    >
      <ControlPointIcon fontSize="small"/>
    </IconButton>
  )
}

export default AddTaskButton
