import { create } from 'zustand';
import { useTheme, useMediaQuery } from '@mui/material';
import { useEffect } from 'react'

const useStyleStore = create((set) => ({
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),
}));

export const initializeMobileDetection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const setIsMobile = useStyleStore((state) => state.setIsMobile);

  useEffect(() => {
    setIsMobile(isMobile);
  }, [isMobile, setIsMobile]);
};

export default useStyleStore;
