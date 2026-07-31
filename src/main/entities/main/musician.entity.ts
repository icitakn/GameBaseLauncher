import { Entity, Property } from '@mikro-orm/core'
import { Base } from './base'
import { MusicianDTO } from '@shared/models/form-schemes.model'

@Entity({ tableName: 'Musicians' })
export class Musician extends Base {
  @Property({ type: 'string', nullable: true })
  photo?: string | null = null

  @Property({ type: 'string', nullable: true })
  grp?: string | null = null

  @Property({ type: 'string', nullable: true })
  nick?: string | null = null

  updateEntity(dto: MusicianDTO) {
    this.name = dto.name
    this.grp = dto.grp
    this.nick = dto.nick
    this.photo = dto.photo
  }
}

export type MusicianEntity = Musician
