import { MikroORM, Options } from '@mikro-orm/better-sqlite'
import { Migrator } from '@mikro-orm/migrations'
import { mainConfig, userConfig } from './mikro-orm.config'
import { DbKey } from './entities'

const configs: Record<DbKey, Options> = {
  main: mainConfig,
  user: userConfig
}

export const initORM = async ({
  dbName,
  dbKey
}: {
  dbName: string
  dbKey: DbKey
}): Promise<MikroORM> => {
  try {
    const orm = await MikroORM.init({
      ...configs[dbKey],
      extensions: [Migrator],
      dbName
    } as Options)

    await orm.getMigrator().up()

    return orm
  } catch (err: any) {
    console.log(`=== error connecting to database (${dbKey}) ====`, err.message)
    throw err
  }
}
