export default {
  version: 1,
  name: 'create_initial_tables',

  up(db) {
    db.exec(`
      CREATE TABLE app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    db.exec(`
      CREATE TABLE user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, key)
      );
    `)

    db.exec(`
      CREATE TABLE playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        track_source TEXT NOT NULL DEFAULT 'mixxx' CHECK (track_source IN ('mixxx', 'rekordbox')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    db.exec(`
      CREATE TABLE playlist_tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER NOT NULL,
        source_track_id INTEGER NOT NULL,
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
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
      );
    `)

    db.exec(`
      CREATE INDEX idx_playlist_tracks_playlist_id
      ON playlist_tracks(playlist_id);
    `)
  },

  down(db) {
    db.exec('DROP TABLE IF EXISTS playlist_tracks;')
    db.exec('DROP TABLE IF EXISTS playlists;')
    db.exec('DROP TABLE IF EXISTS user_preferences;')
    db.exec('DROP TABLE IF EXISTS app_settings;')
  }
}
