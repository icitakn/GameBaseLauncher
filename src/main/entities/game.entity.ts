import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { Base } from './base'
import { Musician } from './musician.entity'
import { Genre } from './genre.entity'
import { Publisher } from './publisher.entity'
import { Difficulty } from './difficulty.entity'
import { Cracker } from './cracker.entity'
import { Programmer } from './programmer.entity'
import { Language } from './language.entity'
import { Artist } from './artist.entity'
import { Developer } from './developer.entity'
import { License } from './license.entity'
import { Rarity } from './rarity.entity'
import { GameDTO } from '@shared/models/form-schemes.model'
import { GetReferenceFunction } from '@shared/types/database.types'

@Entity({ tableName: 'Games' })
export class Game extends Base {
  @Property({ type: 'int', fieldName: 'year' })
  year?: number

  @Property({ type: 'string', nullable: true })
  filename?: string | null = null

  @Property({ type: 'string', nullable: true })
  fileToRun?: string | null = null

  @Property({ type: 'int', nullable: true })
  filenameIndex?: number | null = null

  @Property({ type: 'string', nullable: true })
  scrnshotFilename?: string | null = null

  @ManyToOne({ fieldName: 'mu_id', entity: () => Musician, nullable: true })
  musician?: Musician | null = null

  @ManyToOne({ fieldName: 'ge_id', entity: () => Genre, nullable: true })
  genre?: Genre | null = null

  @ManyToOne({ fieldName: 'pu_id', entity: () => Publisher, nullable: true })
  publisher?: Publisher | null = null

  @ManyToOne({ fieldName: 'di_id', entity: () => Difficulty, nullable: true })
  difficulty?: Difficulty | null = null

  @ManyToOne({ fieldName: 'cr_id', entity: () => Cracker, nullable: true })
  cracker?: Cracker | null = null

  @Property({ type: 'string', nullable: true })
  sidFilename?: string | null = null

  // Remove?
  @Property({ type: 'string', nullable: true })
  dateLastPlayed?: string | null = null

  // Remove?
  @Property({ type: 'int', nullable: true })
  timesPlayed?: number | null = null

  @Property({ type: 'int', nullable: true })
  cCode?: number | null = null

  @Property({ type: 'string', nullable: true })
  highscore?: string | null = null

  @Property({ type: 'int', nullable: true })
  fa?: number | null = null

  @Property({ type: 'int', nullable: true })
  sa?: number | null = null

  @Property({ type: 'int', nullable: true })
  fav?: number | null = null

  @ManyToOne({ fieldName: 'pr_id', entity: () => Programmer, nullable: true })
  programmer?: Programmer | null = null

  @ManyToOne({ fieldName: 'la_id', entity: () => Language, nullable: true })
  language?: Language | null = null

  @Property({ type: 'int', nullable: true })
  extras?: number | null = null

  @Property({ type: 'int', nullable: true })
  classic?: number | null = null

  @Property({ type: 'int', nullable: true })
  rating?: number | null = null

  @Property({ type: 'int', nullable: true })
  v_PalNtsc?: number | null = null

  @Property({ type: 'int', nullable: true })
  v_Length?: number | null = null

  @Property({ type: 'int', nullable: true })
  v_Trainers?: number | null = null

  @Property({ type: 'int', nullable: true })
  playersFrom?: number | null = null

  @Property({ type: 'int', nullable: true })
  playersTo?: number | null = null

  @Property({ type: 'int', nullable: true })
  playersSim?: number | null = null

  @Property({ type: 'int', nullable: true })
  adult?: number | null = null

  @Property({ type: 'string', nullable: true })
  memoText?: string | null = null

  @ManyToOne({ fieldName: 'Prequel', entity: () => Game, nullable: true })
  prequel?: Game | null = null

  @ManyToOne({ fieldName: 'Sequel', entity: () => Game, nullable: true })
  sequel?: Game | null = null

  @ManyToOne({ fieldName: 'Related', entity: () => Game, nullable: true })
  related?: Game | null = null

  @Property({ type: 'int', nullable: true })
  control?: number | null = null

  @Property({ type: 'string', nullable: true })
  crc?: string | null = null

  @Property({ type: 'int', nullable: true })
  filesize?: number | null = null

  @Property({ type: 'int', nullable: true })
  version?: number | null = null

  @Property({ type: 'string', nullable: true })
  gemus?: string | null = null

  @Property({ type: 'int', nullable: true })
  vLengthType?: number | null = null

