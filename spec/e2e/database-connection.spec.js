import { test, expect } from '@playwright/test';
import { TestDatabaseHelper } from './helpers/testDatabase.js';
import { ElectronAppHelper } from './helpers/electronApp.js';

test.describe('Database Connection', () => {
  let testDb;
  let electronApp;

  test.beforeEach(async () => {
    testDb = new TestDatabaseHelper();
    electronApp = new ElectronAppHelper(testDb);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('prompts to configure the Mixxx database connection', async () => {
    const { window } = await electronApp.launch();

    // Wait for the database connection modal
    await expect(window.locator('.database-connection-modal')).toBeVisible();
  });
});
