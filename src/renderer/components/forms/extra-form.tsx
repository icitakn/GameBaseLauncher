import { Stack, TextField } from '@mui/material'
import { EditFormProps, FormHandle } from '../master-detail/master-detail.component'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ExtraDTO, extraSchema } from '@shared/models/form-schemes.model'
import { forwardRef, Fragment, useEffect, useImperativeHandle } from 'react'
import { t } from 'i18next'
import { useSelectedGamebase } from '@renderer/hooks/useGamebase'
import useEntityStore from '@renderer/hooks/useEntityStore'
import FormAutocomplete from './components/form-autocomplete'
import FormTextField from './components/form-textfield'

export const ExtraForm = forwardRef<FormHandle, EditFormProps<ExtraDTO>>(({ selected }, ref) => {
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
    setValue,
    clearErrors
  } = useForm({
    defaultValues: {
      id: null,
      name: '',
      game: null,
      displayOrder: null,
      type: null,
      path: null,
      data: null,
      fileToRun: null
    },
    resolver: yupResolver(extraSchema)
  })

  const { selectedGamebase: gamebase } = useSelectedGamebase()
  const { upsertEntity } = useEntityStore()
  const gameStore = useEntityStore((state) => state.games)
  const loadGames = useEntityStore((state) => state.loadGames)

  useEffect(() => {
    if (selected) {
      setValue('id', selected.id ?? null)
      setValue('name', selected.name)
      setValue('game', selected.game ? { id: selected.game.id, name: selected.game.name } : null)
      setValue('displayOrder', selected.displayOrder)
      setValue('type', selected.type)
      setValue('path', selected.path)
      setValue('data', selected.data)
      setValue('fileToRun', selected.fileToRun)
    }
  }, [selected, setValue])

  const performSave = async (data: any): Promise<boolean> => {
    if (data && gamebase?.id) {
      await upsertEntity('Extra', selected?.id, data, gamebase.id)
    }
    return true
  }

  const save = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      handleSubmit(
        async (data) => {
          const success = await performSave(data)
          resolve(success)
        },
        () => {
          resolve(false)
        }
      )()
    })
  }

  const resetForm = () => {
    clearErrors()
  }

  useImperativeHandle(ref, () => ({
    save,
    reset: resetForm,
    isValid: isValid && !isSubmitting,
    isDirty
  }))

  return (
    <Fragment>
      {gamebase && (
        <form onSubmit={handleSubmit(performSave)}>
          <Stack direction="column" spacing={2}>
            <TextField
              label={t('translation:forms.fields.id')}
              value={selected ? selected.id : 'new'}
              disabled
            />
            <FormTextField
              control={control}
              name="name"
              label={t('translation:forms.fields.name')}
            />
            <FormAutocomplete
              control={control}
              label={t('translation:extra.game')}
              name="game"
              optionsLoader={() => loadGames(gamebase.id)}
              options={gameStore}
              preselected={
                selected?.game?.id
                  ? {
                      id: selected.game.id,
                      label: selected.game.name ?? ''
                    }
                  : undefined
              }
            />
            <FormTextField control={control} name="path" label={t('translation:extra.path')} />
            <FormTextField
              control={control}
              name="fileToRun"
              label={t('translation:extra.file_to_run')}
            />
            <FormTextField
              control={control}
              name="displayOrder"
              label={t('translation:extra.display_order')}
            />
            <FormTextField control={control} name="type" label={t('translation:extra.type')} />
            <FormTextField control={control} name="data" label={t('translation:extra.data')} />
          </Stack>
        </form>
      )}
    </Fragment>
  )
})
