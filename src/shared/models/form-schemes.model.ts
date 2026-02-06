import { t } from 'i18next'
import { AnyObject, bool, InferType, lazy, number, object, ObjectSchema, string } from 'yup'

export interface IdLabelObject {
  id: number
  label: string
  inputValue?: string
}

// const command = object().shape({
//   name: string(),
//   executable: string(),
//   type: string()
// })

export const refObject = object().shape({
  id: number().nullable(),
  name: string().nullable()
})

export const gamebaseSchema = object().shape({
  id: string().nullable(),
  name: string().required(t('translation:gamebase.errors.name_required')),
  importFile: string(),
  dbFile: string().required(t('translation:gamebase.errors.dbfile_required')),
  emulator: string().nullable(),
  musicplayer: string().nullable(),
  folders: object({
    games: string().nullable(),
    extractTo: string().nullable(),
    images: string().nullable(),
    music: string().nullable(),
    photos: string().nullable()
  })
})

export const baseSchema = object().shape({
  id: number().nullable(),
  name: string()
})

export interface Genre {
  id?: number | null
  name?: string
  parent?: Genre | null
}

export const genreSchema: ObjectSchema<Genre> = object({
  id: number().nullable(),
  name: string(),
  parent: lazy(() => genreSchema.nullable().default(null))
}) as ObjectSchema<Genre>

export const musicianSchema = object().shape({
  id: number().nullable(),
  name: string().required(t('translation:gamebase.errors.name_required')),
  photo: string(),
  grp: string(),
  nick: string()
})

export const musicSchema = object().shape({
  id: number().nullable(),
  name: string(),
  game: refObject.nullable(),
  filename: string(),
  musician: refObject.nullable(),
  fav: bool(),
  adult: bool()
})

export const gameSchema = object().shape({
  id: number().nullable(),
  name: string().required(t('translation:gamebase.errors.name_required')),
  year: number(),
  filename: string().nullable(),
  fileToRun: string().nullable(),
  filenameIndex: number().nullable(),
  scrnshotFilename: string().nullable(),
  musician: refObject.nullable(),
  genre: genreSchema.nullable(),
  publisher: refObject.nullable(),
  difficulty: refObject.nullable(),
  cracker: refObject.nullable(),
  sidFilename: string().nullable(),
  programmer: refObject.nullable(),
  language: refObject.nullable(),
  classic: number().nullable(),
  rating: number().nullable(),
  palNtsc: number().nullable(),
  length: number().nullable(),
  trainers: number().nullable(),
  playersFrom: number()
    .min(0)
    .test('min', '${path} must be smaller than or equals to playersTo', (value, context) =>
      value && context.parent.playersTo ? value <= context.parent.playersTo : true
    )
    .nullable(),
  playersTo: number()
    .min(0)
    .test('max', '${path} must be greater than or equals to playersFrom', (value, context) =>
      value && context.parent.playersFrom ? value >= context.parent.playersFrom : true
    )
    .nullable(),
  playersSim: bool().nullable(),
  adult: bool().nullable(),
  memoText: string().nullable(),
  prequel: refObject.nullable(),
  sequel: refObject.nullable(),
  related: refObject.nullable(),
  control: number().nullable(),
  crc: string().nullable(),
  filesize: number().nullable(),
  version: number().nullable(),
  gemus: string().nullable(),
  lengthType: number().nullable(),
  comment: string().nullable(),
  versionComment: string().nullable(),
  loadingScreen: bool().nullable(),
  highscoreSaver: bool().nullable(),
  includedDocs: bool().nullable(),
  trueDriveEmu: bool().nullable(),
  artist: refObject.nullable(),
  developer: refObject.nullable(),
  license: refObject.nullable(),
  rarity: refObject.nullable(),
  weblinkName: string().nullable(),
  weblinkUrl: string().nullable(),
  titleScreen: bool().nullable(),
  playable: bool().nullable(),
  original: bool().nullable(),
  cloneOf: refObject.nullable(),
  reviewRating: number().nullable(),
  highscore: string().nullable(),
  fav: bool().nullable()
})

export const extraSchema = object().shape({
  id: number().nullable(),
  name: string().nullable(),
  game: number().nullable(),
  displayOrder: number().nullable(),
  type: number().nullable(),
  path: string().nullable(),
  data: string().nullable(),
  fileToRun: string().nullable()
})

export type GamebaseDTO = InferType<typeof gamebaseSchema>
export type GameDTO = InferType<typeof gameSchema>
export type BaseDTO = InferType<typeof baseSchema>
export type ArtistDTO = InferType<typeof baseSchema>
export type CrackerDTO = InferType<typeof baseSchema>
export type LanguageDTO = InferType<typeof baseSchema>
export type RarityDTO = InferType<typeof baseSchema>
export type LicenseDTO = InferType<typeof baseSchema>
export type DifficultyDTO = InferType<typeof baseSchema>
export type PublisherDTO = InferType<typeof baseSchema>
export type ProgrammerDTO = InferType<typeof baseSchema>
export type DeveloperDTO = InferType<typeof baseSchema>
export type MusicianDTO = InferType<typeof musicianSchema>
export type MusicDTO = InferType<typeof musicSchema>
export type GenreDTO = InferType<typeof genreSchema>
export type ExtraDTO = InferType<typeof extraSchema>

export interface AppInfo {
  name: string
  version: string
  electron: string
  chrome: string
  node: string
  license: string
}
