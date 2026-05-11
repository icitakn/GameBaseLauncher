import { UUID } from 'crypto'

export type Emulator = {
  id: string
  name: string
  path: string
  gemusScript?: string | null
}

export type GameBase = {
  id: UUID
  name: string
  importFile?: string
  dbFile: string
  folders?: {
    extractTo?: string | null
    games?: string | null
    images?: string | null
    music?: string | null
    photos?: string | null
    extras?: string | null
  }
  emulators?: Emulator[] | null
  musicplayer?: string | null
  state?: string | null
  columnSelections?: Record<string, string[]>
  repacking?: {
    repackGames?: boolean
    askBefore?: boolean
    notifyAfter?: boolean
  }
}

export type GamePlayed = {
  gamebaseId: UUID
  emulatorId?: string
  id: number
  name: string
  genre: string
  lastPlayedAtMs: number
  playtimeInMs: number
  rating: number
}

export type MusicListened = {
  gamebaseId: UUID
  id: number
  name: string
  lastPlayedAtMs: number
  fromGame: boolean
}

export type Settings = {
  language: string
  rememberLastPosition: boolean
  lastPosition: {
    baseUrl: string
    entry: number
  }
  gamebases: GameBase[]
  stats: {
    gamesPlayed: GamePlayed[]
    musicListenedTo: MusicListened[]
  }
}

export type ImportFileCheckResult = {
  numberOfGames: number
}
