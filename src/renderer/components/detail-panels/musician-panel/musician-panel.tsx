import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad } from '@fortawesome/free-solid-svg-icons'
import { createColumnHelper } from '@tanstack/react-table'
import { GameBase } from '@shared/models/settings.model'
import DataTable from '../../data-table/data-table'
import { t } from 'i18next'
import { GameDTO, MusicianDTO } from '@shared/models/form-schemes.model'
import { IMAGE_BASE64_PREFIX } from '@shared/consts'
import { UUID } from 'crypto'
import { useGameLauncher } from '@renderer/hooks/useGameLauncher'

const columnHelper = createColumnHelper<GameDTO>()
const columns = (
  gamebase: GameBase,
  launchGame: (gamebaseId: UUID, gameId: number, gameName: string, emulatorId?: string) => void
) => [
  columnHelper.accessor('id', { header: 'ID' }),
  columnHelper.accessor('name', { header: 'NAME' }),
  columnHelper.display({
    id: 'actions',
    cell: (props) => {
      return (
        <Stack direction="row">
          {props?.row?.original?.fileToRun && (
            <Box
              sx={{
                ':hover': {
                  cursor: 'pointer'
                }
              }}
            >
              <FontAwesomeIcon
                icon={faGamepad}
                fontSize="2.2em"
                onClick={() =>
                  launchGame(gamebase.id, props.row.original.id!, props.row.original.name)
                }
              />
            </Box>
          )}
        </Stack>
      )
    }
  })
]

export interface MusicianPanelProps {
  selected?: MusicianDTO | null
  selectedGamebase: GameBase
}

export function MusicianPanel({ selected, selectedGamebase }: MusicianPanelProps) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<string | null>()
  const [imageFolderError, setImageFolderError] = useState(false)
  const { launchGame } = useGameLauncher()

  const cols = useMemo(() => columns(selectedGamebase, launchGame), [launchGame, selectedGamebase])

  const fetchImage = useCallback(async () => {
    if (selected?.photo && selectedGamebase?.id) {
      try {
        const images = await window.electron.loadPhotoByPath(selected?.photo, selectedGamebase.id)
        setImage(images)
      } catch (error) {
        console.log(error)
        setImageFolderError(true)
      }
    } else {
      setImage(null)
    }
  }, [selected?.photo, selectedGamebase?.id])

  useEffect(() => {
    fetchImage()
  }, [fetchImage])

  useEffect(() => {
    console.log('s1', selected, 's2', selectedGamebase)
    if (selectedGamebase) {
      setLoading(true)
      const filter = {
        ['musician']: [selected?.id]
      }

      window.electron
        .getAll('Game', filter, selectedGamebase.id)
        .then((games) => {
          setGames(games)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [selected?.id, selectedGamebase])

  if (loading) {
    return (
      <Stack direction="column" sx={{ alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Stack>
    )
  }

  return (
    <Stack direction="column" sx={{ width: '100%', height: '100%' }}>
      <Stack alignItems="center" sx={{ pt: 1, pb: 0.5 }}>
        {imageFolderError && (
          <Box sx={{ bgcolor: 'error.main', color: 'error.contrastText', padding: '3px' }}>
            {t('translation:musician.messages.photos')}
          </Box>
        )}

        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0
          }}
        >
          {image ? (
            <Box
              component="img"
              src={IMAGE_BASE64_PREFIX + image}
              alt={selected?.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '1.8rem'
              }}
            >
              No photo available
            </Box>
          )}
        </Box>
      </Stack>

      <Box
        sx={{
          flexShrink: 0,
          p: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ textAlign: 'center' }}>
          {selected?.name}
        </Typography>
        <Typography variant="h6">
          {t('translation:selected_panel.games')} ({games.length} {t('translation:common.entries')})
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          height: '100%'
        }}
      >
        <DataTable
          data={games}
          columns={cols}
          loading={loading}
          noHeader={true}
          noHorizontalScroll={true}
        />
      </Box>
    </Stack>
  )
}
