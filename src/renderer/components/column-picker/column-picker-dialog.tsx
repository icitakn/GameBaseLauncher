import React, { useState } from 'react'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack
} from '@mui/material'
import { ColumnDef } from '@tanstack/react-table'
import { t } from 'i18next'

export interface ColumnOption<T> {
  key: string
  label: string
  column: ColumnDef<T, any>
}

interface ColumnPickerDialogProps<T> {
  open: boolean
  onClose: () => void
  availableColumns: ColumnOption<T>[]
  activeKeys: string[]
  onChange: (activeKeys: string[]) => void
}

export function ColumnPickerDialog<T>({
  open,
  onClose,
  availableColumns,
  activeKeys,
  onChange
}: ColumnPickerDialogProps<T>) {
  const [localKeys, setLocalKeys] = useState<string[]>(activeKeys)

  React.useEffect(() => {
    if (open) setLocalKeys(activeKeys)
  }, [open, activeKeys])

  const toggle = (key: string) => {
    setLocalKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const handleApply = () => {
    const ordered = availableColumns.map((c) => c.key).filter((k) => localKeys.includes(k))
    onChange(ordered)
    onClose()
  }

  const handleSelectAll = () => setLocalKeys(availableColumns.map((c) => c.key))

  const handleDeselectAll = () =>
    setLocalKeys(availableColumns.filter((c) => c.key === 'id').map((c) => c.key))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('column_dialog.title')}</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Button size="small" onClick={handleSelectAll}>
            {t('column_dialog.all')}
          </Button>
          <Button size="small" onClick={handleDeselectAll}>
            {t('column_dialog.none')}
          </Button>
        </Stack>
        <Stack direction="column">
          {availableColumns.map((col) => (
            <FormControlLabel
              key={col.key}
              control={
                <Checkbox
                  checked={localKeys.includes(col.key)}
                  onChange={() => toggle(col.key)}
                  disabled={col.key === 'id'}
                />
              }
              label={col.label}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('buttons.cancel')}</Button>
        <Button onClick={handleApply} variant="contained">
          {t('buttons.ok')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
