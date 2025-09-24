import Database from 'better-sqlite3'
import path from 'path'
import os from 'os'
import fs from 'fs'

export const createMockMixxxDatabase = (dir = null, filename = 'mixxxdb.sqlite') => {
  // Create temp dir to put mock Mixxx DB
  const tempDir = dir || path.join(os.tmpdir(), 'beatbrain-mixxx-test')
  // Remove any existing mock datbase if exists
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  const dbPath = path.join(tempDir, filename)
  const testDb = new Database(dbPath)
  const mixxxSchema = fs.readFileSync('spec/fixtures/mixxxdb_schema.sql', 'utf-8')

  try {
    testDb.exec(mixxxSchema);
    console.log(`Mock Mixxx database created at ${dbPath}`);
    return dbPath
  } catch (error) {
    console.log(error)
  } finally {
    testDb.close
  }
}


// Helper function to insert track data in library table
const processTrack = ( track) => {
  const processed = { ...track };

  // Convert hex strings to Buffers for BLOB fields
  if (processed.beats && processed.beats !== '') {
    processed.beats = Buffer.from(processed.beats, 'hex');
  }
  if (processed.coverart_digest && processed.coverart_digest !== '') {
    processed.coverart_digest = Buffer.from(processed.coverart_digest, 'hex');
  }

  return processed;
}

export const seedMixxxDatabase = (mockDbPath) => {
  const testDb = new Database(mockDbPath)
  const seedData = JSON.parse(fs.readFileSync('spec/fixtures/mixxxData.json', 'utf-8'))

  // The library.location column is INT but the FK references
  // track_location(location)!
  testDb.pragma('foreign_keys = OFF')

  try {
    // Insert track_locations
    seedData.track_locations.forEach((location) => {
      testDb.prepare(`
        INSERT INTO track_locations (
          "id", "location", "filename", "directory", "filesize", "fs_deleted", "needs_verification"
        ) VALUES (
          @id, @location, @filename, @directory, @filesize, @fs_deleted, @needs_verification
        )
      `).run(location);
    })

    const locCount = testDb.prepare('SELECT count(*) AS count FROM track_locations').get()['count'];
    console.log(`Inserted ${locCount} track locations successfully`);

    // Insert library tracks
    seedData.library.forEach((track) => {
      const processedTrack = processTrack(track);

      testDb.prepare(`
        INSERT INTO library (
          "artist", "title", "album", "year", "genre", "tracknumber",
          "location", "comment", "url", "duration", "bitrate", "samplerate",
          "cuepoint", "bpm", "wavesummaryhex", "channels", "datetime_added",
          "mixxx_deleted", "played", "header_parsed", "filetype", "replaygain",
          "timesplayed", "rating", "key", "beats", "beats_version", "composer",
          "bpm_lock", "beats_sub_version", "keys", "keys_version", "keys_sub_version",
          "key_id", "grouping", "album_artist", "coverart_source", "coverart_type",
          "coverart_location", "coverart_hash", "replaygain_peak", "tracktotal",
          "color", "coverart_color", "coverart_digest", "last_played_at",
          "source_synchronized_ms"
        ) VALUES (
          @artist, @title, @album, @year, @genre, @tracknumber,
          @location, @comment, @url, @duration, @bitrate, @samplerate,
          @cuepoint, @bpm, @wavesummaryhex, @channels, @datetime_added,
          @mixxx_deleted, @played, @header_parsed, @filetype, @replaygain,
          @timesplayed, @rating, @key, @beats, @beats_version, @composer,
          @bpm_lock, @beats_sub_version, @keys, @keys_version, @keys_sub_version,
          @key_id, @grouping, @album_artist, @coverart_source, @coverart_type,
          @coverart_location, @coverart_hash, @replaygain_peak, @tracktotal,
          @color, @coverart_color, @coverart_digest, @last_played_at,
          @source_synchronized_ms
        )
      `).run(processedTrack);
    })

    const trackCount = testDb.prepare('SELECT count(*) AS count FROM library').get()['count'];
    console.log(`Inserted ${trackCount} tracks successfully`);

    // Insert crates

    seedData.crates.forEach((crate) => {
      testDb.prepare(`
        INSERT INTO crates (
          "id", "name", "count", "show", "autodj_source", "locked"
        ) VALUES (
          @id, @name, @count, @show, @autodj_source, @locked
        )
      `).run(crate);
    })

    const crateCount = testDb.prepare('SELECT count(*) AS count FROM crates').get()['count'];
    console.log(`Inserted ${crateCount} crates successfully`);

    // Insert crate_tracks

    seedData.crate_tracks.forEach((ct) => {
      testDb.prepare(`
        INSERT INTO crate_tracks (
          "crate_id", "track_id"
        ) VALUES (
          @crate_id, @track_id
        )
      `).run(ct);
    })

    const crateTrackCount = testDb.prepare(
      'SELECT count(*) AS count FROM crate_tracks'
    ).get()['count'];
    console.log(`Inserted ${crateTrackCount} crate tracks successfully`);

    // Insert Playlists

    seedData.playlists.forEach((pl) => {
      testDb.prepare(`
        INSERT INTO Playlists (
          "name", "position", "hidden", "date_created", "date_modified", "locked"
        ) VALUES (
          @name, @position, @hidden, @date_created, @date_modified, @locked
        )
      `).run(pl);
    })

    const playlistCount = testDb.prepare('SELECT count(*) AS count FROM Playlists').get()['count'];
    console.log(`Inserted ${playlistCount} playlists successfully`);

    // Insert PlaylistTracks
    seedData.playlistTracks.forEach((pt) => {
      testDb.prepare(`
        INSERT INTO PlaylistTracks (
          "playlist_id", "track_id", "position", "pl_datetime_added"
        ) VALUES (
          @playlist_id, @track_id, @position, @pl_datetime_added
        )
      `).run(pt);
    })

    const playlistTrackCount = testDb.prepare(
      'SELECT count(*) AS count FROM PlaylistTracks'
    ).get()['count'];
    console.log(`Inserted ${playlistTrackCount} playlist tracks successfully`);

  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    testDb.close
  }
}


export default {
  createMockMixxxDatabase,
  seedMixxxDatabase
}
