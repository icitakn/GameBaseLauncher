import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'Config' })
export class Config {
  @PrimaryKey({ fieldName: 'id', type: 'int' })
  id!: number

  @Property({ type: 'int' })
  majorVersion!: number

  @Property({ type: 'int' })
  minorVersion!: number

  @Property({ type: 'int' })
  officialUpdate!: number

  @Property({ type: 'string' })
  firstLoadMessage!: string

  @Property({ type: 'int' })
  firstLoadGemusAsk!: number

  @Property({ type: 'string' })
  databaseName!: string

  @Property({ type: 'string', nullable: true })
  gamebaseWindowTitle: string | null = null
}

export type ConfigEntity = Config
