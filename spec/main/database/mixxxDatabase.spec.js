import mixxxDatabase from '@main/database/mixxxDatabase.js'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import os from 'os'

vi.mock('os', async (importOriginal) => {
  const actualOS = await importOriginal()
  return {
    ...actualOS,
    userInfo: vi.fn(() => ({ username: 'testuser' })),
    homedir: vi.fn(() => '/home/testuser'),
  }
})

// Create temp dir to put test Mixxx DB
const tempDir = path.join(os.tmpdir(), 'beatbrain-mixxx-test')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

const mockDbPath = path.join(tempDir, 'mixxxdb.sqlite')

// Function to create a mock Mixxx database with realistic schema
const createMockDatabase = () => {
  const testDb = new Database(mockDbPath)
  try {
    testDb.exec(`
  CREATE TABLE settings (
          name TEXT UNIQUE NOT NULL,
          value TEXT,
          locked INTEGER DEFAULT 0,
          hidden INTEGER DEFAULT 0);
  CREATE TABLE track_locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location varchar(512) UNIQUE,
          filename varchar(512),
          directory varchar(512),
          filesize INTEGER,
          fs_deleted INTEGER,
          needs_verification INTEGER);
  CREATE TABLE LibraryHashes (
          directory_path VARCHAR(256) primary key,
          hash INTEGER,
          directory_deleted INTEGER, needs_verification INTEGER DEFAULT 0);
  CREATE TABLE Playlists (
          id INTEGER primary key,
          name varchar(48),
          position INTEGER,
          hidden INTEGER DEFAULT 0 NOT NULL,
          date_created datetime,
          date_modified datetime, locked integer DEFAULT 0);
  CREATE TABLE PlaylistTracks (
          id INTEGER primary key,
          playlist_id INTEGER REFERENCES Playlists(id),
          track_id INTEGER REFERENCES "library_old"(id),
          position INTEGER, pl_datetime_added);
  CREATE TABLE cues (
          id integer PRIMARY KEY AUTOINCREMENT,
          track_id integer NOT NULL REFERENCES "library_old"(id),
          type integer DEFAULT 0 NOT NULL,
          position integer DEFAULT -1 NOT NULL,
          length integer DEFAULT 0 NOT NULL,
          hotcue integer DEFAULT -1 NOT NULL,
          label text DEFAULT '' NOT NULL, color INTEGER DEFAULT 4294901760 NOT NULL);
  CREATE TABLE crates (
          id integer PRIMARY KEY AUTOINCREMENT,
          name varchar(48) UNIQUE NOT NULL,
          count integer DEFAULT 0,
          show integer DEFAULT 1, locked integer DEFAULT 0, autodj_source integer DEFAULT 0);
  CREATE TABLE crate_tracks (
          crate_id integer NOT NULL REFERENCES crates(id),
          track_id integer NOT NULL REFERENCES "library_old"(id),
          UNIQUE (crate_id, track_id));
  CREATE TABLE library (
          id INTEGER primary key AUTOINCREMENT,
          artist varchar(64),
          title varchar(64),
          album varchar(64),
          year varchar(16),
          genre varchar(64),
          tracknumber varchar(3),
          location integer REFERENCES track_locations(location),
          comment varchar(256),
          url varchar(256),
          duration float,
          bitrate integer,
          samplerate integer,
          cuepoint integer,
          bpm float,
          wavesummaryhex blob,
          channels integer,
          datetime_added DEFAULT CURRENT_TIMESTAMP,
          mixxx_deleted integer,
          played integer,
          header_parsed integer DEFAULT 0, filetype varchar(8) DEFAULT "?", replaygain float DEFAULT 0, timesplayed integer DEFAULT 0, rating integer DEFAULT 0, key varchar(8) DEFAULT "", beats BLOB, beats_version TEXT, composer varchar(64) DEFAULT "", bpm_lock INTEGER DEFAULT 0, beats_sub_version TEXT DEFAULT '', keys BLOB, keys_version TEXT, keys_sub_version TEXT, key_id INTEGER DEFAULT 0, grouping TEXT DEFAULT "", album_artist TEXT DEFAULT "", coverart_source INTEGER DEFAULT 0, coverart_type INTEGER DEFAULT 0, coverart_location TEXT DEFAULT "", coverart_hash INTEGER DEFAULT 0, replaygain_peak REAL DEFAULT -1.0, tracktotal TEXT DEFAULT '//', color INTEGER, coverart_color INTEGER, coverart_digest BLOB, last_played_at DATETIME DEFAULT NULL, source_synchronized_ms INTEGER DEFAULT NULL);
  CREATE TABLE itunes_library (
          id INTEGER primary key,
          artist varchar(48), title varchar(48),
          album varchar(48), year varchar(16),
          genre varchar(32), tracknumber varchar(3),
          location varchar(512),
          comment varchar(60),
          duration integer,
          bitrate integer,
          bpm integer,
          rating integer, grouping TEXT DEFAULT "", album_artist TEXT DEFAULT "");
  CREATE TABLE itunes_playlists (
          id INTEGER primary key,
          name varchar(100) UNIQUE);
  CREATE TABLE itunes_playlist_tracks (
          id INTEGER primary key AUTOINCREMENT,
          playlist_id INTEGER REFERENCES itunes_playlist(id),
          track_id INTEGER REFERENCES itunes_library(id), position INTEGER DEFAULT 0);
  CREATE TABLE traktor_library (
          id INTEGER primary key AUTOINCREMENT,
          artist varchar(48), title varchar(48),
          album varchar(48), year varchar(16),
          genre varchar(32), tracknumber varchar(3),
          location varchar(512) UNIQUE,
          comment varchar(60),
          duration integer,
          bitrate integer,
          bpm float,
          key varchar(6),
          rating integer
          );
  CREATE TABLE traktor_playlists (
          id INTEGER primary key,
          name varchar(100) UNIQUE
          );
  CREATE TABLE traktor_playlist_tracks (
          id INTEGER primary key AUTOINCREMENT,
          playlist_id INTEGER REFERENCES traktor_playlist(id),
          track_id INTEGER REFERENCES traktor_library(id)
          , position INTEGER DEFAULT 0);
  CREATE TABLE rhythmbox_library (
          id INTEGER primary key AUTOINCREMENT,
          artist varchar(48), title varchar(48),
          album varchar(48), year varchar(16),
          genre varchar(32), tracknumber varchar(3),
          location varchar(512) UNIQUE,
          comment varchar(60),
          duration integer,
          bitrate integer,
          bpm float,
          key varchar(6),
          rating integer
          );
  CREATE TABLE rhythmbox_playlists (
          id INTEGER primary key AUTOINCREMENT,
          name varchar(100) UNIQUE
          );
  CREATE TABLE rhythmbox_playlist_tracks (
          id INTEGER primary key AUTOINCREMENT,
          playlist_id INTEGER REFERENCES rhythmbox_playlist(id),
          track_id INTEGER REFERENCES rhythmbox_library(id)
          , position INTEGER DEFAULT 0);
  CREATE TABLE track_analysis (
        id INTEGER primary key AUTOINCREMENT,
        track_id INTEGER NOT NULL REFERENCES track_locations(id),
        type varchar(512),
        description varchar(1024),
        version varchar(512),
        created DEFAULT CURRENT_TIMESTAMP,
        data_checksum varchar(512)
      );
  CREATE INDEX track_analysis_track_id_index ON track_analysis (track_id);
  CREATE TABLE directories (
          directory TEXT UNIQUE
        );
  CREATE INDEX idx_PlaylistTracks_playlist_id_track_id ON PlaylistTracks (
            playlist_id,
            track_id
        );
  CREATE INDEX idx_PlaylistTracks_track_id ON PlaylistTracks (
            track_id
        );
  CREATE INDEX idx_crate_tracks_track_id ON crate_tracks (
            track_id
        );
    `);
  } catch (error) {
    console.log(error)
  } finally {
    testDb.close
  }
}

