import React from 'react'
import './App.css'
import MainPage from './MainPage.jsx'
import useInitializeIsMobile from './hooks/useInitializeIsMobile.js'
import {
  createTheme, CssBaseline,
  styled,
  ThemeProvider,
  useColorScheme,
} from '@mui/material'

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: 'rgba(26,47,193,0.65)', // Main color for light theme
        },
        background: {
          default: '#f5f5f5', // Background color for light theme
          paper: '#ffffff',  // Color for paper elements (dialogs, cards, etc.)
        },
        text: {
          primary: '#000000', // Main text color for light theme
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#4e69b1',
        },
        background: {
          default: '#121212',
          paper: '#1d1d1d',
        },
        text: {
          primary: '#ffffff',
        },
      },
    },
  },

});

function App () {
  useInitializeIsMobile();
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <MainPage/>
    </ThemeProvider>
  )
}

export default App
