import { IdLabelObject } from './models/form-schemes.model'

export const SEPARATOR = window.navigator.platform.startsWith('Win') ? '\\' : '/'

export const YEARS = Array(130)
  .fill(0)
  .map((_, index) => index + 1970)

export const UNDEFINED_YEARS: IdLabelObject[] = [
  { id: 9991, label: '19??' },
  { id: 9992, label: '197?' },
  { id: 9993, label: '198?' },
  { id: 9994, label: '199?' },
  { id: 9995, label: '20??' },
  { id: 9996, label: '200?' },
  { id: 9997, label: '201?' },
  { id: 9998, label: '202?' }
]

export const ALL_YEARS: IdLabelObject[] = [
  ...UNDEFINED_YEARS,
  ...YEARS.map((year) => ({
    id: year,
    label: year.toString()
  }))
]

export const UNDEFINED_YEARS_MAP = Object.fromEntries(UNDEFINED_YEARS.map((i) => [i.id, i.label]))
