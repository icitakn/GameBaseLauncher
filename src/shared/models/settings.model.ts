import { UUID } from 'crypto'

export type Command = {
  name: string
  executable: string
  type: string
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
  }
  emulator?: string | null
  musicplayer?: string | null
  // commands?: Command[];
  state?: string | null
}

export type GamePlayed = {
  gamebaseId: UUID
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
  gamebases: GameBase[]
  stats: {
    gamesPlayed: GamePlayed[]
    musicListenedTo: MusicListened[]
  }
}

export type ImportFileCheckResult = {
  numberOfGames: number
}
