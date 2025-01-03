import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
  persist(
    (set) => ({
      messagesOfCat: false,
      messagesOfCaramel: false,

      toggleState: (key) =>
        set((state) => ({
          [key]: !state[key],
        })),
    }),
    {
      name: 'settings',
    },
  ),
)

export default useSettingsStore
