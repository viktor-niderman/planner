// ListMessages.jsx
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
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import useModalStore from '@src/store/modalStore.js'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function ListMessages({ messages, listId, type }) {
  const user = useUserStore()
  const [selected, setSelected] = useState([])
  const { wsMessages } = useWSStore()
  const { openModal } = useModalStore()

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
          {messages.map((row, i) => (
            <SortableMessageRow
              key={i}
              row={row}
              user={user}
              selected={selected}
              changeSelected={changeSelected}
              openModal={openModal}
              listId={listId}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function SortableMessageRow({
  row,
  user,
  selected,
  changeSelected,
  openModal,
  listId,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: row.id,
    data: { listId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isNotMyTask = row.belongsTo && +row.belongsTo !== user.id
  const isMyTask = +row.belongsTo === user.id

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      hover
      {...attributes}
      {...listeners}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        cursor: 'grab',
        bgcolor: isNotMyTask ? 'background.notMyTasks' : '',
      }}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{
          fontWeight: isMyTask ? '400' : '100',
        }}
        onClick={() => {
          openModal(EditMessageModal, { currentData: row })
        }}
      >
        {row.text}
      </TableCell>
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={selected.includes(row.id)}
          onChange={(e) => changeSelected(row.id, e.target.checked)}
          inputProps={{
            'aria-label': 'select message',
          }}
          sx={{
            color: '#c1caca',
          }}
        />
      </TableCell>
    </TableRow>
  )
}

export default ListMessages
