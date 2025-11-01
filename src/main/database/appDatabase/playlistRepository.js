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
      throw new Error(`Playlist with id ${id} not found`)
    }

    const tracks = this.getPlaylistTracks(playlistId)

    return { ...playlist, tracks }
  }

  getPlaylistTracks(playlistId) {
    const tracksStmt = this.db.prepare(`
      SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC
    `)
    const tracks = tracksStmt.all(playlistId)
    return tracks
  }

  getAllPlaylists() {
    const playlistsStmt = this.db.prepare(`
      SELECT * FROM playlists ORDER BY created_at DESC
    `)
    const playlists = playlistsStmt.all()
    return playlists
  }

  updatePlaylist(id, { name, description }) {
    try {
      let sql = `
        UPDATE playlists
        SET updated_at = CURRENT_TIMESTAMP
      `

      if (name !== undefined) {
        sql += `, name = $name`
      }

      if (description !== undefined) {
        sql += `, description = $description`
      }

      const updateStmt = this.db.prepare(sql + ` WHERE id = $id`)
      const result = updateStmt.run({ id, name, description })
      if (result.changes === 0) {
        throw new Error(`Playlist with id ${id} not found`)
      }

      return true

    } catch (error) {
      console.error('Error updating playlist:', error)
      throw error
    }
  }

  updateTrackPosition(playlistId, trackId, newPosition) {
    try {
      const trackStmt = this.db.prepare(`
        SELECT * FROM playlist_tracks WHERE playlist_id = ? AND id = ?
      `)
      const track = trackStmt.get(playlistId, trackId)

      if (!track) {
        throw new Error(`Track with id ${trackId} not found in playlist ${playlistId}`)
      }

      const updateStmt = this.db.prepare(`
        UPDATE playlist_tracks
        SET position = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND playlist_id = ?
      `)
      updateStmt.run(newPosition, trackId, playlistId)

      return true

    } catch (error) {
      console.error('Error updating track position:', error)
      throw error
    }
  }

  // append a track to the end of the playlist
  addTrackToPlaylist(playlistId, trackData) {
    try {
      const playlist = this.getPlaylistById(playlistId)
      const lastTrack = playlist.tracks[playlist.tracks.length - 1]
      const position = lastTrack ? lastTrack.position + 1 : 1

      const insertTrackStmt = this.db.prepare(`
        INSERT INTO playlist_tracks (playlist_id, source_track_id, file_path, duration, artist, title, album, genre, bpm, key, position, created_at, updated_at)
        VALUES ($playlist_id, $source_track_id, $file_path, $duration, $artist, $title, $album, $genre, $bpm, $key, $position, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      insertTrackStmt.run({
        playlist_id: playlistId,
        source_track_id: trackData.id,
        file_path: trackData.file_path,
        duration: trackData.duration,
        artist: trackData.artist,
        title: trackData.title,
        album: trackData.album,
        genre: trackData.genre,
        bpm: trackData.bpm,
        key: trackData.key,
        position: position
      })

      return true
    } catch (error) {
      console.error('Error adding track to playlist:', error)
      throw error
    }
  }

  removeTrackFromPlaylist(playlistId, trackId) {
    try {
      const deleteStmt = this.db.prepare(`
        DELETE FROM playlist_tracks WHERE playlist_id = ? AND id = ?
      `)
      const result = deleteStmt.run(playlistId, trackId)

      if (result.changes === 0) {
        throw new Error(`Track with id ${trackId} not found in playlist ${playlistId}`)
      }

      return true
    } catch (error) {
      console.error('Error removing track from playlist:', error)
      throw error
    }
  }

  deletePlaylist(id) {
    try {
      const deleteTracksStmt = this.db.prepare(`
        DELETE FROM playlist_tracks WHERE playlist_id = ?
      `)
      deleteTracksStmt.run(id)

      const deletePlaylistStmt = this.db.prepare(`
        DELETE FROM playlists WHERE id = ?
      `)
      const result = deletePlaylistStmt.run(id)

      if (result.changes === 0) {
        throw new Error(`Playlist with id ${id} not found`)
      }

      return true
    } catch (error) {
      console.error('Error deleting playlist:', error)
      throw error
    }
  }
}
