import React from 'react'
import {
  Box,
  Tab,
  Tabs,
} from '@mui/material'
import styleStore from '../store/styleStore.js'

function App (props) {
  const isMobile = styleStore((state) => state.isMobile);

  return (
    <footer>
      {
        isMobile && <Box sx={{
          position: 'fixed',
          bottom: 'env(safe-area-inset-bottom)',
          inset: 'auto 0 0 0',
          width: '100vw',
          background: 'white',
          boxShadow: '-2px 1px 1px 1px black',
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Tabs value={props.currentTab} onChange={(e, tab) => {props.setCurrentTab(tab)}}>
              <Tab label="Current"/>
              <Tab label="Future"/>
              <Tab label="To Buy"/>
            </Tabs>
          </Box>
        </Box>}
    </footer>
  )
}

export default App
