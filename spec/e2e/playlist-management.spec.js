import { test, expect } from '@playwright/test';
import { TestDatabaseHelper } from './helpers/testDatabase.js';
import { ElectronAppHelper } from './helpers/electronApp.js';

test.describe('Playlist Management', () => {
  let testDb;
  let electronApp;

  test.beforeEach(async () => {
    testDb = new TestDatabaseHelper();
    electronApp = new ElectronAppHelper(testDb);

    await testDb.createMixxxDatabase();

    await testDb.setUserPreferences([
      { category: 'database', key: 'auto_connect', value: 'true' },
      { category: 'database', key: 'path', value: testDb.getMixxxDbPath() }
    ]);

    // Seed a playlist with tracks
    const tracks = [
      {
        id: 101,
        file_path: '/music/track1.mp3',
        duration: 180,
        artist: 'Artist One',
        title: 'Track One',
        album: 'Album One',
        genre: 'House',
        bpm: 120,
        key: '8A'
      },
      {
        id: 102,
        file_path: '/music/track2.mp3',
        duration: 200,
        artist: 'Artist Two',
        title: 'Track Two',
        album: 'Album Two',
        genre: 'Techno',
        bpm: 130,
        key: '9A'
      }
    ];

    await testDb.createPlaylist('Management Test Playlist', tracks);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('removes a track from the playlist', async ({ page }) => {
    const { window } = await electronApp.launch();

    await expect(window.locator('text=Library')).toBeVisible();

    // Navigate to the playlist (it should appear in the sidebar)
    await window.getByRole('button', { name: 'Management Test Playlist' }).click();

    // Verify playlist view loaded
    await expect(window.locator('h2', { hasText: 'Management Test Playlist' })).toBeVisible();

    // Verify both tracks are present
    const table = window.locator('.table');
    await expect(table).toContainText('Track One');
    await expect(table).toContainText('Track Two');

    // Find the row for 'Track One'
    const trackOneRow = table.locator('tr', { hasText: 'Track One' });

    // Click the remove button (trash icon) for Track One
    const removeBtn = trackOneRow.locator('button.text-danger'); // Assuming it's styled as danger/text-danger
    await removeBtn.click();

    // Confirm the deletion in the modal
    const modal = window.locator('.modal-dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Are you sure you want to remove "Track One"');

    await modal.getByRole('button', { name: 'Confirm' }).click();

    // Verify modal closes
    await expect(modal).not.toBeVisible();

    // Verify 'Track One' is gone
    await expect(table).not.toContainText('Track One');

    // Verify 'Track Two' is still there
    await expect(table).toContainText('Track Two');
  });
});
