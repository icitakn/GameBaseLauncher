import { basename } from 'path'

type DbKey = 'main' | 'user'

const entityGlobs: Record<DbKey, Record<string, unknown>> = {
  main: import.meta.glob('../entities/main/*.entity.ts', { eager: true }),
  user: import.meta.glob('../entities/user/*.entity.ts', { eager: true })
}

const migrationGlobs: Record<DbKey, Record<string, unknown>> = {
  main: import.meta.glob('../migrations/main/*.ts', { eager: true }),
  user: import.meta.glob('../migrations/user/*.ts', { eager: true })
}

function getEntities(db: DbKey): unknown[] {
  const modules = entityGlobs[db]
  return Object.values(modules).flatMap((mod) => {
    const moduleExports = mod as Record<string, unknown>
    return Object.values(moduleExports).filter((exp) => typeof exp === 'function')
  })
}

function getMigrations(db: DbKey): { name: string; class: unknown }[] {
  const migrationModules = migrationGlobs[db]
  const migrations: Record<string, unknown> = {}

  Object.entries(migrationModules).forEach(([path, module]) => {
    const name = basename(path)
    migrations[name] = Object.values(module as Record<string, unknown>)[0]
  })

  return Object.keys(migrations).map((migrationName) => ({
    name: migrationName,
    class: migrations[migrationName]
  }))
}

export { getEntities, getMigrations }
export type { DbKey }
