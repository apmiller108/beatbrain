import { _electron as electron } from 'playwright';
import path from 'path';
import SqliteManager from './sqliteManager.js';

export class ElectronAppHelper {
  constructor(testDb) {
    this.testDb = testDb;
    this.app = null;
    this.window = null;
    this.sqliteManager = new SqliteManager();
  }

  // Running the test needs to have better-sqlite3 binary built for system
  // version of Node, but launching Electron, which has its own built in node,
  // needs it built for Electron's Node version. To solve this, better-sqlite3
  // is built for both versions of node, cached and swapped as needed.
  async launch() {
    await this.sqliteManager.switchToNode();
    this.testDb.createMixxxDatabase();

    await this.sqliteManager.switchToElectron();

    // Launch Electron app with test database paths set via environment variables
    this.app = await electron.launch({
      args: [
        path.join(process.cwd(), 'out/main/index.js'),
        '--test-mode',
        process.env.CI === 'true' ? '--no-sandbox' : ''
      ],
      env: {
        ...process.env,
        // Pass test database paths via environment variables
        BEATBRAIN_TEST_MIXXX_DB: this.testDb.getMixxxDbPath(),
        BEATBRAIN_TEST_APP_DB: this.testDb.getAppDbPath(),
        NODE_ENV: 'test'
      }
    });

    // Get the first window
    this.window = await this.app.firstWindow();

    // Wait for app to be ready
    await this.window.waitForLoadState('domcontentloaded');

    return { app: this.app, window: this.window };
  }

  async close() {
    if (this.app) {
      await this.app.close();
    }
    this.testDb.cleanup();
  }
}
