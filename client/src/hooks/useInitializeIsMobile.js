import { useTheme, useMediaQuery } from '@mui/material'
import { useEffect } from 'react'
import styleStore from '../store/styleStore.js'

const useInitializeIsMobile = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const setIsMobile = styleStore((state) => state.setIsMobile)

  useEffect(() => {
    setIsMobile(isMobile)
  }, [isMobile, setIsMobile])
}

export default useInitializeIsMobile
