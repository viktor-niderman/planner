import React from 'react'
import { Box, Button, Menu, MenuItem } from '@mui/material'
import useUserStore from '@src/store/userStore.js'
import ThemeSwitcher from '@src/components/Buttons/ThemeSwitcher.jsx'
import useSettingsStore from '@src/store/settingsStore.js'
import useWSStore from '@src/store/wsStore.js'

function Header (props) {
  const user = useUserStore()
  const { canSeeOthersMessages, showCalendar, toggleState } = useSettingsStore()
  const { wsMessages } = useWSStore()

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const canSeeOthersMessagesVariants = {
    true: '🙉',
    false: ' 🙈',
  }
  const showCalendarVariants = {
    true: '📅',
    false: '🗓️',
  }

  return (
    <Box className="header" sx={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 5px 0',
      position: 'fixed',
      width: '100%',
      bgcolor: 'background.default',
      zIndex: '999',
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
        <MenuItem onClick={wsMessages.export}>Export</MenuItem>
        <MenuItem>
          <input type="file" accept=".json"
                 onChange={wsMessages.import}
                 className="import-input"/>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          {user.name}
        </MenuItem>
      </Menu>
      <div>
        <Button onClick={() => toggleState('canSeeOthersMessages')}>
          {canSeeOthersMessagesVariants[canSeeOthersMessages]}
        </Button>
        <Button onClick={() => toggleState('showCalendar')}>
          {showCalendarVariants[showCalendar]}
        </Button>
      </div>
      <div>
        <ThemeSwitcher/>
      </div>
    </Box>
  )
}

export default Header
