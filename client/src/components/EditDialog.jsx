import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, FormControl, InputLabel, MenuItem, Select,
  TextField,
} from '@mui/material'
import { Send } from '@mui/icons-material'

function EditDialog (props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeCallback}
      PaperProps={{
        component: 'form',
        onSubmit: (event) => {
          event.preventDefault();
          props.save();
          props.closeCallback();
        },
      }}
    >
      <DialogTitle>New Task</DialogTitle>
      <DialogContent>
        <TextField
          sx={{minWidth: '250px'}}
          autoFocus
          required
          margin="dense"
          id="text"
          name="text"
          label="Text"
          type="text"
          fullWidth
          variant="standard"
          onChange={e => props.handleEditInputDataChange({text: e.target.value})}
          value={props.inputData.text}
        />
        <FormControl variant="standard" sx={{ mt: 1 }} fullWidth>
          <InputLabel id="demo-simple-select-label">Type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={props.inputData.type}
            label="Type"
            onChange={e => props.handleEditInputDataChange({type: e.target.value})}
          >
            <MenuItem value="type1">Current</MenuItem>
            <MenuItem value="type2">Future</MenuItem>
            <MenuItem value="type3">To Buy</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="standard" sx={{ mt: 1 }}>
          {props.inputData.type === 'type1' &&
            <input
              type="date"
              value={props.inputData.date}
              onChange={e => props.handleEditInputDataChange({date: e.target.value})}
              className="date-input"
            />
          }
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.closeCallback}>Cancel</Button>
        <Button variant="contained"
                type="submit"
                endIcon={<Send/>}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditDialog
