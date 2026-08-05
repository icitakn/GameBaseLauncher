import { initReactI18next } from 'react-i18next'
import translation_en from './en/translation.json'
import translation_de from './de/translation.json'
import i18next, { init, use } from 'i18next'
import { IdLabelObject } from '@shared/models/form-schemes.model'

export const LANGUAGES: IdLabelObject[] = [
  {
    id: 1,
    label: 'English',
    inputValue: 'en'
  },
  {
    id: 2,
    label: 'Deutsch',
    inputValue: 'de'
  }
] as const

export const i18nResources = {
  en: {
    translation: translation_en
  },
  de: {
    translation: translation_de
  }
}

i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  resources: i18nResources
})

export const setAppLanguage = (language?: string) => {
  if (language && i18next.language !== language) {
    i18next.changeLanguage(language)
  }
}

export default i18next
