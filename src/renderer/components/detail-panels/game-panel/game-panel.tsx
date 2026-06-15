import { ExtraDTO, GameDTO } from '@shared/models/form-schemes.model'
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  ClickAwayListener,
  Container,
  Divider,
  Grid2,
  Grow,
  ImageList,
  ImageListItem,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Tab,
  Tabs
} from '@mui/material'
import { t } from 'i18next'
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { IMAGE_BASE64_PREFIX, UNDEFINED_YEARS } from '@shared/consts'
import useEntityStore from '@renderer/hooks/useEntityStore'
import { GameBase } from '@shared/models/settings.model'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { TabPanel } from '@renderer/components/common/tab-panel'
import { UUID } from 'crypto'
import { ExtraDialog } from '@renderer/components/extra-dialog/extra-dialog'
import { ExtraFileResult } from '@shared/types/file.types'
import { useGameLauncher } from '@renderer/hooks/useGameLauncher'

export interface GamePanelProps {
  selected?: GameDTO | null
  selectedGamebase?: GameBase
}

export function GamePanel({ selected, selectedGamebase }: GamePanelProps): ReactElement {
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [imageFolderError, setImageFolderError] = useState(false)
  const [emulatorMenuOpen, setEmulatorMenuOpen] = useState(false)
  const emulatorAnchorRef = useRef<HTMLDivElement>(null)
  const [selectedTab, setSelectedTab] = useState(0)

  const { loadGameById } = useEntityStore()
  const [game, setGame] = useState<GameDTO | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [loadingExtras, setLoadingExtras] = useState(true)
  const [extras, setExtras] = useState<ExtraDTO[]>([])

  const [extraFile, setExtraFile] = useState<ExtraFileResult | null>(null)
  const [extraDialogOpen, setExtraDialogOpen] = useState(false)
  const [loadingExtraFile, setLoadingExtraFile] = useState(false)

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
    .thumbnail-strip::-webkit-scrollbar {
      height: 6px;
    }
    .thumbnail-strip::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.12);
      border-radius: 3px;
    }
    .thumbnail-strip::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.4);
      border-radius: 3px;
    }
    .thumbnail-strip::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.65);
    }
  `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const loadXtra = async (id: number, gamebaseId: UUID) => {
    setLoadingExtras(true)
    try {
      const extras = await window.electron.loadExtras(id, gamebaseId)
      console.log('extras', extras)
      setExtras(extras)
    } finally {
      setLoadingExtras(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newTab: number) => {
    setSelectedTab(newTab)
    if (newTab === 1) {
      if (game?.id && selectedGamebase?.id) {
        loadXtra(game.id, selectedGamebase.id)
      }
    }
  }

  useEffect(() => {
    const load = async (id: number, gamebaseId: UUID) => {
      setLoadingDetail(true)
      try {
        const fullGame = await loadGameById(id, gamebaseId)
        setSelectedTab(0)
        setGame(fullGame)
      } finally {
        setLoadingDetail(false)
      }
    }
    if (selected?.id && selectedGamebase?.id) {
      load(selected.id, selectedGamebase.id)
    }
  }, [loadGameById, selected?.id, selectedGamebase?.id])

  const emulators = selectedGamebase?.emulators ?? []
  const hasMultipleEmulators = emulators.length > 1

  const { launchGame } = useGameLauncher()

  const execute = async (emulatorId?: string): Promise<void> => {
    if (game && game.id && selectedGamebase?.id) {
      launchGame(selectedGamebase.id, game.id, game.name, emulatorId)
    }
  }

  const handleEmulatorSelect = (emulatorId: string) => {
    setEmulatorMenuOpen(false)
    execute(emulatorId)
  }

  const playMusic = async (): Promise<void> => {
    if (game && game.id && selectedGamebase?.id) {
      try {
        await window.electron.playMusic(selectedGamebase.id, { gameId: game.id })
      } catch (error) {
        toast.error(t('common.error_occured') + error)
      }
    }
  }

  const fetchImages = useCallback(async () => {
    setSelectedImage(0)
    if (!loadingDetail && game && selectedGamebase?.id) {
      try {
        const images = await window.electron.loadImages(game, selectedGamebase.id)
        setImages(images)
      } catch (error) {
        console.log(error)
        setImageFolderError(true)
      }
    }
  }, [game, loadingDetail, selectedGamebase?.id])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const selectedYear = useMemo(() => {
    if (game?.year && UNDEFINED_YEARS.some((year) => game.year === year.id)) {
      return UNDEFINED_YEARS.find((year) => game.year === year.id)?.label
    }
    return game?.year
  }, [game?.year])

  const InfoLine = ({
    label,
    value
  }: {
    label: string
    value: string | number | undefined | null
  }): ReactElement => {
    return (
      <>
        <Grid2 size={6}>
          <div>{label}</div>
        </Grid2>
        <Grid2 size={6}>
          <div>{value}</div>
        </Grid2>
      </>
    )
  }

  if (loadingDetail) {
    return (
      <Stack direction="column" sx={{ alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Stack>
    )
  }

  async function handleExtraClick(extra: ExtraDTO): Promise<void> {
    if (!extra.path) return
    if (!selectedGamebase?.folders?.extras) return

    setLoadingExtraFile(true)
    setExtraDialogOpen(true)
    try {
      const result = await window.electron.readExtra(
        extra.path,
        extra?.fileToRun ?? undefined,
        selectedGamebase.folders.extras,
        selectedGamebase.id
      )
      setExtraFile(result)
    } catch (e) {
      toast.error(t('common.error_occured') + e)
      setExtraDialogOpen(false)
    } finally {
      setLoadingExtraFile(false)
    }
  }

  return (
    <Stack direction="column" sx={{ alignItems: 'center', height: '100%' }}>
      {imageFolderError && (
        <Box sx={{ bgcolor: 'error.main', color: 'error.contrastText', padding: '3px' }}>
          {t('translation:game.messages.screenshots')}
        </Box>
      )}
      {images && images.length > 0 && (
        <Box sx={{ width: '100%', flexShrink: 0 }}>
          <Box
            sx={{
              width: '100%',
              aspectRatio: '16 / 10',
              overflow: 'hidden',
              borderRadius: '6px',
              mb: 0.75,
              bgcolor: '#000',
              position: 'relative'
            }}
          >
            <Box
              component="img"
              src={IMAGE_BASE64_PREFIX + images[selectedImage]}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                transition: 'opacity 0.2s ease'
              }}
            />
          </Box>

          {images.length > 1 && (
            <Box
              className="thumbnail-strip"
              sx={{
                display: 'flex',
                gap: '4px',
                overflowX: 'auto',
                flexWrap: 'nowrap',
                mt: '4px'
              }}
            >
              {images.map((item, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: '52px',
                    height: '36px',
                    flexShrink: 0,
                    borderRadius: '3px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === index ? '2px solid' : '2px solid transparent',
                    borderColor: selectedImage === index ? 'success.main' : 'transparent',
                    opacity: selectedImage === index ? 1 : 0.55,
                    transition: 'opacity 0.15s ease, border-color 0.15s ease',
                    '&:hover': {
                      opacity: 1
                    },
                    mb: '2px'
                  }}
                >
                  <Box
                    component="img"
                    src={IMAGE_BASE64_PREFIX + item}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {game && (
        <Stack
          spacing={1}
          sx={{
            alignSelf: 'stretch',
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <strong style={{ textAlign: 'center' }}>{game.name}</strong>

          {game.filename && (
            <>
              {hasMultipleEmulators ? (
                <>
                  <ButtonGroup
                    ref={emulatorAnchorRef}
                    variant="contained"
                    color="success"
                    fullWidth
                  >
                    <Button onClick={() => execute(emulators[0].id)} sx={{ flex: 1 }}>
                      {t('translation:game.play')}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setEmulatorMenuOpen((prev) => !prev)}
                      sx={{ width: '36px', flexShrink: 0 }}
                    >
                      <FontAwesomeIcon icon={faChevronDown} />
                    </Button>
                  </ButtonGroup>

                  <Popper
                    open={emulatorMenuOpen}
                    anchorEl={emulatorAnchorRef.current}
                    transition
                    disablePortal
                    style={{ zIndex: 1 }}
                  >
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
                        }}
                      >
                        <Paper>
                          <ClickAwayListener onClickAway={() => setEmulatorMenuOpen(false)}>
                            <MenuList autoFocusItem>
                              {emulators.map((emulator) => (
                                <MenuItem
                                  key={emulator.id}
                                  onClick={() => handleEmulatorSelect(emulator.id)}
                                >
                                  {emulator.name}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </>
              ) : (
                <Button
                  onClick={() => execute(emulators[0]?.id)}
                  color="success"
                  variant="contained"
                >
                  {t('translation:game.play')}
                </Button>
              )}
            </>
          )}

          {game.sidFilename && (
            <Button onClick={() => playMusic()} color="primary" variant="outlined">
              {t('translation:game.music')}
            </Button>
          )}
          <Divider variant="middle" component="div" />
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label={'Game info'} />
            <Tab label={'Extras'} />
          </Tabs>

          <TabPanel value={selectedTab} index={0} sx={{ overflowY: 'auto', flex: 1 }}>
            <Grid2 container spacing={2} sx={{ overflowY: 'auto', flex: 1 }}>
              <InfoLine label={t('translation:game.release')} value={selectedYear} />
              <InfoLine label={t('translation:game.developer')} value={game.developer?.name} />
              <InfoLine label={t('translation:game.programmer')} value={game.programmer?.name} />
              <InfoLine label={t('translation:game.musician')} value={game.musician?.name} />
              <InfoLine label={t('translation:game.artist')} value={game.artist?.name} />
              <InfoLine label={t('translation:game.publisher')} value={game.publisher?.name} />
              <InfoLine label={t('translation:game.cracker')} value={game.cracker?.name} />
              <InfoLine label={t('translation:game.genre')} value={game.genre?.name} />
              <InfoLine
                label={t('translation:game.player_number')}
                value={
                  game.playersFrom && game.playersFrom !== game.playersTo
                    ? game.playersFrom + ' - ' + game.playersTo
                    : game.playersFrom
                }
              />
            </Grid2>
          </TabPanel>
          <TabPanel value={selectedTab} index={1} sx={{ overflowY: 'auto', flex: 1 }}>
            {loadingExtras && (
              <Container>
                <CircularProgress />
              </Container>
            )}
            {!loadingExtras && (
              <List>
                {extras.map((extra) => (
                  <ListItem disablePadding key={extra.id}>
                    <ListItemButton onClick={() => handleExtraClick(extra)}>
                      <ListItemText primary={extra.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </TabPanel>
        </Stack>
      )}

      <ExtraDialog
        open={extraDialogOpen}
        loading={loadingExtraFile}
        file={extraFile}
        onClose={() => {
          setExtraDialogOpen(false)
          setExtraFile(null)
        }}
      />
    </Stack>
  )
}
