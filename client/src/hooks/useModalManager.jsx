import { useState, useCallback } from 'react'

const useModalManager = (ModalComponent) => {
  const [isOpen, setIsOpen] = useState(false)
  const [modalProps, setModalProps] = useState({})

  const openModalWithData = useCallback((props = {}) => {
    setModalProps({ currentData: { ...props } })
    setIsOpen(true)
  }, [])

  const openModal = useCallback((props = {}) => {
    setModalProps(props)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setModalProps({})
  }, [])

  const ModalWrapper = isOpen ? (
    <ModalComponent {...modalProps} open={isOpen} closeCallback={closeModal}/>
  ) : null

  return {
    openModal,
    closeModal,
    ModalWrapper,
    openModalWithData,
  }
}

export default useModalManager
