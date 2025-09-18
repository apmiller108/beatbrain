import fs from 'fs'
import path from 'path'
import os from 'os'
import mixxxDatabase from '@main/database/mixxxDatabase.js'
import Database from 'better-sqlite3'
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
        error: `Cannot read database file: ${mockDbPath}`
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

  // describe('Operations on a connected database', () => {
  //   beforeEach(() => {
  //     // Ensure we are connected before each test in this block
  //     const result = mixxxDatabase.connect(mockDbPath)
  //     if (!result.success) {
  //       throw new Error('Failed to connect to mock DB for testing')
  //     }
  //   })

  //   it('should get library stats', () => {
  //     const stats = mixxxDatabase.getLibraryStats()
  //     expect(stats.totalTracks).toBe(3)
  //     expect(stats.totalCrates).toBe(1)
  //     expect(stats.totalPlaylists).toBe(1)
  //     expect(stats.totalDurationSeconds).toBe(180 + 240 + 200)
  //   })

  //   it('should get a sample of tracks', () => {
  //     const tracks = mixxxDatabase.getSampleTracks(2)
  //     expect(tracks.length).toBe(2)
  //     expect(tracks[0]).toHaveProperty('artist')
  //     expect(tracks[0]).toHaveProperty('title')
  //   })

  //   it('should test the connection successfully', () => {
  //     const result = mixxxDatabase.testConnection()
  //     expect(result.success).toBe(true)
  //     expect(result.tests.library).toBe(3)
  //     expect(result.tests.crates).toBe(1)
  //     expect(result.tests.playlists).toBe(1)
  //   })
  // })

  // describe('getStatus', () => {
  //   it('returns the correct status when disconnected', () => {
  //     vi.spyOn(mixxxDatabase, 'getDefaultPath').mockReturnValue(mockDbPath)
  //     vi.spyOn(fs, 'existsSync').mockReturnValue(true)

  //     const status = mixxxDatabase.getStatus()
  //     expect(status.isConnected).toBe(false)
  //     expect(status.dbPath).toBeNull()
  //     expect(status.defaultPathExists).toBe(true)
  //   })

  //   it('returns the correct status when connected', () => {
  //     mixxxDatabase.connect(mockDbPath)
  //     const status = mixxxDatabase.getStatus()
  //     expect(status.isConnected).toBe(true)
  //     expect(status.dbPath).toBe(mockDbPath)
  //   })
  // })

  // describe('disconnect', () => {
  //   it('should disconnect and reset the state', () => {
  //     mixxxDatabase.connect(mockDbPath)
  //     expect(mixxxDatabase.isConnected).toBe(true)

  //     const status = mixxxDatabase.disconnect()
  //     expect(status.isConnected).toBe(false)
  //     expect(status.dbPath).toBeNull()
  //     expect(mixxxDatabase.db).toBeNull()
  //   })
  // })
})
