import React, { useEffect, useState } from 'react'
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

function EditDialog (props) {
  const defaultInputData = {
    id: null,
    text: '',
    description: '',
    type: 'type1',
    date: '',
    belongsTo: null,
    group: null,
    position: null,
  }
  const [inputData, setInputData] = useState(defaultInputData)

  const handleInputDataChange = (valueObject) => {
    setInputData(prevData => ({
      ...prevData,
      ...valueObject,
    }))
  }

  useEffect(() => {
    setInputData({ ...defaultInputData, ...props.currentData })
  }, [props.currentData])

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
        onSubmit: (event) => {
          event.preventDefault()
          saveMessage()
          if (inputData.id) {
            handleCloseDialog()
          } else {
            handleInputDataChange({ text: '' })
          }
        },
      }}
    >
      <DialogTitle>
        {inputData.id ? 'Edit Task' : 'Add New Task'}
      </DialogTitle>
      <DialogContent>
        <TextField
          sx={{ minWidth: '250px' }}
          autoFocus
          required
          margin="dense"
          id="text"
          name="text"
          label="Text"
          type="text"
          fullWidth
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
            label="Type"
            onChange={e => handleInputDataChange({ type: e.target.value })}
          >
            <MenuItem value="type1">Current</MenuItem>
            <MenuItem value="type2">Future</MenuItem>
            <MenuItem value="type3">To Buy</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="standard" sx={{ mt: 1 }}>
          {inputData.type === 'type1' &&
            <input
              type="date"
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
