export default class SettingsRepository {
  constructor(db) {
    this.db = db
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
      return true
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

  saveSearchFilters(filters = {}) {
    const filtersJson = JSON.stringify(filters)
    return this.setSetting('searchFilters', filtersJson)
  }

  saveTrackFilters(filters = {}) {
    const filtersJson = JSON.stringify(filters)
    return this.setSetting('trackFilters', filtersJson)
  }

  getTrackFilters() {
    return this.getSetting('trackFilters')
  }
}
