import appDatabase from '@main/database/appDatabase.js'
import { app } from 'electron'

describe('AppDatabase', () => {
  let initializationResult;

  beforeAll(() => {
    // See setup.js for mock setup of application temp data directory
    initializationResult = appDatabase.initialize(app.getPath('userData'))
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

  describe('playlist operations', () => {
    beforeEach(() => {
      appDatabase.db.prepare('DELETE FROM playlist_tracks').run()
      appDatabase.db.prepare('DELETE FROM playlists').run()
    })

    it('creates a playlist with tracks', () => {
      const playlistData = {
        name: 'Test Playlist',
        description: 'A test playlist',
        trackSource: 'mixxx'
      }
      const tracks = [
        {
          id: 1,
          file_path: '/path/to/track1.mp3',
          duration: 180,
          artist: 'Artist 1',
          title: 'Track 1',
          album: 'Album 1',
          genre: 'Genre 1',
          bpm: 120,
          key: '8A'
        },
        {
          id: 2,
          file_path: '/path/to/track2.mp3',
          duration: 240,
          artist: 'Artist 2',
          title: 'Track 2',
          album: 'Album 2',
          genre: 'Genre 2',
          bpm: 125,
          key: '1B'
        }
      ]

      appDatabase.createPlaylist(playlistData, tracks)

      const playlist = appDatabase.db.prepare('SELECT * FROM playlists WHERE name = ?').get(playlistData.name)
      expect(playlist.name).toBe(playlistData.name)
      expect(playlist.description).toBe(playlistData.description)
      expect(playlist.track_source).toBe(playlistData.trackSource)

      const playlistId = playlist.id
      const insertedTracks = appDatabase.db.prepare('SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY position').all(playlistId)

      expect(insertedTracks.length).toBe(2)

      expect(insertedTracks[0].position).toBe(0)
      expect(insertedTracks[0]).toMatchObject(tracks[0])

      expect(insertedTracks[1].position).toBe(1)
      expect(insertedTracks[1]).toMatchObject(tracks[1])
    })
  })

  describe('transaction', () => {
    it('should execute transaction successfully', () => {
      appDatabase.transaction(() => {
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
      appDatabase.initialize(app.getPath('userData'))
      expect(appDatabase.db).toBeTruthy()

      appDatabase.close()

      expect(appDatabase.db).toBeNull()
    })
  })
})
