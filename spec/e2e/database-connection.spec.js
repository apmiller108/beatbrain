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
    // Cleanup
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should connect to Mixxx database automatically', async () => {
    const { window } = await electronApp.launch();

    // Wait for the database connection modal or status indicator
    await expect(window.locator('[data-testid="database-status"]')).toContainText('Connected');

    // Verify tracks are loaded
    await window.click('[data-testid="library-view-button"]');
    await expect(window.locator('[data-testid="track-list"]')).toBeVisible();

    // Check that tracks from test data are displayed
    await expect(window.locator('text=Test Artist 1')).toBeVisible();
  });

  test('should disconnect from database', async () => {
    const { window } = await electronApp.launch();

    // Click database status to open modal
    await window.click('[data-testid="database-status-icon"]');

    // Click disconnect button
    await window.click('[data-testid="disconnect-database-button"]');

    // Verify disconnected state
    await expect(window.locator('[data-testid="database-status"]')).toContainText('Not connected');
  });
});
