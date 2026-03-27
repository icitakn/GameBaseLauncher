import { UNDEFINED_YEARS_MAP } from '@shared/consts'
import { GameDTO, Genre } from '@shared/models/form-schemes.model'

const nameOf = (val: unknown): string => {
  if (!val) return ''
  return typeof val === 'object' && 'name' in val ? (val as { name: string }).name : String(val)
}

const getFullGenreLabel = (genre: Genre): string => {
  if (!genre.parent) {
    return genre.name ?? ''
  }
  const parentLabel = getFullGenreLabel(genre.parent)
  return parentLabel + ' - ' + genre.name
}

export const nameOfAccessors: Partial<Record<keyof GameDTO, (row: GameDTO) => string>> = {
  publisher: (row) => nameOf(row.publisher),
  developer: (row) => nameOf(row.developer),
  programmer: (row) => nameOf(row.programmer),
  musician: (row) => nameOf(row.musician),
  artist: (row) => nameOf(row.artist),
  language: (row) => nameOf(row.language),
  difficulty: (row) => nameOf(row.difficulty),
  rarity: (row) => nameOf(row.rarity),
  license: (row) => nameOf(row.license)
}

export const yearAccessor = (row: GameDTO) => {
  const val = row.year
  return val && UNDEFINED_YEARS_MAP[val] ? UNDEFINED_YEARS_MAP[val] : (val?.toString() ?? '')
}

export const genreAccessor = (row: GameDTO) => (row?.genre ? getFullGenreLabel(row.genre) : '')
