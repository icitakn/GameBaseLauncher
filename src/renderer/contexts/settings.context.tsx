import { Settings } from '@shared/models/settings.model'
import { createContext, Dispatch, SetStateAction } from 'react'

type SettingsContextT = {
  settings: Settings | undefined
  setSettings: Dispatch<SetStateAction<Settings | undefined>>
}

export const SettingsContext = createContext<SettingsContextT>({
  settings: undefined,
  setSettings: () => {}
})
