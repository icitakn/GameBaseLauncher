import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { BaseDTO } from '@shared/models/form-schemes.model'
import { GetReferenceFunction } from '@shared/types/database.types'

@Entity({ abstract: true })
export abstract class Base {
  @PrimaryKey({ type: 'int' })
  id?: number

  @Property({ type: 'string' })
  name?: string

  updateEntity(dto: BaseDTO, _resolve?: GetReferenceFunction) {
    this.name = dto.name
  }
}

export type BaseEntity = Base
