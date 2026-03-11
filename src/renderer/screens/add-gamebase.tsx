import { Card, Container, Stack } from '@mui/material'
import { t } from 'i18next'
import { Settings, GameBase } from '@shared/models/settings.model'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { GamebaseForm } from '../components/gamebase-form/gamebase-form'
import { SettingsContext } from '../contexts/settings.context'
import useEntityStore from '@renderer/hooks/useEntityStore'

export function AddGamebase() {
  const navigate = useNavigate()
  const { settings, setSettings } = useContext(SettingsContext)

  const onSubmit = (gamebase: GameBase) => {
    window.electron.addGamebase(gamebase).then((result) => {
      const newSettings = result as Settings
      const gbFromSettings = newSettings.gamebases.find((gb) => gb.name === gamebase.name)

      setSettings({
        ...newSettings,
        gamebases: newSettings.gamebases.map((gb) =>
          gb.id === gbFromSettings?.id
            ? { ...gb, state: '0%' } // Import started
            : gb
        )
      })
      toast.success(t('translation:forms.messages.save_success'), {
        position: 'bottom-left'
      })
      useEntityStore.getState().clearStore()
      navigate('/gamebase/' + gbFromSettings?.id)
    })
  }

  return (
    <Stack direction="row" spacing={2} sx={{ padding: '10px', flex: '1' }}>
      <Card
        elevation={4}
        sx={{
          position: 'relative',
          width: '99%',
          height: '99%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          overflow: 'visible'
        }}
      >
        <GamebaseForm onSubmit={onSubmit} />
      </Card>
    </Stack>
  )
}
