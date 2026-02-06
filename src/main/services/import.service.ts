import { readFileSync } from 'fs'
import { Value } from 'mdb-reader'
import { DataCache } from '../cache/datacache'
import { Artist } from '../entities/artist.entity'
import { Developer } from '../entities/developer.entity'
import { Genre } from '../entities/genre.entity'
import { Base } from '../entities/base'
import { Cracker } from '../entities/cracker.entity'
import { Difficulty } from '../entities/difficulty.entity'
import { Language } from '../entities/language.entity'
import { License } from '../entities/license.entity'
import { Programmer } from '../entities/programmer.entity'
import { Publisher } from '../entities/publisher.entity'
import { Rarity } from '../entities/rarity.entity'
import { Config } from '../entities/config.entity'
import { Musician } from '../entities/musician.entity'
import { Game } from '../entities/game.entity'
import { Music } from '../entities/music.entity'
import { Extra } from '../entities/extra.entity'
import { MikroORM } from '@mikro-orm/better-sqlite'
import log from 'electron-log'
import { MessagePort } from 'worker_threads'
import { GameBase } from '@shared/models/settings.model'

export async function importData(gamebase: GameBase, db: MikroORM, port: MessagePort) {
  const mdbReader = await import('mdb-reader')
  log.info('mdbReader: ', mdbReader !== undefined)
  if (!gamebase.importFile) {
    return
  }
  const buffer = readFileSync(gamebase.importFile)
  const reader = new mdbReader.default(buffer)

  const tables = reader.getTableNames()
  const totalRowCount = tables
    .filter((name) => name !== 'ViewData' && name !== 'ViewFilters')
    .map((name) => reader.getTable(name).rowCount)
    .reduce((acc, cur) => acc + cur)

  const onePercentProgress = Math.floor(totalRowCount / 100)
  let rowsPersisted = 0
  let percentage = 0
  const percentageIncrease = 6.67

  const reportProgress = (currentRow: number) => {
    if (currentRow % onePercentProgress === 0) {
      log.info(`Import: line ${currentRow}`)
      port.postMessage({
        status: 'running',
        message: `${Math.ceil((currentRow / totalRowCount) * 100)}%`
      })
    }
  }
  if (process && process.send) {
    process.send('Import started')
  }
  log.info('Starting import')

  const em = db.em.fork()
  log.info('em', em !== undefined)

  const persistRow = async (row: object) => {
    em.persist(row)
    rowsPersisted++
    if (rowsPersisted % 500 === 0) {
      //await em.flush()
      reportProgress(rowsPersisted)
    }
  }

  const creator = async (
    orig: { [x: string]: Value },
    copyCreator: () => Base,
    idColName: string,
    nameColName: string,
    cache: DataCache<unknown>
  ) => {
    const copy = copyCreator()
    copy.id = orig[idColName] as number
    copy.name = orig[nameColName] as string
    await persistRow(copy)
    cache[copy.id] = copy
  }

  const importTable = async (
    tableName: string,
    copyCreator: () => Base,
    idColName: string,
    nameColName: string,
    cache: DataCache<unknown>
  ) => {
    log.info(`Import: importing ${tableName}`)
    port.postMessage({
      status: 'running',
      message: `${percentage.toFixed(0)}%`
    })

    const mdbTable = reader.getTable(tableName).getData()
    for (const row of mdbTable) {
      await creator(row, copyCreator, idColName, nameColName, cache)
    }

    await em.flush()
    percentage += percentageIncrease
  }

  const artistCache: DataCache<Artist> = {}
  const crackerCache: DataCache<Cracker> = {}
  const developerCache: DataCache<Developer> = {}
  const difficultyCache: DataCache<Difficulty> = {}
  const languageCache: DataCache<Language> = {}
  const licenseCache: DataCache<License> = {}
  const programmerCache: DataCache<Programmer> = {}
  const publisherCache: DataCache<Publisher> = {}
  const rarityCache: DataCache<Rarity> = {}

  // import simple tables without dependencies

  await importTable('Artists', () => new Artist(), 'AR_Id', 'Artist', artistCache)
  await importTable('Crackers', () => new Cracker(), 'CR_Id', 'Cracker', crackerCache)
  await importTable('Developers', () => new Developer(), 'DE_Id', 'Developer', developerCache)
  await importTable('Difficulty', () => new Difficulty(), 'DI_Id', 'Difficulty', difficultyCache)
  await importTable('Languages', () => new Language(), 'LA_Id', 'Language', languageCache)
  await importTable('Licenses', () => new License(), 'LI_Id', 'License', licenseCache)
  await importTable('Programmers', () => new Programmer(), 'PR_Id', 'Programmer', programmerCache)
  await importTable('Publishers', () => new Publisher(), 'PU_Id', 'Publisher', publisherCache)
  await importTable('Rarities', () => new Rarity(), 'RA_Id', 'Rarity', rarityCache)

  const yearCache: DataCache<number> = {}
  const years = reader.getTable('Years').getData()
  for (const year of years) {
    yearCache[year['YE_Id'] as number] = year['Year'] as number
  }

  const configs = reader.getTable('Config').getData()
  for (const config of configs) {
    const newConfig = new Config()
    newConfig.majorVersion = config['MajorVersion'] as number
    newConfig.minorVersion = config['MinorVersion'] as number
    newConfig.officialUpdate = config['OfficialUpdate'] as number
    newConfig.firstLoadMessage = config['FirstLoadMessage'] as string
    newConfig.firstLoadGemusAsk = config['FirstLoadGemusAsk'] as number
    newConfig.databaseName = config['DatabaseName'] as string
    newConfig.gamebaseWindowTitle = config['GamebaseWindowTitle'] as string
    await persistRow(newConfig)
  }

  await em.flush()
  percentage += percentageIncrease

  log.info(`Import: importing musicians`)
  port.postMessage({
    status: 'running',
    message: `${percentage.toFixed(0)}%`
  })

  // musician
  const musicianCache: DataCache<Musician> = {}
  const musicians = reader.getTable('Musicians').getData()
  for (const musician of musicians) {
    const newMusician = new Musician()
    newMusician.id = musician['MU_Id'] as number
    newMusician.photo = musician['Photo'] as string
    newMusician.name = musician['Musician'] as string
    newMusician.grp = musician['Grp'] as string
    newMusician.nick = musician['Nick'] as string
    await persistRow(newMusician)
    musicianCache[newMusician.id] = newMusician
  }

  await em.flush()
  percentage += percentageIncrease

  log.info(`Import: importing genres`)
  port.postMessage({
    status: 'running',
    message: `${percentage.toFixed(0)}%`
  })

  // genre
  const parentGenres = reader.getTable('PGenres').getData()
  const genreCache: DataCache<Genre> = {}
  let maxParentGenreId = 0
  for (const genre of parentGenres) {
    const newGenre = new Genre()
    newGenre.id = genre['PG_Id'] as number
    newGenre.name = genre['ParentGenre'] as string
    await persistRow(newGenre)
    genreCache[newGenre.id] = newGenre
    if (newGenre.id > maxParentGenreId) {
      maxParentGenreId = newGenre.id
    }
  }

  const subGenres = reader.getTable('Genres').getData()
  for (const genre of subGenres) {
    const newGenre = new Genre()
    newGenre.id = (genre['GE_Id'] as number) + maxParentGenreId
    newGenre.parent = genreCache[genre['PG_Id'] as number]
    newGenre.name = genre['Genre'] as string
    await persistRow(newGenre)
    genreCache[newGenre.id] = newGenre
  }

  await em.flush()
  percentage += percentageIncrease
  log.info(`Import: importing games`)
  port.postMessage({
    status: 'running',
    message: `${percentage.toFixed(0)}%`
  })

  // game
  const prequelCache: DataCache<number> = {}
  const sequelCache: DataCache<number> = {}
  const relatedCache: DataCache<number> = {}
  const cloneOfCache: DataCache<number> = {}
  const gameCache: DataCache<Game> = {}
  const games = reader.getTable('Games').getData()
  for (const game of games) {
    const newGame = new Game()
    newGame.id = game['GA_Id'] as number
    newGame.name = game['Name'] as string
    newGame.year = yearCache[game['YE_Id'] as number]
    newGame.filename = game['Filename'] as string
    newGame.fileToRun = game['FileToRun'] as string
    newGame.filenameIndex = game['FilenameIndex'] as number
    newGame.scrnshotFilename = game['ScrnshotFilename'] as string
    newGame.musician = musicianCache[game['MU_Id'] as number]
    newGame.genre = genreCache[(game['GE_Id'] as number) + maxParentGenreId]
    newGame.publisher = publisherCache[game['PU_Id'] as number]
    newGame.difficulty = difficultyCache[game['DI_Id'] as number]
    newGame.cracker = crackerCache[game['CR_Id'] as number]
    newGame.sidFilename = game['SidFilename'] as string
    newGame.dateLastPlayed = game['DateLastPlayed'] as string
    newGame.timesPlayed = game['TimesPlayed'] as number
    newGame.cCode = game['CCode'] as number
    newGame.highscore = game['HighScore'] as string
    newGame.fa = game['FA'] as number
    newGame.sa = game['SA'] as number
    newGame.fav = game['FAV'] as number
    newGame.programmer = programmerCache[game['PR_Id'] as number]
    newGame.language = languageCache[game['LA_Id'] as number]
    newGame.extras = game['Extras'] as number
    newGame.classic = game['Classic'] as number
    newGame.rating = game['Rating'] as number
    newGame.v_PalNtsc = game['V_PalNTSC'] as number
    newGame.v_Length = game['V_Length'] as number
    newGame.v_Trainers = game['V_Trainers'] as number
    newGame.playersFrom = game['PlayersFrom'] as number
    newGame.playersTo = game['PlayersTo'] as number
    newGame.playersSim = game['PlayersSim'] as number
    newGame.adult = game['Adult'] as number
    newGame.memoText = game['MemoText'] as string
    newGame.control = game['Control'] as number
    newGame.crc = game['CRC'] as string
    newGame.filesize = game['Filesize'] as number
    newGame.version = game['Version'] as number
    newGame.gemus = game['Gemus'] as string
    newGame.vLengthType = game['V_LengthType'] as number
    newGame.comment = game['Comment'] as string
    newGame.vComment = game['V_Comment'] as string
    newGame.vLoadingScreen = game['V_LoadingScreen'] as number
    newGame.vHighscoreSaver = game['V_HighscoreSaver'] as number
    newGame.vIncludedDocs = game['V_IncludedDocs'] as number
    newGame.vTrueDriveEmu = game['V_TrueDriveEmu'] as number
    newGame.artist = artistCache[game['AR_Id'] as number]
    newGame.developer = developerCache[game['DE_Id'] as number]
    newGame.license = licenseCache[game['LI_Id'] as number]
    newGame.rarity = rarityCache[game['RA_Id'] as number]
    newGame.weblinkName = game['Weblink_Name'] as string
    newGame.weblinkUrl = game['Weblink_URL'] as string
    newGame.vWeblinkName = game['V_Weblink_Name'] as string
    newGame.vWeblinkUrl = game['V_Weblink_URL'] as string
    newGame.vTitlescreen = game['V_TitleScreen'] as number
    newGame.vPlayable = game['V_Playable'] as number
    newGame.vOriginal = game['V_Original'] as number
    newGame.reviewRating = game['ReviewRating'] as number
    await persistRow(newGame)
    gameCache[newGame.id] = newGame
    // store them for later after all games have been created
    if (game['Prequel']) prequelCache[newGame.id] = game['Prequel'] as number
    if (game['Sequel']) sequelCache[newGame.id] = game['Sequel'] as number
    if (game['Related']) relatedCache[newGame.id] = game['Related'] as number
    if (game['CloneOf']) cloneOfCache[newGame.id] = game['CloneOf'] as number
  }

  // game: prequel, sequel, related, cloneOf
  for (const gameId of Object.keys(prequelCache)) {
    const id = Number.parseInt(gameId)
    gameCache[id].prequel = gameCache[prequelCache[id]]
    em.persist(gameCache[id])
  }
  for (const gameId of Object.keys(sequelCache)) {
    const id = Number.parseInt(gameId)
    gameCache[id].sequel = gameCache[sequelCache[id]]
    em.persist(gameCache[id])
  }
  for (const gameId of Object.keys(relatedCache)) {
    const id = Number.parseInt(gameId)
    gameCache[id].related = gameCache[relatedCache[id]]
    em.persist(gameCache[id])
  }
  for (const gameId of Object.keys(cloneOfCache)) {
    const id = Number.parseInt(gameId)
    gameCache[id].cloneOf = gameCache[cloneOfCache[id]]
    em.persist(gameCache[id])
  }

  await em.flush()
  percentage += percentageIncrease

  // music
  const music = reader.getTable('Music').getData()
  log.info(`Import: importing music`)
  port.postMessage({
    status: 'running',
    message: `${percentage.toFixed(0)}%`
  })

  for (const element of music) {
    const newMusic = new Music()
    newMusic.game = gameCache[element['GA_Id'] as number]
    newMusic.name = element['Name'] as string
    newMusic.filename = element['Filename'] as string
    newMusic.musician = musicianCache[element['MU_Id'] as number]
    newMusic.sfav = element['SFav'] as number
    newMusic.sa = element['SA'] as number
    newMusic.adult = element['adult'] as number
    await persistRow(newMusic)
  }

  await em.flush()
  percentage += percentageIncrease

  // extras
  const extras = reader.getTable('Extras').getData()
  log.info(`Import: importing extras`)
  port.postMessage({
    status: 'running',
    message: `${percentage.toFixed(0)}%`
  })

  for (const extra of extras) {
    const newExtra = new Extra()
    newExtra.id = extra['EX_Id'] as number
    newExtra.game = gameCache[extra['GA_Id'] as number]
    newExtra.displayOrder = extra['DisplayOrder'] as number
    newExtra.type = extra['Type'] as number
    newExtra.name = extra['Name'] as string
    newExtra.path = extra['Path'] as string
    newExtra.ea = extra['EA'] as number
    newExtra.data = extra['Data'] as string
    newExtra.fileToRun = extra['FileToRun'] as string

    await persistRow(newExtra)
  }

  await em.flush()
}
