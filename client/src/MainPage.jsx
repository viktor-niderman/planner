import React, { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import './App.css'
import WSClient from './modules/wsClient.js'
import {
  Box,
  Button, Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell, TableContainer,
  TableRow,
} from '@mui/material'
import Footer from './components/Footer.jsx'
import styleStore from './store/styleStore.js'
import EditDialog from './components/EditDialog.jsx'
import Header from './components/Header.jsx'
import AddTaskButton from './components/AddTaskButton.jsx'

function MainPage () {
  const [doc, setDoc] = useState(() => [])
  const [currentTab, setCurrentTab] = useState(0)
  const wsClient = useRef(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const isMobile = styleStore((state) => state.isMobile)
  const [currentData, setCurrentData] = useState({})
  const [selected, setSelected] = useState([])

  const changeSelected = (id, state) => {
    if (state) {
      setSelected([...selected, id])
    } else {
      setSelected(selected.filter((item) => item !== id))
    }
  }

  useEffect(() => {
    wsClient.current = new WSClient(
      `${process.env.SERVER_HOST}:${process.env.PORT}`)

    wsClient.current.addChangeListener((newDoc) => {
      setDoc(newDoc.messages || [])
    })

    return () => {
      if (wsClient.current) {
        wsClient.current.ws.close()
      }
    }
  }, [])

  const wsMessages = {
    add: (message) => {
      wsClient.current.addMessage(message)
    },
    edit: (id, message) => {
      wsClient.current.editMessage(id, message)
    },
    delete: (id) => {
      wsClient.current.deleteMessage(id)
    },
    export: () => {wsClient.current.exportData()},
    import: (event) => {
      const file = event.target.files[0]
      if (file) {
        wsClient.current.importData(file)
      }
    },
  }

  const getFormattedMessages = (type) => {
    if (!doc) return []
    return doc.filter((msg) => msg.type === type).
      sort((a, b) => new Date(a.date) - new Date(b.date)).
      reduce((acc, msg) => {
        if (!acc[msg.date]) acc[msg.date] = []
        acc[msg.date].push(msg)
        return acc
      }, {})
  }
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

  const openEditModal = (data) => {
    setCurrentData({ ...data })
    setIsEditModalOpen(true)
  }

  const handleDeleteMessages = () => {
    selected.forEach((id) => {
      wsMessages.delete(id)
    })
    setSelected([])
  }

  return (
    <div className="app-container">
      <Header importCallback={wsMessages.import}
              exportCallback={wsMessages.export}/>
      <Box sx={{ position: 'fixed', top: '20px', right: '10px' }}
           hidden={selected.length === 0}>
        <Button variant="contained" color="error"
                onClick={handleDeleteMessages}>
          Delete
        </Button>
      </Box>
      <div className="messages-container">
        {['type1', 'type2', 'type3'].map((type, indexType) => (
          <Box key={type} className="message-type-section"
               hidden={isMobile && type !== 'type' + (currentTab + 1)}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <AddTaskButton onClick={() => {
                openEditModal({ type: type })
              }}/>
            </Box>

            {Object.entries(getFormattedMessages(type)).
              map(([date, messages]) => (
                  <div key={date} className="date-section">
                    {type === 'type1' &&
                      <div>
                        <strong>{getFormattedDate(date)}</strong>
                        <AddTaskButton onClick={() => {
                          openEditModal({ type: type, date: date })
                        }}/>
                      </div>
                    }

                    <TableContainer component={Paper}>
                      <Table sx={{ width: '100%' }} aria-label="simple table"
                             size="small">
                        <TableBody>
                          {messages.map((row) => (
                            <TableRow
                              hover
                              key={row.id}
                              sx={{
                                '&:last-child td, &:last-child th': { border: 0 },
                                cursor: 'pointer',
                              }}
                            >
                              <TableCell component="th" scope="row"
                                         onClick={() => {
                                           openEditModal(row)
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
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                ),
              )}
          </Box>
        ))}
      </div>
      <Footer currentTab={currentTab} setCurrentTab={setCurrentTab}/>

      <EditDialog
        open={isEditModalOpen}
        closeCallback={() => setIsEditModalOpen(false)}
        addMessageCallback={wsMessages.add}
        editMessageCallback={wsMessages.edit}
        currentData={currentData}
      />
    </div>
  )
}

export default MainPage
