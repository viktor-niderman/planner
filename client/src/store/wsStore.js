// store.js
import { create } from 'zustand';
import WSClient from '../modules/wsClient.js'
import useUserStore from './userStore.js'
import useSettingsStore from './settingsStore.js'

const useWSStore = create((set, get) => {

  const wsClient = new WSClient(`${process.env.SERVER_HOST}:${process.env.PORT}`);


  // Set initial state
  wsClient.addChangeListener((newDoc) => {
    set({ messages: newDoc.messages || [] });
    updateVisibleMessages();
  });

  // Close the WebSocket connection when the store is destroyed
  const cleanup = () => {
    if (wsClient && wsClient.ws) {
      wsClient.ws.close();
    }
  };

  const updateVisibleMessages = () => {
    const { messages } = get();
    const { seePosition } = useSettingsStore.getState();
    const userId = useUserStore.getState().id;

    const visibleMessages = !seePosition
      ? messages.filter((msg) => !msg.belongsTo || +msg.belongsTo === userId)
      : messages;

    set({ visibleMessages });
  };

  // Подписка на изменения всего состояния useSettingsStore
  useSettingsStore.subscribe((settingsState) => {
    const currentSeePosition = settingsState.seePosition;
    const previousSeePosition = get().seePosition;
    if (currentSeePosition !== previousSeePosition) {
      set({ seePosition: currentSeePosition }); // Обновляем локально
      updateVisibleMessages();
    }
  });

  // Подписка на изменения всего состояния useUserStore
  useUserStore.subscribe((userState) => {
    const currentUser = userState.user;
    const previousUser = get().user;
    if (currentUser?.id !== previousUser?.id) {
      set({ user: currentUser }); // Обновляем локально
      updateVisibleMessages();
    }
  });

  return {
    messages: [],
    visibleMessages: [],
    wsMessages: {
      add: (message) => wsClient.addMessage(message),
      edit: (id, message) => wsClient.editMessage(id, message),
      delete: (id) => wsClient.deleteMessage(id),
      export: () => wsClient.exportData(),
      import: (file) => wsClient.importData(file),
    },
    cleanup,
  };
});

// Subscribe to the store and call the cleanup function when the component is unmounted
useWSStore.subscribe((state) => {
  if (typeof state.cleanup === 'function') {
    return state.cleanup;
  }
});

export default useWSStore;
