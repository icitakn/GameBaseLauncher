import { HashRouter, useNavigate } from 'react-router-dom'
import { ReactElement, useContext, useEffect, useRef, useState } from 'react'
import { Settings } from '@shared/models/settings.model'
import { SettingsContext } from './contexts/settings.context'
import Router from './router'
import { InitI18N } from './i18n/config'
import { useGamebasePolling } from './hooks/useGamebasePolling'

function AppContent(): ReactElement {
  useGamebasePolling()
  const { settings } = useContext(SettingsContext)
  const navigate = useNavigate()
  const hasNavigated = useRef(false)

  useEffect(() => {
    if (!settings || hasNavigated.current) return
    hasNavigated.current = true

    const pos = settings.lastPosition
    if (settings.rememberLastPosition && pos && pos.baseUrl) {
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
      InitI18N(settings?.language)
    })
  }, [])

  return (
    <HashRouter>
      <SettingsContext.Provider value={providerValue}>
        <AppContent />
      </SettingsContext.Provider>
    </HashRouter>
  )
}
