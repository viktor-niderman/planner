import { Box, useTheme } from '@mui/material'
import AddTaskButton from '@src/components/Buttons/AddTaskButton.jsx'
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import useModalStore from '@src/store/modalStore.js'
import ListToDay from '@src/components/ListToDay.jsx'
import useWSStore from '@src/store/wsStore.js'

export const TasksPage = () => {
  const { openModal } = useModalStore()
  const { messages, wsMessages, messagesTasks } = useWSStore()
  const theme = useTheme()
  console.log(messagesTasks)

  return (
    <>
      {
        <Box
          className="message-type-section"
          sx={{
            boxShadow: theme.palette.boxShadow,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              padding: '0 5px',
            }}
          >
            {/*<AddTaskButton onClick={() => {*/}
            {/*  openModal(EditMessageModal, { currentData: { type } })*/}
            {/*}}/>*/}
          </Box>
          <Box sx={{ padding: '0 7px' }}>
            {JSON.stringify(messagesTasks)}
            {/*<ListToDay*/}
            {/*  date={date}*/}
            {/*  messages={messages}*/}
            {/*  type={type}*/}
            {/*  dateIndex={dateIndex} // Use unique key for each day*/}
            {/*/>*/}
          </Box>
        </Box>
      }

    </>
  )
}
