import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { Menubar } from './components/menubar/menubar'
import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import { FileDialogProvider } from './contexts/filedialog.provider'
import { ConfirmDialogProvider } from './contexts/confirmdialog.provider'
import { ReactElement } from 'react'

const drawerWidth = 200

export default function Layout(): ReactElement {
  return (
    <ConfirmDialogProvider>
      <FileDialogProvider>
        <Box
          sx={{
            display: 'flex',
            minHeight: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: drawerWidth,
              maxWidth: drawerWidth,
              height: '100vh',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              overflowY: 'auto',
              flexShrink: 0
            }}
          >
            <Menubar />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              height: '100vh',
              overflowY: 'auto',
              minWidth: 0,
              bgcolor: 'content.main'
            }}
          >
            <Outlet />
          </Box>
          <ToastContainer theme="colored" autoClose={3000} />
        </Box>
      </FileDialogProvider>
    </ConfirmDialogProvider>
  )
}
