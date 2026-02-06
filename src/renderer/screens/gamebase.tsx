import { CircularProgress, Container } from '@mui/material'
import { useSelectedGamebase } from '../hooks/useGamebase'
import { t } from 'i18next'

export function Gamebase() {
  const { selectedGamebase } = useSelectedGamebase()
  const isImporting = selectedGamebase?.state ? selectedGamebase.state.endsWith('%') : false
  const importFailed = selectedGamebase?.state ? selectedGamebase.state.endsWith('failed') : false

  return (
    <>
      {selectedGamebase && (
        <>
          <Container
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <div>Gamebase {selectedGamebase.name}</div>
            {isImporting && (
              <>
                <div>
                  {t('translation:gamebase.messages.importing')}({selectedGamebase.state})
                </div>
                <CircularProgress />
              </>
            )}
            {importFailed && (
              <>
                <div>{t('translation:gamebase.messages.import_failed')}</div>
              </>
            )}
          </Container>
        </>
      )}
    </>
  )
}
