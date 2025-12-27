export default {
  version: 2,
  name: 'add_playlist_filters',

  up(db) {
    db.exec(`
      ALTER TABLE playlists
      ADD COLUMN filters TEXT;
    `)
  },

  down(db) {
    // SQLite doesn't support DROP COLUMN directly
    // You'd need to recreate the table without the column
    db.exec(`
      CREATE TABLE playlists_backup AS
      SELECT id, name, description, track_source, created_at, updated_at
      FROM playlists;
    `)

    db.exec('DROP TABLE playlists;')

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
      INSERT INTO playlists
      SELECT * FROM playlists_backup;
    `)

    db.exec('DROP TABLE playlists_backup;')
  }
}
