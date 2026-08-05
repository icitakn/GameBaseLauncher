import { Entity } from '@mikro-orm/core'
import { Base } from './base'

@Entity({ tableName: 'Licenses' })
export class License extends Base {}

export type LicenseEntity = License
