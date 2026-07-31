import { Migration } from '@mikro-orm/migrations'

export class Migration_0001 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'CREATE TABLE IF NOT EXISTS GameUserData(game_id INTEGER PRIMARY KEY, rating INTEGER NULL, favorite INTEGER NOT NULL DEFAULT 0, comment TEXT NULL, high_score TEXT NULL, last_played_at TEXT NULL, play_count INTEGER NOT NULL DEFAULT 0);'
    )

    this.addSql(
      "CREATE TABLE IF NOT EXISTS UserDbState(key TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'pending', completed_at TEXT NULL, error_message TEXT NULL);"
    )

    this.addSql(
      'CREATE TABLE IF NOT EXISTS GameSession(id INTEGER PRIMARY KEY, game_id INTEGER NOT NULL, emulator_id TEXT NULL, name TEXT NULL, genre TEXT NULL, playtime_in_ms INTEGER NOT NULL, last_played_at_ms INTEGER NOT NULL);'
    )

    this.addSql(
      'CREATE TABLE IF NOT EXISTS MusicSession(id INTEGER PRIMARY KEY, music_or_game_id INTEGER NOT NULL, name TEXT NULL, last_played_at_ms INTEGER NOT NULL, from_game INTEGER NOT NULL DEFAULT 0);'
    )
  }
}
