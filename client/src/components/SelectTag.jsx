import React from 'react'
import {
  Box, FormControl,
} from '@mui/material'

function SelectLine ({
  title, text, handleValueChange, isSelected,
}) {

  return (<FormControl variant="standard" sx={{
    mt: 2,
    fontSize: '30px',
    userSelect: 'none',
    width: '40px',
    textAlign: 'center',
    cursor: 'pointer',
  }}>
    <Box title={title} onClick={() => handleValueChange()} className={{
      'is-selected-tag': isSelected,
    }}>
      {text}
    </Box>
  </FormControl>)
}

export default SelectLine
