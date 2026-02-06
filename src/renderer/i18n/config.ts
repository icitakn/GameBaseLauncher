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

export const InitI18N = (language?: string) => {
  use(initReactI18next)
  if (!i18next.isInitialized) {
    init({
      lng: language ?? 'en', // if you're using a language detector, do not define the lng option
      debug: true,
      resources: {
        en: {
          translation: translation_en
        },
        de: {
          translation: translation_de
        }
      }
      // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
      // set returnNull to false (and also in the i18next.d.ts options)
      // returnNull: false,
    })
  }
}
