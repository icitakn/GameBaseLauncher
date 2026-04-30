import { useForm } from 'react-hook-form'
import { boolean, number, object } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Stack } from '@mui/material'
import FormSelect from '../forms/components/form-select'
import { Settings } from '@shared/models/settings.model'
import { useEffect } from 'react'
import { LANGUAGES } from '@renderer/i18n/config'
import { t } from 'i18next'
import FormCheckbox from '../forms/components/form-checkbox'

export interface GeneralSettingsFormProps {
  onSubmit: (data: any) => void
  settings: Settings
}

const generalSettingsSchema = object().shape({
  language: number(),
  rememberLastPosition: boolean()
})

export function GeneralSettingsForm({ onSubmit, settings }: GeneralSettingsFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      language: 1,
      rememberLastPosition: false
    },
    resolver: yupResolver(generalSettingsSchema)
  })

  useEffect(() => {
    if (settings) {
      const language = LANGUAGES.find((l) => l.inputValue === settings.language)
      setValue('language', language?.id ?? 1)
      setValue('rememberLastPosition', settings.rememberLastPosition ?? false)
    }
  }, [settings])

  const submitFn = handleSubmit((data: any) => {
    onSubmit(data)
  })

  return (
    <form onSubmit={submitFn}>
      <Stack
        spacing={2}
        sx={{
          boxShadow: '4',
          padding: '15px'
        }}
      >
        <FormSelect
          name="language"
          control={control}
          label={t('translation:settings.language')}
          options={LANGUAGES}
        />
        <FormCheckbox
          control={control}
          name="rememberLastPosition"
          label={t('translation:settings.remember')}
        />

        <Button variant="contained" color="primary" type="submit">
          {t('translation:buttons.save')}
        </Button>
      </Stack>
    </form>
  )
}