// Functions to insert seed data
const processRecord = (record) => {
  const processed = { ...record };

  // Convert hex strings to Buffers for BLOB fields
  if (processed.beats && processed.beats !== '') {
    processed.beats = Buffer.from(processed.beats, 'hex');
  }
  if (processed.coverart_digest && processed.coverart_digest !== '') {
    processed.coverart_digest = Buffer.from(processed.coverart_digest, 'hex');
  }

  return processed;
}

// TODO: insert proper track_locations.
// TODO: add more library tracks
const seedMixxxDatabase = () => {
  const testDb = new Database(mockDbPath)
  const seedData = JSON.parse(fs.readFileSync('spec/fixtures/mixxxData.json', 'utf-8'))
  const insertLibrary = testDb.prepare(`
    INSERT INTO library (
      "id", "artist", "title", "album", "year", "genre", "tracknumber", 
      "location", "comment", "url", "duration", "bitrate", "samplerate", 
      "cuepoint", "bpm", "wavesummaryhex", "channels", "datetime_added", 
      "mixxx_deleted", "played", "header_parsed", "filetype", "replaygain", 
      "timesplayed", "rating", "key", "beats", "beats_version", "composer", 
      "bpm_lock", "beats_sub_version", "keys", "keys_version", "keys_sub_version", 
      "key_id", "grouping", "album_artist", "coverart_source", "coverart_type", 
      "coverart_location", "coverart_hash", "replaygain_peak", "tracktotal", 
      "color", "coverart_color", "coverart_digest", "last_played_at", 
      "source_synchronized_ms"
    ) VALUES (
      @id, @artist, @title, @album, @year, @genre, @tracknumber, 
      @location, @comment, @url, @duration, @bitrate, @samplerate, 
      @cuepoint, @bpm, @wavesummaryhex, @channels, @datetime_added, 
      @mixxx_deleted, @played, @header_parsed, @filetype, @replaygain, 
      @timesplayed, @rating, @key, @beats, @beats_version, @composer, 
      @bpm_lock, @beats_sub_version, @keys, @keys_version, @keys_sub_version, 
      @key_id, @grouping, @album_artist, @coverart_source, @coverart_type, 
      @coverart_location, @coverart_hash, @replaygain_peak, @tracktotal, 
      @color, @coverart_color, @coverart_digest, @last_played_at, 
      @source_synchronized_ms
    )
  `);

  try {
    const insertMany = testDb.transaction((records) => {
      records.forEach((record) => {
        const processedRecord = processRecord(record);
        insertLibrary.run(processedRecord);
      })
    });

    insertMany(seedData.library);
    console.log(`Inserted ${seedData.library.length} records successfully`);
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    testDb.close
  }
}

