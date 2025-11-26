export default class UserPreferencesRepository {
  constructor(db) {
    this.db = db
  }

  getPreference(category, key) {
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

  getAllPreferences(category) {
    try {
      const stmt = this.db.prepare(
        'SELECT key, value FROM user_preferences WHERE category = ?'
      )
      const rows = stmt.all(category)
      const preferences = {}
      rows.forEach(row => {
        preferences[row.key] = row.value
      })

      return preferences
    } catch (error) {
      console.error('Error getting all user preferences:', error)
      throw error
    }
  }

  setPreference(category, key, value) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO user_preferences (category, key, value, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(category, key) DO UPDATE SET
          value = excluded.value,
          updated_at = CURRENT_TIMESTAMP;
      `)
      stmt.run(category, key, value)
      return true
    } catch (error) {
      console.error('Error setting user preference:', error)
      throw error
    }
  }
}
