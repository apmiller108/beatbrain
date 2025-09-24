import { test, expect } from '@playwright/test';
import { TestDatabaseHelper } from './helpers/testDatabase.js';
import { ElectronAppHelper } from './helpers/electronApp.js';

test.describe('Configure Mixxx database connection', () => {
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

  test.describe('when a Mixxx database exists at the default location', () => {
    test.beforeEach(async () => {
      await testDb.createMixxxDatabase();
    })

    test('connect to Mixxx database at default location', async ({ page }) => {
      const { window } = await electronApp.launch();

      // Wait for the database connection modal
      await expect(window.locator('.database-connection-modal')).toBeVisible();
      const modal = window.locator('.database-connection-modal');

      // Verify modal contents
      await expect(modal.locator('input#auto-detect')).toBeChecked();
      await expect(modal.locator('code')).toHaveText(testDb.getMixxxDbPath());
      await expect(modal.locator('input#remember-choice')).not.toBeChecked();

      // Connect to the database
      await modal.getByRole('button', { name: 'Connect' }).click();

      await expect(window.locator('.database-connection-modal')).not.toBeVisible();
      await expect(window.locator('.status-bar')).toContainText('Connected to Mixxx database')
    });
  })

  // TODO: write test for manually selecting a Mixxx database file
  test.describe('when no Mixxx database exists at the default location', () => {
    test('connect to Mixxx at custom location', ({ page }) => {
      // Auto-detect option should not be shown
      // Should be able to manually select a Mixxx database file
    })
  });

  test.describe('with user preference set to auto connect', () => {
    test.beforeEach(async () => {
      await testDb.setUserPreferences([
        { category: 'database', key: 'auto_connect', value: 'true' },
        { category: 'database', key: 'path', value: testDb.getMixxxDbPath() }
      ]);
    });

    test('does not prompt to configure database', async ({ page }) => {
      page.on('console', msg => {
        // Log any console messages from the app for debugging
        console.log(`App console: ${msg.text()}`);
      });

      const { window } = await electronApp.launch();

      // Wait for the database connection modal
      await expect(window.locator('.database-connection-modal')).not.toBeVisible();
    })
  });
});
