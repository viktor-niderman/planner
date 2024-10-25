import React, { useState } from 'react'
import AddTaskButton from './AddTaskButton.jsx'
import {
  Box, Button,
  Checkbox,
  Paper,
  Table,
  TableBody, TableCell,
  TableContainer,
  TableRow,
} from '@mui/material'
import { format } from 'date-fns'
import useUserStore from '../store/userStore.js'
import useWSStore from '../store/wsStore.js'

function ListToDay (props) {
  const user = useUserStore()
  const [selected, setSelected] = useState([])
  const { wsMessages} = useWSStore();

  const getFormattedDate = (date) => {
    let formattedDate = 'no-date'
    if (date) {
      try {
        formattedDate = format(new Date(date), 'd MMMM (EEE)')
      } catch (e) {
        console.error(e)
      }
    }
    return formattedDate
  }

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
    <div className="date-section">

      <Box sx={{
        display: 'flex',
      }}>

        {props.date &&
          <Box>
            <strong>{getFormattedDate(props.date)}</strong>
            <AddTaskButton onClick={() => {
              props.openEditModal({ type: props.type, date: props.date })
            }}/>
          </Box>
        }
        <Box visibility={selected.length === 0 ? "hidden" : "visible"}>
          <Button variant="contained" color="error"
                  size={'small'}
                  onClick={handleDeleteMessages}>
            Delete
          </Button>
        </Box>
      </Box>


      <TableContainer component={Paper}>
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
                             onClick={() => {
                               props.openEditModal(row)
                             }}>
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
    </div>
  )
}

export default ListToDay
