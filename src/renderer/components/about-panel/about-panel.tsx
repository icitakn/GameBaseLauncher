import { useConfirmDialog } from '@renderer/hooks/useConfirmDialog'
import { AppInfo } from '@shared/models/form-schemes.model'
import { Button, Divider, Grid2, Typography } from '@mui/material'
import { t } from 'i18next'
import { ReactElement, useEffect, useState } from 'react'

export function AboutPanel(): ReactElement {
  const [appInfo, setAppInfo] = useState<AppInfo>()
  const [licenses, setLicenses] = useState('')

  useEffect(() => {
    window.electron.getAppInfo().then((appInfo) => setAppInfo(appInfo))
    window.electron.getLicenses().then((result) => setLicenses(result?.content))
  }, [])

  const { openConfirmDialog } = useConfirmDialog()

  const handleMITClick = (): void => {
    openConfirmDialog({
      mode: 'okonly',
      title: t('translation:about.dialogs.mit'),
      message: <pre style={{ whiteSpace: 'pre-line' }}>{appInfo?.license}</pre>
      //sx: { maxWidth: '650px' }
    })
  }

  const handle3rdPartyClick = (): void => {
    openConfirmDialog({
      mode: 'okonly',
      title: t('translation:about.dialogs.3rd'),
      message: <pre style={{ whiteSpace: 'pre-line' }}>{licenses}</pre>
      //sx: { maxWidth: '650px' }
    })
  }

  return (
    <Grid2 container rowSpacing={2}>
      <Grid2 size={6}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {t('translation:about.name')}:
        </Typography>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6">GameBaseLauncher</Typography>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {t('translation:about.version')}:
        </Typography>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6">{appInfo?.version}</Typography>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Electron:
        </Typography>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6">{appInfo?.electron}</Typography>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Chrome:
        </Typography>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6">{appInfo?.chrome}</Typography>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Node:
        </Typography>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6">{appInfo?.node}</Typography>
      </Grid2>
      <Divider />
      <Grid2 size={6}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {t('translation:about.licensed_under')}:
        </Typography>
      </Grid2>
      <Grid2 size={6}>
        <Button variant="outlined" onClick={handleMITClick}>
          {t('translation:about.dialogs.mit')}
        </Button>
      </Grid2>
      <Grid2 size={6}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {t('translation:about.dialogs.3rd')}:
        </Typography>
      </Grid2>
      <Grid2 size={6}>
        <Button variant="outlined" onClick={handle3rdPartyClick}>
          {t('translation:about.licenses')}
        </Button>
      </Grid2>
    </Grid2>
  )
}
