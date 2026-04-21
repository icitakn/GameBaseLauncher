import { Box, SxProps } from '@mui/material'
import { ReactElement } from 'react'

export interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  sx?: SxProps
}

export function TabPanel(props: TabPanelProps): ReactElement {
  const { children, value, index, sx, ...other } = props

  return (
    <Box
      style={{ height: '100%' }}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={sx}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  )
}
