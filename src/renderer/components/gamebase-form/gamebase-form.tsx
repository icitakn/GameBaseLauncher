import { Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons'
import { GamebaseDTO, gamebaseSchema } from '@shared/models/form-schemes.model'
import { GameBase } from '@shared/models/settings.model'
import { useFileDialog } from '@renderer/hooks/useFileDialog'
import { useConfirmDialog } from '@renderer/hooks/useConfirmDialog'
import { useNavigate } from 'react-router-dom'
import { SEPARATOR } from '@shared/consts'
import FormTextField from '../forms/components/form-textfield'
import { UUID } from 'crypto'

export interface GamebaseFormProps {
  onSubmit: (gamebase: GameBase) => void
  gamebase?: GameBase
  title: string
}

export function GamebaseForm({ onSubmit, gamebase, title }: GamebaseFormProps) {
  type ImportType = 'mdb' | 'db'

  const [importType, setImportType] = useState<ImportType>('mdb')

  const { control, handleSubmit, setValue, getValues } = useForm({
    defaultValues: {
      name: '',
      importFile: '',
      dbFile: '',
      emulator: '',
      musicplayer: '',
      folders: {
        extractTo: '',
        games: '',
        images: '',
        music: '',
        photos: ''
      }
    },
    resolver: yupResolver(gamebaseSchema)
  })

  useEffect(() => {
    if (gamebase) {
      setValue('name', gamebase.name)
      setValue('importFile', gamebase.importFile)
      setValue('dbFile', gamebase.dbFile)
      setValue('emulator', gamebase.emulator)
      setValue('musicplayer', gamebase.musicplayer)
      setValue('folders.extractTo', gamebase.folders?.extractTo)
      setValue('folders.games', gamebase.folders?.games)
      setValue('folders.images', gamebase.folders?.images)
      setValue('folders.music', gamebase.folders?.music)
      setValue('folders.photos', gamebase.folders?.photos)
    }
  }, [gamebase, setValue])

  const submitFn = handleSubmit((data: GamebaseDTO) => {
    if (importType !== 'mdb') {
      data.importFile = undefined
    }
    onSubmit({ ...data, id: data.id as UUID })
  })

  const { openDialog } = useFileDialog()
  const { openConfirmDialog } = useConfirmDialog()

  const handleFileClick = async (key: keyof GamebaseDTO) => {
    const selected = await openDialog({
      mode: 'file',
      title: t('translation:file_dialog.title'),
      multiSelect: false,
      preselectedPath: gamebase ? (gamebase[key] as string) : undefined,
      rootPath: window.navigator.platform.startsWith('Win') ? 'C:\\' : '/'
    })
    setValue(key, selected.path)
  }

  const handleFolderClick = async (folderKey: keyof GamebaseDTO['folders']) => {
    const selected = await openDialog({
      mode: 'directory',
      title: t('translation:file_dialog.select_folder'),
      multiSelect: false,
      preselectedPath: gamebase?.folders?.[folderKey] ?? undefined
    })
    setValue(`folders.${folderKey}`, selected.path)
  }

  const handleDbFileFolderClick = async () => {
    const selected = await openDialog({
      mode: 'directory',
      title: t('translation:file_dialog.select_folder'),
      multiSelect: false,
      preselectedPath: gamebase?.dbFile?.slice(0, gamebase.dbFile.lastIndexOf(SEPARATOR))
    })
    setValue('dbFile', selected.path + SEPARATOR + getValues('name') + '.db')
  }

  const navigate = useNavigate()

  const handleDeleteClick = () => {
    openConfirmDialog({
      mode: 'delete',
      title: t('translation:gamebase.delete_gamebase'),
      message: t('translation:gamebase.messages.confirm_delete')
    })
      .then((result) => {
        if (result) {
          // User clicked Delete/OK/Yes
          if (gamebase) {
            window.electron.deleteGamebase(gamebase.id).then(() => {
              navigate('/')
            })
          }
        }
      })
      .catch(() => {
        // User clicked Cancel/No or closed dialog
      })
  }

  const ImportOption = ({ type, text }: { type: ImportType; text: string }) => {
    return (
      <Card
        elevation={importType === type ? 4 : 1}
        sx={{
          flex: 1,
          minHeight: '100px',
          borderRadius: '10px',
          alignContent: 'center',
          textAlign: 'center'
        }}
      >
        <CardContent
          onClick={() => setImportType(type)}
          sx={{ fontWeight: importType === type ? 'bold' : 'normal' }}
        >
          {text}
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={submitFn}>
      <Stack
        spacing={2}
        sx={{
          boxShadow: '4',
          padding: '15px'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>

        <FormTextField
          control={control}
          name="name"
          label={t('translation:gamebase.form_fields.name')}
        />

        {!gamebase && (
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
            <ImportOption type="mdb" text={t('gamebase.select_importMdb')} />
            <ImportOption type="db" text={t('gamebase.select_importDb')} />
          </Stack>
        )}

        {importType === 'mdb' && (
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
            <FormTextField
              control={control}
              name="importFile"
              label={t('translation:gamebase.form_fields.importfile')}
              sx={{ flexGrow: 1 }}
              disabled={gamebase !== undefined}
            />
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleFileClick('importFile')}
              disabled={gamebase !== undefined}
            >
              <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
            </Button>
          </Stack>
        )}

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <FormTextField
            control={control}
            name="dbFile"
            label={t('translation:gamebase.form_fields.db_file')}
            sx={{ flexGrow: 1 }}
            disabled={gamebase !== undefined}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleDbFileFolderClick}
            disabled={gamebase !== undefined}
          >
            <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
          </Button>
        </Stack>

        <Divider />

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <FormTextField
            control={control}
            name="emulator"
            label={t('translation:gamebase.form_fields.emulator')}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" color="secondary" onClick={() => handleFileClick('emulator')}>
            <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <FormTextField
            control={control}
            name="musicplayer"
            label={t('translation:gamebase.form_fields.music_player')}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleFileClick('musicplayer')}
          >
            <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
          </Button>
        </Stack>

        <Divider />

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <FormTextField
            control={control}
            name="folders.extractTo"
            label={t('translation:gamebase.form_fields.extract_zip_to')}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleFolderClick('extractTo')}
          >
            <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <FormTextField
            control={control}
            name="folders.games"
            label={t('translation:gamebase.form_fields.games_folder')}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" color="secondary" onClick={() => handleFolderClick('games')}>
            <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <FormTextField
            control={control}
            name="folders.images"
            label={t('translation:gamebase.form_fields.images_folder')}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" color="secondary" onClick={() => handleFolderClick('images')}>
            <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <FormTextField
            control={control}
            name="folders.music"
            label={t('translation:gamebase.form_fields.music_folder')}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" color="secondary" onClick={() => handleFolderClick('music')}>
            <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <FormTextField
            control={control}
            name="folders.photos"
            label={t('translation:gamebase.form_fields.photos_folder')}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" color="secondary" onClick={() => handleFolderClick('photos')}>
            <FontAwesomeIcon icon={faFolder}></FontAwesomeIcon>
          </Button>
        </Stack>

        <Stack direction="row" sx={{ marginTop: 3 }} spacing={2}>
          {gamebase && (
            <Button variant="contained" color="error" onClick={handleDeleteClick} sx={{ flex: 1 }}>
              {t('translation:buttons.delete')}
            </Button>
          )}

          <Button variant="contained" color="primary" type="submit" sx={{ flex: 1 }}>
            {gamebase ? t('translation:buttons.edit') : t('translation:buttons.add')}
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}
