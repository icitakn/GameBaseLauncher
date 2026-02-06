import { Entity } from '@mikro-orm/core'
import { Base } from './base'

@Entity({ tableName: 'Publishers' })
export class Publisher extends Base {}

export type PublisherEntity = Publisher
