// mikro-orm.config.ts
import { Options } from '@mikro-orm/better-sqlite'
import { Artist } from '../entities/main/artist.entity'
import { Config } from '../entities/main/config.entity'
import { Cracker } from '../entities/main/cracker.entity'
import { Developer } from '../entities/main/developer.entity'
import { Difficulty } from '../entities/main/difficulty.entity'
import { Extra } from '../entities/main/extra.entity'
import { Game } from '../entities/main/game.entity'
import { Language } from '../entities/main/language.entity'
import { License } from '../entities/main/license.entity'
import { Music } from '../entities/main/music.entity'
import { Musician } from '../entities/main/musician.entity'
import { Programmer } from '../entities/main/programmer.entity'
import { Publisher } from '../entities/main/publisher.entity'
import { Rarity } from '../entities/main/rarity.entity'
import { Genre } from '../entities/main/genre.entity'
import { Migration_0001 } from '../migrations/main/migration-0001'
import { GameSession } from '../entities/user/game-session.entity'
import { GameUserData } from '../entities/user/game-user-data.entity'
import { MusicSession } from '../entities/user/music-session.entity'
import { UserDbState } from '../entities/user/user-db-state.entity'
import { User_Migration_0001 } from '../migrations/user/migration-0001'

export const mainConfig = {
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
    migrationsList: [{ name: 'Migration_0001', class: Migration_0001 }]
  }
} as Options

export const userConfig = {
  entities: [GameSession, GameUserData, MusicSession, UserDbState],
  migrations: {
    migrationsList: [
      {
        name: 'User_Migration_0001',
        class: User_Migration_0001
      }
    ]
  }
} as Options
