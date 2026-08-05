import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'GameSession' })
export class GameSession {
  @PrimaryKey({ type: 'int' })
  id!: number

  @Property({ type: 'int', nullable: false })
  gameId!: number

  @Property({ type: 'string', nullable: true })
  emulatorId: string | undefined

  @Property({ type: 'string', nullable: true })
  name: string | undefined

  @Property({ type: 'string', nullable: true })
  genre?: string

  @Property({ type: 'int', nullable: false })
  playtimeInMs!: number

  @Property({ type: 'int', nullable: false })
  lastPlayedAtMs!: number
}
