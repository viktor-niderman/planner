import React from 'react'
import {
  TableRow,
  TableCell,
  Checkbox,
} from '@mui/material'
import { useDraggable } from '@dnd-kit/core'
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import useModalStore from '@src/store/modalStore.js'
import useUserStore from '@src/store/userStore.js'
import useWSStore from '@src/store/wsStore.js'

const DraggableTableRow = ({ row, changeSelected, selected }) => {
  const user = useUserStore()
  const { wsMessages } = useWSStore()
  const { openModal } = useModalStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useDraggable({
    id: row.id,
  })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  }

  const isNotMyTask = row.belongsTo && +row.belongsTo !== user.id
  const isMyTask = +row.belongsTo === user.id

  return (
    <TableRow
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      hover
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        cursor: 'grab',
        bgcolor: isNotMyTask ? 'background.notMyTasks' : '',
        ...style,
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
          onChange={(e) => {
            changeSelected(row.id, e.target.checked)
          }}
          inputProps={{
            'aria-label': 'select task',
          }}
          sx={{
            color: '#c1caca',
          }}
        />
      </TableCell>
    </TableRow>
  )
}

export default DraggableTableRow
