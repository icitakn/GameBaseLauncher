import { MikroORM } from '@mikro-orm/better-sqlite'
import { randomUUID, UUID } from 'crypto'
import { getOrCreateSettings, getSettings, saveSettings } from '../services/file.service'
import { loadDatabase } from '../services/database.service'
import { app, ipcMain } from 'electron'
import { readFileSync } from 'fs'
import { GameBase, Settings } from '../../shared/models/settings.model'
import path from 'node:path'
import log from 'electron-log'

import createWorker from '../worker?nodeWorker'

let currentGamebaseId: UUID
let db: { main: MikroORM; user: MikroORM }

function callImportData(gamebase: GameBase): void {
  createWorker({ workerData: { task: 'import', payload: { gamebase } } })
    .on('message', (message) => {
      log.info(`Message from worker: ${JSON.stringify(message)}`)
      if (message) {
        const settings = getSettings()
        const gbInSettings = settings.gamebases.find((gb) => gb.id === gamebase.id)
        if (gbInSettings) {
          if (message.status === 'running') {
            gbInSettings.state = message.message
          } else if (message.status === 'finished') {
            gbInSettings.state = 'Import finished'
          } else {
            gbInSettings.state = 'Import failed'
          }
          saveSettings(settings)
        }
      }
    })
    .on('exit', (code) => {
      log.info(`Worker exited with code: ${code}`)
    })
    .postMessage('')
}

export async function loadGamebase(gamebaseId: UUID) {
  const settings = getSettings()
  const gamebase = settings.gamebases.find((gb) => gb.id === gamebaseId)
  if (currentGamebaseId !== gamebaseId && gamebase?.dbFile) {
    db = await loadDatabase(gamebase.dbFile)

    currentGamebaseId = gamebaseId
  }
  return { db: db?.main, user: db?.user, gamebase }
}

export function shutdown() {
  db?.main.close()
  db?.user.close()
}

function callMigrateUserDbs(): void {
  const settings = getOrCreateSettings()
  const gamebases = settings.gamebases?.filter((gb) => gb.dbFile)

  if (!gamebases.length) return

  createWorker({
    workerData: {
      task: 'migrate-user-dbs',
      payload: { gamebases, configPath: path.join(app.getPath('userData'), 'config.json') }
    }
  })
    .on('message', (message) => {
      log.info(`Migration worker: ${JSON.stringify(message)}`)
      if (message.status === 'failed') {
        const settings = getSettings()
        const gb = settings.gamebases.find((gb) => gb.id === message.gamebaseId)
        if (gb) {
          gb.state = 'Migration failed'
          saveSettings(settings)
        }
      }
    })
    .on('exit', (code) => {
      log.info(`Migration worker exited with code: ${code}`)
    })
    .postMessage('')
}

export const registerGamebaseController = () => {
  ipcMain.handle('gamebase:editGamebase', async (_, gamebase: GameBase) => {
    const settings = getSettings()
    settings.gamebases = settings.gamebases.map((gb) => (gb.id === gamebase.id ? gamebase : gb))
    console.log(settings.gamebases)
    console.log(gamebase)

    saveSettings(settings)
  })

  ipcMain.handle('gamebase:addGamebase', async (_, gamebase: GameBase) => {
    const settings = getOrCreateSettings()
    const newId = randomUUID()
    settings.gamebases = [...settings.gamebases, { ...gamebase, id: newId }]
    saveSettings(settings)

    const currentGb = settings.gamebases.find((gb) => gb.id === newId)
    await loadGamebase(newId)

    if (currentGb?.importFile) {
      currentGb.state = 'Import started'
      saveSettings(settings)
      callImportData(currentGb)
    }

    return settings
  })

  ipcMain.handle('gamebase:deleteGamebase', async (_, gamebaseId: UUID) => {
    const settings = getOrCreateSettings()
    settings.gamebases = settings.gamebases.filter((gb) => gamebaseId !== gb.id)
    saveSettings(settings)
  })

  ipcMain.handle('gamebase:getLicenses', async () => {
    try {
      let licensePath = path.join(__dirname, 'THIRD_PARTY_LICENSES.txt')

      if (app.isPackaged) {
        licensePath = path.join(process.resourcesPath, 'THIRD_PARTY_LICENSES.txt')
      }

      const content = readFileSync(licensePath, 'utf-8')
      return { success: true, content }
    } catch (error) {
      console.error('Error reading licenses:', error)
      return { success: false, error: error }
    }
  })

  ipcMain.handle('gamebase:saveSettings', async (_, settings: Settings) => {
    saveSettings(settings)
  })

  ipcMain.handle('gamebase:getAppInfo', async () => {
    try {
      let licensePath = path.join(__dirname, 'LICENSE')

      if (app.isPackaged) {
        licensePath = path.join(process.resourcesPath, 'LICENSE')
      }

      const content = readFileSync(licensePath, 'utf-8')
      return {
        name: app.getName(),
        version: app.getVersion(),
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
        license: content
      }
    } catch (error) {
      console.error('Error reading licenses:', error)
      return {
        name: app.getName(),
        version: app.getVersion(),
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
        license: ''
      }
    }
  })

  callMigrateUserDbs()
}
