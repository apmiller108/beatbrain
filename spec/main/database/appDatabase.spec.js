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

    describe('createPlaylist', () => {
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

    describe('getPlaylist', () => {
      it('retrieves a playlist by ID with tracks', () => {
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
          }
        ]

        const playlist = appDatabase.createPlaylist(playlistData, tracks)

        const retrievedPlaylist = appDatabase.getPlaylist(playlist.id)

        expect(retrievedPlaylist).toMatchObject({
          name: playlistData.name, description: playlistData.description, track_source: playlistData.trackSource
        })

        // eslint-disable-next-line no-unused-vars
        const { id, ...expectedTrackAttrs } = tracks[0]
        expect(retrievedPlaylist.tracks[0]).toMatchObject(expectedTrackAttrs)
      })
    })

    describe('getAllPlaylists', () => {
      it('retrieves all playlists', () => {
        const playlist1 = {
          name: 'Playlist 1',
          description: 'First playlist',
          trackSource: 'mixxx'
        }
        const playlist2 = {
          name: 'Playlist 2',
          description: 'Second playlist',
          trackSource: 'mixxx'
        }

        appDatabase.createPlaylist(playlist1, [])
        appDatabase.createPlaylist(playlist2, [])

        const playlists = appDatabase.getAllPlaylists()

        expect(playlists.length).toBe(2)
        expect(playlists[0].name).toBe(playlist1.name)
        expect(playlists[1].name).toBe(playlist2.name)
      })
    })

    describe('updatePlaylist', () => {
      it('updates playlist details', () => {
        const playlistData = {
          name: 'Original Name',
          description: 'Original description',
          trackSource: 'mixxx'
        }

        const playlist = appDatabase.createPlaylist(playlistData, [])

        const updatedData = {
          name: 'Updated Name',
          description: 'Updated description'
        }

        appDatabase.updatePlaylist(playlist.id, updatedData)

        const updatedPlaylist = appDatabase.getPlaylist(playlist.id)

        expect(updatedPlaylist).toMatchObject(updatedData)
      })
    })

    describe('updateTrackPosition', () => {
      it('updates the position of a track in a playlist', () => {
        const playlistData = {
          name: 'Test Playlist',
          description: 'A test playlist',
          trackSource: 'mixxx'
        }
        const trackData = [
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

        const playlist = appDatabase.createPlaylist(playlistData, trackData)
        const track = playlist.tracks[1]

        appDatabase.updateTrackPosition(playlist.id, track.id, 1)

        const updatedPlaylist = appDatabase.getPlaylist(playlist.id)
        const updatedTrack = updatedPlaylist.tracks.find(t => t.id === track.id)

        expect(updatedTrack.position).toBe(1)
      })
    })

    describe('removeTrackFromPlaylist', () => {
      it('removes a track from a playlist', () => {
        const playlistData = {
          name: 'Test Playlist',
          description: 'A test playlist',
          trackSource: 'mixxx'
        }
        // tracks from mixxx
        const tracks = [
          {
            id: 1, // this becomes the source track ID
            file_path: '/path/to/track1.mp3',
            duration: 180,
            artist: 'Artist 1',
            title: 'Track 1',
            album: 'Album 1',
            genre: 'Genre 1',
            bpm: 120,
            key: '8A'
          }
        ]

        const playlist = appDatabase.createPlaylist(playlistData, tracks)
        const track = playlist.tracks[0]

        appDatabase.removeTrackFromPlaylist(playlist.id, track.id)

        const updatedPlaylist = appDatabase.getPlaylist(playlist.id)

        expect(updatedPlaylist.tracks.length).toBe(0)
      })
    })

    describe('addTracksToPlaylist', () => {
      it('adds multiple tracks to an existing playlist', () => {
        const tracks = [
          { id: 101, title: 'New Track 1', artist: 'New Artist 1', bpm: 130, key: '9A', duration: 200, file_path: '/new/1' },
          { id: 102, title: 'New Track 2', artist: 'New Artist 2', bpm: 132, key: '10A', duration: 210, file_path: '/new/2' }
        ]
        const playlist = appDatabase.createPlaylist({ name: 'Initial Playlist' }, [])

        appDatabase.addTracksToPlaylist(playlist.id, tracks)

        const updatedPlaylist = appDatabase.getPlaylist(playlist.id)
        expect(updatedPlaylist.tracks.length).toBe(2)
      })
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
