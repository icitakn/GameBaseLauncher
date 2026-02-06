import { HashRouter } from 'react-router-dom'
import { ReactElement, useEffect, useState } from 'react'
import { Settings } from '@shared/models/settings.model'
import { SettingsContext } from './contexts/settings.context'
import Router from './router'
import { InitI18N } from './i18n/config'
import { useGamebasePolling } from './hooks/useGamebasePolling'

function AppContent(): ReactElement {
  useGamebasePolling()

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
