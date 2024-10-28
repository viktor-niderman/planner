import React from 'react'
import {
  Box, FormControl,
} from '@mui/material'

function SelectLine ({
  list, handleValueChange, value
}) {

  return (<FormControl variant="standard" sx={{ mt: 2 }} fullWidth>
    <Box className="select-belongs-to">
      {list.map((item, i) => (
        <Box key={i} onClick={() => handleValueChange(item.value)} className={{
          'is-selected': value === item.value,
        }}>
          {item.text}
        </Box>))}
    </Box>
  </FormControl>)
}

export default SelectLine
