import { MikroORM } from '@mikro-orm/better-sqlite'
import { initORM } from './config/db'
import { DbKey } from './config/entities'

export async function initDb(dbName: string, dbKey: DbKey): Promise<MikroORM> {
  return await initORM({ dbName, dbKey })
}
