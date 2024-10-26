// DraggableTableRow.jsx
import React from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { TableRow, TableCell, Checkbox } from '@mui/material'

const DraggableTableRow = ({ row, isMyTask, isNotMyTask, onCheck, onClick }) => {
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
        bgcolor: isNotMyTask ? 'background.notMyTasks' : '',
        ...style,
      }}
    >
      <TableCell
        component="th"
        scope="row"
        sx={{ fontWeight: isMyTask ? '400' : '100' }}
        onClick={onClick}
      >
        {row.text}
      </TableCell>
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          onChange={(e) => onCheck(row.id, e.target.checked)}
          inputProps={{ 'aria-label': 'select all desserts' }}
          sx={{ color: '#c1caca' }}
        />
      </TableCell>
    </TableRow>
  )
}

export default DraggableTableRow
