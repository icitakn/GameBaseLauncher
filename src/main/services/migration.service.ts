import { GameUserData } from '../entities/user/game-user-data.entity'
import { Game } from '../entities/main/game.entity'
import { TaskStatus, UserDbState } from '../entities/user/user-db-state.entity'
import {
  AbstractSqlConnection,
  AbstractSqlDriver,
  AbstractSqlPlatform,
  MikroORM,
  SqlEntityManager
} from '@mikro-orm/better-sqlite'
import { GameBase } from '@shared/models/settings.model'
import { MessagePort } from 'worker_threads'
import { getSettingsFromPath, saveSettingsToPath } from './file.service'
import { GameSession } from '../entities/user/game-session.entity'
import { MusicSession } from '../entities/user/music-session.entity'

export enum Tasks {
  USER_DB_INIT = 'user_db_init',
  GAME_SESSIONS = 'game_sessions'
}

type MigrationFn = (
  gamebase: GameBase,
  db: { main: MikroORM; user: MikroORM },
  configPath: string
) => Promise<void>

const migrations = new Map<Tasks, MigrationFn>([
  [Tasks.USER_DB_INIT, initUserDb],
  [Tasks.GAME_SESSIONS, initGameSessions]
])

async function initGameSessions(
  gamebase: GameBase,
  db: { main: MikroORM; user: MikroORM },
  configPath: string
): Promise<void> {
  const settings = getSettingsFromPath(configPath)
  const userEM = db.user.em.fork()

  if (settings.stats?.gamesPlayed) {
    const played = settings.stats?.gamesPlayed?.filter((p) => p.gamebaseId === gamebase.id)
    for (const game of played) {
      const session = userEM.create(GameSession, {
        gameId: game.id,
        name: game.name,
        emulatorId: game.emulatorId,
        genre: game.genre,
        lastPlayedAtMs: game.lastPlayedAtMs,
        playtimeInMs: game.playtimeInMs
      })
      userEM.persist(session)
    }
    userEM.flush()
  }

  if (settings.stats?.musicListenedTo) {
    const played = settings.stats?.musicListenedTo?.filter((p) => p.gamebaseId === gamebase.id)
    for (const music of played) {
      const session = userEM.create(MusicSession, {
        musicOrGameId: music.id,
        name: music.name,
        lastPlayedAtMs: music.lastPlayedAtMs,
        fromGame: music.fromGame
      })
      userEM.persist(session)
    }
    userEM.flush()
  }

  if (settings.stats) {
    settings.stats = {
      gamesPlayed: settings.stats?.gamesPlayed?.filter((p) => p.gamebaseId !== gamebase.id),
      musicListenedTo: settings.stats?.musicListenedTo?.filter((p) => p.gamebaseId !== gamebase.id)
    }

    if (settings.stats.gamesPlayed.length === 0 && settings.stats.musicListenedTo.length === 0) {
      settings.stats = undefined
    }
    saveSettingsToPath(settings, configPath)
  }
}

async function initUserDb(
  gamebase: GameBase,
  db: { main: MikroORM; user: MikroORM },
  configPath: string
): Promise<void> {
  const mainEM = db.main.em.fork()
  const userEM = db.user.em.fork()

  const games = await mainEM.findAll(Game)
  for (const game of games) {
    createGameUserDataEntry(game, userEM)
  }
  userEM.flush()
}

export const createGameUserDataEntry = (
  game: Game,
  userEM: SqlEntityManager<AbstractSqlDriver<AbstractSqlConnection, AbstractSqlPlatform>>
) => {
  const gameData = userEM.create(GameUserData, {
    favorite: game.fav === 1,
    gameId: game.id!,
    playCount: game.timesPlayed ?? 0,
    comment: '',
    highScore: game.highscore,
    lastPlayedAt: game.dateLastPlayed,
    rating: game.rating
  })
  userEM.persist(gameData)
}

export async function migrateData(
  gamebase: GameBase,
  db: { main: MikroORM; user: MikroORM },
  port: MessagePort,
  configPath: string
): Promise<void> {
  const userEM = db.user.em.fork()
  const dbStates = await userEM.findAll(UserDbState)
  const stateMap = new Map(dbStates.map((s) => [s.key, s]))

  for (const [task, fn] of migrations) {
    const existing = stateMap.get(task)

    if (existing?.status === TaskStatus.DONE) {
      continue
    }
    const taskEM = db.user.em.fork()

    const state = existing
      ? Object.assign(existing, {
          status: TaskStatus.RUNNING,
          completedAt: undefined,
          errorMessage: undefined
        })
      : taskEM.create(UserDbState, { key: task, status: TaskStatus.RUNNING })

    await taskEM.persistAndFlush(state)
    port.postMessage({ status: 'running', task })

    try {
      await fn(gamebase, db, configPath)
      state.status = TaskStatus.DONE
      state.completedAt = new Date()
      await taskEM.persistAndFlush(state)
      port.postMessage({ status: 'done', task })
    } catch (err: any) {
      state.status = TaskStatus.FAILED
      state.errorMessage = err.message
      await taskEM.persistAndFlush(state)
      port.postMessage({ status: 'failed', task, message: err.message })
      throw err
    }
  }
}
