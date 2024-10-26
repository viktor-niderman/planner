import React from 'react';
import useModalStore from '../../store/modalStore';
import ReactDOM from 'react-dom';

const ModalContainer = () => {
  const { modals, closeModal } = useModalStore();

  if (modals.length === 0) return null;

  return ReactDOM.createPortal(
    <>
      {modals.map((modal, index) => {
        const { ModalComponent, props } = modal;
        const isTopMost = index === modals.length - 1;

        return (
          <ModalComponent
            key={index}
            {...props}
            open={true}
            closeCallback={isTopMost ? closeModal : undefined}
          />
        );
      })}
    </>,
    document.getElementById('modal-root')
  );
};

export default ModalContainer;
