import React from 'react'
import useModalStore from '@src/store/modalStore'
import ReactDOM from 'react-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import { handleDragEnd } from '@src/modules/dnd.js'
import useWSStore from '@src/store/wsStore.js'

const ModalContainer = () => {
  const { modals, closeModal } = useModalStore()
  const { messages, wsMessages } = useWSStore()

  if (modals.length === 0) return null

  return ReactDOM.createPortal(
    <>
      <DragDropContext onDragEnd={(r) => handleDragEnd(r, messages, wsMessages)}>
        {modals.map((modal, index) => {
          const { ModalComponent, props } = modal
          const isTopMost = index === modals.length - 1

          return (
            <ModalComponent
              key={index}
              {...props}
              open={true}
              closeCallback={isTopMost ? closeModal : undefined}
            />
          )
        })}
      </DragDropContext>
    </>,
    document.getElementById('modal-root'),
  )
}

export default ModalContainer
