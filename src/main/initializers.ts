import { MikroORM } from '@mikro-orm/better-sqlite'
import { initORM } from './config/db'

export async function initDb(dbName: string): Promise<MikroORM> {
  return await initORM({ dbName })
}
