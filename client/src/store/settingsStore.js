import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      seePosition: 0,

      setState: (newValue) =>
        set((state) => ({
          ...state,
          ...newValue,
        })),
    }),
    {
      name: 'settings',
      getStorage: () => localStorage,
    }
  )
);

export default useSettingsStore;