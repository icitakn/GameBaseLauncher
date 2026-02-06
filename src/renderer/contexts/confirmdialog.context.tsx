import { SxProps } from '@mui/material'
import { createContext, ReactNode } from 'react'

export interface ConfirmDialogConfig {
  onClose?: (event?: any) => void
  onSelect?: (selected: any) => void
  mode: 'delete' | 'ok' | 'yesno' | 'okonly'
  title: string
  message: string | ReactNode
  sx?: SxProps
}

export interface ConfirmDialogContextProps {
  openConfirmDialog: (config: ConfirmDialogConfig) => Promise<any>
  closeConfirmDialog: () => void
  isOpen: boolean
  config: ConfirmDialogConfig
}

export const ConfirmDialogContext = createContext<ConfirmDialogContextProps>(
  {} as ConfirmDialogContextProps
)
