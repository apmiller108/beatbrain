import fs from 'fs';
import path from 'path';
import os from 'os';
import { createMockMixxxDatabase, seedMixxxDatabase } from '../../mockMixxxDatabase.js'
import appDatabase from '../../../src/main/database/appDatabase.js';
import SqliteManager from './sqliteManager.js';

export class TestDatabaseHelper {
  constructor() {
    this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beatbrain-e2e'));

    // This path is set to the env var BEATBRAIN_TEST_APP_DB when launching the
    // app (see ElectronAppHelper) so when appDatabase.initialize is called it
    // uses this path. We can therefore use this path to initialize another
    // instance of appDatabase in the tests in order to seed or even read data.
    this.appDbPath = path.join(this.tempDir, 'beatbrain.sqlite');

    this.mixxxDbPath = path.join(this.tempDir, 'mixxxdb.sqlite');
    this.sqliteManager = new SqliteManager();
  }

  async createMixxxDatabase() {
    await this.sqliteManager.switchToNode();
    createMockMixxxDatabase(this.tempDir);
    seedMixxxDatabase(this.mixxxDbPath)
  }

  // Create a Mixxx database with a custom filename for
  // simulating a user selecting a Mixxx database file in a non-default location
  async createCustomMixxxDatabase() {
    const customDbFilename = 'custom_mixxxdb.sqlite';
    this.mixxxDbPathCustom = path.join(this.tempDir, customDbFilename);

    await this.sqliteManager.switchToNode();

    createMockMixxxDatabase(this.tempDir, customDbFilename);
    seedMixxxDatabase(this.mixxxDbPathCustom)
  }

  cleanup() {
    try {
      fs.rmSync(this.appDbPath, { recursive: true, force: true });
      fs.rmSync(this.mixxxDbPath, { recursive: true, force: true });
      if (this.mixxxDbPathCustom) {
        fs.rmSync(this.mixxxDbPathCustom, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('Failed to cleanup test database:', error);
    }
  }

  getMixxxDbPath() {
    return this.mixxxDbPath;
  }

  getAppDbPath() {
    return this.appDbPath;
  }

  async setUserPreferences(preferences) {
    await this.sqliteManager.switchToNode();
    appDatabase.initialize(this.tempDir)
    preferences.forEach(({ category, key, value }) => {
      appDatabase.setUserPreference(category, key, value);
    });
    appDatabase.close();
  }

  async createPlaylist(name) {
    await this.sqliteManager.switchToNode();
    appDatabase.initialize(this.tempDir);
    const playlist = appDatabase.createPlaylist({ name });
    appDatabase.close();
    return playlist;
  }
}
