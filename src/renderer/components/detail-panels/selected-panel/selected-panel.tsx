import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad } from '@fortawesome/free-solid-svg-icons'
import { createColumnHelper } from '@tanstack/react-table'
import { GameBase } from '@shared/models/settings.model'
import DataTable from '../../data-table/data-table'
import { t } from 'i18next'
import { GameDTO } from '@shared/models/form-schemes.model'
import { toast } from 'react-toastify'

const columnHelper = createColumnHelper<GameDTO>()
const columns = (gamebase: GameBase) => [
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
                onClick={() => execute(gamebase, props.row.original)}
              />
            </Box>
          )}
        </Stack>
      )
    }
  })
]

const execute = async (gamebase: GameBase, game: GameDTO) => {
  if (game && game.id) {
    try {
      await window.electron.execute(gamebase.id, game.id)
    } catch (error) {
      toast.error(t('common.error_occured') + error)
    }
  }
}

export interface SelectedPanelProps {
  selectedName?: string
  selectedId: number
  selectedTable: string
  selectedGamebase: GameBase
}

export function SelectedPanel({
  selectedName,
  selectedId,
  selectedTable,
  selectedGamebase
}: SelectedPanelProps) {
  const [value, setValue] = useState(0)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const cols = useMemo(() => columns(selectedGamebase), [selectedGamebase])

  useEffect(() => {
    if (selectedGamebase) {
      setLoading(true)
      const filter = {
        [selectedTable.toLowerCase()]: [selectedId]
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
  }, [selectedId, selectedTable, selectedGamebase])

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          p: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ textAlign: 'center' }}>
          {selectedName}
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
        <DataTable data={games} columns={cols} loading={loading} noHeader={true} />
      </Box>
    </Box>
  )
}
