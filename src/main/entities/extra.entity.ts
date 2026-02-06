import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Game } from './game.entity'
import { Base } from './base'

@Entity({ tableName: 'Extras' })
export class Extra extends Base {
  @ManyToOne({ fieldName: 'ga_id', entity: () => Game })
  game!: Game

  @Property({ type: 'int', nullable: true })
  displayOrder: number | null = null

  @Property({ type: 'int', nullable: true })
  type: number | null = null

  @Property({ type: 'string', nullable: true })
  path: string | null = null

  @Property({ type: 'int', nullable: true })
  ea: number | null = null

  @Property({ type: 'string', nullable: true })
  data: string | null = null

  @Property({ type: 'string', nullable: true })
  fileToRun: string | null = null
}

export type ExtraEntity = Extra
