import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import os from 'os'

// NOTE: this may not longer be necessary as the components will convert keys per users preference
// It might be useful to have this logic here for future features though (eg, harmonic mixing algorithm)
const camelotCaseStatement = `
  CASE
    WHEN l.key LIKE '%A (%' OR l.key LIKE '%B (%' THEN SUBSTR(l.key, 1, INSTR(l.key, ' ') - 1)
    WHEN l.key = 'Am' OR l.key = 'Amin' THEN '8A'
    WHEN l.key = 'Em' OR l.key = 'Emin' THEN '9A'
    WHEN l.key = 'Bm' OR l.key = 'Bmin' THEN '10A'
    WHEN l.key = 'F#m' OR l.key = 'F#min' OR l.key = 'Gbm' OR l.key = 'Gbmin' THEN '11A'
    WHEN l.key = 'C#m' OR l.key = 'C#min' OR l.key = 'Dbm' OR l.key = 'Dbmin' THEN '12A'
    WHEN l.key = 'G#m' OR l.key = 'G#min' OR l.key = 'Abm' OR l.key = 'Abmin' THEN '1A'
    WHEN l.key = 'D#m' OR l.key = 'D#min' OR l.key = 'Ebm' OR l.key = 'Ebmin' THEN '2A'
    WHEN l.key = 'A#m' OR l.key = 'A#min' OR l.key = 'Bbm' OR l.key = 'Bbmin' THEN '3A'
    WHEN l.key = 'Fm' OR l.key = 'Fmin' THEN '4A'
    WHEN l.key = 'Cm' OR l.key = 'Cmin' THEN '5A'
    WHEN l.key = 'Gm' OR l.key = 'Gmin' THEN '6A'
    WHEN l.key = 'Dm' OR l.key = 'Dmin' THEN '7A'
    WHEN l.key = 'C' OR l.key = 'Cmaj' OR l.key = 'CM' THEN '8B'
    WHEN l.key = 'G' OR l.key = 'Gmaj' OR l.key = 'GM' THEN '9B'
    WHEN l.key = 'D' OR l.key = 'Dmaj' OR l.key = 'DM' THEN '10B'
    WHEN l.key = 'A' OR l.key = 'Amaj' OR l.key = 'AM' THEN '11B'
    WHEN l.key = 'E' OR l.key = 'Emaj' OR l.key = 'EM' THEN '12B'
    WHEN l.key = 'B' OR l.key = 'Bmaj' OR l.key = 'BM' OR l.key = 'Cb' OR l.key = 'Cbmaj' THEN '1B'
    WHEN l.key = 'F#' OR l.key = 'F#maj' OR l.key = 'F#M' OR l.key = 'Gb' OR l.key = 'Gbmaj' THEN '2B'
    WHEN l.key = 'C#' OR l.key = 'C#maj' OR l.key = 'C#M' OR l.key = 'Db' OR l.key = 'Dbmaj' THEN '3B'
    WHEN l.key = 'G#' OR l.key = 'G#maj' OR l.key = 'G#M' OR l.key = 'Ab' OR l.key = 'Abmaj' THEN '4B'
    WHEN l.key = 'D#' OR l.key = 'D#maj' OR l.key = 'D#M' OR l.key = 'Eb' OR l.key = 'Ebmaj' THEN '5B'
    WHEN l.key = 'A#' OR l.key = 'A#maj' OR l.key = 'A#M' OR l.key = 'Bb' OR l.key = 'Bbmaj' THEN '6B'
    WHEN l.key = 'F' OR l.key = 'Fmaj' OR l.key = 'FM' THEN '7B'
    ELSE l.key
  END
`

class MixxxDatabase {
  constructor() {
    this.db = null
    this.dbPath = null
    this.isConnected = false
    this.lastError = null
  }

