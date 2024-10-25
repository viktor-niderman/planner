import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#1A2FC1', // Main color for light theme
          light: '#4D63F0', // Light shade of the main color
          dark: '#0019B2', // Dark shade of the main color
          contrastText: '#ffffff', // Text color on the primary color
        },
        secondary: {
          main: '#FF4081', // Secondary main color
          light: '#FF79B0',
          dark: '#C60055',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f5f5f5', // Main background for light theme
          paper: '#ffffff', // Background for Paper components (dialogs, cards, etc.)
          notMyTasks: '#FFF8E1', // Custom color for tasks that are not mine
        },
        text: {
          primary: '#212121', // Main text color
          secondary: '#757575', // Secondary text color
          disabled: '#BDBDBD', // Color for disabled text
        },
        error: {
          main: '#D32F2F',
          light: '#FF6659',
          dark: '#9A0007',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#ED6C02',
          light: '#FF9800',
          dark: '#E65100',
          contrastText: '#ffffff',
        },
        info: {
          main: '#0288D1',
          light: '#03A9F4',
          dark: '#01579B',
          contrastText: '#ffffff',
        },
        success: {
          main: '#2E7D32',
          light: '#4CAF50',
          dark: '#1B5E20',
          contrastText: '#ffffff',
        },
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Enhanced shadow
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#4e69b1',
          light: '#7A8BE8',
          dark: '#003ba2',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#FF4081',
          light: '#FF79B0',
          dark: '#C60055',
          contrastText: '#ffffff',
        },
        background: {
          default: '#121212',
          paper: '#1d1d1d',
          notMyTasks: '#424242',
        },
        text: {
          primary: '#ffffff',
          secondary: '#BDBDBD',
          disabled: '#757575',
        },
        error: {
          main: '#f44336',
          light: '#e57373',
          dark: '#d32f2f',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#ffa726',
          light: '#ffb74d',
          dark: '#f57c00',
          contrastText: '#ffffff',
        },
        info: {
          main: '#29b6f6',
          light: '#4fc3f7',
          dark: '#0288d1',
          contrastText: '#ffffff',
        },
        success: {
          main: '#66bb6a',
          light: '#81c784',
          dark: '#388e3c',
          contrastText: '#ffffff',
        },
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.7)', // Enhanced shadow for dark theme
      },
    },
  },
  typography: {
    // Typography settings if needed
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    // Add other typography settings
  },
  components: {
    // MUI component settings if needed
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
        },
      },
    },
    // Add other components if needed
  },
})

export default theme
