import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import os from 'os'

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
    return this.getTracks({ limit })
  }

  getTracks({ minBpm, maxBpm, genre, limit } = {}) {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }

    try {
      let query = `
        SELECT
          artist,
          title,
          album,
          genre,
          year,
          duration,
          bpm,
          key,
          rating,
          color
        FROM library
        WHERE mixxx_deleted = 0
      `
      const params = {}

      if (minBpm !== undefined) {
        query += ' AND bpm >= @minBpm'
        params.minBpm = minBpm
      }
      if (maxBpm !== undefined) {
        query += ' AND bpm <= @maxBpm'
        params.maxBpm = maxBpm
      }
      // genre can be an array of genres
      if (genre !== undefined) {
        if (!Array.isArray(genre)) {
          genre = [genre]
        }
        const genreNamedParams = []
        genre.forEach((g, index) => {
          const name = `genre${index}`
          genreNamedParams.push(`@${name}`)
          params[name] = g.toLowerCase()
        })
        query += ` AND LOWER(genre) IN (${genreNamedParams})`
      }

      query += ' ORDER BY RANDOM()'

      if (limit !== undefined) {
        query += ' LIMIT @limit'
        params.limit = limit
      }

      const tracks = this.db.prepare(query).all(params)
      return tracks
    } catch (error) {
      console.error('Error getting tracks:', error)
      throw error
    }
  }

  getGenres() {
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
