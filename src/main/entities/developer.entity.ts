import { Entity } from '@mikro-orm/core'
import { Base } from './base'

@Entity({ tableName: 'Developers' })
export class Developer extends Base {}

export type DeveloperEntity = Developer
