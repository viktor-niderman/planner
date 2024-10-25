import React from 'react'
import {
  Box, Button, useColorScheme,
} from '@mui/material'

function Header (props) {
  const { mode, setMode } = useColorScheme()
  if (!mode) {
    return null
  }
  const modes = [
    'system',
    'dark',
    'light',
  ]
  const setNextMode = () => {
    const currentIndex = modes.indexOf(mode)
    const nextIndex = (currentIndex + 1) % modes.length
    setMode(modes[nextIndex])
  }

  return (
    <Box>
      <Button onClick={setNextMode} size="small" color="info">{mode}</Button>
    </Box>
  )
}

export default Header