  @Property({ type: 'string', nullable: true })
  comment?: string | null = null

  @Property({ type: 'string', nullable: true })
  vComment?: string | null = null

  @Property({ type: 'int', nullable: true })
  vLoadingScreen?: number | null = null
  @Property({ type: 'int', nullable: true })
  vHighscoreSaver?: number | null = null
  @Property({ type: 'int', nullable: true })
  vIncludedDocs?: number | null = null
  @Property({ type: 'int', nullable: true })
  vTrueDriveEmu?: number | null = null

  @ManyToOne({ fieldName: 'ar_Id', entity: () => Artist, nullable: true })
  artist?: Artist | null = null

  @ManyToOne({ fieldName: 'de_Id', entity: () => Developer, nullable: true })
  developer?: Developer | null = null
  @ManyToOne({ fieldName: 'li_Id', entity: () => License, nullable: true })
  license?: License | null = null
  @ManyToOne({ fieldName: 'ra_Id', entity: () => Rarity, nullable: true })
  rarity?: Rarity | null = null

  @Property({ type: 'string', nullable: true })
  weblinkName?: string | null = null
  @Property({ type: 'string', nullable: true })
  weblinkUrl?: string | null = null
  @Property({ type: 'string', nullable: true })
  vWeblinkName?: string | null = null
  @Property({ type: 'string', nullable: true })
  vWeblinkUrl?: string | null = null
  @Property({ type: 'int', nullable: true })
  vTitlescreen?: number | null = null
  @Property({ type: 'int', nullable: true })
  vPlayable?: number | null = null
  @Property({ type: 'int', nullable: true })
  vOriginal?: number | null = null

  @ManyToOne({ fieldName: 'clone_of', entity: () => Game, nullable: true })
  cloneOf?: Game | null = null

  @Property({ type: 'int', nullable: true })
  reviewRating?: number | null = null

  // @OneToMany(() => Extra, (extra) => extra.game)
  // extraObjects = new Collection<Extra>(this);

  updateEntity(dto: GameDTO, resolve: GetReferenceFunction) {
    this.developer = resolve(Developer, dto.developer?.id)
    this.publisher = resolve(Publisher, dto.publisher?.id)
    this.artist = resolve(Artist, dto.artist?.id)
    this.programmer = resolve(Programmer, dto.programmer?.id)
    this.musician = resolve(Musician, dto.musician?.id)
    this.genre = resolve(Genre, dto.genre?.id)
    this.language = resolve(Language, dto.language?.id)
    this.rarity = resolve(Rarity, dto.rarity?.id)
    this.license = resolve(License, dto.license?.id)
    this.cracker = resolve(Cracker, dto.cracker?.id)
    this.difficulty = resolve(Difficulty, dto.difficulty?.id)
    this.prequel = resolve(Game, dto.prequel?.id)
    this.sequel = resolve(Game, dto.sequel?.id)
    this.related = resolve(Game, dto.related?.id)
    this.cloneOf = resolve(Game, dto.cloneOf?.id)

    this.name = dto.name
    this.year = dto.year
    this.reviewRating = dto.reviewRating
    this.filename = dto.filename
    this.fileToRun = dto.fileToRun
    this.sidFilename = dto.sidFilename
    this.scrnshotFilename = dto.scrnshotFilename
    this.playersFrom = dto.playersFrom
    this.playersTo = dto.playersTo
    this.playersSim = dto.playersSim ? 1 : 0
    this.control = dto.control
    this.v_Trainers = dto.trainers
    this.v_Length = dto.length
    this.vLengthType = dto.lengthType
    this.v_PalNtsc = dto.palNtsc
    this.comment = dto.comment
    this.vComment = dto.versionComment
    this.vPlayable = dto.playable ? 1 : 0
    this.vTitlescreen = dto.titleScreen ? 1 : 0
    this.vOriginal = dto.original ? 1 : 0
    this.vIncludedDocs = dto.includedDocs ? 1 : 0
    this.vLoadingScreen = dto.loadingScreen ? 1 : 0
    this.vHighscoreSaver = dto.highscoreSaver ? 1 : 0
    this.vTrueDriveEmu = dto.trueDriveEmu ? 1 : 0
    this.highscore = dto.highscore
    this.rating = dto.rating
    this.adult = dto.adult ? 1 : 0
    this.fav = dto.fav ? 1 : 0
    this.memoText = dto.memoText
  }
}

export type GameEntity = Game
