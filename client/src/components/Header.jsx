import React from 'react'
import {
  Box, Button, Menu, MenuItem,
} from '@mui/material'
import useUserStore from '../store/userStore.js'
import ThemeSwitcher from './ThemeSwitcher.jsx'

function Header (props) {
  const user = useUserStore()

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box className="header" sx={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 5px 0',
    }}>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        Dashboard
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={props.exportCallback}>Export</MenuItem>
        <MenuItem>
          <input type="file" accept=".json"
                 onChange={props.importCallback}
                 className="import-input"/>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          {user.name}
        </MenuItem>
      </Menu>
      <div>
        <ThemeSwitcher/>
      </div>
    </Box>
  )
}

export default Header
