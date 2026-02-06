import { Stack, TextField } from '@mui/material'
import { EditFormProps, FormHandle } from '../master-detail/master-detail.component'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { BaseDTO, baseSchema } from '@shared/models/form-schemes.model'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { t } from 'i18next'
import { useSelectedGamebase } from '@renderer/hooks/useGamebase'
import useEntityStore from '@renderer/hooks/useEntityStore'

export const BaseEditForm = forwardRef<FormHandle, EditFormProps<BaseDTO>>(
  ({ selected, table }, ref) => {
    const {
      control,
      handleSubmit,
      formState: { errors, isDirty, isSubmitting, isValid },
      setValue,
      clearErrors
    } = useForm({
      defaultValues: {
        id: null,
        name: ''
      },
      resolver: yupResolver(baseSchema)
    })

    const { selectedGamebase: gamebase } = useSelectedGamebase()
    const { upsertEntity } = useEntityStore()

    useEffect(() => {
      if (selected) {
        setValue('id', selected.id ?? null)
        setValue('name', selected.name)
      }
    }, [selected, setValue])

    const onFormSubmit = handleSubmit(async (data) => {
      await performSave(data)
    })

    const performSave = async (data: BaseDTO): Promise<boolean> => {
      if (table && data && gamebase?.id) {
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
        </Stack>
      </form>
    )
  }
)
