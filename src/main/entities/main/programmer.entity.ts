import { Entity } from '@mikro-orm/core'
import { Base } from './base'

@Entity({ tableName: 'Programmers' })
export class Programmer extends Base {}

export type ProgrammerEntity = Programmer
