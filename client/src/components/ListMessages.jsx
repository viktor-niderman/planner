import React, { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import useUserStore from '@src/store/userStore.js'
import useWSStore from '@src/store/wsStore.js'
import useModalStore from '@src/store/modalStore.js'
import DraggableTableRow from './DraggableTableRow.jsx'

function ListMessages (props) {
  const [selected, setSelected] = useState([])
  const { wsMessages } = useWSStore()
  const { openModal } = useModalStore()

  const changeSelected = (id, state) => {
    if (state) {
      setSelected((prevSelected) => [...prevSelected, id])
    } else {
      setSelected((prevSelected) => prevSelected.filter((item) => item !== id))
    }
  }

  const handleDeleteMessages = () => {
    selected.forEach((id) => {
      wsMessages.delete(id)
    })
    setSelected([])
  }

  return (
    <TableContainer component={Paper} sx={{ position: 'relative' }}>
      <Box
        visibility={selected.length === 0 ? 'hidden' : 'visible'}
        sx={{
          position: 'absolute',
          top: '0',
          right: '42px',
        }}
      >
        <Button
          variant="contained"
          color="error"
          size={'small'}
          onClick={handleDeleteMessages}
        >
          Delete
        </Button>
      </Box>
      <Table sx={{ width: '100%' }} aria-label="simple table" size="small">
        <TableBody>
          {props.messages.map((row, i) => (
            <DraggableTableRow
              key={i}
              row={row}
              changeSelected={changeSelected}
              selected={selected}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ListMessages
