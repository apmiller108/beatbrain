import Database from 'better-sqlite3'
import path from 'path'
import os from 'os'
import fs from 'fs'

export const createMockMixxxDatabase = () => {
  // Create temp dir to put mock Mixxx DB
  const tempDir = path.join(os.tmpdir(), 'beatbrain-mixxx-test')
  // Remove any existing mock datbase if exists
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  const dbPath = path.join(tempDir, 'mixxxdb.sqlite')
  const testDb = new Database(dbPath)
  const mixxxSchema = fs.readFileSync('spec/fixtures/mixxxdb_schema.sql', 'utf-8')

  try {
    testDb.exec(mixxxSchema);
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

// TODO: insert proper track_locations.
// TODO: add more library tracks
export const seedMixxxDatabase = (mockDbPath) => {
  const testDb = new Database(mockDbPath)
  const seedData = JSON.parse(fs.readFileSync('spec/fixtures/mixxxData.json', 'utf-8'))
  const insertLibrary = testDb.prepare(`
    INSERT INTO library (
      "id", "artist", "title", "album", "year", "genre", "tracknumber",
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
      @id, @artist, @title, @album, @year, @genre, @tracknumber,
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
  `);

  try {
    const insertTracks = testDb.transaction((tracks) => {
      tracks.forEach((track) => {
        const processedTrack = processTrack(track);
        insertLibrary.run(processedTrack);
      })
    });

    insertTracks(seedData.library);
    console.log(`Inserted ${seedData.library.length} tracks successfully`);
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
