import Database from 'better-sqlite3'
import CreateTables from './appDatabase/createTables.js'
import SettingsRepository from './appDatabase/settingsRepository.js'
import UserPreferenceRepository from './appDatabase/userPreferenceRepository.js'
import PlaylistRepository from './appDatabase/playlistRepository.js'
import path from 'path'

class AppDatabase {
  constructor(debug = false) {
    this.dbPath = null
    this.db = null
    this.verbose = debug ? console.log : null
    this.settingsRepository = new SettingsRepository(this)
    this.userPreferencesRepository = new UserPreferenceRepository(this)
    this.playlistRepository = new PlaylistRepository(this)
  }

  initialize(userDataPath) {
    if (process.env.NODE_ENV === 'test' && process.env.BEATBRAIN_TEST_APP_DB) {
      // In test mode, use a temporary database path if provided (for e2e testing)
      this.dbPath = process.env.BEATBRAIN_TEST_APP_DB
    } else {
      // In production or development, use the standard user data path
      this.dbPath = path.join(userDataPath, 'beatbrain.sqlite')
    }

    this.db = new Database(this.dbPath, { verbose: this.verbose })
    this.db.pragma('journal_mode = WAL')

    try {
      this.createTables()
      return true
    } catch (error) {
      console.error('Error getting user data path:', error)
      throw error
    }
  }

  createTables() {
    const createTables = new CreateTables(this)
    createTables.up()
  }

  // Settings Repository Methods

  getSetting(key) {
    return this.settingsRepository.getSetting(key)
  }

  getAllSettings() {
    return this.settingsRepository.getAllSettings()
  }

  setSetting(key, value) {
    return this.settingsRepository.setSetting(key, value)
  }

  deleteSetting(key) {
    return this.settingsRepository.deleteSetting(key)
  }

  saveTrackFilters(filters = {}) {
    return this.settingsRepository.saveTrackFilters(filters)
  }

  getTrackFilters() {
    return this.settingsRepository.getTrackFilters()
  }

  // User Preferences Repository Methods

  getUserPreference(category, key) {
    return this.userPreferencesRepository.getPreference(category, key)
  }

  getUserPreferencesForCategory(category) {
    return this.userPreferencesRepository.getAllPreferences(category)
  }

  setUserPreference(category, key, value) {
    return this.userPreferencesRepository.setPreference(category, key, value)
  }

  // Playlist Repository Methods

  createPlaylist({ name, description = '', trackSource = 'mixxx' }, tracks = []) {
    return this.playlistRepository.createPlaylist(name, description, trackSource, tracks)
  }

  // Utility Methods

  transaction(fn) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized')
      }

      const transaction = this.db.transaction(fn)
      return transaction()
    } catch (error) {
      console.error('Error in transaction:', error)
      throw error
    }
  }

  prepare(sql) {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db.prepare(sql)
  }

  exec(sql, params = []) {
    try {
      const stmt = this.prepare(sql)
      return stmt.run(...params)
    }
    catch (error) {
      console.error('Error executing SQL:', error)
      throw error
    }
  }


  close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  getInfo() {
    return { dbPath: this.dbPath, isOpen: this.db !== null }
  }
}

// Export singleton instance
const appDatabase = new AppDatabase()
export default appDatabase
