import React from 'react'
import {
  Box,
} from '@mui/material'
import useUserStore from '../store/userStore.js'

function Header (props) {
  const user = useUserStore()
  return (
    <Box className="header" sx={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 5px 0',
    }}>
      <div className="import-export-section">
        <button onClick={props.exportCallback}
                className="export-button">Export JSON
        </button>
        <input type="file" accept=".json"
               onChange={props.importCallback}
               className="import-input"/>
      </div>
      <div>
        {user.name}
      </div>
    </Box>
  )
}

export default Header
