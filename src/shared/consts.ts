import { IdLabelObject } from './models/form-schemes.model'

export const SEPARATOR = window.navigator.platform.startsWith('Win') ? '\\' : '/'

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
