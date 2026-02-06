import { ReactNode, useState } from 'react'
import { FileDialog } from '../components/file-manager/file-dialog'
import { t } from 'i18next'
import { FileDialogConfig, FileDialogContext } from './filedialog.context'

export const FileDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<FileDialogConfig>({
    mode: 'both', // 'files', 'directories', 'both'
    title: t('translation:file_dialog.title'),
    onSelect: () => {},
    multiSelect: false,
    filters: [],
    onClose: () => {
      return
    }
  })

  const openDialog = (options = {}) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      ...options
    }))
    setIsOpen(true)

    // Promise-basiertes Interface für einfachere Verwendung
    return new Promise((resolve, reject) => {
      setConfig((prevConfig) => ({
        ...prevConfig,
        onSelect: (result) => {
          setIsOpen(false)
          resolve(result)
        },
        onCancel: () => {
          setIsOpen(false)
          reject(new Error('Dialog cancelled'))
        }
      }))
    })
  }

  const closeDialog = () => {
    setIsOpen(false)
    if (config.onClose) {
      config.onClose()
    }
  }

  return (
    <FileDialogContext.Provider value={{ openDialog, closeDialog, isOpen, config }}>
      {children}
      <FileDialog
        open={isOpen}
        onClose={closeDialog}
        onSelect={config.onSelect}
        mode={config.mode}
        title={config.title}
        multiSelect={config.multiSelect}
        filters={config.filters}
        path={config.path}
        rootPath={config.rootPath}
        archiveFile={config.archiveFile}
        containerFile={config.containerFile}
        preselectedPath={config.preselectedPath}
      />
    </FileDialogContext.Provider>
  )
}
