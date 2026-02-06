import { Stack, TextField } from '@mui/material'
import { EditFormProps, FormHandle } from '../master-detail/master-detail.component'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Genre, GenreDTO, genreSchema } from '@shared/models/form-schemes.model'
import { forwardRef, Fragment, useEffect, useImperativeHandle } from 'react'
import { t } from 'i18next'
import { useSelectedGamebase } from '@renderer/hooks/useGamebase'
import useEntityStore from '@renderer/hooks/useEntityStore'
import FormAutocomplete from './components/form-autocomplete'

export const GenreEditForm = forwardRef<FormHandle, EditFormProps<GenreDTO>>(
  ({ selected, table }, ref) => {
    const {
      control,
      handleSubmit,
      formState: { errors, isDirty, isSubmitting, isValid },
      setValue,
      clearErrors
    } = useForm<Genre>({
      defaultValues: {
        id: null,
        name: '',
        parent: null
      },
      resolver: yupResolver(genreSchema)
    })

    const { selectedGamebase: gamebase } = useSelectedGamebase()
    const { upsertEntity } = useEntityStore()

    const genres = useEntityStore((state) => state.genres)
    const loadGenres = useEntityStore((state) => state.loadGenres)

    useEffect(() => {
      if (selected) {
        setValue('id', selected.id ?? null)
        setValue('name', selected.name)
        setValue('parent', selected.parent)
      }
    }, [selected, setValue])

    const onFormSubmit = handleSubmit(async (data) => {
      await performSave(data)
    })

    const performSave = async (data): Promise<boolean> => {
      if (table && gamebase) {
        await upsertEntity(table, selected?.id, data, gamebase.id)
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
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField
                    label={t('translation:gamebase.form_fields.name')}
                    {...field}
                    error={!!errors?.name}
                    size="small"
                    helperText={errors?.name?.message}
                  />
                )}
              />

              <FormAutocomplete
                control={control}
                label={t('translation:genre.parent')}
                name="parent"
                optionsLoader={() => loadGenres(gamebase.id)}
                options={genres}
                preselected={
                  selected?.parent?.id
                    ? {
                        id: selected?.parent?.id,
                        label: selected?.parent?.name ?? ''
                      }
                    : undefined
                }
              />
            </Stack>
          </form>
        )}
      </Fragment>
    )
  }
)
