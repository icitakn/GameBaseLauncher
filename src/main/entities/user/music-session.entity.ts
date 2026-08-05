import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'MusicSession' })
export class MusicSession {
  @PrimaryKey({ type: 'int' })
  id!: number

  @Property({ type: 'int', nullable: false })
  musicOrGameId!: number

  @Property({ type: 'string', nullable: true })
  name: string | undefined

  @Property({ type: 'int', nullable: false })
  lastPlayedAtMs!: number

  @Property({ type: 'boolean', default: false })
  fromGame: boolean = false
}
