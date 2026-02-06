import { Options } from '@mikro-orm/better-sqlite'
import { getMigrations } from './entities'
import { Artist } from '../entities/artist.entity'
import { Config } from '../entities/config.entity'
import { Cracker } from '../entities/cracker.entity'
import { Developer } from '../entities/developer.entity'
import { Difficulty } from '../entities/difficulty.entity'
import { Extra } from '../entities/extra.entity'
import { Game } from '../entities/game.entity'
import { Genre } from '../entities/genre.entity'
import { Language } from '../entities/language.entity'
import { License } from '../entities/license.entity'
import { Music } from '../entities/music.entity'
import { Musician } from '../entities/musician.entity'
import { Programmer } from '../entities/programmer.entity'
import { Publisher } from '../entities/publisher.entity'
import { Rarity } from '../entities/rarity.entity'

const config = {
  entities: [
    Artist,
    Config,
    Cracker,
    Developer,
    Difficulty,
    Extra,
    Game,
    Genre,
    Language,
    License,
    Music,
    Musician,
    Programmer,
    Publisher,
    Rarity
  ],
  migrations: {
    migrationsList: getMigrations()
  }
  // debug: ['query', 'query-params']
} as Options

export default config
