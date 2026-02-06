import { UUID } from 'crypto'
import { ipcMain } from 'electron'
import { loadGamebase } from './gamebase.controller'
import { Game } from '../entities/game.entity'
import { execute, playMusic } from '../services/executor.service'
import { Music } from '../entities/music.entity'

export const registerExecuteController = () => {
  ipcMain.handle('execute:game', async (_, gamebaseId: UUID, gameId: number) => {
    const { db, gamebase } = await loadGamebase(gamebaseId)

    if (gamebase) {
      const game = await db.em
        .fork()
        .findOne(Game, [gameId], { populate: ['genre', 'genre.parent'] })

      if (game) {
        execute(gamebase, game)
      }
    }
  })

  ipcMain.handle(
    'execute:music',
    async (_, gamebaseId: UUID, options: { gameId?: number; musicId?: number }) => {
      const { db, gamebase } = await loadGamebase(gamebaseId)

      let name: string
      let filename: string
      let id: number
      let fromGame = true
      if (options.gameId) {
        const game = await db.em.fork().findOne(Game, [options.gameId])
        if (!game || !game.id || !game.sidFilename) {
          throw new Error('Game music not found')
        }

        name = game.name ?? ''
        filename = game.sidFilename
        id = game.id
      } else if (options.musicId) {
        const music = await db.em.fork().findOne(Music, [options.musicId])
        if (!music || !music.id || !music.filename) {
          throw new Error('Music not found')
        }
        name = music.name ?? ''
        filename = music.filename
        id = music.id
        fromGame = false
      } else {
        throw new Error('Invalid call of execute:music: No gameId or musicId given')
      }
      if (gamebase) playMusic(gamebase, name, filename, id, fromGame)
    }
  )
}
