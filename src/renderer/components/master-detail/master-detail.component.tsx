import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material'
import DataTable from '../data-table/data-table'
import { useSelectedGamebase } from '@renderer/hooks/useGamebase'
import { SelectedPanel } from '../detail-panels/selected-panel/selected-panel'
import { GameBase } from '@shared/models/settings.model'
import { UUID } from 'crypto'
import { toast } from 'react-toastify'
import { EntityType } from '@shared/types/database.types'
import { t } from 'i18next'
import { useConfirmDialog } from '@renderer/hooks/useConfirmDialog'
import useEntityStore from '@renderer/hooks/useEntityStore'
import { ColumnPickerDialog, ColumnOption } from '../column-picker/column-picker-dialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTableColumns } from '@fortawesome/free-solid-svg-icons'

export interface DetailsProps<T> {
  selected: T
  selectedGamebase: GameBase
}

export interface FormHandle {
  save: () => Promise<boolean>
  reset: () => void
  isValid: boolean
  isDirty: boolean
}

export interface EditFormProps<T> {
  selected?: T | null
  table?: EntityType
}

export interface MasterDetailProps<T> {
  title: string
  tableName: EntityType
  /**
   * Standardmäßig angezeigte Spalten (z. B. nur id + name).
   * Wird nur als Fallback verwendet, wenn keine gespeicherte Auswahl existiert.
   */
  columns: any[]
  /**
   * Alle verfügbaren Spalten inkl. Label für den Picker-Dialog.
   * Fehlt dieses Prop, wird kein „Spalten"-Button angezeigt.
   */
  availableColumns?: ColumnOption<T>[]
  DetailsPanel?: React.ComponentType<{
    selected?: T | null
    selectedGamebase?: GameBase
  }>
  EditForm: React.ForwardRefExoticComponent<EditFormProps<T> & React.RefAttributes<FormHandle>>
  createNew: () => T
  data: T[]
  loadData: (gamebaseId: UUID) => Promise<void>
}

/** Liest aktive Spalten-Keys aus localStorage, Fallback: Standardspalten */
function getStoredColumnKeys(storageKey: string, defaultKeys: string[]): string[] {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) return JSON.parse(stored) as string[]
  } catch {
    // ignore
  }
  return defaultKeys
}

