import { parentPort, workerData } from 'worker_threads'
import { loadDatabase } from './services/database.service'
import { importData } from './services/import.service'
import { GameBase } from '@shared/models/settings.model'
import log from 'electron-log'
import { MikroORM } from '@mikro-orm/better-sqlite'
import { migrateData } from './services/migration.service'

type WorkerTask =
  | { task: 'import'; payload: { gamebase: GameBase } }
  | { task: 'migrate-user-dbs'; payload: { gamebases: GameBase[]; configPath: string } }

log.info('Worker: Started init...')

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async () => {
  const { task, payload } = workerData as WorkerTask

  const openedDbs: MikroORM[] = []

  try {
    if (task === 'import') {
      const db = await loadDatabase(payload.gamebase.dbFile!)
      openedDbs.push(db.main)
      openedDbs.push(db.user)
      await importData(payload.gamebase, db, port)
      port.postMessage({ status: 'finished', message: 'Import finished' })
    } else if (task === 'migrate-user-dbs') {
      for (const gb of payload.gamebases) {
        if (!gb.dbFile) continue
        const db = await loadDatabase(gb.dbFile!)
        openedDbs.push(db.main)
        openedDbs.push(db.user)

        port.postMessage({ status: 'migrating', message: 'Starting migration of Gb ' + gb.id })

        await migrateData(gb, db, port, payload.configPath)

        port.postMessage({ status: 'migrated', message: 'Finished migration of Gb ' + gb.id })
      }
      port.postMessage({ status: 'finished', message: 'All migrations done' })
    }
  } catch (err: any) {
    port.postMessage({ status: 'failed', message: err?.message })
  } finally {
    for (const db of openedDbs) {
      await db.close()
    }
  }
})
