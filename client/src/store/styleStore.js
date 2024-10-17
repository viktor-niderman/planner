import { create } from 'zustand'

const styleStore = create((set) => ({
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),
}))

export default styleStore
