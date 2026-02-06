import { Entity, ManyToOne } from '@mikro-orm/core'
import { Base } from './base'
import { GenreDTO } from '@shared/models/form-schemes.model'
import { GetReferenceFunction } from '@shared/types/database.types'

@Entity({ tableName: 'Genres' })
export class Genre extends Base {
  @ManyToOne({ fieldName: 'ge_id', entity: () => Genre, nullable: true })
  parent?: Genre | null = null

  updateEntity(dto: GenreDTO, resolve: GetReferenceFunction) {
    super.updateEntity(dto)

    this.parent = resolve(Genre, dto.parent?.id)
  }
}

export type GenreEntity = Genre
