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

function spawnAndWait(executable: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = child.spawn(executable, args, { stdio: 'ignore' })
    proc.on('close', (code) => {
      if (code === 0 || code !== null) resolve()
      else reject(new Error(`Process exited with code ${code}`))
    })
    proc.on('error', reject)
  })
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

export async function execute(gamebase: GameBase, game: Game, emulatorId?: string) {
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

  const emulator = emulatorId
    ? gamebase.emulators?.find((e) => e.id === emulatorId)
    : gamebase.emulators && gamebase.emulators.length > 0
      ? gamebase.emulators[0]
      : null
  // -------------------------------------------------------------------------
  // GEMUS Script path
  // -------------------------------------------------------------------------
  if (emulator && emulator.gemusScript) {
    log.info(`[GEMUS] Running game "${game.name}" via GEMUS script: "${emulator.gemusScript}"`)
    const scriptContent = loadGemusScript(emulator.gemusScript)

    // Resolve the emulator path (directory only, not the executable itself)
    const emulatorPath = emulator.path ? path.dirname(emulator.path) : ''

    // Parse key=value pairs stored on the game (stored as a raw string)
    const kvPairs = parseKvPairs(game.gemus ?? undefined)

    // Allow per-game emulator override via emu=<name> key
    let resolvedEmulator = emulator.path ?? ''
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
      emulatorPath: resolvedEmulator,
      kvPairs
    }

    try {
      const startTime = new Date().getTime()
      const scriptResult = executeGemusScript(scriptContent, ctx, resolvedEmulator)
      const playTime = new Date().getTime() - startTime

      if (!scriptResult.shouldRun) {
        log.info(`[GEMUS] Script decided not to run the game (shouldRun=false)`)
        if (scriptResult.exitMessage) {
          log.info(`[GEMUS] Exit message: ${scriptResult.exitMessage}`)
        }
        // Still record stats so the game shows up as attempted
        recordGamePlayed({ gamebase, game, emulatorId: emulator?.id, playTime })
        return
      }

      // Stats are recorded after the emulator finishes;
      // GEMUS already calls spawnProcess internally in Run_Emulator() /
      // Run_GameFile(). We still track stats here.
      recordGamePlayed({ gamebase, game, emulatorId: emulator?.id, playTime })
    } catch (err) {
      log.error(`[GEMUS] Script execution failed for "${game.name}": ${err}`)
      throw err
    }

    return
  }

  // -------------------------------------------------------------------------
  // Legacy (non-GEMUS) path
  // -------------------------------------------------------------------------
  if (!emulator && !isExecutable(gamepath)) {
    const msg = `Game "${game.name}" is not executable on this system (${os.platform()}) and no emulator is configured.`
    log.error(msg)
    throw new Error(msg)
  }

  const emulatorPath = emulator?.path || gamepath
  const args = emulator?.path ? [gamepath] : []
  const startTime = new Date().getTime()
  await spawnAndWait(emulatorPath, args)
  const playTime = new Date().getTime() - startTime

  recordGamePlayed({ gamebase, game, emulatorId: emulator?.id, playTime })
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

function recordGamePlayed({
  gamebase,
  game,
  emulatorId,
  playTime
}: {
  gamebase: GameBase
  game: Game
  emulatorId?: string
  playTime: number
}): void {
  if (!game.id) return

  const settings = getSettings()
  if (!settings.stats) {
    settings.stats = { gamesPlayed: [], musicListenedTo: [] }
  }

  const alreadyPlayedIdx = settings.stats.gamesPlayed.findIndex((played) => played.id === game.id)
  if (alreadyPlayedIdx >= 0) {
    settings.stats.gamesPlayed[alreadyPlayedIdx].lastPlayedAtMs = new Date().getTime()
    settings.stats.gamesPlayed[alreadyPlayedIdx].playtimeInMs += playTime
  } else {
    settings.stats.gamesPlayed = [
      ...settings.stats.gamesPlayed,
      {
        gamebaseId: gamebase.id,
        emulatorId,
        id: game.id,
        genre: game.genre ? getFullLabel(game.genre) : 'Unknown',
        lastPlayedAtMs: new Date().getTime(),
        name: game.name || 'Unknown',
        playtimeInMs: playTime,
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
