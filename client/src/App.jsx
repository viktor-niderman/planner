import React from 'react'
import './App.css'
import MainPage from './MainPage.jsx'
import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material'
import theme from './modules/theme.js'
import { initializeMobileDetection } from './store/styleStore.js'

function App () {
  initializeMobileDetection()
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline/>
      <MainPage/>
    </ThemeProvider>
  )
}

export default App
