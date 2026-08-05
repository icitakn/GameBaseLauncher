import { ipcMain } from 'electron'
import { UUID } from 'crypto'
import { loadGamebase } from './gamebase.controller'
import { GameUserData } from '../entities/user/game-user-data.entity'
import { GameUserDataDTO } from '@shared/models/form-schemes.model'
import { GameSession } from '../entities/user/game-session.entity'
import { MusicSession } from '../entities/user/music-session.entity'
import { GamePlayed, MusicListened } from '@shared/models/settings.model'

export const registerUserDataController = () => {
  // backend
  ipcMain.handle('userdata:getGamebaseStats', async (_, gamebaseId: UUID) => {
    const { user } = await loadGamebase(gamebaseId)
    const gameSessions = await user.em.fork().findAll(GameSession)
    const musicSessions = await user.em.fork().findAll(MusicSession)

    return {
      gameSessions: gameSessions.map((s) => toGamePlayed(s, gamebaseId)),
      musicSessions: musicSessions.map((s) => toMusicListened(s, gamebaseId))
    }
  })

  function toGamePlayed(session: GameSession, gamebaseId: UUID): GamePlayed {
    return {
      gamebaseId,
      id: session.gameId,
      emulatorId: session.emulatorId,
      name: session.name ?? 'Unknown',
      genre: session.genre ?? 'Unknown',
      lastPlayedAtMs: session.lastPlayedAtMs,
      playtimeInMs: session.playtimeInMs
    }
  }

  function toMusicListened(session: MusicSession, gamebaseId: UUID): MusicListened {
    return {
      gamebaseId,
      musicOrGameId: session.musicOrGameId,
      name: session.name ?? 'Unknown',
      lastPlayedAtMs: session.lastPlayedAtMs,
      fromGame: session.fromGame
    }
  }

  ipcMain.handle('userdata:get', async (_, gameId: number, gamebaseId: UUID) => {
    const { user } = await loadGamebase(gamebaseId)
    return await user.em.fork().findOne(GameUserData, { gameId })
  })

  ipcMain.handle('userdata:upsert', async (_, data: GameUserDataDTO, gamebaseId: UUID) => {
    const { user } = await loadGamebase(gamebaseId)
    const em = user.em.fork()

    console.log('data', data)

    const existing = await em.findOne(GameUserData, { gameId: data.gameId })

    if (existing) {
      Object.assign(existing, data)
      await em.persistAndFlush(existing)
      return existing
    } else {
      const newEntry = em.create(GameUserData, data)
      await em.persistAndFlush(newEntry)
      return newEntry
    }
  })
}
