import { GameBase } from '@shared/models/settings.model'
import { Game } from '../entities/game.entity'
import { Genre } from '../entities/genre.entity'
import { extract, getSettings, normalizePath, saveSettings } from './file.service'
import * as child from 'child_process'
import log from 'electron-log'
import path from 'path'

export function execute(gamebase: GameBase, game: Game) {
  if (!gamebase || !gamebase.folders || !gamebase.folders.games) {
    log.info('Games folder is not set!')
  }

  let gamepath

  const normalizedFilename = normalizePath(game.filename!)
  if (gamebase?.folders?.games) {
    gamepath = path.join(gamebase.folders.games, normalizedFilename)
  } else {
    gamepath = game.filename
  }

  if (normalizedFilename.endsWith('.zip') && gamebase?.folders?.extractTo && game.fileToRun) {
    extract(gamepath, gamebase.folders.extractTo)
    gamepath = path.join(gamebase.folders.extractTo, game.fileToRun)
  }

  child.execFile(
    gamebase.emulator || gamepath,
    gamebase.emulator ? [gamepath] : [],
    (error: child.ExecFileException | null, _stdout: string, _stderr: string) => {
      const settings = getSettings()

      const alreadyPlayedIdx = settings.stats.gamesPlayed.findIndex(
        (played) => played.id === game.id
      )
      if (alreadyPlayedIdx > 0) {
        const playtime =
          new Date().getTime() - settings.stats.gamesPlayed[alreadyPlayedIdx].lastPlayedAtMs
        settings.stats.gamesPlayed[alreadyPlayedIdx].playtimeInMs += playtime
        saveSettings(settings)
      }

      if (error) {
        log.error('An error occured while executing game ' + game.name + ': ' + error)
        log.error('Game info: ' + JSON.stringify(game))
        log.error('Path: ' + path)
        throw new Error('An error occured while executing game ' + game.name + ': ' + error)
      }
    }
  )
  const settings = getSettings()
  if (!settings.stats) {
    settings.stats = {
      gamesPlayed: [],
      musicListenedTo: []
    }
  }

  const getFullLabel = (genre: Genre): string => {
    const name = genre.name ?? ''
    if (!genre.parent) {
      return name
    }
    const parentLabel = getFullLabel(genre.parent)
    return parentLabel ? parentLabel + ' - ' + name : name
  }

  if (!game.id) {
    return
  }

  const alreadyPlayedIdx = settings.stats.gamesPlayed.findIndex((played) => played.id === game.id)
  if (alreadyPlayedIdx >= 0) {
    settings.stats.gamesPlayed[alreadyPlayedIdx].lastPlayedAtMs = new Date().getTime()
  } else {
    settings.stats.gamesPlayed = [
      ...settings.stats.gamesPlayed,
      {
        gamebaseId: gamebase.id,
        id: game.id,
        genre: game.genre ? getFullLabel(game.genre) : 'Unknown',
        lastPlayedAtMs: new Date().getTime(),
        name: game.name || 'Unknown',
        playtimeInMs: 0,
        rating: game.rating ?? 0
      }
    ]
  }
  saveSettings(settings)
}

export function playMusic(
  gamebase: GameBase,
  name: string,
  fileName: string,
  id: number,
  fromGame: boolean
) {
  if (!gamebase || !gamebase.folders || !gamebase.folders.music) {
    log.error('Music folder is not set')
  }

  let musicpath

  const normalizedFilename = normalizePath(fileName)
  if (gamebase?.folders?.music) {
    musicpath = path.join(gamebase.folders.music, normalizedFilename)
  } else {
    musicpath = normalizedFilename
  }

  child.execFile(
    gamebase.musicplayer || musicpath,
    gamebase.musicplayer ? [musicpath] : [],
    (error: child.ExecFileException | null, stdout: string, _stderr: string) => {
      if (error) {
        console.log(error)
      }
      if (stdout) console.log(stdout)
    }
  )

  const settings = getSettings()
  if (!settings.stats) {
    settings.stats = {
      gamesPlayed: [],
      musicListenedTo: []
    }
  }

  const alreadyPlayedIdx = settings.stats.musicListenedTo.findIndex(
    (played) => played.id === id && played.name === name
  )
  if (alreadyPlayedIdx >= 0) {
    settings.stats.musicListenedTo[alreadyPlayedIdx].lastPlayedAtMs = new Date().getTime()
  } else {
    settings.stats.musicListenedTo = [
      ...settings.stats.musicListenedTo,
      {
        gamebaseId: gamebase.id,
        id,
        lastPlayedAtMs: new Date().getTime(),
        name,
        fromGame
      }
    ]
  }
  saveSettings(settings)
}
