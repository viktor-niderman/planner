import React from 'react'
import '@src/App.css'
import MainPage from '@src/MainPage.jsx'
import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material'
import theme from '@src/modules/theme.js'
import { initializeMobileDetection } from '@src/store/styleStore.js'
import ModalContainer from '@src/components/Modals/ModalContainer.jsx'

function App () {
  initializeMobileDetection()
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline/>
      <ModalContainer />
      <MainPage/>
    </ThemeProvider>
  )
}

export default App
