import { GameDTO } from '@shared/models/form-schemes.model'
import { GameBase } from '@shared/models/settings.model'
import { Box, Button, Divider, Grid2, ImageList, ImageListItem, Stack } from '@mui/material'
import { t } from 'i18next'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { UNDEFINED_YEARS } from '@shared/consts'

const IMAGE_BASE64_PREFIX = 'data:image/png;base64, '

export interface GamePanelProps {
  selected?: GameDTO | null
  selectedGamebase?: GameBase
}

export function GamePanel({ selected, selectedGamebase }: GamePanelProps): ReactElement {
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [imageFolderError, setImageFolderError] = useState(false)

  const execute = async (): Promise<void> => {
    if (selected && selected.id && selectedGamebase) {
      try {
        await window.electron.execute(selectedGamebase.id, selected.id)
      } catch (error) {
        toast.error(t('common.error_occured') + error)
      }
    }
  }

  const playMusic = async (): Promise<void> => {
    if (selected && selected.id && selectedGamebase) {
      try {
        await window.electron.playMusic(selectedGamebase.id, { gameId: selected.id })
      } catch (error) {
        toast.error(t('common.error_occured') + error)
      }
    }
  }

  const fetchImages = useCallback(async () => {
    setSelectedImage(0)
    if (selected && selectedGamebase) {
      try {
        const images = await window.electron.loadImages(selected, selectedGamebase.id)
        setImages(images)
      } catch (error) {
        console.log(error)
        setImageFolderError(true)
      }
    }
  }, [selected, selectedGamebase])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const selectedYear = useMemo(() => {
    if (selected?.year && UNDEFINED_YEARS.some((year) => selected.year === year.id)) {
      return UNDEFINED_YEARS.find((year) => selected.year === year.id)?.label
    }
    return selected?.year
  }, [selected?.year])

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

      {selected && (
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
          <strong style={{ textAlign: 'center' }}>{selected.name}</strong>
          {selected.filename && (
            <Button onClick={() => execute()} color="success" variant="contained">
              {t('translation:game.play')}
            </Button>
          )}
          {selected.sidFilename && (
            <Button onClick={() => playMusic()} color="primary" variant="outlined">
              {t('translation:game.music')}
            </Button>
          )}
          <Divider variant="middle" component="div" />
          <Grid2 container spacing={2} sx={{ overflowY: 'auto', flex: 1 }}>
            <InfoLine label={t('translation:game.release')} value={selectedYear} />
            <InfoLine label={t('translation:game.developer')} value={selected.developer?.name} />
            <InfoLine label={t('translation:game.programmer')} value={selected.programmer?.name} />
            <InfoLine label={t('translation:game.musician')} value={selected.musician?.name} />
            <InfoLine label={t('translation:game.artist')} value={selected.artist?.name} />
            <InfoLine label={t('translation:game.publisher')} value={selected.publisher?.name} />
            <InfoLine label={t('translation:game.cracker')} value={selected.cracker?.name} />
            <InfoLine label={t('translation:game.genre')} value={selected.genre?.name} />
            <InfoLine
              label={t('translation:game.player_number')}
              value={
                selected.playersFrom && selected.playersFrom !== selected.playersTo
                  ? selected.playersFrom + ' - ' + selected.playersTo
                  : selected.playersFrom
              }
            />
          </Grid2>
        </Stack>
      )}
    </Stack>
  )
}
