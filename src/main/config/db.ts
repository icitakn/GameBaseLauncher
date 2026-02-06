import { MikroORM, Options } from '@mikro-orm/better-sqlite'
import config from './mikro-orm.config'
import { Migrator } from '@mikro-orm/migrations'

export const initORM = async ({ dbName }: { dbName: string }): Promise<MikroORM> => {
  try {
    const orm = await MikroORM.init({
      ...config,
      extensions: [Migrator],
      dbName
      //   ...credentials
    } as Options)

    await orm.getMigrator().up()

    return orm

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log('=== error connecting to database ====', err.message)
    throw err
  }
}
