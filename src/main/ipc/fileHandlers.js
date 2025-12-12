import { ipcMain, dialog, shell } from 'electron';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export function registerFileHandlers() {
  ipcMain.handle('file:saveM3UPlaylist', handleSaveM3U);
  ipcMain.handle('file:openFileInFolder', openFileInFolder);
  ipcMain.handle('file:openFile', handleOpenFile);
}

/**
 * Open file in system file explorer
 * @param {IpcMainInvokeEvent} event
 * @param {string} filePath
 */
async function openFileInFolder(event, filePath) {
  await shell.showItemInFolder(filePath);
}

/**
  * Open file with default application
  * @param {IpcMainInvokeEvent} event
  * @param {string} filePath
  */
async function handleOpenFile(event, filePath) {
  await shell.openPath(filePath);
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

    const pathParts = filePath.split("/")
    const fileName = pathParts.pop()
    const exportPath = pathParts.join("/")

    return {
      success: true,
      filePath,
      exportPath,
      fileName,
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
