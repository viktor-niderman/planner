import React from 'react'
import './App.css'
import MainPage from './MainPage.jsx'
import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material'
import theme from './modules/theme.js'
import { initializeMobileDetection } from './store/styleStore.js'
import ModalContainer from './components/Modals/ModalContainer.jsx'

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
