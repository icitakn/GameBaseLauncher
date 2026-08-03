import { MusicDTO } from '@shared/models/form-schemes.model'
import { GameBase } from '@shared/models/settings.model'
import { Button, Grid2, Stack } from '@mui/material'
import { t } from 'i18next'
import { ReactElement } from 'react'
import { toast } from 'react-toastify'
import { DetailRow } from '@renderer/components/common/detail-row'

export interface MusicPanelProps {
  selected?: MusicDTO | null
  selectedGamebase?: GameBase
}

export function MusicPanel({ selected, selectedGamebase }: MusicPanelProps): ReactElement {
  const playMusic = async () => {
    if (selected && selected.id && selectedGamebase) {
      try {
        await window.electron.playMusic(selectedGamebase.id, { musicId: selected.id })
      } catch (error) {
        toast.error(t('common.error_occured') + error)
      }
    }
  }

  return (
    <Stack direction="column">
      {selected && (
        <Stack spacing={1} sx={{ alignSelf: 'stretch' }}>
          <strong style={{ textAlign: 'center' }}>{selected.name}</strong>
          <Button onClick={() => playMusic()} color="primary" variant="outlined">
            {t('translation:game.music')}
          </Button>
          <Grid2 container spacing={2} sx={{ overflowY: 'auto' }}>
            <DetailRow label={t('translation:game.musician')}>{selected?.musician?.name}</DetailRow>
          </Grid2>
        </Stack>
      )}
    </Stack>
  )
}
