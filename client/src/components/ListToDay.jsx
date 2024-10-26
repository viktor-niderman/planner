// ListToDay.jsx
import React from 'react'
import AddTaskButton from '@src/components/Buttons/AddTaskButton.jsx'
import { Box } from '@mui/material'
import { format } from 'date-fns'
import ListMessages from '@src/components/ListMessages.jsx'
import EditMessageModal from '@src/components/Modals/EditMessageModal.jsx'
import useModalStore from '@src/store/modalStore.js'

function ListToDay({ listId, date, messages, type }) {
  const { openModal } = useModalStore()

  const getFormattedDate = (date) => {
    if (!date) return null
    const parsedDate = new Date(date)
    if (isNaN(parsedDate)) {
      // Не выводить ошибку, так как для type2 и type3 дата отсутствует
      return null
    }
    try {
      return format(parsedDate, 'd MMMM (EEE)')
    } catch (e) {
      console.error(e)
      return null
    }
  }

  return (
    <div className="date-section">
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        {date && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <strong>{getFormattedDate(date)}</strong>
            <AddTaskButton
              onClick={() => {
                openModal(EditMessageModal, { currentData: { type, date } })
              }}
            />
          </Box>
        )}
      </Box>

      <ListMessages messages={messages} listId={listId} type={type} />
    </div>
  )
}

export default ListToDay
