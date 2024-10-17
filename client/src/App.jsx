import React from 'react'
import './App.css'
import MainPage from './MainPage.jsx'
import useInitializeIsMobile from './hooks/useInitializeIsMobile.js'

function App () {
  useInitializeIsMobile();
  return (
    <MainPage/>
  )
}

export default App
