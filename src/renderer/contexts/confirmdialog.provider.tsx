import { ReactNode, useState } from 'react'
import { ConfirmDialog } from '../components/confirm-dialog/confirm-dialog'
import { ConfirmDialogConfig, ConfirmDialogContext } from './confirmdialog.context'

export const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ConfirmDialogConfig>({
    mode: 'ok',
    title: '',
    message: '',
    onSelect: undefined,
    onClose: () => {
      return
    }
  })

  const openDialog = (options: Partial<ConfirmDialogConfig> = {}) => {
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
        onClose: () => {
          setIsOpen(false)
          if (options.onClose) {
            options.onClose()
          }
          reject()
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
    <ConfirmDialogContext.Provider
      value={{
        openConfirmDialog: openDialog,
        closeConfirmDialog: closeDialog,
        isOpen,
        config
      }}
    >
      {children}
      <ConfirmDialog open={isOpen} config={config} onClose={closeDialog} />
    </ConfirmDialogContext.Provider>
  )
}
