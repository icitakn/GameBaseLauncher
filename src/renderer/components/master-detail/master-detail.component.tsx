import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { table } from 'console'

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
  columns: any[]
  DetailsPanel?: React.ComponentType<{
    selected?: T | null
    selectedGamebase?: GameBase
  }>
  // DetailsPanel?: React.FC<DetailsProps<T>>;
  // EditForm: React.FC<EditFormProps<T>>;
  EditForm: React.ForwardRefExoticComponent<EditFormProps<T> & React.RefAttributes<FormHandle>>
  createNew: () => T
  data: T[]
  loadData: (gamebaseId: UUID) => Promise<void>
}

export function MasterDetail<T extends { id?: number | null; name?: string }>({
  title,
  tableName,
  columns,
  DetailsPanel,
  EditForm,
  createNew,
  data,
  loadData
}: MasterDetailProps<T>) {
  const { selectedGamebase } = useSelectedGamebase()
  const [selected, setSelected] = useState<T | null>()
  const [tableColumns, setTableColumns] = useState(columns)
  const [edit, setEdit] = useState<T | null>()
  const [filter, setFilter] = useState<{ [name: string]: string[] }>({})
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const formRef = useRef<FormHandle>(null)

  useEffect(() => {
    if (selectedGamebase && (!data || data.length === 0)) {
      setLoading(true)
      loadData(selectedGamebase.id)
    }
  }, [selectedGamebase, data])

  useEffect(() => {
    if (data) {
      setLoading(false)
    }
  }, [data])

  useEffect(() => {
    setEditDialogOpen(edit ? true : false)
  }, [edit])

  const onFilterChange = (newFilter: { [name: string]: string[] }) => {
    setFilter(newFilter)
  }

  const onClose = (reload: boolean) => {
    setEditDialogOpen(false)
    // if (reload) fetchAll();
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
    if (formRef.current) {
      formRef.current.reset()
    }

    setEditDialogOpen(false)
    setEdit(undefined)
  }

  const { openConfirmDialog } = useConfirmDialog()

  const { deleteEntity } = useEntityStore()

  const handleDeleteClick = (selected) => {
    openConfirmDialog({
      mode: 'delete',
      title: t('buttons.delete'),
      message: t('common.confirm_delete')
    })
      .then(async (result) => {
        if (result) {
          // User clicked Delete/OK/Yes
          if (selectedGamebase) {
            await deleteEntity(tableName, selected.id, selectedGamebase.id)
          }
        }
      })
      .catch(() => {
        // User clicked Cancel/No or closed dialog
      })
  }

  const isFormValid = formRef.current?.isValid ?? false
  //const isFormDirty = formRef.current?.isDirty ?? false;

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        padding: '10px',
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <Dialog open={isEditDialogOpen} fullWidth maxWidth={'md'}>
        <DialogTitle>{edit?.id ? 'Edit' : 'New'}</DialogTitle>
        <DialogContent>
          <EditForm
            ref={formRef}
            selected={edit}
            table={tableName}
            // closeDialog={(reload: boolean) => onClose(reload)}
          />
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
            {/* <Searchbar
            onChangeHandler={onFilterChange}
            fieldNames={["name"]}
          ></Searchbar> */}

            <Button
              variant="contained"
              color="error"
              disabled={!selected}
              onClick={() => handleDeleteClick(selected)}
            >
              {t('translation:buttons.delete')}
            </Button>
            <Button variant="outlined" disabled={!selected} onClick={() => setEdit(selected)}>
              {t('translation:buttons.edit')}
            </Button>
            <Button variant="contained" onClick={() => setEdit(createNew())}>
              {t('translation:buttons.add')}
            </Button>
          </Stack>

          <Stack sx={{ flex: 1, minHeight: 0 }}>
            <DataTable
              data={data}
              columns={tableColumns}
              onSelectionChange={(selected) => setSelected(selected)}
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
