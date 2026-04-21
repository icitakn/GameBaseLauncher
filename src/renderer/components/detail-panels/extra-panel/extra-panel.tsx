import { ExtraDTO, IdLabelObject } from '@shared/models/form-schemes.model'
import { GameBase } from '@shared/models/settings.model'
import { Button, Grid2, Stack } from '@mui/material'
import { t } from 'i18next'
import { ReactElement, useState } from 'react'
import { toast } from 'react-toastify'
import { ExtraDialog } from '@renderer/components/extra-dialog/extra-dialog'
import { ExtraFileResult } from '@shared/types/file.types'

export interface ExtraPanelProps {
  selected?: ExtraDTO | null
  selectedGamebase?: GameBase
}

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
        <div style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>{value}</div>
      </Grid2>
    </>
  )
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
            <InfoLine label={t('translation:forms.fields.name')} value={selected?.name} />
            <InfoLine label={t('translation:extra.game')} value={selected?.game?.name} />
            <InfoLine label={t('translation:extra.path')} value={selected?.path} />
            <InfoLine label={t('translation:extra.display_order')} value={selected?.displayOrder} />
            <InfoLine
              label={t('translation:extra.type')}
              value={TYPES.find((type) => type.id === selected?.type)?.label}
            />
            <InfoLine label={t('translation:extra.data')} value={selected?.data} />
            <InfoLine label={t('translation:extra.file_to_run')} value={selected?.fileToRun} />
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
