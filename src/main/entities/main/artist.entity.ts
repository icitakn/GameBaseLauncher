import { Entity } from '@mikro-orm/core'
import { Base } from './base'

@Entity({ tableName: 'Artists' })
export class Artist extends Base {}

export type ArtistEntity = Artist