  /**
   * Get platform-specific default Mixxx database paths
   */
  getDefaultPath() {
    const platform = process.platform
    const username = os.userInfo().username

    if (process.env.NODE_ENV === 'test' && process.env.BEATBRAIN_TEST_MIXXX_DB) {
      return process.env.BEATBRAIN_TEST_MIXXX_DB
    }

    switch (platform) {
      case 'win32':
        return path.join(
          'C:',
          'Users',
          username,
          'AppData',
          'Local',
          'Mixxx',
          'mixxxdb.sqlite'
        )
      case 'darwin':
        return path.join(
          os.homedir(),
          'Library',
          'Containers',
          'org.mixxx.mixxx',
          'Data',
          'Library',
          'Application Support',
          'Mixxx',
          'mixxxdb.sqlite'
        )
      case 'linux':
        return path.join(os.homedir(), '.mixxx', 'mixxxdb.sqlite')
      default:
        return ''
    }
  }

  /**
   * Auto-detect Mixxx database location
   */
  autoDetect() {
    const dbPath = this.getDefaultPath()

    if (dbPath && fs.existsSync(dbPath)) {
      console.log(`Found Mixxx database at: ${dbPath}`)
      return dbPath
    }

    console.log('No Mixxx database found at default locations')
    return null
  }

  /**
   * Connect to Mixxx database (read-only)
   * @returns { success: boolean, path?: string, error?: string }
   */
  connect(dbPath = null) {
    try {
      // Auto-detect if no path provided
      if (!dbPath) {
        dbPath = this.autoDetect()
        if (!dbPath) {
          throw new Error('Could not find Mixxx database at default locations')
        }
      }

      // Verify file exists
      if (!fs.existsSync(dbPath)) {
        throw new Error(`Database file not found: ${dbPath}`)
      }

      // Verify file is readable
      try {
        fs.accessSync(dbPath, fs.constants.R_OK)
      } catch (error) {
        throw new Error(`Cannot read database file: ${dbPath} : ${error.message}`)
      }

      // Connect with read-only mode and test the connection
      this.dbPath = dbPath

      const db = new Database(dbPath, { readonly: true, timeout: 5000 })
      db.prepare('SELECT COUNT(*) as count FROM library').get()
      this.db = db

      this.isConnected = true
      this.lastError = null

      console.log(`Connected to Mixxx database: ${dbPath}`)
      return { success: true, path: dbPath }
    } catch (error) {
      this.lastError = error.message
      this.isConnected = false
      console.error('Failed to connect to Mixxx database:', error.message)

      return { success: false, error: error.message }
    }
  }

