import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Game } from './game.entity'
import { Base } from './base'
import { ExtraDTO } from '@shared/models/form-schemes.model'
import { GetReferenceFunction } from '@shared/types/database.types'

@Entity({ tableName: 'Extras' })
export class Extra extends Base {
  @ManyToOne({ fieldName: 'ga_id', entity: () => Game })
  game: Game | null = null

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

  updateEntity(dto: ExtraDTO, resolve?: GetReferenceFunction): void {
    if (resolve) {
      this.name = dto.name
      this.game = resolve(Game, dto.game?.id)
      this.displayOrder = dto.displayOrder ?? null
      this.type = dto.type ?? null
      this.path = dto.path ?? null
      this.data = dto.data ?? null
      this.fileToRun = dto.fileToRun ?? null
    }
  }
}

export type ExtraEntity = Extra
