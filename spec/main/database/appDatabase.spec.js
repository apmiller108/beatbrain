import appDatabase from '@main/database/appDatabase.js'

describe('AppDatabase', () => {
  // See setup.js for mock setup of application temp data directory
  let initializationResult;

  beforeAll(() => {
    initializationResult = appDatabase.initialize()
  })

  describe('initialize', () => {
    it('should create database and tables successfully', () => {
      expect(initializationResult).toBe(true)
      expect(appDatabase.db).toBeTruthy()
      expect(appDatabase.dbPath).toContain('beatbrain.sqlite')
    })
  })

  describe('settings operations', () => {
    beforeAll(() => appDatabase.db.prepare('DELETE FROM app_settings').run())

    afterEach(() => {
      appDatabase.db.prepare('DELETE FROM app_settings').run()
    })

    it('should set and get a setting', () => {
      appDatabase.setSetting('test_key', 'test_value')
      const value = appDatabase.getSetting('test_key')

      expect(value).toBe('test_value')
    })

    it('should return null for non-existent setting', () => {
      const value = appDatabase.getSetting('non_existent_key')

      expect(value).toBeNull()
    })

    it('should update existing setting', () => {
      appDatabase.setSetting('test_key', 'initial_value')
      appDatabase.setSetting('test_key', 'updated_value')
      const value = appDatabase.getSetting('test_key')

      expect(value).toBe('updated_value')
    })

    it('should get all settings', () => {
      appDatabase.setSetting('key1', 'value1')
      appDatabase.setSetting('key2', 'value2')

      const allSettings = appDatabase.getAllSettings()

      expect(allSettings).toEqual({
        key1: 'value1',
        key2: 'value2'
      })
    })

    it('should delete a setting', () => {
      appDatabase.setSetting('test_key', 'test_value')
      appDatabase.deleteSetting('test_key')
      const value = appDatabase.getSetting('test_key')

      expect(value).toBeNull()
    })
  })

  describe('user preferences operations', () => {
    beforeAll(() => appDatabase.db.prepare('DELETE FROM user_preferences').run())

    beforeEach(() => {
      appDatabase.db.prepare('DELETE FROM user_preferences').run()
    })

    it('should set and get user preference', () => {
      appDatabase.setUserPreference('ui', 'theme', 'dark')
      const value = appDatabase.getUserPreference('ui', 'theme')

      expect(value).toBe('dark')
    })

    it('should return null for non-existent preference', () => {
      const value = appDatabase.getUserPreference('ui', 'non_existent')

      expect(value).toBeNull()
    })

    it('should get all preferences for category', () => {
      appDatabase.setUserPreference('ui', 'theme', 'dark')
      appDatabase.setUserPreference('ui', 'language', 'en')
      appDatabase.setUserPreference('audio', 'volume', '80')

      const uiPrefs = appDatabase.getUserPreferencesForCategory('ui')

      expect(uiPrefs).toEqual({
        theme: 'dark',
        language: 'en'
      })
      expect(uiPrefs).not.toHaveProperty('volume')
    })

    it('should update existing preference', () => {
      appDatabase.setUserPreference('ui', 'theme', 'light')
      appDatabase.setUserPreference('ui', 'theme', 'dark')
      const value = appDatabase.getUserPreference('ui', 'theme')

      expect(value).toBe('dark')
    })
  })

  describe('transaction', () => {
    it('should execute transaction successfully', () => {
      const result = appDatabase.transaction(() => {
        appDatabase.setSetting('key1', 'value1')
        appDatabase.setSetting('key2', 'value2')
      })

      expect(appDatabase.getSetting('key1')).toBe('value1')
      expect(appDatabase.getSetting('key2')).toBe('value2')
    })
  })

  describe('getInfo', () => {
    it('should return correct info when database is open', () => {
      const info = appDatabase.getInfo()

      expect(info.isOpen).toBe(true)
      expect(info.dbPath).not.toBeNull()
    })
  })

  describe('close', () => {
    it('should close database connection', () => {
      appDatabase.initialize()
      expect(appDatabase.db).toBeTruthy()

      appDatabase.close()

      expect(appDatabase.db).toBeNull()
    })
  })
})
