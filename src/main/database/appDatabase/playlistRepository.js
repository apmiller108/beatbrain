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
      const insertedTracks = tracks.map((track, index) => {
        const result = insertTrackStmt.run({
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
        return { ...track, id: result.lastInsertRowid, position: index }
      })
      return { id: playlist.lastInsertRowid, name, description, trackSource, tracks: insertedTracks  }
    })
  }

  getPlaylistById(playlistId) {
    const playlistStmt = this.db.prepare(`
      SELECT * FROM playlists WHERE id = ?
    `)
    const playlist = playlistStmt.get(playlistId)

    if (!playlist) {
      throw new Error(`Playlist with id ${playlistId} not found`)
    }

    const tracks = this.getPlaylistTracks(playlistId)

    return { ...playlist, tracks, track_count: tracks.length }
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

    // fetch the playlist_tracks count grouped by playlist_id and attach to each playlist
    const trackCountStmt = this.db.prepare(`
      SELECT playlist_id, COUNT(*) as track_count
      FROM playlist_tracks
      GROUP BY playlist_id
    `)
    const trackCounts = trackCountStmt.all()

    playlists.map(playlist => {
      const trackCount = trackCounts.find(tc => tc.playlist_id === playlist.id)
      playlist.track_count = trackCount ? trackCount.track_count : 0
    })

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

      if (updateStmt.changes === 0) {
        throw new Error(`Failed to update position for track with id ${trackId} in playlist ${playlistId}`)
      } else {
        this.updatePlaylist(playlistId, {})  // update the playlist's updated_at timestamp
      }

      return true

    } catch (error) {
      console.error('Error updating track position:', error)
      throw error
    }
  }

  updateTrackPositions(playlistId, tracks) {
    this.db.transaction(() => {
      tracks.forEach((track) => {
        this.updateTrackPosition(playlistId, track.id, track.position)
      })
    })
  }

  addTracksToPlaylist(playlistId, tracks) {
    if (!tracks || tracks.length === 0) {
      return { success: true, changes: 0 }
    }

    return this.db.transaction(() => {
      const maxPositionResult = this.db.prepare(
        'SELECT MAX(position) as maxPosition FROM playlist_tracks WHERE playlist_id = ?'
      ).get(playlistId)
      let nextPosition = (maxPositionResult?.maxPosition ?? -1) + 1

      const insertStmt = this.db.prepare(`
        INSERT INTO playlist_tracks (playlist_id, source_track_id, file_path, duration, artist, title, album, genre, bpm, key, position, created_at, updated_at)
        VALUES ($playlist_id, $source_track_id, $file_path, $duration, $artist, $title, $album, $genre, $bpm, $key, $position, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)

      for (const track of tracks) {
        insertStmt.run({
          playlist_id: playlistId,
          source_track_id: track.id,
          file_path: track.file_path,
          duration: track.duration,
          artist: track.artist,
          title: track.title,
          album: track.album,
          genre: track.genre,
          bpm: track.bpm,
          key: track.key,
          position: nextPosition
        })
        nextPosition++
      }

      this.updatePlaylist(playlistId, {}) // update the playlist's updated_at timestamp
      return { success: true, changes: tracks.length }
    })
  }

  removeTrackFromPlaylist(playlistId, trackId) {
    this.db.transaction(() => {
      try {
        const tracks = this.getPlaylistTracks(playlistId)
        const track = tracks.find(t => t.id === trackId)
        // Decrement positions of tracks that were after the removed track
        const tracksToReoder = tracks.filter(t => t.position > track.position)
                                     .map(t => ({ ...t, position: t.position - 1 }))

        const deleteStmt = this.db.prepare(`
          DELETE FROM playlist_tracks WHERE playlist_id = ? AND id = ?
        `)
        const result = deleteStmt.run(playlistId, trackId)

        if (result.changes === 0) {
          throw new Error(`Track with id ${trackId} not found in playlist ${playlistId}`)
        } else {
          this.updatePlaylist(playlistId, {})  // update the playlist's updated_at timestamp
          this.updateTrackPositions(playlistId, tracksToReoder) // reorder remaining tracks
        }

        return true
      } catch (error) {
        console.error('Error removing track from playlist:', error)
        throw error
      }
    })
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
