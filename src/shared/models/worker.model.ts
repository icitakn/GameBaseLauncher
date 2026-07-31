import { GameBase } from './settings.model'

export type WorkerTask =
  | { task: 'import'; payload: { gamebase: GameBase } }
  | { task: 'migrate-user-dbs'; payload: { gamebases: GameBase[] } }
