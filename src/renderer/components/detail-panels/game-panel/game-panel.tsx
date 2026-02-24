import { GameDTO } from '@shared/models/form-schemes.model'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid2,
  ImageList,
  ImageListItem,
  Stack
} from '@mui/material'
import { t } from 'i18next'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { UNDEFINED_YEARS } from '@shared/consts'
import useEntityStore from '@renderer/hooks/useEntityStore'
import { GameBase } from '@shared/models/settings.model'

const IMAGE_BASE64_PREFIX = 'data:image/png;base64, '

export interface GamePanelProps {
  selected?: GameDTO | null
  selectedGamebase?: GameBase
}

export function GamePanel({ selected, selectedGamebase }: GamePanelProps): ReactElement {
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [imageFolderError, setImageFolderError] = useState(false)

  const { loadGameById } = useEntityStore()
  const [game, setGame] = useState<GameDTO | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(true)

  useEffect(() => {
    const load = async (id, gamebaseId) => {
      setLoadingDetail(true)
      try {
        const fullGame = await loadGameById(id, gamebaseId)
        setGame(fullGame)
      } finally {
        setLoadingDetail(false)
      }
    }
    if (selected?.id && selectedGamebase?.id) {
      load(selected.id, selectedGamebase.id)
    }
  }, [loadGameById, selected?.id, selectedGamebase?.id])

  const execute = async (): Promise<void> => {
    if (game && game.id && selectedGamebase?.id) {
      try {
        await window.electron.execute(selectedGamebase.id, game.id)
      } catch (error) {
        toast.error(t('common.error_occured') + error)
      }
    }
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

  return (
    <Stack direction="column" sx={{ alignItems: 'center', height: '100%' }}>
      {imageFolderError && (
        <Box
          sx={{
            bgcolor: 'error.main',
            color: 'error.contrastText',
            padding: '3px'
          }}
        >
          {t('translation:game.messages.screenshots')}
        </Box>
      )}
      {images && images.length > 0 && (
        <>
          <Box
            component="img"
            src={IMAGE_BASE64_PREFIX + images[selectedImage]}
            sx={{ height: '100px', width: '200px' }}
          />
          <ImageList
            sx={{
              width: '200px',
              height: '75px',
              border: '1px black solid',
              gridAutoFlow: 'column',
              gridAutoColumns: '75px',
              gridTemplateColumns: 'unset',
              maxWidth: '200px'
            }}
            cols={0}
          >
            {images.map((item, index) => (
              <ImageListItem
                key={index}
                sx={{
                  border: '1px white solid',
                  ':hover': {
                    border: '1px black solid'
                  }
                }}
              >
                <img src={IMAGE_BASE64_PREFIX + item} onClick={() => setSelectedImage(index)} />
              </ImageListItem>
            ))}
          </ImageList>
        </>
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
            <Button onClick={() => execute()} color="success" variant="contained">
              {t('translation:game.play')}
            </Button>
          )}
          {game.sidFilename && (
            <Button onClick={() => playMusic()} color="primary" variant="outlined">
              {t('translation:game.music')}
            </Button>
          )}
          <Divider variant="middle" component="div" />
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
        </Stack>
      )}
    </Stack>
  )
}