describe('MixxxDatabase', () => {
  beforeAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
    createMockDatabase()
    seedMixxxDatabase()
  })

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  })

  afterEach(() => {
    mixxxDatabase.disconnect()
    vi.clearAllMocks()
  })

  describe('getDefaultPath', () => {
    it('should return correct path for Linux', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      vi.spyOn(os, 'homedir').mockReturnValue('/home/testuser');
      expect(mixxxDatabase.getDefaultPath()).toBe('/home/testuser/.mixxx/mixxxdb.sqlite');
    })

    it('should return correct path for Windows', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      vi.spyOn(os, 'userInfo').mockReturnValue({ username: 'testuser' });
      const expectedPath = path.join('C:', 'Users', 'testuser', 'AppData', 'Local', 'Mixxx', 'mixxxdb.sqlite');
      expect(mixxxDatabase.getDefaultPath()).toBe(expectedPath);
    })

    it('should return correct path for macOS', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      vi.spyOn(os, 'homedir').mockReturnValue('/Users/testuser');
      const expectedPath = path.join('/Users/testuser', 'Library', 'Containers', 'org.mixxx.mixxx', 'Data', 'Library', 'Application Support', 'Mixxx', 'mixxxdb.sqlite');
      expect(mixxxDatabase.getDefaultPath()).toBe(expectedPath);
    })
  })

  // describe('connect', () => {
  //   it('should connect successfully to a valid database file', () => {
  //     const result = mixxxDatabase.connect(mockDbPath)
  //     expect(result.success).toBe(true)
  //     expect(result.path).toBe(mockDbPath)
  //     expect(mixxxDatabase.isConnected).toBe(true)
  //   })

  //   it('should fail if database file does not exist', () => {
  //     const badPath = '/non/existent/path/mixxxdb.sqlite'
  //     const result = mixxxDatabase.connect(badPath)
  //     expect(result.success).toBe(false)
  //     expect(result.error).toContain('Database file not found')
  //     expect(mixxxDatabase.isConnected).toBe(false)
  //   })

  //   it('should fail if database file is not readable', () => {
  //     // Mock fs.accessSync to throw an error
  //     vi.spyOn(fs, 'accessSync').mockImplementationOnce(() => {
  //       throw new Error('Permission denied')
  //     })
  //     const result = mixxxDatabase.connect(mockDbPath)
  //     expect(result.success).toBe(false)
  //     expect(result.error).toContain('Cannot read database file')
  //   })

  //   it('should auto-detect and connect if path is not provided', () => {
  //     vi.spyOn(mixxxDatabase, 'getDefaultPath').mockReturnValue(mockDbPath)
  //     const result = mixxxDatabase.connect()
  //     expect(result.success).toBe(true)
  //     expect(result.path).toBe(mockDbPath)
  //     expect(mixxxDatabase.isConnected).toBe(true)
  //   })
  // })

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
  //   it('should return correct status when disconnected', () => {
  //     vi.spyOn(mixxxDatabase, 'getDefaultPath').mockReturnValue(mockDbPath)
  //     vi.spyOn(fs, 'existsSync').mockReturnValue(true)

  //     const status = mixxxDatabase.getStatus()
  //     expect(status.isConnected).toBe(false)
  //     expect(status.dbPath).toBeNull()
  //     expect(status.defaultPathExists).toBe(true)
  //   })

  //   it('should return correct status when connected', () => {
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
