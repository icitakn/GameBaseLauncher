import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'GameUserData' })
export class GameUserData {
  @PrimaryKey({ type: 'int' })
  gameId!: number

  @Property({ type: 'int', nullable: true })
  rating?: number

  @Property({ type: 'boolean', default: false })
  favorite: boolean = false

  @Property({ type: 'string', nullable: true })
  comment?: string

  @Property({ type: 'string', nullable: true })
  highScore?: string

  @Property({ type: 'date', nullable: true })
  lastPlayedAt?: string

  @Property({ type: 'int', default: 0 })
  playCount: number = 0
}
