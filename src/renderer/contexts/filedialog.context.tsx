import { createContext } from 'react'

export interface FileDialogConfig {
  onClose?: (event?: any) => void
  onSelect: (selected: any) => void
  mode: 'both' | 'file' | 'directory'
  title: string
  multiSelect: boolean
  filters?: string[]
  path?: string
  rootPath?: string
  archiveFile?: string
  preselectedPath?: string
  containerFile?: string
}

export interface FileDialogContextProps {
  openDialog: (config: Partial<FileDialogConfig>) => Promise<any>
  closeDialog: () => void
  isOpen: boolean
  config: FileDialogConfig
}

export const FileDialogContext = createContext<FileDialogContextProps>({} as FileDialogContextProps)
