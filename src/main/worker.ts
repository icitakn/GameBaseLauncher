// src/main/worker.ts
import { parentPort, workerData } from 'worker_threads'
import { loadDatabase } from './services/database.service'
import { importData } from './services/import.service'
import log from 'electron-log'
import { GameBase } from '@shared/models/settings.model'

log.info('Worker: Initialisierung gestartet...')
const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async () => {
  log.info('Worker started')
  const gamebase = workerData as GameBase

  if (!gamebase) {
    port.postMessage({ status: 'failed', message: 'No GameBase found!' })
  } else {
    try {
      const db = await loadDatabase(gamebase.dbFile!)
      await importData(gamebase, db, port)

      port.postMessage({ status: 'finished', message: 'Import finished' })
    } catch (err) {
      port.postMessage({ status: 'failed', message: err })
    }
  }
})
