import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Base } from './base'
import { Game } from './game.entity'
import { Musician } from './musician.entity'
import { MusicDTO } from '@shared/models/form-schemes.model'
import { GetReferenceFunction } from '@shared/types/database.types'

@Entity({ tableName: 'Music' })
export class Music extends Base {
  @ManyToOne({ fieldName: 'ga_id', entity: () => Game, nullable: true })
  game: Game | null = null

  @Property({ type: 'string', nullable: true })
  filename: string | null = null

  @ManyToOne({ fieldName: 'mu_id', entity: () => Musician, nullable: true })
  musician: Musician | null = null

  @Property({ type: 'int', nullable: true })
  sfav: number | null = null

  @Property({ type: 'int', nullable: true })
  sa: number | null = null

  @Property({ type: 'int', nullable: true })
  adult: number | null = null

  updateEntity(dto: MusicDTO, resolve?: GetReferenceFunction): void {
    if (resolve) {
      this.game = resolve(Game, dto.game?.id)
      this.musician = resolve(Musician, dto.musician?.id)
      this.adult = dto.adult ? 1 : 0
      this.filename = dto.filename ?? null
      this.name = dto.name
      this.sfav = dto.fav ? 1 : 0
    }
  }
}

export type MusicEntity = Music
