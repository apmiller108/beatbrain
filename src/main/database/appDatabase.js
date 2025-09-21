import Database from 'better-sqlite3'
import path from 'path'

class AppDatabase {
  constructor(debug = false) {
    this.dbPath = null
    this.db = null
    this.verbose = debug ? console.log : null
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
    try {
      const createSettingsTable = `
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `

      const createUserPreferencesTable = `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(category, key)
        );
      `

      this.db.exec(createSettingsTable)
      this.db.exec(createUserPreferencesTable)
    } catch (error) {
      console.error('Error creating tables:', error)
      throw error
    }
  }

  getSetting(key) {
    try {
      const stmt = this.db.prepare(
        'SELECT value FROM app_settings WHERE key = ?'
      )
      const row = stmt.get(key)
      return row ? row.value : null
    } catch (error) {
      console.error('Error getting setting:', error)
      throw error
    }
  }

  getAllSettings() {
    try {
      const stmt = this.db.prepare('SELECT key, value FROM app_settings')
      const rows = stmt.all()
      const settings = {}
      rows.forEach(row => {
        settings[row.key] = row.value
      })

      return settings
    } catch (error) {
      console.error('Error getting all settings:', error)
      throw error
    }
  }

  setSetting(key, value) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO app_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = CURRENT_TIMESTAMP;
      `)
      stmt.run(key, value)
    } catch (error) {
      console.error('Error setting setting:', error)
      throw error
    }
  }

  deleteSetting(key) {
    try {
      const stmt = this.db.prepare('DELETE FROM app_settings WHERE key = ?')
      stmt.run(key)
    } catch (error) {
      console.error('Error deleting setting:', error)
      throw error
    }
  }

  getUserPreference(category, key) {
    try {
      const stmt = this.db.prepare(
        'SELECT value FROM user_preferences WHERE category = ? AND key = ?'
      )
      const row = stmt.get(category, key)
      return row ? row.value : null
    } catch (error) {
      console.error('Error getting user preference:', error)
      throw error
    }
  }

  getUserPreferencesForCategory(category) {
    try {
      const stmt = this.db.prepare(`
        SELECT key, value FROM user_preferences WHERE category = ?
        ORDER BY updated_at DESC
      `)
      const rows = stmt.all(category)
      const preferences = {}
      rows.forEach(row => {
        preferences[row.key] = row.value
      })

      return preferences
    } catch (error) {
      console.error('Error getting user preferences for category:', error)
      throw error
    }
  }

  setUserPreference(category, key, value) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO user_preferences (category, key, value, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(category, key) DO UPDATE SET
          value = excluded.value,
          updated_at = CURRENT_TIMESTAMP;
      `)
      stmt.run(category, key, value)
    } catch (error) {
      console.error('Error setting user preference:', error)
      throw error
    }
  }

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
