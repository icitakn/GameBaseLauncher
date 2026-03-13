import { Card, Container, Stack } from '@mui/material'
import { GameBase } from '@shared/models/settings.model'
import { toast } from 'react-toastify'
import { GamebaseForm } from '../components/gamebase-form/gamebase-form'
import { useSelectedGamebase } from '../hooks/useGamebase'
import { t } from 'i18next'
import { BaseDTO } from '@shared/models/form-schemes.model'

export function EditGamebase() {
  const createNew = (): BaseDTO => {
    return {
      id: undefined,
      name: undefined
    }
  }

  // const navigate = useNavigate();
  const { selectedGamebase } = useSelectedGamebase()

  const onSubmit = (gamebase: GameBase) => {
    if (selectedGamebase) {
      // the form does not contain the id, so we need to set it here
      gamebase.id = selectedGamebase.id
      window.electron.editGamebase(gamebase).then(() => {
        toast.success(t('translation:forms.messages.save_success'), {
          position: 'bottom-left'
        })
      })
    }
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ padding: '10px', flex: '1', alignItems: 'flex-start' }}
    >
      <Card
        elevation={4}
        sx={{
          position: 'relative',
          width: '99%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          overflow: 'visible'
        }}
      >
        <GamebaseForm onSubmit={onSubmit} gamebase={selectedGamebase} />
      </Card>
    </Stack>
  )
}
