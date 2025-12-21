import { test, expect } from '@playwright/test';
import { TestDatabaseHelper } from './helpers/testDatabase.js';
import { ElectronAppHelper } from './helpers/electronApp.js';

test.describe('Track Search & Add', () => {
  let testDb;
  let electronApp;
  let playlist;

  test.beforeEach(async () => {
    testDb = new TestDatabaseHelper();
    electronApp = new ElectronAppHelper(testDb);

    await testDb.createMixxxDatabase();

    // Set user preference to auto-connect to the Mixxx DB to bypass the connection modal
    await testDb.setUserPreferences([
      { category: 'database', key: 'auto_connect', value: 'true' },
      { category: 'database', key: 'path', value: testDb.getMixxxDbPath() }
    ]);

    // Create a playlist to add tracks to
    playlist = await testDb.createPlaylist('E2E Test Playlist');
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('searches for a track and adds it to a playlist', async ({ page }) => {
    const { window } = await electronApp.launch();

    // Wait for the app to load and the main view to be ready
    await expect(window.locator('text=Library')).toBeVisible();

    // Navigate to the created playlist
    await window.getByRole('button', { name: 'E2E Test Playlist' }).click();
    await expect(window.locator('h2', { hasText: 'E2E Test Playlist' })).toBeVisible();

    // Click "Add Tracks" button to open the search modal
    await window.locator('#add-tracks-btn').click();
    const modal = window.locator('.modal-dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.modal-title')).toHaveText('Add Tracks to Playlist');

    // Search for a track
    const searchInput = modal.getByPlaceholder('Search by track name, artist, album...');
    await searchInput.fill('Elevate');

    // Wait for search results and verify the correct track appears
    const resultItem = modal.locator('.c-track-search-result-item');
    await expect(resultItem).toBeVisible();
    await expect(resultItem.getByRole('button', { name: 'Elevate' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Leda' })).not.toBeVisible();

    // Select the track
    await resultItem.click();

    // Verify the "Add" button is enabled and shows the correct count
    const addButton = modal.getByRole('button', { name: 'Add 1 Selected Tracks' });
    await expect(addButton).toBeEnabled();

    // Add the track
    await addButton.click();

    // Verify the modal closes
    await expect(modal).not.toBeVisible();

    // Verify the track now appears in the playlist view
    const playlistTrackList = window.locator('.c-playlist-detail-view')
    await expect(playlistTrackList).toContainText('Elevate')
    await expect(playlistTrackList).toContainText('Kashpitzky')
  });
});
