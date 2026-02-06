import { Entity } from '@mikro-orm/core'
import { Base } from './base'

@Entity({ tableName: 'Crackers' })
export class Cracker extends Base {}

export type CrackerEntity = Cracker
