import { Stack, Tab, Tabs } from '@mui/material'
import { GeneralSettingsForm } from '../components/settings/general-settings-form'
import { TabPanel } from '../components/common/tab-panel'
import { Fragment, useContext, useState } from 'react'
import { AboutPanel } from '../components/about-panel/about-panel'
import { changeLanguage, t } from 'i18next'
import { SettingsContext } from '../contexts/settings.context'
import { useNavigate } from 'react-router-dom'
import { LANGUAGES } from '@renderer/i18n/config'

function Settings() {
  const { settings, setSettings } = useContext(SettingsContext)
  const [selectedTab, setSelectedTab] = useState(0)
  const handleTabChange = (event: React.SyntheticEvent, newTab: number) => {
    setSelectedTab(newTab)
  }

  const navigate = useNavigate()

  const handleSubmit = (data: any) => {
    if (settings) {
      settings.language = LANGUAGES.find((lang) => lang.id === data.language)?.inputValue ?? 'en'
      window.electron.saveSettings(settings).then(() => {
        setSettings(settings)
        changeLanguage(settings.language).then(() => {
          navigate('/')
        })
      })
    }
  }

  return (
    <Fragment>
      {settings && (
        <Stack sx={{ margin: 2 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label={t('translation:settings.tabs.general')} value={0} />
            <Tab label={t('translation:settings.tabs.about')} value={1} />
          </Tabs>

          <TabPanel value={selectedTab} index={0}>
            <GeneralSettingsForm settings={settings} onSubmit={handleSubmit} />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <AboutPanel />
          </TabPanel>
        </Stack>
      )}
    </Fragment>
  )
}

export default Settings
