import fs from 'fs';
import path from 'path';
import os from 'os';
import { createMockMixxxDatabase, seedMixxxDatabase } from '../../mockMixxxDatabase.js'

export class TestDatabaseHelper {
  constructor() {
    this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beatbrain-e2e'));
    this.appDbPath = path.join(this.tempDir, 'beatbrain.sqlite');
  }

  createMixxxDatabase() {
    this.mixxxDbPath = createMockMixxxDatabase()
    seedMixxxDatabase(this.mixxxDbPath)
    return this.mixxxDbPath
    ;
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
}
