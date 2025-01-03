import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from '@mui/material'
import { Send } from '@mui/icons-material'
import { v4 as uuidv4 } from 'uuid'

import {
  defaultInputData, groups,
} from '@src/modules/constants.js'
import useWSStore from '@src/store/wsStore.js'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import SelectLine from '@src/components/SelectLine.jsx'

/**
 * EditMessageModal Component
 *
 * This component renders a dialog for adding or editing tasks.
 * It includes fields for task text, type, assignment, and date (if applicable).
 *
 * Props:
 * - open (boolean): Controls the visibility of the dialog.
 * - closeCallback (function): Function to close the dialog.
 * - currentData (object): Data of the message to edit.
 */
const EditMessageModal = ({
  open,
  closeCallback,
  currentData,
}) => {
  dayjs.extend(updateLocale)
  dayjs.updateLocale('en', {
    weekStart: 1,
  })
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

  const handleDateClick = (e) => {
    if (e.target.type === 'date' && e.target.showPicker) {
      e.target.showPicker()
    }
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
          value={inputData.title}
        />

        {/* Select Field for Task Type */}

        <FormControl variant="standard" sx={{ mt: 2 }} fullWidth>
          <SelectLine list={[
            { value: 'type1', text: 'Current' },
            { value: 'type2', text: 'Future' },
            { value: 'type3', text: 'To Buy' }]}
                      handleValueChange={(value) => handleInputDataChange(
                        { type: value })}
                      value={inputData.type}
          />
        </FormControl>

        <FormControl variant="standard" sx={{ mt: 2 }} fullWidth>
          <SelectLine sx={{
            fontSize: '30px'
          }} list={[
            { value: '', text: '⊘' },
            { value: '1', text: '🐈' },
            { value: '2', text: '🌸' }]}
                      handleValueChange={(value) => handleInputDataChange(
                        { belongsTo: value })}
          value={inputData.belongsTo}
          />
        </FormControl>

        {inputData.type === 'type1' && (
          <FormControl variant="standard" sx={{ mt: 2 }} fullWidth>
            <TextField
              id="date"
              name="date"
              label="Date"
              type="date"
              onClick={handleDateClick}
              value={inputData.date}
              onChange={(e) => handleInputDataChange({ date: e.target.value })}
              variant="standard"
              fullWidth
            />
          </FormControl>
        )}

        <FormControl variant="standard" sx={{ mt: 2 }} fullWidth>
          <SelectLine sx={{
            fontSize: '30px'
          }} list={[
            { value: '', text: '⊘' },
            { value: groups.important.name, text: groups.important.emoji },
            { value: groups.birthday.name, text: groups.birthday.emoji }]}
                      handleValueChange={(value) => handleInputDataChange(
                        { group: value })}
                      value={inputData.group}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button
          variant="contained"
          type="submit"
          endIcon={<Send/>}
          disabled={!inputData.title.trim()}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default React.memo(EditMessageModal)
