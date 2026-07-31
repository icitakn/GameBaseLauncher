import { HashRouter, useNavigate } from 'react-router-dom'
import { ReactElement, useContext, useEffect, useRef, useState } from 'react'
import { Settings } from '@shared/models/settings.model'
import { SettingsContext } from './contexts/settings.context'
import Router from './router'
import { setAppLanguage } from './i18n/config'
import { useGamebasePolling } from './hooks/useGamebasePolling'
import { Box, CircularProgress } from '@mui/material'

function AppContent(): ReactElement {
  useGamebasePolling()
  const { settings } = useContext(SettingsContext)
  const navigate = useNavigate()
  const hasNavigated = useRef(false)

  useEffect(() => {
    if (!settings || hasNavigated.current) return
    hasNavigated.current = true

    const pos = settings.lastPosition
    if (!pos || !pos.baseUrl) return

    const gbId = pos.baseUrl.split('/')[2]
    if (!settings.gamebases.find((gb) => gb.id === gbId)) return

    if (settings.rememberLastPosition) {
      navigate(`${pos.baseUrl}?entry=${pos.entry}`)
    }
  }, [settings])

  return <Router />
}

export default function App(): ReactElement {
  const [settings, setSettings] = useState<Settings>()
  const providerValue = { settings, setSettings }

  useEffect(() => {
    window.electron.getOrCreateSettings().then((settings: Settings) => {
      setSettings(settings)
      setAppLanguage(settings?.language)
    })
  }, [])

  if (!settings) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <HashRouter>
      <SettingsContext.Provider value={providerValue}>
        <AppContent />
      </SettingsContext.Provider>
    </HashRouter>
  )
}
