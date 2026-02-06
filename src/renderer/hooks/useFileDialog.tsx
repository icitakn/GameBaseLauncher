import { FileDialogContext } from '@renderer/contexts/filedialog.context'
import { useContext } from 'react'

export const useFileDialog = () => {
  const context = useContext(FileDialogContext)
  if (!context) {
    throw new Error('useFileDialog must be used within FileDialogProvider')
  }
  return context
}
