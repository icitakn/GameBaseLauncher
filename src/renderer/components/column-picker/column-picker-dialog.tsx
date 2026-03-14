import React, { useState } from 'react'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography
} from '@mui/material'
import { ColumnDef } from '@tanstack/react-table'

export interface ColumnOption<T> {
  /** Interner Schlüssel – muss eindeutig sein (z. B. der accessor-Key) */
  key: string
  /** Anzeigename im Dialog */
  label: string
  /** Die vollständige TanStack-ColumnDef */
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

  // Lokalen State synchronisieren, wenn der Dialog geöffnet wird
  React.useEffect(() => {
    if (open) setLocalKeys(activeKeys)
  }, [open, activeKeys])

  const toggle = (key: string) => {
    setLocalKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleApply = () => {
    // Reihenfolge der availableColumns beibehalten
    const ordered = availableColumns
      .map((c) => c.key)
      .filter((k) => localKeys.includes(k))
    onChange(ordered)
    onClose()
  }

  const handleSelectAll = () =>
    setLocalKeys(availableColumns.map((c) => c.key))

  const handleDeselectAll = () =>
    // id immer aktiv lassen
    setLocalKeys(availableColumns.filter((c) => c.key === 'id').map((c) => c.key))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Spalten auswählen</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Button size="small" onClick={handleSelectAll}>
            Alle
          </Button>
          <Button size="small" onClick={handleDeselectAll}>
            Keine
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
                  // id-Spalte kann nicht abgewählt werden
                  disabled={col.key === 'id'}
                />
              }
              label={col.label}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleApply} variant="contained">
          Übernehmen
        </Button>
      </DialogActions>
    </Dialog>
  )
}
