import { Migration } from '@mikro-orm/migrations'

export class Migration_0001 extends Migration {
  override async up(): Promise<void> {
    this.addSql('CREATE TABLE IF NOT EXISTS Artists(id INTEGER PRIMARY KEY, name TEXT);')

    this.addSql(
      'CREATE TABLE IF NOT EXISTS Config(id INTEGER PRIMARY KEY, major_version INTEGER, minor_version INTEGER, official_update INTEGER, first_load_message TEXT, first_load_gemus_ask INTEGER, database_name TEXT, game_base_window_title TEXT);'
    )

    this.addSql('CREATE TABLE IF NOT EXISTS Crackers(id INTEGER PRIMARY KEY, name TEXT);')

    this.addSql('CREATE TABLE IF NOT EXISTS Developers(id INTEGER PRIMARY KEY, name TEXT);')

    this.addSql('CREATE TABLE IF NOT EXISTS Difficulty(id INTEGER PRIMARY KEY, name TEXT);')

    this.addSql(
      'CREATE TABLE IF NOT EXISTS Extras(id INTEGER PRIMARY KEY, ga_id INTEGER, display_order INTEGER, type INTEGER, name TEXT, path TEXT, ea INTEGER, data TEXT, file_to_run TEXT);'
    )

    this.addSql(
      'CREATE TABLE IF NOT EXISTS Games(id INTEGER PRIMARY KEY, name TEXT, year INTEGER, filename TEXT, file_to_run TEXT, filename_index INTEGER, scrnshot_filename TEXT, mu_id INTEGER, ge_id INTEGER, pu_id INTEGER, di_id TEXT, cr_id INTEGER, sid_filename TEXT, date_last_played TEXT, times_played INTEGER, c_code INTEGER, highscore TEXT, fa INTEGER, sa INTEGER, fav INTEGER, pr_id INTEGER, la_id INTEGER, extras INTEGER, classic INTEGER, rating INTEGER, v_pal_ntsc INTEGER, v_length INTEGER, v_trainers INTEGER, players_from INTEGER, players_to INTEGER, players_sim INTEGER, adult INTEGER, memo_text TEXT, prequel INTEGER, sequel INTEGER, related INTEGER, control INTEGER, crc TEXT, filesize INTEGER, version INTEGER, gemus TEXT, v_length_type INTEGER, comment TEXT, v_comment TEXT, v_loading_screen INTEGER, v_highscore_saver INTEGER, v_included_docs INTEGER, v_true_drive_emu INTEGER, ar_id INTEGER, de_id INTEGER, li_id INTEGER, ra_id INTEGER, weblink_name TEXT, webLink_url TEXT, v_weblink_name TEXT, v_weblink_url TEXT, v_titlescreen INTEGER, v_playable INTEGER, v_original INTEGER, clone_of INTEGER, review_rating INTEGER);'
    )

    this.addSql(
      'CREATE TABLE IF NOT EXISTS Genres(id INTEGER PRIMARY KEY, ge_id INTEGER, name TEXT);'
    )

    this.addSql('CREATE TABLE IF NOT EXISTS Languages(id INTEGER PRIMARY KEY, name TEXT);')

    this.addSql('CREATE TABLE IF NOT EXISTS Licenses(id INTEGER PRIMARY KEY, name TEXT);')

    this.addSql(
      'CREATE TABLE IF NOT EXISTS Music(id INTEGER PRIMARY KEY, ga_id INTEGER, name TEXT, filename TEXT, mu_id INTEGER, sfav INTEGER, sa INTEGER, adult INTEGER);'
    )

    this.addSql(
      'CREATE TABLE IF NOT EXISTS Musicians(id INTEGER PRIMARY KEY, photo TEXT, name TEXT, grp TEXT, nick TEXT);'
    )

    this.addSql('CREATE TABLE IF NOT EXISTS Programmers(id INTEGER PRIMARY KEY, name TEXT);')

    this.addSql('CREATE TABLE IF NOT EXISTS Publishers(id INTEGER PRIMARY KEY, name TEXT);')

    this.addSql('CREATE TABLE IF NOT EXISTS Rarities(id INTEGER PRIMARY KEY, name TEXT);')

    // this.addSql(
    //   "CREATE TABLE IF NOT EXISTS ViewData(id INTEGER PRIMARY KEY, filterMode INTEGER, title TEXT, FilterCount INTEGER, IncludeMusicTable INTEGER, ListViewType INTEGER, SortColumn INTEGER, SortOrder INTEGER, SelectedItem TEXT, ExtraColumns TEXT, Ordinal INTEGER);"
    // );

    // this.addSql(
    //   "CREATE TABLE IF NOT EXISTS ViewFilters(id INTEGER PRIMARY KEY, FieldTable TEXT, FieldName TEXT, Operator INTEGER, ClauseType INTEGER, ClauseData TEXT, MusicFieldName TEXT, MusicFieldTable TEXT);"
    // );

    // this.addSql(
    //   "CREATE TABLE IF NOT EXISTS Years(id INTEGER PRIMARY KEY, year INTEGER);"
    // );
  }
}
