import React from 'react'
import {
  Box, FormControl,
} from '@mui/material'

function SelectLine ({
  list, handleValueChange, value, sx
}) {

  return (<FormControl variant="standard" sx={{ mt: 2 }} fullWidth>
    <Box sx={sx} className="select-belongs-to">
      {list.map((item, i) => (
        <Box key={i} onClick={() => handleValueChange(item.value)} className={{
          'is-selected': value === item.value,
        }}>
          {item.title}
        </Box>))}
    </Box>
  </FormControl>)
}

export default SelectLine
