import fs from 'fs'
import path from 'path'
import os from 'os'
import mixxxDatabase from '@main/database/mixxxDatabase.js'
import { createMockMixxxDatabase, seedMixxxDatabase } from '@spec/mockMixxxDatabase.js'

vi.mock('os', async (importOriginal) => {
  const actualOS = await importOriginal()
  return {
    ...actualOS,
    userInfo: vi.fn(() => ({ username: 'testuser' })),
    homedir: vi.fn(() => '/home/testuser'),
  }
})

describe('MixxxDatabase', () => {
  let mockDbPath;
  beforeAll(() => {
    mockDbPath = createMockMixxxDatabase()
    seedMixxxDatabase(mockDbPath)
  })

  afterAll(() => {
    if (fs.existsSync(mockDbPath)) {
      fs.rmSync(mockDbPath, { recursive: true, force: true });
    }
  })

  afterEach(() => {
    // Suppress console.log output for cleaner test output
    vi.spyOn(console, 'log').mockImplementationOnce(() => {})
    mixxxDatabase.disconnect()
    vi.clearAllMocks()
  })

  describe('getDefaultPath', () => {
    const originalPlatform = process.platform;

    afterAll(() => {
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    })

    it('returns the correct path for Linux', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      vi.spyOn(os, 'homedir').mockReturnValue('/home/testuser');
      expect(mixxxDatabase.getDefaultPath()).toBe('/home/testuser/.mixxx/mixxxdb.sqlite');
    })

    it('returns the correct path for Windows', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      vi.spyOn(os, 'userInfo').mockReturnValue({ username: 'testuser' });
      const expectedPath = path.join('C:', 'Users', 'testuser', 'AppData', 'Local', 'Mixxx', 'mixxxdb.sqlite');
      expect(mixxxDatabase.getDefaultPath()).toBe(expectedPath);
    })

    it('returns the correct path for macOS', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      vi.spyOn(os, 'homedir').mockReturnValue('/Users/testuser');
      const expectedPath = path.join('/Users/testuser', 'Library', 'Containers', 'org.mixxx.mixxx',
                                     'Data', 'Library', 'Application Support', 'Mixxx', 'mixxxdb.sqlite');
      expect(mixxxDatabase.getDefaultPath()).toBe(expectedPath);
    })
  })

  describe('connect', () => {
    it('connects successfully to a valid database file', () => {
      const result = mixxxDatabase.connect(mockDbPath)
      expect(mixxxDatabase.isConnected).toBe(true)
      expect(result).toEqual({
        success: true,
        path: mockDbPath,
      })
    })

    it('return an error result if database file does not exist', () => {
      const badPath = '/non/existent/path/mixxxdb.sqlite'
      // Suppress console.error output for cleaner test output
      vi.spyOn(console, 'error').mockImplementationOnce(() => {})

      const result = mixxxDatabase.connect(badPath)
      expect(mixxxDatabase.isConnected).toBe(false)
      expect(result).toEqual({
        success: false,
        error: `Database file not found: ${badPath}`,
      })
    })

    it('returns an error result if database file is not readable', () => {
      // Mock fs.accessSync to throw an error
      vi.spyOn(fs, 'accessSync').mockImplementationOnce(() => {
        throw new Error('Permission denied')
      })

      // Suppress console.error output for cleaner test output
      vi.spyOn(console, 'error').mockImplementationOnce(() => {})

      const result = mixxxDatabase.connect(mockDbPath)
      expect(result).toEqual({
        success: false,
        error: `Cannot read database file: ${mockDbPath} : Permission denied`,
      })
    })

    it('should auto-detect and connect if path is not provided', () => {
      vi.spyOn(mixxxDatabase, 'getDefaultPath').mockReturnValue(mockDbPath)
      const result = mixxxDatabase.connect()
      expect(mixxxDatabase.isConnected).toBe(true)
      expect(result).toEqual({
        success: true,
        path: mockDbPath,
      })
    })
  })

  describe('queries on a connected database', () => {
    const seedData = JSON.parse(fs.readFileSync('spec/fixtures/mixxxData.json', 'utf-8'))

    beforeEach(() => {
      // Ensure connection to DB before each test in this block
      const result = mixxxDatabase.connect(mockDbPath)
      if (!result.success) {
        throw new Error('Failed to connect to mock DB for testing')
      }
    })


    describe('getLibraryStats', () => {
      it('returns the correct stats', () => {
        const stats = mixxxDatabase.getLibraryStats()
        expect(stats.totalTracks).toBe(seedData.library.length)
        expect(stats.totalCrates).toBe(seedData.crates.length)
        expect(stats.totalPlaylists).toBe(seedData.playlists.length)
        expect(stats.totalDurationSeconds).toBe(
          seedData.library.reduce((sum, track) => sum + (track.duration || 0), 0)
        )
      })
    })

    describe('getTracks', () => {
      it('returns all tracks when no filters are provided', () => {
        const tracks = mixxxDatabase.getTracks()
        expect(tracks.length).toBe(seedData.library.length)
      })

      it('filters by a query string', () => {
        const tracks = mixxxDatabase.getTracks({ query: 'Logotech' })
        expect(tracks.length).toBe(1)
        expect(tracks[0].artist).toBe('Logotech')
      })

      it('filters by BPM range', () => {
        const tracks = mixxxDatabase.getTracks({ minBpm: 124, maxBpm: 126 })
        expect(tracks.length).toBe(1)
        expect(tracks[0].bpm).toBe(125)
      })

      it('filters by genres', () => {
        const tracks = mixxxDatabase.getTracks({ genres: ['Techno (Raw / Deep / Hypnotic)', 'Techno'] })
        expect(tracks.length).toBe(3)
        const receivedGenres = tracks.map(t => t.genre).sort()
        expect(receivedGenres).toEqual(['Techno', 'Techno', 'Techno (Raw / Deep / Hypnotic)'])
      })

      it('filters by Camelot keys', () => {
        const tracks = mixxxDatabase.getTracks({ keys: ['Emin'] })
        expect(tracks.length).toBe(1)
        expect(tracks[0].key).toBe('Emin')
      })

      it('filters by crates', () => {
        const crate1 = seedData.crates.find(c => c.name === 'Crate 1')
        const tracks = mixxxDatabase.getTracks({ crates: [crate1.id] })
        expect(tracks.length).toBe(2)
        expect(tracks.map(t => t.title).sort()).toEqual(['Leda', 'Sub Lunar Phase II (Original M)'])
      })

      it('combines multiple filters', () => {
        const track = seedData.library.find(t => t.title === 'Elevate')
        const crate = seedData.crates.find(c => c.id === seedData.crate_tracks.find(ct => ct.track_id === track.id).crate_id)
        const tracks = mixxxDatabase.getTracks({
          genres: track.genre,
          crates: [crate.id],
          minBpm: track.bpm - 1,
          maxBpm: track.bpm + 1,
        })
        expect(tracks.length).toBe(1)
        expect(tracks[0].title).toBe(track.title)
      })
    })

    describe('getAvailableCrates', () => {
      it('returns all available crates', () => {
        const crates = mixxxDatabase.getAvailableCrates()
        expect(crates.length).toBe(seedData.crates.length)
        expect(crates[0]).toHaveProperty('id')
        expect(crates[0]).toHaveProperty('name')
      })
    })

    describe('getAvailableKeys', () => {
      it('returns unique keys with original and Camelot notation', () => {
        const keys = mixxxDatabase.getAvailableKeys()
        expect(keys).toEqual(expect.arrayContaining([
          {
            original: "Emin",
            camelot: "9A",
            label: "9A - Emin"
          }
        ]))
      })
    })

    describe('getTracksByIds', () => {
      it('returns the correct tracks for the given IDs', () => {
        const trackIds = [1, 3]
        const tracks = mixxxDatabase.getTracksByIds(trackIds)
        expect(tracks.length).toBe(2)
        expect(tracks.map(t => t.id).sort()).toEqual([1, 3])
      })

      it('returns an empty array if no IDs are provided', () => {
        const tracks = mixxxDatabase.getTracksByIds([])
        expect(tracks.length).toBe(0)
      })
    })
  })

  describe('getStatus', () => {
    it('returns the correct status when disconnected', () => {
      vi.spyOn(mixxxDatabase, 'getDefaultPath').mockReturnValue(mockDbPath)
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)

      const status = mixxxDatabase.getStatus()
      expect(status.isConnected).toBe(false)
      expect(status.dbPath).toBeNull()
      expect(status.defaultPathExists).toBe(true)
    })

    it('returns the correct status when connected', () => {
      mixxxDatabase.connect(mockDbPath)
      const status = mixxxDatabase.getStatus()
      expect(status.isConnected).toBe(true)
      expect(status.dbPath).toBe(mockDbPath)
    })
  })

  describe.skip('disconnect', () => {
    it('should disconnect and reset the state', () => {
      mixxxDatabase.connect(mockDbPath)

      const status = mixxxDatabase.disconnect()
      expect(status.isConnected).toBe(false)
      expect(status.dbPath).toBeNull()
      expect(mixxxDatabase.db).toBeNull()
    })
  })
})
