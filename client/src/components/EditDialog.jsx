import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl, InputLabel, MenuItem, Select,
  TextField,
} from '@mui/material'
import { Send } from '@mui/icons-material'
import { v4 as uuidv4 } from 'uuid'
import { defaultInputData } from '../modules/constants.js'

function EditDialog (props) {
  const [inputData, setInputData] = useState(defaultInputData)
  const textFieldRef = useRef(null)

  const handleInputDataChange = (valueObject) => {
    setInputData(prevData => ({
      ...prevData,
      ...valueObject,
    }))
  }

  const focusTextField = () => {
    setTimeout(() => {
      if (props.open && textFieldRef.current) {
        textFieldRef.current.focus()
      }
    }, 50)
  }
  useEffect(() => {
    setInputData({ ...defaultInputData, ...props.currentData })
    focusTextField()
  }, [props.open])

  const saveMessage = () => {
    let message = { ...inputData }
    if (message.id) {
      props.editMessageCallback(message.id, prepareMessage(message))
    } else {
      props.addMessageCallback(prepareMessage(message))
    }
  }

  const handleCloseDialog = () => {
    props.closeCallback()
  }

  const prepareMessage = (message) => {
    if (message.type !== 'type1') {
      message.date = defaultInputData.date
    }
    if (!message.id) {
      message.id = uuidv4()
    }
    return message
  }

  const formSubmit = (event) => {
    event.preventDefault()
    saveMessage()
    if (inputData.id) {
      handleCloseDialog()
    } else {
      handleInputDataChange({ text: '' })
      focusTextField()
    }
  }

  return (
    <Dialog
      open={props.open}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          position: 'absolute',
          top: '5%',
        },
        component: 'form',
        onSubmit: formSubmit
      }}
    >
      <DialogTitle>
        {inputData.id ? 'Edit Task' : 'Add New Task'}
      </DialogTitle>
      <DialogContent>
        <TextField
          sx={{ minWidth: '250px' }}
          inputRef={textFieldRef}
          required
          margin="dense"
          id="text"
          name="text"
          label="Text"
          type="text"
          fullWidth
          autoComplete="off"
          variant="standard"
          onChange={e => handleInputDataChange({ text: e.target.value })}
          value={inputData.text}
        />
        <FormControl variant="standard" sx={{ mt: 1 }} fullWidth>
          <InputLabel id="demo-simple-select-label">Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={inputData.type}
            autoComplete="off"
            label="Type"
            onChange={e => handleInputDataChange({ type: e.target.value })}
            variant="standard"
          >
            <MenuItem value="type1">Current</MenuItem>
            <MenuItem value="type2">Future</MenuItem>
            <MenuItem value="type3">To Buy</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="standard" sx={{ mt: 1 }} fullWidth>
          <InputLabel id="belongs-to-select-label">Belongs to</InputLabel>
          <Select
            labelId="belongs-to-select-label"
            id="belongs-to-select"
            autoComplete="off"
            value={inputData.belongsTo}
            label="Type"
            variant="standard"
            onChange={e => handleInputDataChange({ belongsTo: e.target.value })}
          >
            <MenuItem value="">Common</MenuItem>
            <MenuItem value="1">Kot</MenuItem>
            <MenuItem value="2">Caramel</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="standard" sx={{ mt: 1 }}>
          {inputData.type === 'type1' &&
            <input
              type="date"
              autoComplete="false"
              value={inputData.date}
              onChange={e => handleInputDataChange({ date: e.target.value })}
              className="date-input"
            />
          }
        </FormControl>

      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button variant="contained"
                type="submit"
                endIcon={<Send/>}
                disabled={!inputData.text.trim()}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditDialog
