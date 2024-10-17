import { create } from 'zustand';

const useUserStore = create((set) => ({
  id: null,
  name: '',

  setUser: (userData) =>
    set((state) => {
      return {
        id: userData.id !== undefined ? userData.id : state.id,
        name: userData.name !== undefined ? userData.name : state.name,
      };
    }),

  clearUser: () =>
    set(() => {
      return {
        id: null,
        name: '',
      };
    }),
}));

export default useUserStore;
