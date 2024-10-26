import React, { useState } from 'react'
import {
  Box, Button,
  Checkbox,
  Paper,
  Table,
  TableBody, TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import useUserStore from '../store/userStore.js'
import useWSStore from '../store/wsStore.js'
import EditMessageModal from './Modals/EditMessageModal.jsx'
import useModalStore from '../store/modalStore.js'

function ListToDay (props) {
  const user = useUserStore()
  const [selected, setSelected] = useState([])
  const { wsMessages } = useWSStore()
  const openModal = useModalStore((state) => state.openModal);

  const changeSelected = (id, state) => {
    if (state) {
      setSelected([...selected, id])
    } else {
      setSelected(selected.filter((item) => item !== id))
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
      <Box visibility={selected.length === 0 ? 'hidden' : 'visible'} sx={{
        position: 'absolute',
        top: '0',
        right: '42px',
      }}>
        <Button variant="contained" color="error"
                size={'small'}
                onClick={handleDeleteMessages}>
          Delete
        </Button>
      </Box>
      <Table sx={{ width: '100%' }} aria-label="simple table"
             size="small">
        <TableBody>
          {props.messages.map((row) => {
            const isNotMyTask = row.belongsTo &&
              +row.belongsTo !== user.id
            const isMyTask = +row.belongsTo === user.id
            return (
              <TableRow
                hover
                key={row.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                  bgcolor: isNotMyTask
                    ? 'background.notMyTasks'
                    : '',
                }}
              >
                <TableCell component="th" scope="row"
                           sx={{
                             fontWeight: isMyTask ? '400' : '100',
                           }}
                           onClick={() => {openModal(EditMessageModal, { currentData: row })}}>
                  {row.text}
                </TableCell>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    onChange={(e) => {
                      changeSelected(row.id, e.target.checked)
                    }}
                    inputProps={{
                      'aria-label': 'select all desserts',
                    }}
                    sx={{
                      color: '#c1caca',
                    }}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ListToDay
