import { ExtraDTO, IdLabelObject } from '@shared/models/form-schemes.model'
import { GameBase } from '@shared/models/settings.model'
import { Button, Grid2, Stack } from '@mui/material'
import { t } from 'i18next'
import { ReactElement, useState } from 'react'
import { toast } from 'react-toastify'
import { ExtraDialog } from '@renderer/components/extra-dialog/extra-dialog'
import { ExtraFileResult } from '@shared/types/file.types'
import { DetailRow } from '@renderer/components/common/detail-row'

export interface ExtraPanelProps {
  selected?: ExtraDTO | null
  selectedGamebase?: GameBase
}

export function ExtraPanel({ selected, selectedGamebase }: ExtraPanelProps): ReactElement {
  const [extraFile, setExtraFile] = useState<ExtraFileResult | null>(null)
  const [extraDialogOpen, setExtraDialogOpen] = useState(false)
  const [loadingExtraFile, setLoadingExtraFile] = useState(false)
  const TYPES: IdLabelObject[] = [
    { id: 0, label: t('translation:extra.types.standard') },
    { id: 1, label: t('translation:extra.types.gemus') },
    { id: 2, label: t('translation:extra.types.music') },
    { id: 3, label: t('translation:extra.types.url') }
  ]

  async function handleExtraClick(): Promise<void> {
    if (!selected?.path) return
    if (!selectedGamebase?.folders?.extras) return

    setLoadingExtraFile(true)
    setExtraDialogOpen(true)
    try {
      const result = await window.electron.readExtra(
        selected.path,
        selected?.fileToRun ?? undefined,
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
    <Stack direction="column">
      {selected && (
        <Stack spacing={1} sx={{ alignSelf: 'stretch' }}>
          <strong style={{ textAlign: 'center' }}>{selected.name}</strong>
          <Button onClick={() => handleExtraClick()} color="primary" variant="outlined">
            {t('translation:buttons.open')}
          </Button>
          <Grid2 container spacing={2} sx={{ overflowY: 'auto' }}>
            <DetailRow label={t('translation:forms.fields.name')} value={selected?.name} />
            <DetailRow label={t('translation:extra.game')} value={selected?.game?.name} />
            <DetailRow label={t('translation:extra.path')} value={selected?.path} />
            <DetailRow
              label={t('translation:extra.display_order')}
              value={selected?.displayOrder}
            />
            <DetailRow
              label={t('translation:extra.type')}
              value={TYPES.find((type) => type.id === selected?.type)?.label}
            />
            <DetailRow label={t('translation:extra.data')} value={selected?.data} />
            <DetailRow label={t('translation:extra.file_to_run')} value={selected?.fileToRun} />
          </Grid2>
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
