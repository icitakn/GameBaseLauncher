import React, { ReactNode } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { ConfirmDialogConfig } from '@renderer/contexts/confirmdialog.provider'
import { t } from 'i18next'

interface ConfirmDialogProps {
  open: boolean
  config: ConfirmDialogConfig
  onClose: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, config, onClose }) => {
  if (!config) return null

  const handleClose = (): void => {
    if (config.onClose) {
      config.onClose()
    }
    onClose()
  }

  const handlePrimaryAction = (): void => {
    if (config.onSelect) {
      config.onSelect(true)
    }
    onClose()
  }

  const handleSecondaryAction = (): void => {
    if (config.onSelect) {
      config.onSelect(false)
    }
    onClose()
  }

  const getButtons = (): ReactNode => {
    switch (config.mode) {
      case 'delete':
        return (
          <>
            <Button onClick={handleSecondaryAction} color="inherit">
              {t('translation:buttons.cancel')}
            </Button>
            <Button onClick={handlePrimaryAction} color="error" variant="contained">
              {t('translation:buttons.delete')}
            </Button>
          </>
        )
      case 'ok':
        return (
          <>
            <Button onClick={handleSecondaryAction} color="inherit">
              {t('translation:buttons.cancel')}
            </Button>
            <Button onClick={handlePrimaryAction} color="primary" variant="contained">
              {t('translation:buttons.ok')}
            </Button>
          </>
        )
      case 'okonly':
        return (
          <>
            <Button onClick={handlePrimaryAction} color="primary" variant="contained">
              {t('translation:buttons.ok')}
            </Button>
          </>
        )
      case 'yesno':
        return (
          <>
            <Button onClick={handleSecondaryAction} color="inherit">
              {t('translation:buttons.no')}
            </Button>
            <Button onClick={handlePrimaryAction} color="primary" variant="contained">
              {t('translation:buttons.yes')}
            </Button>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      aria-labelledby="confirm-dialog-title"
      sx={{ ...config.sx }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ pr: 6 }}>
        {config.title}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography component={'div'}>{config.message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>{getButtons()}</DialogActions>
    </Dialog>
  )
}
