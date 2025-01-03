import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Box,
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
  defaultInputData,
} from '@src/modules/constants.js'
import useWSStore from '@src/store/wsStore.js'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import SelectLine from '@src/components/SelectLine.jsx'
import messagesTypes from '@src/modules/messagesTypes.js'
import SelectTag from '@src/components/SelectTag.jsx'
import tags from '@src/modules/tags.js'

/**
 * EditMessageModal Component
 *
 * This component renders a dialog for adding or editing tasks.
 * It includes fields for task title, type, assignment, and date (if applicable).
 *
 * Props:
 * - open (boolean): Controls the visibility of the dialog.
 * - closeCallback (function): Function to close the dialog.
 * - currentData (object): Data of the message to edit.
 */
const EditMessageModal = ({
  open, closeCallback, currentData,
}) => {
  dayjs.extend(updateLocale)
  dayjs.updateLocale('en', {
    weekStart: 1,
  })

  const [inputData, setInputData] = useState(defaultInputData)
  const autoFocusBoxRef = useRef(null)
  const { wsMessages } = useWSStore()

  useEffect(() => {
    if (open) {
      setInputData({ ...defaultInputData, ...currentData })
      focusTitleField()
    }
  }, [open, currentData])

  const focusTitleField = () => {
    setTimeout(() => {
      if (autoFocusBoxRef.current) {
        autoFocusBoxRef.current.focus()
      }
    }, 50)
  }

  const prepareMessage = useCallback((message) => {
    const preparedMessage = { ...message }

    if (!preparedMessage.id) {
      preparedMessage.id = uuidv4()
    }

    return preparedMessage
  }, [])

  const handleInputDataChange = useCallback((valueObject) => {
    setInputData((prevData) => ({
      ...prevData, ...valueObject,
    }))
  }, [])

  const handleSetTag = (tagName, value) => {
    setInputData((prevState) => ({
      ...prevState, tags: {
        ...prevState.tags, [tagName]: value,
      },
    }))
  }

  const handleDateClick = (e) => {
    if (e.target.type === 'date' && e.target.showPicker) {
      e.target.showPicker()
    }
  }

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
      // If adding, reset the title field for a new entry
      handleInputDataChange({ title: '' })
      focusTitleField()
    }
  }, [
    saveMessage,
    inputData.id,
    currentData.id,
    handleCloseDialog,
    handleInputDataChange])

  return (<Dialog
    open={open}
    onClose={handleCloseDialog}
    PaperProps={{
      sx: {
        position: 'absolute', top: '5%', minWidth: '400px'
      }, component: 'form', onSubmit: handleFormSubmit,
    }}
    aria-labelledby="edit-dialog-title"
  >
    <DialogTitle id="edit-dialog-title">
      {inputData.id ? 'Edit Task' : 'Add New Task'}
    </DialogTitle>
    <DialogContent>
      <TextField
        sx={{ minWidth: '250px' }}
        inputRef={autoFocusBoxRef}
        required
        margin="dense"
        id="title"
        name="title"
        label="Title"
        type="text"
        fullWidth
        autoComplete="off"
        variant="standard"
        onChange={(e) => handleInputDataChange({ title: e.target.value })}
        value={inputData.title}
      />

      {inputData.type === messagesTypes.calendar &&
        (<FormControl variant="standard" sx={{ mt: 2, mb: 2 }} fullWidth>
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
        </FormControl>)}

      <DialogActions sx={{mb: 2}}>
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

      <Box sx={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
        <Box>
          <FormControl variant="standard" fullWidth>
            <SelectLine sx={{
              fontSize: '30px',
            }} list={[
              { value: '', text: '⊘' },
              { value: tags.selectable.onlyFor.cat, text: '🐈' },
              { value: tags.selectable.onlyFor.caramel, text: '🌸' }]}
                        handleValueChange={(value) => handleSetTag('onlyFor',
                          value)}
                        value={inputData.tags.onlyFor ?? ''}
            />
          </FormControl>
        </Box>
        <Box>
          {inputData.type === messagesTypes.calendar && (<SelectTag
            title={'Birthday'}
            text={'🎂'}
            handleValueChange={() => handleSetTag(tags.booleans.is_birthday, !inputData.tags[tags.booleans.is_birthday])}
            isSelected={inputData.tags[tags.booleans.is_birthday]}
          />)}
          <SelectTag
            title={'Important'}
            text={'❗'}
            handleValueChange={() => handleSetTag(tags.booleans.is_important, !inputData.tags[tags.booleans.is_important])}
            isSelected={inputData.tags[tags.booleans.is_important]}
          />
        </Box>
      </Box>
      <Box>
        <TextField
          sx={{ mt: 2, width: '100%' }}
          id="outlined-multiline-static"
          label="Description"
          multiline
          rows={4}
          onChange={(e) => handleInputDataChange({ description: e.target.value })}
          value={inputData.description}
        />
      </Box>

    </DialogContent>
  </Dialog>)
}

export default React.memo(EditMessageModal)
