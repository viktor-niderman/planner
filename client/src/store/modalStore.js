import { create } from 'zustand';

const useModalStore = create((set) => ({
  modals: [], // Стек модальных окон
  openModal: (ModalComponent, props = {}) =>
    set((state) => ({
      modals: [...state.modals, { ModalComponent, props }],
    })),
  closeModal: () =>
    set((state) => ({
      modals: state.modals.slice(0, -1),
    })),
  closeAllModals: () => set({ modals: [] }),
}));

export default useModalStore;
