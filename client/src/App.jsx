import React from 'react'
import './App.css'
import MainPage from './MainPage.jsx'
import useInitializeIsMobile from './hooks/useInitializeIsMobile.js'
import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material'
import theme from './modules/theme.js'

function App () {
  useInitializeIsMobile()
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline/>
      <MainPage/>
    </ThemeProvider>
  )
}

export default App
