// ListMessages.jsx
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
import useUserStore from '@src/store/userStore.js'
import useWSStore from '@src/store/wsStore.js'
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import useModalStore from '@src/store/modalStore.js'

// Импортируем необходимые хуки из @dnd-kit/core
import {
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'

function ListMessages(props) {
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

            // Настройка draggable для каждой строки
            const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({
              id: row.id,
            })

            // Настройка droppable для каждой строки
            const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
              id: row.id,
            })

            // Объединяем refs для draggable и droppable
            const setNodeRefCombined = (node) => {
              setDraggableNodeRef(node)
              setDroppableNodeRef(node)
            }

            const style = {
              transform: transform
                ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                : undefined,
              opacity: isDragging ? 0.5 : 1,
              cursor: 'grab',
              backgroundColor: isOver ? 'lightgreen' : undefined, // Визуальная подсветка при наведении
            }

            return (
              <TableRow
                hover
                key={row.id}
                ref={setNodeRefCombined} // Объединенный ref
                {...listeners}
                {...attributes}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                  bgcolor: isNotMyTask
                    ? 'background.notMyTasks'
                    : '',
                  ...style,
                }}
              >
                <TableCell component="th" scope="row"
                           sx={{
                             fontWeight: isMyTask ? '400' : '100',
                           }}
                           onClick={() => { openModal(EditMessageModal, { currentData: row }) }}>
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

export default ListMessages
