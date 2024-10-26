// useWSStore.js
import { create } from 'zustand'
import WSClient from '@src/modules/wsClient.js'
import useUserStore from '@src/store/userStore.js'
import useSettingsStore from '@src/store/settingsStore.js'

const useWSStore = create((set, get) => {

  const wsClient = new WSClient(
    `${process.env.SERVER_HOST}:${process.env.PORT}`)

  // Set initial state
  wsClient.addChangeListener((newDoc) => {
    set({ messages: newDoc.messages || [] })
    updateVisibleMessages()
  })

  // Close the WebSocket connection when the store is destroyed
  const cleanup = () => {
    if (wsClient && wsClient.ws) {
      wsClient.ws.close()
    }
  }

  const updateVisibleMessages = () => {
    const { messages } = get()
    const { canSeeOthersMessages } = useSettingsStore.getState()
    const userId = useUserStore.getState().id

    const visibleMessages = !canSeeOthersMessages
      ? messages.filter((msg) => !msg.belongsTo || +msg.belongsTo === userId)
      : messages

    set({ visibleMessages })
  }

  // Add a listener to the settings store
  useSettingsStore.subscribe((settingsState) => {
    const currentcanSeeOthersMessages = settingsState.canSeeOthersMessages
    const previouscanSeeOthersMessages = get().canSeeOthersMessages
    if (currentcanSeeOthersMessages !== previouscanSeeOthersMessages) {
      set({ canSeeOthersMessages: currentcanSeeOthersMessages }) // Update locally
      updateVisibleMessages()
    }
  })

  // Add a listener to the user store
  useUserStore.subscribe((userState) => {
    const currentId = userState.id
    const previousId = get().id
    if (currentId !== previousId) {
      updateVisibleMessages()
    }
  })

  return {
    messages: [],
    visibleMessages: [],
    wsMessages: {
      add: (message) => {
        const lastPosition = get()?.
          messages?.
          filter(el => el.type === message.type && el.date === message.date)?.
          sort((a, b) => a.position - b.position)?.
          at(-1)?.position ?? 0
        message.position = lastPosition + 1000
        wsClient.addMessage(message)
      },
      edit: (id, message) => wsClient.editMessage(id, message),
      delete: (id) => wsClient.deleteMessage(id),
      export: () => wsClient.exportData(),
      import: (file) => wsClient.importData(file),
      update: (id, changes) => {
        const message = get().messages.find((msg) => msg.id === id)
        if (!message) return
        wsClient.editMessage(id, { ...message, ...changes })
      },
    },
    cleanup,
  }
})

// Subscribe to the store and call the cleanup function when the component is unmounted
useWSStore.subscribe((state) => {
  if (typeof state.cleanup === 'function') {
    return state.cleanup
  }
})

export default useWSStore
