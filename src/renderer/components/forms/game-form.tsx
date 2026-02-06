import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid2,
  Stack,
  Tab,
  Tabs,
  TextField
} from '@mui/material'
import { EditFormProps, FormHandle } from '../master-detail/master-detail.component'
import { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { GameDTO, gameSchema, GenreDTO, IdLabelObject } from '@shared/models/form-schemes.model'
import { t } from 'i18next'
import { TabPanel } from '../common/tab-panel'
import FormSelect from './components/form-select'
import FormTextField from './components/form-textfield'
import FormAutocomplete from './components/form-autocomplete'
import useEntityStore from '@renderer/hooks/useEntityStore'
import { useSelectedGamebase } from '@renderer/hooks/useGamebase'
import FormCheckbox from './components/form-checkbox'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'
import { useFileDialog } from '@renderer/hooks/useFileDialog'
import { SEPARATOR, UNDEFINED_YEARS } from '@shared/consts'

const YEARS = Array(130)
  .fill(0)
  .map((_, index) => index + 1970)

const CONTROLS: IdLabelObject[] = [
  { id: 0, label: 'Joystick Port 2' },
  { id: 1, label: 'Joystick Port 1' },
  { id: 2, label: 'Keyboard' },
  { id: 3, label: 'Paddle Port 2' },
  { id: 4, label: 'Paddle Port 1' },
  { id: 5, label: 'Mouse' },
  { id: 6, label: 'Light Pen' },
  { id: 7, label: 'Koala Pad' },
  { id: 8, label: 'Light Gun' }
]

const LENGTH_TYPES: IdLabelObject[] = [
  { id: 0, label: 'Block(s)' },
  { id: 1, label: 'Disk(s)' },
  { id: 2, label: 'Cartridge(s)' },
  { id: 3, label: 'Tape(s)' }
]

const PAL_NTSC: IdLabelObject[] = [
  { id: 0, label: 'PAL' },
  { id: 1, label: 'Universal' },
  { id: 2, label: 'NTSC' },
  { id: 3, label: 'PAL(+NTSC?)' }
]

const toRefObject = (entity: { id?: number | null; name?: string | null } | null | undefined) => {
  return entity ? { id: entity.id ?? null, name: entity.name ?? null } : null
}

export const GameForm = forwardRef<FormHandle, EditFormProps<GameDTO>>(({ selected }, ref) => {
  const [years, setYears] = useState([
    ...UNDEFINED_YEARS,
    ...YEARS.map((year) => ({
      id: year,
      label: year.toString()
    }))
  ])

  const RATING: IdLabelObject[] = [
    { id: 0, label: t('translation:forms.game.fields.ratings.unknown') },
    { id: 1, label: t('translation:forms.game.fields.ratings.terrible') },
    { id: 2, label: t('translation:forms.game.fields.ratings.poor') },
    { id: 3, label: t('translation:forms.game.fields.ratings.average') },
    { id: 4, label: t('translation:forms.game.fields.ratings.quite_good') },
    { id: 5, label: t('translation:forms.game.fields.ratings.very_good') },
    { id: 6, label: t('translation:forms.game.fields.ratings.classic') }
  ]

  const [selectedTab, setSelectedTab] = useState(0)

  const [fileOnDisk, setFileOnDisk] = useState('')

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    setValue,
    setError,
    clearErrors,
    getValues
  } = useForm<GameDTO>({
    defaultValues: {
      id: null,
      name: '',
      year: UNDEFINED_YEARS.at(0)?.id,
      developer: null,
      publisher: null,
      artist: null,
      programmer: null,
      musician: null,
      genre: null,
      reviewRating: -1,
      filename: '',
      fileToRun: '',
      sidFilename: '',
      scrnshotFilename: '',
      playersFrom: 1,
      playersTo: 1,
      playersSim: false,
      language: null,
      control: 1,
      rarity: null,
      license: null,
      cracker: null,
      difficulty: null,
      prequel: null,
      sequel: null,
      related: null,
      cloneOf: null,
      trainers: 0,
      length: 0,
      lengthType: 0,
      palNtsc: 0,
      playable: false,
      titleScreen: false,
      original: false,
      includedDocs: false,
      loadingScreen: false,
      highscoreSaver: false,
      trueDriveEmu: false,
      highscore: '',
      rating: 0,
      adult: false,
      fav: false,
      comment: '',
      versionComment: '',
      memoText: ''
    },
    resolver: yupResolver(gameSchema)
  })

  useEffect(() => {
    if (selected) {
      setValue('id', selected.id ?? null)
      setValue('name', selected.name ?? '')
      setValue('year', selected.year ?? UNDEFINED_YEARS.at(0)?.id)
      setValue('developer', selected.developer)
      setValue('publisher', selected.publisher)
      setValue('artist', selected.artist)
      setValue('programmer', selected.programmer)
      setValue('musician', selected.musician)
      setValue('genre', selected.genre)
      setValue('reviewRating', selected.reviewRating ?? 0)
      setValue('filename', selected.filename)
      setValue('fileToRun', selected.fileToRun)
      setValue('sidFilename', selected.sidFilename)
      setValue('scrnshotFilename', selected.scrnshotFilename)
      setValue('filenameIndex', selected.filenameIndex)
      setValue('playersFrom', selected.playersFrom)
      setValue('playersTo', selected.playersTo)
      setValue('playersSim', selected.playersSim)
      setValue('language', selected.language)
      setValue('control', selected.control)
      setValue('rarity', selected.rarity)
      setValue('license', selected.license)
      setValue('cracker', selected.cracker)
      setValue('difficulty', selected.difficulty)
      setValue('prequel', toRefObject(selected.prequel))
      setValue('sequel', toRefObject(selected.sequel))
      setValue('related', toRefObject(selected.related))
      setValue('cloneOf', toRefObject(selected.cloneOf))
      setValue('trainers', selected.trainers)
      setValue('length', selected.length)
      setValue('lengthType', selected.lengthType)
      setValue('palNtsc', selected.palNtsc)
      setValue('comment', selected.comment ?? '')
      setValue('versionComment', selected.versionComment)
      setValue('playable', selected.playable)
      setValue('titleScreen', selected.titleScreen)
      setValue('original', selected.original)
      setValue('includedDocs', selected.includedDocs)
      setValue('loadingScreen', selected.loadingScreen)
      setValue('highscoreSaver', selected.highscoreSaver)
      setValue('trueDriveEmu', selected.trueDriveEmu)
      setValue('highscore', selected.highscore)
      setValue('rating', selected.rating)
      setValue('adult', selected.adult)
      setValue('fav', selected.fav)
      setValue('memoText', selected.memoText)
    }
  }, [selected, setValue])

  const { upsertEntity } = useEntityStore()

  const performSave = async (data: GameDTO): Promise<boolean> => {
    console.log('saving', data)
    if (gamebase?.id && data) {
      await upsertEntity('Game', selected?.id, data, gamebase.id)
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

  const onFormSubmit = handleSubmit(async (data) => {
    await performSave(data)
  })

  const handleTabChange = (event: React.SyntheticEvent, newTab: number) => {
    setSelectedTab(newTab)
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

  const { selectedGamebase: gamebase } = useSelectedGamebase()
  const publisherStore = useEntityStore((state) => state.publishers)
  const developerStore = useEntityStore((state) => state.developers)
  const artistStore = useEntityStore((state) => state.artists)
  const musicianStore = useEntityStore((state) => state.musicians)
  const programmerStore = useEntityStore((state) => state.programmers)
  const crackerStore = useEntityStore((state) => state.crackers)
  const gameStore = useEntityStore((state) => state.games)
  const genreStore = useEntityStore((state) => state.genres)
  const languageStore = useEntityStore((state) => state.languages)
  const rarityStore = useEntityStore((state) => state.rarities)
  const licenseStore = useEntityStore((state) => state.licenses)
  const difficultyStore = useEntityStore((state) => state.difficulties)
  const loadPublishers = useEntityStore((state) => state.loadPublishers)
  const loadDevelopers = useEntityStore((state) => state.loadDevelopers)
  const loadArtists = useEntityStore((state) => state.loadArtists)
  const loadMusicians = useEntityStore((state) => state.loadMusicians)
  const loadProgrammers = useEntityStore((state) => state.loadProgrammers)
  const loadCrackers = useEntityStore((state) => state.loadCrackers)
  const loadGames = useEntityStore((state) => state.loadGames)
  const loadGenres = useEntityStore((state) => state.loadGenres)
  const loadLanguages = useEntityStore((state) => state.loadLanguages)
  const loadRarities = useEntityStore((state) => state.loadRarities)
  const loadLicenses = useEntityStore((state) => state.loadLicenses)
  const loadDifficulties = useEntityStore((state) => state.loadDifficulty)

  const { openDialog } = useFileDialog()

  useEffect(() => {
    if (selected && gamebase) {
      if (
        selected.filenameIndex &&
        selected.filenameIndex >= 0 &&
        selected.fileToRun &&
        selected.filename &&
        gamebase?.folders?.games
      ) {
        const archiveFile = selected.fileToRun

        const containerFile = gamebase.folders.games.endsWith(SEPARATOR)
          ? gamebase?.folders?.games + selected.filename
          : gamebase?.folders?.games + SEPARATOR + selected.filename

        window.electron
          .readFile(archiveFile, gamebase.folders.games, containerFile)
          .then((result) => {
            if (result) {
              const entries = Object.keys(result)
              const found = entries.find(
                (entry) => result[entry] && result[entry].index === selected.filenameIndex
              )
              setFileOnDisk(found ?? '')
            }
          })
      }
    }
  }, [selected, gamebase])

  const handleFileClick = async (key: keyof GameDTO) => {
    let archiveFile
    let rootPath
    let preselected
    let containerFile
    if (key === 'filename') {
      rootPath = gamebase?.folders?.games
      preselected = rootPath.endsWith(SEPARATOR)
        ? rootPath + getValues('filename')
        : rootPath + SEPARATOR + getValues('filename')

      console.log('file root:', rootPath)
      console.log('file pre:', preselected)
    }
    if (key === 'fileToRun' && gamebase?.folders?.games) {
      preselected = getValues('fileToRun')
      archiveFile = gamebase.folders.games.endsWith(SEPARATOR)
        ? gamebase.folders.games + getValues('filename')
        : gamebase.folders.games + SEPARATOR + getValues('filename')
    }
    if (key === 'filenameIndex' && gamebase?.folders?.games) {
      archiveFile = getValues('fileToRun')

      containerFile = gamebase?.folders?.games.endsWith(SEPARATOR)
        ? gamebase?.folders?.games + getValues('filename')
        : gamebase?.folders?.games + SEPARATOR + getValues('filename')

      preselected = fileOnDisk
    }
    if (key === 'sidFilename') {
      rootPath = gamebase?.folders?.music
      preselected = rootPath.endsWith(SEPARATOR)
        ? rootPath + getValues('sidFilename')
        : rootPath + SEPARATOR + getValues('sidFilename')

      console.log('sid root:', rootPath)
      console.log('sid pre:', preselected)
    }

    if (key === 'scrnshotFilename') {
      rootPath = gamebase?.folders?.images
      preselected = rootPath.endsWith(SEPARATOR)
        ? rootPath + getValues('scrnshotFilename')
        : rootPath + SEPARATOR + getValues('scrnshotFilename')
    }

    const selected = await openDialog({
      mode: 'file',
      title: t('translation:file_dialog.title'),
      multiSelect: false,
      archiveFile,
      rootPath,
      preselectedPath: preselected,
      containerFile
    })

    if (key === 'filenameIndex') {
      setValue('filenameIndex', selected.index)
      setFileOnDisk(selected.name)
    } else {
      if (key === 'filename' || key === 'fileToRun') {
        let relPath = (selected.path as string).replace(gamebase?.folders?.games ?? '', '')
        if (relPath.startsWith('/')) {
          relPath = relPath.replace('/', '')
        }
        if (relPath.startsWith('\\')) {
          relPath = relPath.replace('\\', '')
        }

        setValue(key, relPath)
      } else if (key === 'sidFilename') {
        let relPath = (selected.path as string).replace(gamebase?.folders?.music ?? '', '')
        if (relPath.startsWith('/')) {
          relPath = relPath.replace('/', '')
        }
        if (relPath.startsWith('\\')) {
          relPath = relPath.replace('\\', '')
        }

        setValue(key, relPath)
      } else if (key === 'scrnshotFilename') {
        let relPath = (selected.path as string).replace(gamebase?.folders?.images ?? '', '')
        if (relPath.startsWith('/')) {
          relPath = relPath.replace('/', '')
        }
        if (relPath.startsWith('\\')) {
          relPath = relPath.replace('\\', '')
        }
        setValue(key, relPath)
      } else {
        setValue(key, selected.path)
      }
    }
  }

  const numberOfPlayers = useWatch({
    control,
    name: 'playersTo',
    defaultValue: selected?.playersTo ?? 1
  })

  const getFullGenreLabel = (genre: GenreDTO): string => {
    if (!genre.parent) {
      return genre.name ?? ''
    }
    const parentLabel = getFullGenreLabel(genre.parent)
    return parentLabel + ' - ' + genre.name
  }

  return (
    <Fragment>
      {gamebase && (
        <form onSubmit={onFormSubmit}>
          <Stack direction="column" spacing={2}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label={t('translation:forms.game.tabs.game')} value={0} />
              <Tab label={t('translation:forms.game.tabs.files')} value={1} />
              <Tab label={t('translation:forms.game.tabs.version')} value={2} />
              <Tab label={t('translation:forms.game.tabs.personal')} value={3} />
            </Tabs>
            <TabPanel value={selectedTab} index={0}>
              <Stack direction="column" spacing={2}>
                <FormTextField
                  control={control}
                  name="name"
                  label={t('translation:gamebase.form_fields.name')}
                />
                <FormSelect
                  name="year"
                  control={control}
                  label={t('translation:game.year')}
                  options={years}
                />

                <FormAutocomplete
                  control={control}
                  label={t('translation:game.genre')}
                  name="genre"
                  optionsLoader={() => loadGenres(gamebase.id)}
                  options={genreStore}
                  preselected={
                    selected?.genre?.id
                      ? {
                          id: selected.genre.id,
                          label: selected.genre ? getFullGenreLabel(selected.genre) : ''
                        }
                      : undefined
                  }
                />

                <Divider />

                <FormAutocomplete
                  control={control}
                  label={t('translation:game.developer')}
                  name="developer"
                  optionsLoader={() => loadDevelopers(gamebase?.id)}
                  options={developerStore}
                  preselected={
                    selected?.developer?.id
                      ? {
                          id: selected?.developer?.id,
                          label: selected?.developer?.name ?? ''
                        }
                      : undefined
                  }
                />

                <FormAutocomplete
                  control={control}
                  label={t('translation:game.programmer')}
                  name="programmer"
                  optionsLoader={() => loadProgrammers(gamebase?.id)}
                  options={programmerStore}
                  preselected={
                    selected?.programmer?.id
                      ? {
                          id: selected?.programmer?.id,
                          label: selected?.programmer?.name ?? ''
                        }
                      : undefined
                  }
                />

                <FormAutocomplete
                  control={control}
                  label={t('translation:game.artist')}
                  name="artist"
                  optionsLoader={() => loadArtists(gamebase?.id)}
                  options={artistStore}
                  preselected={
                    selected?.artist?.id
                      ? {
                          id: selected?.artist?.id,
                          label: selected?.artist?.name ?? ''
                        }
                      : undefined
                  }
                />

                <FormAutocomplete
                  control={control}
                  label={t('translation:game.musician')}
                  name="musician"
                  optionsLoader={() => loadMusicians(gamebase?.id)}
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
                  label={t('translation:game.publisher')}
                  name="publisher"
                  optionsLoader={() => loadPublishers(gamebase?.id)}
                  options={publisherStore}
                  preselected={
                    selected?.publisher?.id
                      ? {
                          id: selected?.publisher?.id,
                          label: selected?.publisher?.name ?? ''
                        }
                      : undefined
                  }
                />

                <Divider />

                <FormTextField
                  control={control}
                  label={t('translation:game.player_number_min')}
                  name="playersFrom"
                />

                <FormTextField
                  control={control}
                  label={t('translation:game.player_number_max')}
                  name="playersTo"
                />

                <Controller
                  name={'playersSim'}
                  control={control}
                  render={({ field }) => {
                    return (
                      <FormControl>
                        <FormControlLabel
                          control={<Checkbox {...field} />}
                          label={t('translation:game.simultaneously')}
                          disabled={
                            !numberOfPlayers ||
                            numberOfPlayers === 1 ||
                            Number(numberOfPlayers) === 1
                          }
                        />
                      </FormControl>
                    )
                  }}
                />

                <FormSelect
                  control={control}
                  label={t('translation:game.control')}
                  name="control"
                  options={CONTROLS}
                />

                <FormAutocomplete
                  control={control}
                  label={t('translation:game.language')}
                  name="language"
                  optionsLoader={() => loadLanguages(gamebase?.id)}
                  options={languageStore}
                  preselected={
                    selected?.language?.id
                      ? {
                          id: selected?.language?.id,
                          label: selected?.language?.name ?? ''
                        }
                      : undefined
                  }
                />
                <FormAutocomplete
                  control={control}
                  label={t('translation:game.rarity')}
                  name="rarity"
                  optionsLoader={() => loadRarities(gamebase?.id)}
                  options={rarityStore}
                  preselected={
                    selected?.rarity?.id
                      ? {
                          id: selected?.rarity?.id,
                          label: selected?.rarity?.name ?? ''
                        }
                      : undefined
                  }
                />
                <FormAutocomplete
                  control={control}
                  label={t('translation:game.license')}
                  name="license"
                  optionsLoader={() => loadLicenses(gamebase?.id)}
                  options={licenseStore}
                  preselected={
                    selected?.license?.id
                      ? {
                          id: selected?.license?.id,
                          label: selected?.license?.name ?? ''
                        }
                      : undefined
                  }
                />
                <FormAutocomplete
                  control={control}
                  label={t('translation:game.prequel')}
                  name="prequel"
                  optionsLoader={() => loadGames(gamebase?.id)}
                  options={gameStore}
                  preselected={
                    selected?.prequel?.id
                      ? {
                          id: selected?.prequel?.id,
                          label: selected?.prequel?.name ?? ''
                        }
                      : undefined
                  }
                />
                <FormAutocomplete
                  control={control}
                  label={t('translation:game.sequel')}
                  name="sequel"
                  optionsLoader={() => loadGames(gamebase?.id)}
                  options={gameStore}
                  preselected={
                    selected?.sequel?.id
                      ? {
                          id: selected?.sequel?.id,
                          label: selected?.sequel?.name ?? ''
                        }
                      : undefined
                  }
                />
                <FormAutocomplete
                  control={control}
                  label={t('translation:game.clone_of')}
                  name="cloneOf"
                  optionsLoader={() => loadGames(gamebase?.id)}
                  options={gameStore}
                  preselected={
                    selected?.cloneOf?.id
                      ? {
                          id: selected?.cloneOf?.id,
                          label: selected?.cloneOf?.name ?? ''
                        }
                      : undefined
                  }
                />
                <FormAutocomplete
                  control={control}
                  label={t('translation:game.related_to')}
                  name="related"
                  optionsLoader={() => loadGames(gamebase?.id)}
                  options={gameStore}
                  preselected={
                    selected?.related?.id
                      ? {
                          id: selected?.related?.id,
                          label: selected?.related?.name ?? ''
                        }
                      : undefined
                  }
                />
                <FormTextField
                  control={control}
                  name="reviewRating"
                  label={t('translation:game.review_rating')}
                />
                <FormTextField control={control} name="comment" label="Comment" />
              </Stack>
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
              <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                  <FormTextField
                    control={control}
                    name="filename"
                    label={t('translation:game.filename')}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleFileClick('filename')}
                  >
                    <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
                  </Button>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                  <FormTextField
                    control={control}
                    name="fileToRun"
                    label={t('translation:game.runnable')}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleFileClick('fileToRun')}
                  >
                    <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
                  </Button>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                  <TextField
                    value={fileOnDisk}
                    label={t('translation:game.file_on_disk')}
                    sx={{ flexGrow: 1 }}
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleFileClick('filenameIndex')}
                  >
                    <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
                  </Button>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                  <FormTextField
                    control={control}
                    name="sidFilename"
                    label={t('translation:game.music_file')}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleFileClick('sidFilename')}
                  >
                    <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
                  </Button>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                  <FormTextField
                    control={control}
                    name="scrnshotFilename"
                    label={t('translation:game.screenshot_file')}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleFileClick('scrnshotFilename')}
                  >
                    <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
                  </Button>
                </Stack>
              </Stack>
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
              <Stack direction="column" spacing={2}>
                <FormAutocomplete
                  control={control}
                  label={t('translation:game.cracker')}
                  name="cracker"
                  optionsLoader={() => loadCrackers(gamebase?.id)}
                  options={crackerStore}
                  preselected={
                    selected?.cracker?.id
                      ? {
                          id: selected?.cracker?.id,
                          label: selected?.cracker?.name ?? ''
                        }
                      : undefined
                  }
                />
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <FormTextField
                    control={control}
                    name="trainers"
                    label={t('translation:game.no_trainers')}
                  />
                  <FormSelect
                    name="palNtsc"
                    control={control}
                    label="PAL/NTSC"
                    options={PAL_NTSC}
                  />
                </Stack>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <FormTextField
                    control={control}
                    name="length"
                    label={t('translation:game.game_length')}
                    sx={{ flex: 1, marginRight: '5px' }}
                  />
                  <FormSelect
                    name="lengthType"
                    control={control}
                    label={t('translation:game.length_type')}
                    options={LENGTH_TYPES}
                  />
                </Stack>
                <Grid2 container>
                  <Grid2 size={6}>
                    <FormCheckbox
                      control={control}
                      name="playable"
                      label={t('translation:game.playable')}
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <FormCheckbox
                      control={control}
                      name="titleScreen"
                      label={t('translation:game.titlescreen')}
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <FormCheckbox
                      control={control}
                      name="original"
                      label={t('translation:game.original')}
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <FormCheckbox
                      control={control}
                      name="includedDocs"
                      label={t('translation:game.included_docs')}
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <FormCheckbox
                      control={control}
                      name="loadingScreen"
                      label={t('translation:game.loading_screen')}
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <FormCheckbox
                      control={control}
                      name="highscoreSaver"
                      label={t('translation:game.highscore_saver')}
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <FormCheckbox
                      control={control}
                      name="trueDriveEmu"
                      label={t('translation:game.true_drive_emu')}
                    />
                  </Grid2>
                </Grid2>
                <FormTextField
                  control={control}
                  name="downloadName"
                  label={t('translation:game.download_name')}
                />
                <FormTextField
                  control={control}
                  name="downloadUrl"
                  label={t('translation:game.download_url')}
                />
                <FormTextField
                  control={control}
                  name="versionComment"
                  label={t('translation:game.version_comment')}
                />
              </Stack>
            </TabPanel>
            <TabPanel value={selectedTab} index={3}>
              <Stack direction="column" spacing={2}>
                <FormAutocomplete
                  control={control}
                  label={t('translation:game.difficulty')}
                  name="difficulty"
                  optionsLoader={() => loadDifficulties(gamebase?.id)}
                  options={difficultyStore}
                  preselected={
                    selected?.difficulty?.id
                      ? {
                          id: selected?.difficulty?.id,
                          label: selected?.difficulty?.name ?? ''
                        }
                      : undefined
                  }
                />
                <FormSelect
                  name="rating"
                  control={control}
                  label={t('translation:game.rating')}
                  options={RATING}
                />
                <FormCheckbox control={control} name="adult" label={t('translation:game.adult')} />
                <FormCheckbox control={control} name="fav" label={t('translation:game.favorite')} />
                <FormTextField
                  control={control}
                  name="memoText"
                  label={t('translation:game.notes')}
                  multiline
                  rows={4}
                />
              </Stack>
            </TabPanel>
          </Stack>
        </form>
      )}
    </Fragment>
  )
})