export function MasterDetail<T extends { id?: number | null; name?: string }>({
  title,
  tableName,
  columns,
  availableColumns,
  DetailsPanel,
  EditForm,
  createNew,
  data,
  loadData
}: MasterDetailProps<T>) {
  const { selectedGamebase } = useSelectedGamebase()
  const [selected, setSelected] = useState<T | null>()
  const [edit, setEdit] = useState<T | null>()
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isColumnPickerOpen, setColumnPickerOpen] = useState(false)

  // localStorage-Schlüssel pro Tabelle, damit jede Entität ihre eigene Auswahl hat
  const storageKey = `column-selection-${tableName}`

  // Standardmäßig aktive Keys = alle Keys aus dem columns-Prop
  const defaultActiveKeys: string[] = columns.map((col) => {
    // TanStack accessor columns haben entweder accessorKey oder id
    const c = col as { accessorKey?: string; id?: string }
    return c.accessorKey ?? c.id ?? ''
  })

  const [activeColumnKeys, setActiveColumnKeys] = useState<string[]>(() =>
    availableColumns ? getStoredColumnKeys(storageKey, defaultActiveKeys) : defaultActiveKeys
  )

  // Aktive Spalten aus der Gesamtliste filtern, Reihenfolge beibehalten
  const tableColumns = availableColumns
    ? availableColumns.filter((c) => activeColumnKeys.includes(c.key)).map((c) => c.column)
    : columns

  const formRef = useRef<FormHandle>(null)

  useEffect(() => {
    if (selectedGamebase && (!data || data.length === 0)) {
      setLoading(true)
      loadData(selectedGamebase.id)
    }
  }, [selectedGamebase, data])

  useEffect(() => {
    if (data) setLoading(false)
  }, [data])

  useEffect(() => {
    setEditDialogOpen(edit ? true : false)
  }, [edit])

  const handleColumnChange = (keys: string[]) => {
    setActiveColumnKeys(keys)
    localStorage.setItem(storageKey, JSON.stringify(keys))
  }

  const handleSave = async () => {
    if (!formRef.current) return
    setIsSaving(true)
    try {
      const success = await formRef.current.save()
      if (success) {
        setEditDialogOpen(false)
        setEdit(undefined)
      }
    } catch (error) {
      toast.error(t('translation:forms.messages.save_error') + error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    formRef.current?.reset()
    setEditDialogOpen(false)
    setEdit(undefined)
  }

  const { openConfirmDialog } = useConfirmDialog()
  const { deleteEntity } = useEntityStore()

  const handleDeleteClick = (sel: T & { id?: number | null }) => {
    openConfirmDialog({
      mode: 'delete',
      title: t('buttons.delete'),
      message: t('common.confirm_delete')
    })
      .then(async (result) => {
        if (result && selectedGamebase) {
          await deleteEntity(tableName, sel.id!, selectedGamebase.id)
        }
      })
      .catch(() => {})
  }

  const isFormValid = formRef.current?.isValid ?? false

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ padding: '10px', height: '100%', width: '100%', overflow: 'hidden' }}
    >
      {/* Edit-Dialog */}
      <Dialog open={isEditDialogOpen} fullWidth maxWidth="md">
        <DialogTitle>{edit?.id ? 'Edit' : 'New'}</DialogTitle>
        <DialogContent>
          <EditForm ref={formRef} selected={edit} table={tableName} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isSaving}>
            {t('translation:buttons.cancel')}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? t('translation:buttons.saving') : t('translation:buttons.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {availableColumns && (
        <ColumnPickerDialog<T>
          open={isColumnPickerOpen}
          onClose={() => setColumnPickerOpen(false)}
          availableColumns={availableColumns}
          activeKeys={activeColumnKeys}
          onChange={handleColumnChange}
        />
      )}

      <Card
        elevation={4}
        sx={{
          position: 'relative',
          width: '99%',
          height: '99%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          overflow: 'visible'
        }}
      >
        <Stack direction="column" spacing={1} sx={{ flex: '1', minWidth: 0, height: '100%' }}>
          <Typography variant="h6" sx={{ flexShrink: 0 }} fontWeight="bold">
            {title} ({data.length} {t('translation:common.entries')})
          </Typography>

          <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              color="error"
              disabled={!selected}
              onClick={() => handleDeleteClick(selected!)}
            >
              {t('translation:buttons.delete')}
            </Button>
            <Button variant="outlined" disabled={!selected} onClick={() => setEdit(selected)}>
              {t('translation:buttons.edit')}
            </Button>
            <Button variant="contained" onClick={() => setEdit(createNew())}>
              {t('translation:buttons.add')}
            </Button>

            {availableColumns && (
              <IconButton onClick={() => setColumnPickerOpen(true)}>
                <FontAwesomeIcon icon={faTableColumns} />
              </IconButton>
            )}
          </Stack>

          <Stack sx={{ flex: 1, minHeight: 0 }}>
            <DataTable
              data={data}
              columns={tableColumns}
              onSelectionChange={(sel) => setSelected(sel)}
              loading={loading}
            />
          </Stack>
        </Stack>
      </Card>

      {selected && (
        <Stack sx={{ width: 300, minWidth: 300, height: '100%', overflow: 'hidden' }}>
          <Card
            elevation={4}
            sx={{
              position: 'relative',
              width: '99%',
              height: '99%',
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              overflow: 'visible'
            }}
          >
            {DetailsPanel ? (
              <DetailsPanel selectedGamebase={selectedGamebase} selected={selected} />
            ) : (
              <SelectedPanel
                selectedName={selected.name}
                selectedGamebase={selectedGamebase!}
                selectedId={selected.id!}
                selectedTable={tableName}
              />
            )}
          </Card>
        </Stack>
      )}
    </Stack>
  )
}
