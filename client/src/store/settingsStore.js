import { create } from 'zustand';

const useSettingsStore = create((set) => ({
  seePosition: 0,

  setState: (newValue) =>
    set((state) => ({
      ...state,
      ...newValue,
    })),
}));

export default useSettingsStore;
