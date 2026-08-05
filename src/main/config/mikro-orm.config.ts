// mikro-orm.config.ts
import { Options } from '@mikro-orm/better-sqlite'
import { getEntities, getMigrations } from './entities'

export const mainConfig = {
  entities: getEntities('main'),
  migrations: {
    migrationsList: getMigrations('main'),
    path: 'migrations/main'
  }
} as Options

export const userConfig = {
  entities: getEntities('user'),
  migrations: {
    migrationsList: getMigrations('user'),
    path: 'migrations/user'
  }
} as Options
