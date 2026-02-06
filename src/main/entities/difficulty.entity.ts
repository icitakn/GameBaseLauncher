import { Entity } from '@mikro-orm/core'
import { Base } from './base'

@Entity({ tableName: 'Difficulty' })
export class Difficulty extends Base {}

export type DifficultyEntity = Difficulty
