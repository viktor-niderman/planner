import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { Send } from '@mui/icons-material'
import { v4 as uuidv4 } from 'uuid'

import { defaultInputData } from '../modules/constants.js'
import useWSStore from '../store/wsStore.js'

/**
 * EditDialog Component
 *
 * This component renders a dialog for adding or editing tasks.
 * It includes fields for task text, type, assignment, and date (if applicable).
 *
 * Props:
 * - open (boolean): Controls the visibility of the dialog.
 * - closeCallback (function): Function to close the dialog.
 * - currentData (object): Data of the message to edit.
 */
const EditDialog = ({
  open,
  closeCallback,
  currentData,
}) => {
  const [inputData, setInputData] = useState(defaultInputData)
  const textFieldRef = useRef(null)

  const { wsMessages } = useWSStore()

  const handleInputDataChange = useCallback((valueObject) => {
    setInputData((prevData) => ({
      ...prevData,
      ...valueObject,
    }))
  }, [])

  const focusTextField = () => {
    setTimeout(() => {
      if (textFieldRef.current) {
        textFieldRef.current.focus()
      }
    }, 50)
  }

  useEffect(() => {
    if (open) {
      setInputData({ ...defaultInputData, ...currentData })
      focusTextField()
    }
  }, [open, currentData])

  const prepareMessage = useCallback((message) => {
    const preparedMessage = { ...message }

    if (preparedMessage.type !== 'type1') {
      preparedMessage.date = defaultInputData.date
    }

    if (!preparedMessage.id) {
      preparedMessage.id = uuidv4()
    }

    return preparedMessage
  }, [])

  const saveMessage = useCallback(() => {
    const preparedMessage = prepareMessage(inputData)

    if (preparedMessage.id && currentData.id) {
      wsMessages.edit(preparedMessage.id, preparedMessage)
    } else {
      wsMessages.add(preparedMessage)
    }
  }, [inputData, prepareMessage, currentData.id, wsMessages])

  const handleCloseDialog = useCallback(() => {
    closeCallback()
  }, [closeCallback])

  const handleFormSubmit = useCallback((event) => {
    event.preventDefault()
    saveMessage()

    if (inputData.id && currentData.id) {
      // If editing, close the dialog
      handleCloseDialog()
    } else {
      // If adding, reset the text field for a new entry
      handleInputDataChange({ text: '' })
      focusTextField()
    }
  }, [
    saveMessage,
    inputData.id,
    currentData.id,
    handleCloseDialog,
    handleInputDataChange])

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        sx: {
          position: 'absolute',
          top: '5%',
        },
        component: 'form',
        onSubmit: handleFormSubmit,
      }}
      aria-labelledby="edit-dialog-title"
    >
      <DialogTitle id="edit-dialog-title">
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
          onChange={(e) => handleInputDataChange({ text: e.target.value })}
          value={inputData.text}
        />

        {/* Select Field for Task Type */}
        <FormControl variant="standard" sx={{ mt: 2 }} fullWidth>
          <InputLabel id="type-select-label">Type</InputLabel>
          <Select
            labelId="type-select-label"
            id="type-select"
            value={inputData.type}
            label="Type"
            onChange={(e) => handleInputDataChange({ type: e.target.value })}
            variant="standard"
          >
            <MenuItem value="type1">Current</MenuItem>
            <MenuItem value="type2">Future</MenuItem>
            <MenuItem value="type3">To Buy</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="standard" sx={{ mt: 2 }} fullWidth>
          <InputLabel id="belongs-to-select-label">Belongs to</InputLabel>
          <Select
            labelId="belongs-to-select-label"
            id="belongs-to-select"
            value={inputData.belongsTo}
            label="Belongs to"
            onChange={(e) => handleInputDataChange(
              { belongsTo: e.target.value })}
            variant="standard"
          >
            <MenuItem value="">Common</MenuItem>
            <MenuItem value="1">Kot</MenuItem>
            <MenuItem value="2">Caramel</MenuItem>
          </Select>
        </FormControl>

        {inputData.type === 'type1' && (
          <FormControl variant="standard" sx={{ mt: 2 }} fullWidth>
            <TextField
              id="date"
              name="date"
              label="Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={inputData.date}
              onChange={(e) => handleInputDataChange({ date: e.target.value })}
              variant="standard"
              fullWidth
            />
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button
          variant="contained"
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

export default React.memo(EditDialog)
