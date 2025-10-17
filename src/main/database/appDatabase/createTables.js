export default class CreateTables {
  constructor(appDatabase) {
    this.appDatabase = appDatabase
  }

  up() {
    try {
      const createSettingsTable = `
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `

      const createUserPreferencesTable = `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(category, key)
        );
      `

      const createPlaylistsTable = `
        CREATE TABLE IF NOT EXISTS playlists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          track_source TEXT NOT NULL DEFAULT 'mixxx' CHECK (track_source IN ('mixxx', 'rekordbox')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `
      const createPlaylistTracksTable = `
        CREATE TABLE IF NOT EXISTS playlist_tracks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          playlist_id INTEGER NOT NULL,
          source_track_id INTERGER NOT NULL,
          file_path TEXT NOT NULL,
          duration FLOAT,
          artist TEXT,
          title TEXT,
          album TEXT,
          genre TEXT,
          bpm FLOAT,
          key TEXT,
          position INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (playlist_id) REFERENCES playlists(id)
        );
      `
      this.appDatabase.exec(createSettingsTable)
      this.appDatabase.exec(createUserPreferencesTable)
      this.appDatabase.exec(createPlaylistsTable)
      this.appDatabase.exec(createPlaylistTracksTable)
    } catch (error) {
      console.error('Error creating tables:', error)
      throw error
    }
  }
}
