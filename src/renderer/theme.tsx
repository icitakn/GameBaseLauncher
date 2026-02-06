import { createTheme } from '@mui/material'
import { blue, red } from '@mui/material/colors'

const theme = createTheme({
  cssVariables: true,
  typography: {
    fontSize: 11
  },
  palette: {
    primary: {
      main: blue.A400,
      contrastText: '#fafafa'
    },
    secondary: {
      main: '#ff7043'
    },
    error: {
      main: red.A400,
      contrastText: '#fff'
    },
    content: {
      main: '#f5f5f5'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px'
        },
        sizeLarge: {
          borderRadius: '26px'
        },
        sizeSmall: {
          borderRadius: '12px'
        }
      }
    }
  }
})

export default theme
