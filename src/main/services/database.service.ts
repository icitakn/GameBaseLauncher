/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from 'fs'
import { ImportFileCheckResult } from '../../shared/models/settings.model'
import { initDb } from '../initializers'
import { EntityName, FindOptions, MikroORM, PopulatePath } from '@mikro-orm/better-sqlite'
import { Game } from '../entities/game.entity'

export async function getAllGames(db: MikroORM): Promise<Game[]> {
  const games = await db.em.fork().findAll(Game)
  return games
}

export async function upsert<Entity extends object>(
  db: MikroORM,
  entity: Entity,
  entityType: EntityName<Entity> | Entity
) {
  const result = await db.em.fork().upsert(entityType, entity)
  return result
}

export async function loadDatabase(dbFile: string): Promise<MikroORM> {
  if (!dbFile || dbFile.endsWith('.mdb')) {
    throw new Error('Invalid or missing db file')
  }
  return await initDb(dbFile)
}

export async function checkImportFile(filename: string): Promise<ImportFileCheckResult> {
  if (filename.endsWith('.mdb')) {
    const mdbReader = await import('mdb-reader')
    const buffer = readFileSync(filename)
    const reader = new mdbReader.default(buffer)
    if (reader.getTableNames().includes('Games')) {
      const games = reader.getTable('Games')
      return { numberOfGames: games.rowCount }
    } else {
      throw new Error('Invalid gamebase file!')
    }
  }

  throw new Error('Invalid gamebase file!')
}

export interface BatchOptions {
  batchSize?: number
  onProgress?: (loaded: number, total: number) => void
}

export async function getAll(
  db: MikroORM,
  what: string,
  filter: { [name: string]: any[] },
  options?: FindOptions<any, any, PopulatePath.ALL, never>,
  onlyCount?: boolean
): Promise<any[] | number> {
  const where = buildWhereClause(filter)
  if (onlyCount) {
    return await db.em.fork().count(what, where, options)
  }

  return await db.em.fork().find(what, where, options)
}

export async function getAllBatched(
  db: MikroORM,
  what: string,
  filter: { [name: string]: any[] },
  options?: FindOptions<any, any, PopulatePath.ALL, never>,
  batchOptions?: BatchOptions
): Promise<any[]> {
  const batchSize = batchOptions?.batchSize || 5000
  const where = buildWhereClause(filter)

  const totalCount = await db.em.fork().count(what, where, options)

  if (totalCount === 0) {
    return []
  }

  const allResults: any[] = []
  let offset = 0

  while (offset < totalCount) {
    await new Promise((resolve) => setImmediate(resolve))

    const batch = await db.em.fork().find(what, where, {
      ...options,
      limit: batchSize,
      offset: offset
    })

    allResults.push(...batch)
    offset += batch.length

    // Progress Callback
    if (batchOptions?.onProgress) {
      batchOptions.onProgress(allResults.length, totalCount)
    }

    if (batch.length < batchSize) {
      break
    }
  }

  return allResults
}

// Helper-Funktion für Where-Clause
function buildWhereClause(filter: { [name: string]: any[] }): {
  [key: string]: any
} {
  if (!filter || Object.keys(filter).length === 0) {
    return {}
  }

  const where: { [key: string]: any } = {}

  Object.keys(filter).forEach((key) => {
    if (filter[key].length > 0) {
      if (typeof filter[key][0] === 'string') {
        where[key] = { $like: filter[key].map((f) => '%' + f + '%') }
      } else {
        where[key] = [...filter[key]]
      }
    }
  })

  return where
}
