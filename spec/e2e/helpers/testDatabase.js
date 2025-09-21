import fs from 'fs';
import path from 'path';
import os from 'os';
import { createMockMixxxDatabase, seedMixxxDatabase } from '../../mockMixxxDatabase.js'
import appDatabase from '../../../src/main/database/appDatabase.js';

export class TestDatabaseHelper {
  constructor() {
    this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beatbrain-e2e'));
    this.appDbPath = path.join(this.tempDir, 'beatbrain.sqlite');
    this.mixxxDbPath = path.join(this.tempDir, 'mixxxdb.sqlite');
  }

  createMixxxDatabase() {
    createMockMixxxDatabase(this.tempDir);
    seedMixxxDatabase(this.mixxxDbPath)
  }

  cleanup() {
    try {
      fs.rmSync(this.appDbPath, { recursive: true, force: true });
      fs.rmSync(this.mixxxDbPath, { recursive: true, force: true });
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

  setUserPreferences(preferences) {
    appDatabase.initialize(this.tempDir)
    preferences.forEach(({ category, key, value }) => {
      appDatabase.setUserPreference(category, key, value);
    });
    appDatabase.close();
  }
}
