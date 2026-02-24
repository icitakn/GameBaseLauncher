import { UUID } from 'crypto'
import { ipcMain } from 'electron'
import { loadGamebase } from './gamebase.controller'
import { getAll, getAllBatched, upsert } from '../services/database.service'
import { Game } from '../entities/game.entity'
import { Artist } from '../entities/artist.entity'
import { Musician } from '../entities/musician.entity'
import { Programmer } from '../entities/programmer.entity'
import { Publisher } from '../entities/publisher.entity'
import { Language } from '../entities/language.entity'
import { Developer } from '../entities/developer.entity'
import { Genre } from '../entities/genre.entity'
import { Rarity } from '../entities/rarity.entity'
import { License } from '../entities/license.entity'
import { Cracker } from '../entities/cracker.entity'
import { Difficulty } from '../entities/difficulty.entity'
import { EntityManager, FindOptions, PopulatePath } from '@mikro-orm/core'
import { EntityType, GetReferenceFunction } from '@shared/types/database.types'
import { Extra } from '../entities/extra.entity'
import { Music } from '../entities/music.entity'

const createGetReference =
  (em: EntityManager): GetReferenceFunction =>
  <T>(entityClass: new () => T, id: number | null | undefined): T | null => {
    return id ? em.getReference(entityClass, id) : null
  }

const ENTITY_MAP = {
  Game,
  Artist,
  Musician,
  Programmer,
  Developer,
  Publisher,
  Cracker,
  Difficulty,
  Extra,
  Genre,
  Language,
  Music,
  Rarity,
  License
} as const

const ENTITIES_WITH_REFERENCES = new Set(['Game', 'Genre', 'Music'])

const getPopulates = (tableName: string) => {
  let populate: FindOptions<any, any, PopulatePath.ALL, never> = {}
  if (tableName === 'Extra') {
    populate = { populate: ['game'] }
  } else if (tableName === 'Music') {
    populate = { populate: ['game', 'musician'] }
  } else if (tableName === 'Game') {
    populate = {
      populate: [
        'musician',
        'genre',
        'genre.parent',
        'publisher',
        'difficulty',
        'cracker',
        'programmer',
        'language',
        'prequel',
        'sequel',
        'related',
        'artist',
        'developer',
        'license',
        'rarity',
        'cloneOf'
      ]
    }
  }
  return populate
}

const SLIM_FIELDS: Partial<Record<string, string[]>> = {
  Game: ['id', 'name']
}

export const registerEntityController = () => {
  ipcMain.handle(
    'entity:getAll',
    async (
      event,
      tableName: string,
      filter: { [name: string]: any[] },
      gamebaseId: UUID,
      useBatching = true
    ) => {
      const { db } = await loadGamebase(gamebaseId)

      const populate = getPopulates(tableName)

      if (useBatching) {
        const result = await getAllBatched(db, tableName, filter, populate, {
          batchSize: 5000,
          onProgress: (loaded, total) => {
            event.sender.send('entity:loadProgress', {
              tableName,
              loaded,
              total,
              percentage: Math.round((loaded / total) * 100)
            })
          }
        })

        return result
      } else {
        return await getAll(db, tableName, filter, populate)
      }
    }
  )

  ipcMain.handle(
    'entity:getSlim',
    async (event, tableName: string, gamebaseId: UUID, fields?: string[]) => {
      const { db } = await loadGamebase(gamebaseId)

      const populateOptions: FindOptions<any, any, PopulatePath.ALL, never> = {}

      const effectiveFields = fields ?? SLIM_FIELDS[tableName]
      if (effectiveFields) {
        Object.assign(populateOptions, { fields: effectiveFields })
      }

      const result = await getAllBatched(db, tableName, {}, populateOptions, {
        batchSize: 5000,
        onProgress: (loaded, total) => {
          event.sender.send('entity:loadProgress', {
            tableName,
            loaded,
            total,
            percentage: Math.round((loaded / total) * 100)
          })
        }
      })

      return result
    }
  )

  ipcMain.handle(
    'entity:getCount',
    async (_, tableName: string, filter: { [name: string]: any[] }, gamebaseId: UUID) => {
      const { db } = await loadGamebase(gamebaseId)

      return await getAll(db, tableName, filter, {}, true)
    }
  )

  ipcMain.handle(
    'entity:upsertEntity',
    async (_, entity: any, type: EntityType, gamebaseId: UUID) => {
      const { db } = await loadGamebase(gamebaseId)
      const em = db.em.fork()

      const EntityClass = ENTITY_MAP[type]
      if (!EntityClass) {
        throw new Error(`Unknown entity type: ${type}`)
      }

      const dbEntity = entity.id
        ? await em.findOne(EntityClass, { id: entity.id })
        : new EntityClass()

      if (dbEntity) {
        const needsReference = ENTITIES_WITH_REFERENCES.has(type)
        if (needsReference) {
          dbEntity.updateEntity(entity, createGetReference(em))
        } else {
          dbEntity.updateEntity(entity, (_entityClass, _id) => entity)
        }

        await upsert(db, dbEntity, EntityClass)

        const populate = getPopulates(EntityClass.name)
        if (dbEntity.id) {
          const result = await getAll(db, EntityClass.name, { id: [dbEntity.id] }, populate, false)
          return result
        }
      }

      return dbEntity
    }
  )

  ipcMain.handle(
    'entity:deleteEntity',
    async (_, id: number, type: EntityType, gamebaseId: UUID) => {
      if (!id || !type) {
        throw new Error('No id or no type given')
      }
      const { db } = await loadGamebase(gamebaseId)
      const em = db.em.fork()

      const dbEntity = await em.findOne(type, { id })

      if (dbEntity) {
        await em.removeAndFlush(dbEntity)
      } else {
        throw new Error('Entity not found!')
      }
    }
  )
}
