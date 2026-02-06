import { Entity } from '@mikro-orm/core'
import { Base } from './base'

@Entity({ tableName: 'Languages' })
export class Language extends Base {}

export type LanguageEntity = Language
