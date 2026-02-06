import { Entity } from '@mikro-orm/core'
import { Base } from './base'

@Entity({ tableName: 'Rarities' })
export class Rarity extends Base {}

export type RarityEntity = Rarity
