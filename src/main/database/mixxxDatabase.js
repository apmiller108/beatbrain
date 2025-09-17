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
   * Returns { success: boolean, path?: string, error?: string }
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
        console.error(error)
        throw new Error(`Cannot read database file: ${dbPath}`)
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
        .prepare('SELECT COUNT(*) as count FROM library')
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
      const bpmRange = this.db
        .prepare(
          `
        SELECT
          MIN(bpm) as minBpm,
          MAX(bpm) as maxBpm,
          AVG(bpm) as avgBpm
        FROM library
        WHERE bpm IS NOT NULL AND bpm > 0
      `
        )
        .get()
      stats.bpmRange = bpmRange

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
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected')
    }

    try {
      const tracks = this.db
        .prepare(
          `
        SELECT
          artist,
          title,
          album,
          genre,
          year,
          duration,
          bpm,
          key,
          rating
        FROM library
        WHERE artist IS NOT NULL AND title IS NOT NULL
        ORDER BY RANDOM()
        LIMIT ?
      `
        )
        .all(limit)

      return tracks
    } catch (error) {
      console.error('Error getting sample tracks:', error)
      throw error
    }
  }

  /**
   * Test database connection and schema
   */
  testConnection() {
    if (!this.isConnected || !this.db) {
      return { success: false, error: 'Not connected' }
    }

    try {
      // Test basic queries
      const libraryTest = this.db
        .prepare('SELECT COUNT(*) as count FROM library')
        .get()
      const cratesTest = this.db
        .prepare('SELECT COUNT(*) as count FROM crates')
        .get()
      const playlistsTest = this.db
        .prepare('SELECT COUNT(*) as count FROM Playlists')
        .get()

      return {
        success: true,
        tests: {
          library: libraryTest.count,
          crates: cratesTest.count,
          playlists: playlistsTest.count,
        },
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      dbPath: this.dbPath,
      lastError: this.lastError,
      defaultPath: this.getDefaultPath(),
      defaultPathExists: fs.existsSync(this.getDefaultPath()),
    }
  }

  /**
   * Disconnect from database
   */
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
