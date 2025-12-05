import { ipcMain, dialog } from 'electron';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export function registerFileHandlers() {
  ipcMain.handle('file:saveM3UPlaylist', handleSaveM3U);
}

/**
 * Handle M3U file save dialog and write
 * @param {IpcMainInvokeEvent} event
 * @param {Object} options - { content, playlistName, lastExportPath }
 * @returns {Object} { success, filePath, error }
 */
async function handleSaveM3U(event, options) {
  const { content, playlistName, lastExportPath } = options;

  try {
    const defaultPath = lastExportPath || join(homedir(), 'Music');
    const defaultFileName = `${sanitizeFileName(playlistName)}.m3u`;

    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Export Playlist as M3U',
      defaultPath: join(defaultPath, defaultFileName),
      filters: [
        { name: 'M3U Playlists', extensions: ['m3u'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory']
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    // Write file with UTF-8 encoding
    await writeFile(filePath, content, 'utf-8');

    return {
      success: true,
      filePath,
      fileName: filePath.split(/[\\/]/).pop()
    };
  } catch (error) {
    console.error('Error saving M3U file:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function sanitizeFileName(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255);
}
