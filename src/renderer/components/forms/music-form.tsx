import { Stack, TextField } from '@mui/material'
import { EditFormProps, FormHandle } from '../master-detail/master-detail.component'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  IdLabelObject,
  MusicDTO,
  MusicianDTO,
  musicSchema
} from '@shared/models/form-schemes.model'
import { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react'
import { t } from 'i18next'
import { useSelectedGamebase } from '@renderer/hooks/useGamebase'
import useEntityStore from '@renderer/hooks/useEntityStore'
import FormAutocomplete from './components/form-autocomplete'
import FormCheckbox from './components/form-checkbox'
import FormTextField from './components/form-textfield'

export const MusicForm = forwardRef<FormHandle, EditFormProps<MusicDTO>>(({ selected }, ref) => {
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
      filename: '',
      musician: null,
      fav: false,
      adult: false
    },
    resolver: yupResolver(musicSchema)
  })
  const { selectedGamebase: gamebase } = useSelectedGamebase()

  useEffect(() => {
    if (selected) {
      setValue('id', selected.id ?? null)
      setValue('name', selected.name)
      setValue('game', selected.game)
      setValue('filename', selected.filename)
      setValue('musician', selected.musician)
      setValue('fav', selected.fav)
      setValue('adult', selected.adult)
    }
  }, [selected, setValue])

  const { upsertEntity } = useEntityStore()

  const gameStore = useEntityStore((state) => state.games)
  const musicianStore = useEntityStore((state) => state.musicians)
  const loadGames = useEntityStore((state) => state.loadGames)
  const loadMusicians = useEntityStore((state) => state.loadMusicians)

  const onFormSubmit = handleSubmit(async (data) => {
    await performSave(data)
  })

  const performSave = async (data: any): Promise<boolean> => {
    if (data && gamebase?.id) {
      await upsertEntity('Music', selected?.id, data, gamebase.id)
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
        (errors) => {
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
        <form onSubmit={onFormSubmit}>
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
            <FormTextField control={control} name="filename" label="Filename" />

            <FormAutocomplete
              control={control}
              label={t('translation:forms.music.fields.musician')}
              name="musician"
              optionsLoader={() => loadMusicians(gamebase.id)}
              options={musicianStore}
              preselected={
                selected?.musician?.id
                  ? {
                      id: selected?.musician?.id,
                      label: selected?.musician?.name ?? ''
                    }
                  : undefined
              }
            />

            <FormAutocomplete
              control={control}
              label={t('translation:forms.music.fields.game')}
              name="game"
              optionsLoader={() => loadGames(gamebase.id)}
              options={gameStore}
              preselected={
                selected?.game?.id
                  ? {
                      id: selected?.game?.id,
                      label: selected?.game?.name ?? ''
                    }
                  : undefined
              }
            />

            <FormCheckbox
              control={control}
              name="adult"
              label={t('translation:forms.music.fields.adult')}
            />

            <FormCheckbox
              control={control}
              name="fav"
              label={t('translation:forms.music.fields.fav')}
            />
          </Stack>
        </form>
      )}
    </Fragment>
  )
})
