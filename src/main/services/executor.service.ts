import { GameBase } from '@shared/models/settings.model'
import { Game } from '../entities/game.entity'
import { Genre } from '../entities/genre.entity'
import { extract, getSettings, normalizePath, saveSettings } from './file.service'
import { executeGemusScript, loadGemusScript, parseKvPairs, GemusContext } from './gemus.service'
import * as child from 'child_process'
import * as fs from 'fs'
import log from 'electron-log'
import path from 'path'
import os from 'os'

const EXECUTABLE_EXTENSIONS: Record<string, string[]> = {
  win32: ['.exe', '.bat', '.cmd', '.com'],
  darwin: ['.app', '.sh', ''],
  linux: ['.sh', '.AppImage', '']
}

function isExecutable(filePath: string): boolean {
  const platform = os.platform()
  const ext = path.extname(filePath).toLowerCase()
  const allowedExtensions = EXECUTABLE_EXTENSIONS[platform] ?? []

  if (!allowedExtensions.includes(ext)) {
    return false
  }

  if (platform === 'darwin' || platform === 'linux') {
    try {
      fs.accessSync(filePath, fs.constants.X_OK)
    } catch {
      return false
    }
  }

  return true
}

export function execute(gamebase: GameBase, game: Game) {
  if (!gamebase || !gamebase.folders || !gamebase.folders.games) {
    log.info('Games folder is not set!')
  }

  let gamepath: string

  const normalizedFilename = normalizePath(game.filename!)
  if (gamebase?.folders?.games) {
    gamepath = path.join(gamebase.folders.games, normalizedFilename)
  } else {
    gamepath = game.filename!
  }

  if (normalizedFilename.endsWith('.zip')) {
    if (gamebase?.folders?.extractTo && game.fileToRun) {
      extract(gamepath, gamebase.folders.extractTo)
      gamepath = path.join(gamebase.folders.extractTo, game.fileToRun)
    } else {
      throw new Error(
        'Zip file found but no extractTo folder or the game has no file to run after unzipping'
      )
    }
  }

  // -------------------------------------------------------------------------
  // GEMUS Script path
  // -------------------------------------------------------------------------
  if (gamebase.gemusScript) {
    log.info(`[GEMUS] Running game "${game.name}" via GEMUS script: "${gamebase.gemusScript}"`)
    const scriptContent = loadGemusScript(gamebase.gemusScript)

    // Resolve the emulator path (directory only, not the executable itself)
    const emulatorPath = gamebase.emulator ? path.dirname(gamebase.emulator) : ''

    // Parse key=value pairs stored on the game (stored as a raw string)
    const kvPairs = parseKvPairs(game.gemus ?? undefined)

    // Allow per-game emulator override via emu=<name> key
    let resolvedEmulator = gamebase.emulator ?? ''
    if (kvPairs['emu']) {
      // In a full implementation you'd look up the emulator by name from a registry;
      // here we just use the value directly if it looks like a path.
      resolvedEmulator = kvPairs['emu']
      log.info(`[GEMUS] emu= override: using "${resolvedEmulator}"`)
    }

    const ctx: GemusContext = {
      gamebase,
      game,
      gamepathfile: gamepath,
      emulatorPath,
      kvPairs
    }

    try {
      const scriptResult = executeGemusScript(scriptContent, ctx)

      if (!scriptResult.shouldRun) {
        log.info(`[GEMUS] Script decided not to run the game (shouldRun=false)`)
        if (scriptResult.exitMessage) {
          log.info(`[GEMUS] Exit message: ${scriptResult.exitMessage}`)
        }
        // Still record stats so the game shows up as attempted
        recordGamePlayed(gamebase, game)
        return
      }

      // Stats are recorded after the emulator finishes;
      // GEMUS already calls spawnProcess internally in Run_Emulator() /
      // Run_GameFile(). We still track stats here.
      recordGamePlayed(gamebase, game)
    } catch (err) {
      log.error(`[GEMUS] Script execution failed for "${game.name}": ${err}`)
      throw err
    }

    return
  }

  // -------------------------------------------------------------------------
  // Legacy (non-GEMUS) path
  // -------------------------------------------------------------------------
  if (!gamebase.emulator && !isExecutable(gamepath)) {
    const msg = `Game "${game.name}" is not executable on this system (${os.platform()}) and no emulator is configured.`
    log.error(msg)
    throw new Error(msg)
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

  recordGamePlayed(gamebase, game)
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const getFullLabel = (genre: Genre): string => {
  const name = genre.name ?? ''
  if (!genre.parent) return name
  const parentLabel = getFullLabel(genre.parent)
  return parentLabel ? parentLabel + ' - ' + name : name
}

function recordGamePlayed(gamebase: GameBase, game: Game): void {
  if (!game.id) return

  const settings = getSettings()
  if (!settings.stats) {
    settings.stats = { gamesPlayed: [], musicListenedTo: [] }
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

  let musicpath: string

  const normalizedFilename = normalizePath(fileName)
  if (gamebase?.folders?.music) {
    musicpath = path.join(gamebase.folders.music, normalizedFilename)
  } else {
    musicpath = normalizedFilename
  }

  if (!gamebase.musicplayer && !isExecutable(musicpath)) {
    const msg = `Music file "${name}" is not executable on this system (${os.platform()}) and no music player is configured.`
    log.error(msg)
    throw new Error(msg)
  }

  child.execFile(
    gamebase.musicplayer || musicpath,
    gamebase.musicplayer ? [musicpath] : [],
    (error: child.ExecFileException | null, stdout: string, _stderr: string) => {
      if (error) console.log(error)
      if (stdout) console.log(stdout)
    }
  )

  const settings = getSettings()
  if (!settings.stats) {
    settings.stats = { gamesPlayed: [], musicListenedTo: [] }
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
