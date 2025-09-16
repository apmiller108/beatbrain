import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import AppDatabase from '@main/database/appDatabase.js'

describe('AppDatabase', () => {
  let testDbPath
  let appDb

  beforeEach(() => {
    // Create a fresh instance for each test
    appDb = new AppDatabase()
    testDbPath = path.join(os.tmpdir(), 'beatbrain-test')

    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.rmSync(testDbPath, { recursive: true, force: true })
    }
  })

  afterEach(() => {
    // Clean up after each test
    if (appDb.db) {
      appDb.close()
    }
    if (fs.existsSync(testDbPath)) {
      fs.rmSync(testDbPath, { recursive: true, force: true })
    }
  })

  describe('initialize', () => {
    it('should create database and tables successfully', () => {
      const result = appDb.initialize()

      expect(result).toBe(true)
      expect(appDb.db).toBeTruthy()
      expect(appDb.dbPath).toContain('beatbrain.sqlite')
    })

    it('should create userData directory if it does not exist', () => {
      appDb.initialize()

      expect(fs.existsSync(testDbPath)).toBe(true)
    })
  })

  describe('settings operations', () => {
    beforeEach(() => {
      appDb.initialize()
    })

    it('should set and get a setting', () => {
      appDb.setSetting('test_key', 'test_value')
      const value = appDb.getSetting('test_key')

      expect(value).toBe('test_value')
    })

    it('should return null for non-existent setting', () => {
      const value = appDb.getSetting('non_existent_key')

      expect(value).toBeNull()
    })

    it('should update existing setting', () => {
      appDb.setSetting('test_key', 'initial_value')
      appDb.setSetting('test_key', 'updated_value')
      const value = appDb.getSetting('test_key')

      expect(value).toBe('updated_value')
    })

    it('should get all settings', () => {
      appDb.setSetting('key1', 'value1')
      appDb.setSetting('key2', 'value2')

      const allSettings = appDb.getAllSettings()

      expect(allSettings).toEqual({
        key1: 'value1',
        key2: 'value2'
      })
    })

    it('should delete a setting', () => {
      appDb.setSetting('test_key', 'test_value')
      appDb.deleteSetting('test_key')
      const value = appDb.getSetting('test_key')

      expect(value).toBeNull()
    })
  })

  describe('user preferences operations', () => {
    beforeEach(() => {
      appDb.initialize()
    })

    it('should set and get user preference', () => {
      appDb.setUserPreference('ui', 'theme', 'dark')
      const value = appDb.getUserPreference('ui', 'theme')

      expect(value).toBe('dark')
    })

    it('should return null for non-existent preference', () => {
      const value = appDb.getUserPreference('ui', 'non_existent')

      expect(value).toBeNull()
    })

    it('should get all preferences for category', () => {
      appDb.setUserPreference('ui', 'theme', 'dark')
      appDb.setUserPreference('ui', 'language', 'en')
      appDb.setUserPreference('audio', 'volume', '80')

      const uiPrefs = appDb.getUserPreferencesForCategory('ui')

      expect(uiPrefs).toEqual({
        theme: 'dark',
        language: 'en'
      })
      expect(uiPrefs).not.toHaveProperty('volume')
    })

    it('should update existing preference', () => {
      appDb.setUserPreference('ui', 'theme', 'light')
      appDb.setUserPreference('ui', 'theme', 'dark')
      const value = appDb.getUserPreference('ui', 'theme')

      expect(value).toBe('dark')
    })
  })

  describe('transaction', () => {
    beforeEach(() => {
      appDb.initialize()
    })

    it('should execute transaction successfully', () => {
      const result = appDb.transaction(() => {
        appDb.setSetting('key1', 'value1')
        appDb.setSetting('key2', 'value2')
        return 'success'
      })

      expect(result).toBe('success')
      expect(appDb.getSetting('key1')).toBe('value1')
      expect(appDb.getSetting('key2')).toBe('value2')
    })

    it('should throw error if database not initialized', () => {
      const uninitializedDb = new AppDatabase()

      expect(() => {
        uninitializedDb.transaction(() => {})
      }).toThrow('Database not initialized')
    })
  })

  describe('getInfo', () => {
    it('should return correct info when database is closed', () => {
      const info = appDb.getInfo()

      expect(info.isOpen).toBe(false)
      expect(info.dbPath).toBeNull()
    })

    it('should return correct info when database is open', () => {
      appDb.initialize()
      const info = appDb.getInfo()

      expect(info.isOpen).toBe(true)
      expect(info.dbPath).toContain('beatbrain.sqlite')
    })
  })

  describe('close', () => {
    it('should close database connection', () => {
      appDb.initialize()
      expect(appDb.db).toBeTruthy()

      appDb.close()

      expect(appDb.db).toBeNull()
    })
  })
})
