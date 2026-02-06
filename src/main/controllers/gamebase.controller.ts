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
let db: MikroORM

function callImportData(gamebase: GameBase): void {
  createWorker({ workerData: gamebase })
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

  // const workerPath = is.dev
  //   ? path.join(__dirname, 'worker.js')
  //   : path.join(app.getAppPath(), 'dist', 'main', 'worker.js')
  //    : path.join(process.resourcesPath, 'app.asar', 'dist', 'main', 'worker.js')

  // const child = fork(workerPath, ['worker'], {
  //   stdio: ['pipe', 'pipe', 'pipe', 'ipc'] // Für besseres Debugging
  // })
  // const workerPath = is.dev
  //   ? path.join(__dirname, '..', 'main', 'worker.js')
  //   : path.join(__dirname, 'worker.js') // In der Prod liegen index.js und worker.js nebeneinander

  // // utilityProcess kann nativ mit ASAR-Pfaden umgehen!
  // const child = utilityProcess.fork(workerPath, [], {
  //   stdio: 'inherit' // Leitet worker-logs direkt in deine Haupt-Konsole um
  // })

  // child.on('spawn', () => {
  //   log.info('Worker erfolgreich gestartet')
  //   // child.postMessage({ gamebase })
  // })

  // child.on('message', (msg) => {
  //   if (msg === 'WORKER_READY') {
  //     log.info('Main: Worker signalisiert Bereitschaft. Sende Daten...');
  //     child.postMessage({ gamebase })
  //   } else if (msg === 'Import finished') {
  //     log.info('Main: Import erfolgreich abgeschlossen')
  //   } else if (msg.error) {
  //     log.error('Main: Worker Fehler gemeldet:', msg.error)
  //   }
  // });

  // child.on('exit', (code) => {
  //   log.info(`Worker beendet mit Code ${code}`)
  // })
  // log.info('Starting worker: ', workerPath)

  // const child = fork(workerPath, [], {
  //   stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  //   execArgv: []
  // })

  // child.stdout?.on('data', (data) => {
  //   log.info('Worker stdout: ', data)
  // })

  // child.stderr?.on('data', (data) => {
  //   log.error('Worker stderr: ', data)
  // })

  // // const child = fork(resolve(__dirname, 'worker.js'), ['worker'])
  // child.on('message', function (message: string) {
  //   log.info('Message from worker: ', message)
  // })
  // child.on('error', function (message: string) {
  //   log.error('Worker error: ', message)
  // })

  // child.on('close', function (code) {
  //   log.info('child process exited with code ' + code)
  //   const settings = getSettings()
  //   const gbInSettings = settings.gamebases.find((gb) => gb.id === gamebase.id)
  //   if (gbInSettings) {
  //     if (code === 0) {
  //       gbInSettings.state = 'Import finished'
  //     } else {
  //       gbInSettings.state = 'Import failed'
  //     }
  //     saveSettings(settings)
  //   }
  // })

  // child.send({ gamebase })
  // setTimeout(() => {
  // }, 2_500)
}

export async function loadGamebase(gamebaseId: UUID) {
  const settings = getSettings()
  const gamebase = settings.gamebases.find((gb) => gb.id === gamebaseId)
  if (currentGamebaseId !== gamebaseId && gamebase?.dbFile) {
    db = await loadDatabase(gamebase.dbFile)

    currentGamebaseId = gamebaseId
  }
  return { db, gamebase }
}

export function shutdown() {
  db?.close()
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
}