  /**
   * Get basic library statistics
   */
  getLibraryStats() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }

    try {
      const stats = {}

      // Total tracks
      const trackCount = this.db
            .prepare('SELECT COUNT(*) as count FROM library where mixxx_deleted = 0')
        .get()
      stats.totalTracks = trackCount.count

      // Total crates
      const crateCount = this.db
        .prepare('SELECT COUNT(*) as count FROM crates')
        .get()
      stats.totalCrates = crateCount.count

      // Total playlists
      const playlistCount = this.db
        .prepare('SELECT COUNT(*) as count FROM Playlists')
        .get()
      stats.totalPlaylists = playlistCount.count

      // Total duration (in seconds)
      const duration = this.db
        .prepare(
          'SELECT SUM(duration) as total FROM library WHERE duration IS NOT NULL'
        )
        .get()
      stats.totalDurationSeconds = duration.total || 0

      // Most common genres (top 5)
      const genres = this.db
        .prepare(
          `
        SELECT genre, COUNT(*) as count
        FROM library
        WHERE genre IS NOT NULL AND genre != ''
        GROUP BY genre
        ORDER BY count DESC
        LIMIT 5
      `
        )
        .all()
      stats.topGenres = genres

      // BPM range
      stats.bpmRange = this.getBpmRange()

      return stats
    } catch (error) {
      console.error('Error getting library stats:', error)
      throw error
    }
  }

  /**
   * Get sample tracks for preview
   */
  getSampleTracks(limit = 10) {
    return this.getTracks({ trackCount: limit } )
  }

  getTracks({ minBpm, maxBpm, genres, trackCount, query, keys, crates, groupings } = {}) {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }

    try {
      const params = {}
      const whereClauses = ['l.mixxx_deleted = 0']

      let baseQuery = `
        SELECT
            l.id,
            l.title,
            l.artist,
            l.album,
            l."grouping",
            l.year,
            l.datetime_added,
            l.genre,
            l.duration,
            l.bpm,
            l.rating,
            l.key,
            tl."location" AS "file_path"
        FROM
            "library" l
            JOIN track_locations tl ON tl.id = l."location"
      `

      if (Array.isArray(crates) && crates.length > 0) {
        baseQuery += ' JOIN crate_tracks ct ON ct.track_id = l.id'
        const crateNamedParams = crates.map((g, index) => {
          const name = `crate${index}`
          params[name] = g
          return `@${name}`
        })
        whereClauses.push(`ct.crate_id IN (${crateNamedParams.join(', ')})`)
      }

      if (query) {
        whereClauses.push('(l.artist LIKE @query OR l.title LIKE @query OR l.album LIKE @query)')
        params.query = `%${query}%`
      }

      // Allows falsey values like 0
      if (minBpm !== undefined && minBpm !== null) {
        whereClauses.push('l.bpm >= @minBpm')
        params.minBpm = minBpm
      }
      if (maxBpm !== undefined && maxBpm !== null) {
        whereClauses.push('l.bpm <= @maxBpm')
        params.maxBpm = maxBpm
      }

      if (Array.isArray(genres) && genres.length > 0) {
        const genreNamedParams = genres.map((g, index) => {
          const name = `genre${index}`
          params[name] = g.toLowerCase()
          return `@${name}`
        })
        whereClauses.push(`LOWER(l.genre) IN (${genreNamedParams.join(', ')})`)
      }

      if (Array.isArray(groupings) && groupings.length > 0) {
        const groupingNamedParams = groupings.map((g, index) => {
          const name = `grouping${index}`
          params[name] = g.toLowerCase()
          return `@${name}`
        })
        whereClauses.push(`LOWER(l."grouping") IN (${groupingNamedParams.join(', ')})`)
      }

      if (Array.isArray(keys) && keys.length > 0) {
        const keyNamedParams = keys.map((k, index) => {
          const name = `key${index}`
          params[name] = k
          return `@${name}`
        })

        whereClauses.push(`l.key in (${keyNamedParams.join(', ')})`)
      }
      let finalQuery = `${baseQuery} WHERE ${whereClauses.join(' AND ')}`

      finalQuery += ' ORDER BY RANDOM()'

      if (trackCount !== undefined) {
        finalQuery += ' LIMIT @limit'
        params.limit = trackCount
      }

      const tracks = this.db.prepare(finalQuery).all(params)
      return tracks
    } catch (error) {
      console.error('Error getting tracks:', error)
      throw error
    }
  }

  getTrackById(trackId) {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }

    try {
      const track = this.db
        .prepare(
          `
        SELECT DISTINCT
            l.id,
            l.title,
            l.artist,
            l.album,
            l.grouping,
            l.year,
            l.datetime_added,
            l.genre,
            l.duration,
            l.bpm,
            l.bpm_lock,
            l.rating,
            l.key,
            l.comment,
            l.datetime_added,
            l.timesplayed,
            l.last_played_at,
            l.bitrate,
            l.samplerate,
            l.filetype,
            tl.location AS "file_path"
        FROM
            "library" l
            JOIN track_locations tl ON tl.id = l."location"
        WHERE l.id = ?
          AND l.mixxx_deleted = 0
      `
        )
        .get(trackId)

      const crates = this.getCratesForTrack(trackId)
      track.crates = crates
      return track
    } catch (error) {
      console.error('Error getting track by ID:', error)
      throw error
    }
  }

  getTracksByIds(trackIds) {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }
    if (!trackIds || trackIds.length === 0) {
      return []
    }

    try {
      const placeholders = trackIds.map(() => '?').join(',')
      const tracks = this.db.prepare(`
        SELECT
            l.id, l.title, l.artist, l.album, l.genre, l.duration, l.bpm, l.key,
            tl.location AS "file_path"
        FROM
            "library" l
            JOIN track_locations tl ON tl.id = l."location"
        WHERE l.id IN (${placeholders}) AND l.mixxx_deleted = 0
      `).all(trackIds)

      return tracks
    } catch (error) {
      console.error('Error getting tracks by IDs:', error)
      throw error
    }
  }

  getAvailableGenres() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }

    try {
      const genres = this.db
        .prepare(`
        SELECT DISTINCT genre
        FROM library
        WHERE genre IS NOT NULL AND genre != ''
        AND mixxx_deleted = 0
        ORDER BY genre COLLATE NOCASE ASC
       `)
        .all()
        .map(row => row.genre)

      return genres
    } catch (error) {
      console.error('Error getting available genres:', error)
      throw error
    }
  }

  getAvailableGroupings() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }

    try {
      const groupings = this.db
        .prepare(`
        SELECT DISTINCT "grouping"
        FROM library
        WHERE "grouping" IS NOT NULL AND "grouping" != ''
        AND mixxx_deleted = 0
        ORDER BY "grouping" COLLATE NOCASE ASC
        `)
        .all()
        .map(row => row.grouping)
      return groupings
    } catch (error) {
      console.error('Error getting available groupings:', error)
      throw error
    }
  }

  getCratesForTrack(trackId) {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }
    try {
      const crates = this.db
        .prepare(`
          SELECT c.id, c.name
          FROM crates c
          JOIN crate_tracks ct ON ct.crate_id = c.id
          WHERE ct.track_id = ?
        `)
        .all(trackId)
      return crates
    } catch (error) {
      console.error('Error getting crates for track:', error)
      throw error
    }
  }

  getAvailableCrates() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected');
    }

    try {
      const crates = this.db
        .prepare(`
          SELECT id, name
          FROM crates
          ORDER BY name COLLATE NOCASE ASC
        `)
        .all();
      return crates;
    } catch (error) {
      console.error('Error getting available crates:', error);
      throw error;
    }
  }

  getAvailableKeys() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected');
    }

    try {
      const keys = this.db
        .prepare(`
          SELECT DISTINCT key
          FROM library
          WHERE key IS NOT NULL AND key != ''
          AND mixxx_deleted = 0
        `)
        .all().map(row => row.key)

      return keys;
    } catch (error) {
      console.error('Error getting available keys:', error);
      throw error;
    }
  }

  /**
   * Get min and max BPM in the library
   * @returns { minBpm: number, maxBpm: number }
   */
  getBpmRange() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }

    try {
      const bpmRange = this.db
        .prepare(`
        SELECT
          FLOOR(MIN(bpm)) as minBpm,
          CEILING(MAX(bpm)) as maxBpm
        FROM library
        WHERE bpm IS NOT NULL AND bpm > 0
        AND mixxx_deleted = 0
      `)
        .get()

      return bpmRange
    } catch (error) {
      console.error('Error getting BPM range:', error)
      throw error
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      dbPath: this.dbPath,
      lastError: this.lastError,
      defaultPath: this.getDefaultPath(),
      defaultPathExists: fs.existsSync(this.getDefaultPath()),
    }
  }

  disconnect() {
    if (this.db) {
      this.db.close()
      console.log('Disconnected from Mixxx database')
    }

    this.db = null
    this.dbPath = null
    this.isConnected = false
    this.lastError = null

    return this.getStatus()
  }
}

// Export singleton instance
const mixxxDatabase = new MixxxDatabase()
export default mixxxDatabase
