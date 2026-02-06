import { Button, Stack, TextField } from '@mui/material'
import { EditFormProps, FormHandle } from '../master-detail/master-detail.component'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { MusicianDTO, musicianSchema } from '@shared/models/form-schemes.model'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'
import { useSelectedGamebase } from '@renderer/hooks/useGamebase'
import useEntityStore from '@renderer/hooks/useEntityStore'
import FormTextField from './components/form-textfield'
import { SEPARATOR } from '@shared/consts'
import { useFileDialog } from '@renderer/hooks/useFileDialog'

export const MusicianForm = forwardRef<FormHandle, EditFormProps<MusicianDTO>>(
  ({ selected }, ref) => {
    const {
      control,
      handleSubmit,
      formState: { isValid, isDirty, isSubmitting },
      setValue,
      getValues,
      clearErrors
    } = useForm({
      defaultValues: {
        name: '',
        grp: '',
        photo: '',
        nick: ''
      },
      resolver: yupResolver(musicianSchema)
    })

    useEffect(() => {
      if (selected) {
        setValue('id', selected.id ?? null)
        setValue('name', selected.name)
        setValue('grp', selected.grp)
        setValue('photo', selected.photo)
        setValue('nick', selected.nick)
      }
    }, [selected, setValue])

    const { selectedGamebase: gamebase } = useSelectedGamebase()
    const { upsertEntity } = useEntityStore()

    const onFormSubmit = handleSubmit(async (data) => {
      await performSave(data)
    })

    const performSave = async (data: MusicianDTO): Promise<boolean> => {
      if (gamebase) {
        await upsertEntity('Musician', selected?.id, data, gamebase.id)
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

    const { openDialog } = useFileDialog()

    const handleFileClick = async () => {
      let archiveFile
      const rootPath = gamebase?.folders?.photos ?? undefined
      const preselected = rootPath?.endsWith(SEPARATOR)
        ? rootPath + getValues('photo')
        : rootPath + SEPARATOR + getValues('photo')

      const selected = await openDialog({
        mode: 'file',
        title: t('translation:file_dialog.title'),
        multiSelect: false,
        archiveFile,
        rootPath,
        preselectedPath: preselected,
        containerFile: undefined
      })

      let relPath = (selected.path as string).replace(gamebase?.folders?.photos ?? '', '')
      if (relPath.startsWith('/')) {
        relPath = relPath.replace('/', '')
      }
      if (relPath.startsWith('\\')) {
        relPath = relPath.replace('\\', '')
      }

      setValue('photo', relPath)
    }

    return (
      <form onSubmit={onFormSubmit}>
        <Stack direction="column" spacing={2}>
          <TextField label={t('forms.fields.id')} value={selected ? selected.id : 'new'} disabled />
          <FormTextField control={control} name="name" label={t('forms.fields.name')} />
          <FormTextField control={control} name="nick" label={t('forms.musician.fields.nick')} />
          <FormTextField control={control} name="grp" label={t('forms.musician.fields.grp')} />
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
            <FormTextField
              control={control}
              name="photo"
              label={t('forms.musician.fields.photo')}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="outlined" color="primary" onClick={() => handleFileClick()}>
              <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
            </Button>
          </Stack>
        </Stack>
      </form>
    )
  }
)
