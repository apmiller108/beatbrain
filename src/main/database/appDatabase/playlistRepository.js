export default class PlaylistRepository {
  constructor(db) {
    this.db = db
  }

  createPlaylist(name, description, trackSource, tracks) {
    return this.db.transaction(() => {
      const insertPlaylistStmt = this.db.prepare(`
        INSERT INTO playlists (name, description, track_source, created_at, updated_at)
        VALUES ($name, $description, $trackSource, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      const playlist = insertPlaylistStmt.run({ name, description, trackSource })

      const insertTrackStmt = this.db.prepare(`
        INSERT INTO playlist_tracks (playlist_id, source_track_id, file_path, duration, artist, title, album, genre, bpm, key, position, created_at, updated_at)
        VALUES ($playlist_id, $source_track_id, $file_path, $duration, $artist, $title, $album, $genre, $bpm, $key, $position, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      tracks.forEach((track, index) => {
        insertTrackStmt.run({
          playlist_id: playlist.lastInsertRowid,
          source_track_id: track.id,
          file_path: track.file_path,
          duration: track.duration,
          artist: track.artist,
          title: track.title,
          album: track.album,
          genre: track.genre,
          bpm: track.bpm,
          key: track.key,
          position: index
        })
      })
      return playlist
    })
  }

  getPlaylistById(playlistId) {
    const playlistStmt = this.db.prepare(`
      SELECT * FROM playlists WHERE id = ?
    `)
    const playlist = playlistStmt.get(playlistId)

    if (!playlist) {
      return null
    }

    const tracksStmt = this.db.prepare(`
      SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC
    `)
    const tracks = tracksStmt.all(playlistId)

    return { ...playlist, tracks }
  }

  getAllPlaylists() {
    const playlistsStmt = this.db.prepare(`
      SELECT * FROM playlists ORDER BY created_at DESC
    `)
    const playlists = playlistsStmt.all()
    return playlists
  }
}
