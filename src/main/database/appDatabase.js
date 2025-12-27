import Database from 'better-sqlite3'
import path from 'path'
import SettingsRepository from './appDatabase/settingsRepository.js'
import UserPreferenceRepository from './appDatabase/userPreferenceRepository.js'
import PlaylistRepository from './appDatabase/playlistRepository.js'
import MigrationManager from './appDatabase/migrationManager.js'
import create_initial_tables from './appDatabase/migrations/create_initial_tables.js'
import add_filters_to_playlists from './appDatabase/migrations/add_filters_to_playlists.js'

class AppDatabase {
  constructor(debug = false) {
    this.dbPath = null
    this.db = null
    this.verbose = debug ? console.log : null
    this.migrations = [
      create_initial_tables,
      add_filters_to_playlists
    ]
    this.settingsRepository = new SettingsRepository(this)
    this.userPreferencesRepository = new UserPreferenceRepository(this)
    this.playlistRepository = new PlaylistRepository(this)
  }

  async initialize(userDataPath) {
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
      const migrationManager = new MigrationManager(this.db)
      migrationManager.register(this.migrations)
      await migrationManager.runMigrations()
      return true
    } catch (error) {
      console.error('Error getting user data path:', error)
      throw error
    }
  }

  // Settings Repository Methods
  // Settings are for storing application state that can be recalled later as a
  // convenience. For example, remembering the directory the user last saved a
  // file and recalling that the next time they save a file.

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

  saveSearchFilters(filters = {}) {
    return this.settingsRepository.saveSearchFilters(filters)
  }

  // User Preferences Repository Methods
  // User preferences are explicit choices made by the user.

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

  createPlaylist({ name, description = '', trackSource = 'mixxx', filters = '' }, tracks = []) {
    return this.playlistRepository.createPlaylist(name, description, trackSource, filters, tracks)
  }

  getPlaylist(id) {
    return this.playlistRepository.getPlaylistById(id)
  }

  getAllPlaylists() {
    return this.playlistRepository.getAllPlaylists()
  }

  updatePlaylist(playlistId, { name, description }) {
    return this.playlistRepository.updatePlaylist(playlistId, { name, description })
  }

  updateTrackPosition(playlistId, trackId, newPosition) {
    return this.playlistRepository.updateTrackPosition(playlistId, trackId, newPosition)
  }

  updateTrackPositions(playlistId, tracks) {
    return this.playlistRepository.updateTrackPositions(playlistId, tracks)
  }

  addTracksToPlaylist(playlistId, trackSourceIds) {
    return this.playlistRepository.addTracksToPlaylist(playlistId, trackSourceIds)
  }

  removeTrackFromPlaylist(playlistId, trackId) {
    return this.playlistRepository.removeTrackFromPlaylist(playlistId, trackId)
  }

  deletePlaylist(playlistId) {
    return this.playlistRepository.deletePlaylist(playlistId)
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
