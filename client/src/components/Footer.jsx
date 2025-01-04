import React from 'react'
import {
  Box,
  Tab,
  Tabs,
} from '@mui/material'
import styleStore from '@src/store/styleStore.js'
import { CalendarMonth, ListAlt, ShoppingCart } from '@mui/icons-material'

function App (props) {
  const { isMobile } = styleStore()

  return (
    <footer>
      <Box sx={{
          position: 'fixed',
          bottom: 'env(safe-area-inset-bottom)',
          paddingBottom: '20px',
          inset: 'auto 0 0 0',
          width: '100vw',
          boxShadow: '-2px 1px 1px 1px black',
          bgcolor: 'background.default',
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Tabs value={props.currentTab}
                  onChange={(e, tab) => {props.setCurrentTab(tab)}}>
              <Tab icon={<CalendarMonth />}/>
              <Tab icon={<ListAlt/>}/>
              <Tab icon={<ShoppingCart/>}/>
            </Tabs>
          </Box>
        </Box>
    </footer>
  )
}

export default App
