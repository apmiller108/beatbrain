import { test, expect } from '@playwright/test';
import { TestDatabaseHelper } from './helpers/testDatabase.js';
import { ElectronAppHelper } from './helpers/electronApp.js';

test.describe('Playlist Creation', () => {
  let testDb;
  let electronApp;

  test.beforeEach(async () => {
    testDb = new TestDatabaseHelper();
    electronApp = new ElectronAppHelper(testDb);

    await testDb.createMixxxDatabase();

    // Set user preference to auto-connect to the Mixxx DB to bypass the connection modal
    await testDb.setUserPreferences([
      { category: 'database', key: 'auto_connect', value: 'true' },
      { category: 'database', key: 'path', value: testDb.getMixxxDbPath() }
    ]);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('generates a new playlist with filtered tracks', async ({ page }) => {
    const { window } = await electronApp.launch();

    // Wait for the app to load and the main view to be ready
    await expect(window.locator('text=Library')).toBeVisible();

    // Click "Create Playlist" in the sidebar navigation
    await window.locator('button[title="Create new playlist"]').click();

    // Verify we are on the creation view
    await expect(window.locator('h2', { hasText: 'Create Playlist' })).toBeVisible();

    // Wait for filters to load
    await expect(window.locator('text=Loading filters...')).not.toBeVisible();

    // The seed data has tracks with BPMs: 134, 125, 142.
    // Let's filter for tracks with BPM between 120 and 130 (should match "Sub Lunar Phase II" at 125 BPM)

    // Locate BPM inputs
    const minBpmInput = window.locator('input[type="number"]').nth(1); // Assuming order: count, min, max
    const maxBpmInput = window.locator('input[type="number"]').nth(2);

    // Better to find by labels if possible, but let's look at the component structure in PlaylistForm (not provided)
    // or rely on placeholders/labels if they exist.
    // BpmRangeInput usually has placeholders "Min" and "Max"
    await window.getByPlaceholder('Min').fill('120');
    await window.getByPlaceholder('Max').fill('130');

    // Set Track Count to 1 to ensure we have enough tracks
    // The default might be 25. We only have 3 tracks in seed data.
    // The "Track Count" input
    await window.locator('input[type="number"]').first().fill('1');

    // Wait for the debounce and DB query
    // The UI should show "X tracks found".
    // "Sub Lunar Phase II" is 125 BPM.
    await expect(window.locator('.badge.bg-success')).toContainText('1 tracks found');

    // Click "Generate Playlist"
    const generateBtn = window.getByRole('button', { name: 'Generate Playlist' });
    await expect(generateBtn).toBeEnabled();
    await generateBtn.click();

    // The app should navigate to the new playlist detail view
    await expect(window.locator('.c-playlist-detail-view')).toBeVisible();

    // Verify the track is in the list
    await expect(window.locator('.table')).toContainText('Sub Lunar Phase II');

    // Verify NOT in the list (the 142 BPM track)
    await expect(window.locator('.table')).not.toContainText('Elevate');
  });
});
