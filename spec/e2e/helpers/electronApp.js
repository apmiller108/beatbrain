import { _electron as electron } from 'playwright';
import path from 'path';
import { execSync } from 'child_process';

export class ElectronAppHelper {
  constructor(testDb) {
    this.testDb = testDb;
    this.app = null;
    this.window = null;
  }

  // Rebuild better-sqlite3 for Electron
  // Running the test needs to have better-sqlite3 built for system version of Node
  // but launching Electron needs it built for Electron's Node version.
  // This is a huge pain in the ass and all I could figure out to do is
  // rebuild before launching the app.
  async rebuildForElectron() {
    console.log('Rebuilding better-sqlite3 for Electron...');
    try {
      execSync('npm run rebuild', {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      console.log('✅ Rebuilt better-sqlite3 for Electron');
    } catch (error) {
      console.error('Failed to rebuild for Electron:', error);
      throw error;
    }
  }

  async rebuildForNode() {
    console.log('Rebuilding better-sqlite3 for system node...');
    try {
      execSync('npm rebuild', {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      console.log('✅ Rebuilt better-sqlite3 for system node');
    } catch (error) {
      console.error('Failed to rebuild for system node:', error);
      throw error;
    }
  }

  async launch() {
    // TODO: cache these better-sqlite3 builds and switch between them
    // Create the test Mixxx database
    await this.rebuildForNode()
    this.testDb.createMixxxDatabase();

    await this.rebuildForElectron();
    // Launch Electron app with test database paths
    this.app = await electron.launch({
      args: [
        path.join(process.cwd(), 'out/main/index.js'), '--test-mode'
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
