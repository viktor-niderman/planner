import React from 'react'
import { Box, Checkbox, Typography, Paper, Button } from '@mui/material'
import useUserStore from '@src/store/userStore.js'
import useWSStore from '@src/store/wsStore.js'
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import useModalStore from '@src/store/modalStore.js'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import tags from '@src/modules/tags.js'

function ListMessages (props) {
  const user = useUserStore()
  const { wsMessages } = useWSStore()
  const { openModal } = useModalStore()

  const [selected, setSelected] = React.useState([])

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
    <Paper sx={{ padding: '8px', position: 'relative' }}>
      <Box visibility={selected.length === 0 ? 'hidden' : 'visible'} sx={{
        position: 'absolute',
        top: '0',
        right: '42px',
      }}>
        <Button variant="contained" color="error"
                size="small"
                onClick={handleDeleteMessages}>
          Delete
        </Button>
      </Box>

      <Droppable droppableId={props.droppableId}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            {props.messages.map((row, index) => {
              const isNotMyTask = row.belongsTo && +row.belongsTo !== user.id
              const isMyTask = +row.belongsTo === user.id
              const isImportant = row.tags[tags.booleans.is_important]
              return (
                <Draggable key={row.id} draggableId={row.id} index={index}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 6px',
                        borderRadius: '8px',
                        boxShadow: snapshot.isDragging ? '0 0 .4rem #666' : '0 1px 3px rgba(0,0,0,0.2)',
                        backgroundColor: isNotMyTask ? 'background.notMyTasks' : 'background.paper',
                        cursor: 'pointer',
                        border: '1px solid transparent',
                        borderColor: isImportant ? 'red' : 'transparent',
                      }}
                    >
                      <Typography
                        onClick={() => { openModal(EditMessageModal, { currentData: row }) }}
                        sx={{
                          fontWeight: isMyTask ? '400' : '100',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {row.title}
                      </Typography>
                      <Checkbox
                        color="primary"
                        checked={selected.includes(row.id)}
                        onChange={(e) => {
                          changeSelected(row.id, e.target.checked)
                        }}
                        inputProps={{
                          'aria-label': 'select message',
                        }}
                        sx={{
                          color: '#c1caca',
                        }}
                      />
                    </Box>
                  )}
                </Draggable>
              )
            })}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  )
}

export default ListMessages
