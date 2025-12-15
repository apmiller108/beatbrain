import { ipcMain, dialog } from 'electron';

export function registerMixxxDatabaseHandlers(mixxxDatabase) {
  ipcMain.handle('app:selectDatabaseFile', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select Mixxx Database File',
      filters: [
        { name: 'SQLite Database', extensions: ['sqlite', 'db'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle('mixxx:getStatus', () => {
    return mixxxDatabase.getStatus()
  })

  ipcMain.handle('mixxx:connect', async (_, dbPath) => {
    return mixxxDatabase.connect(dbPath)
  })

  ipcMain.handle('mixxx:disconnect', async () => {
    return mixxxDatabase.disconnect()
  })

  ipcMain.handle('mixxx:getStats', async () => {
    return mixxxDatabase.getLibraryStats()
  })

  ipcMain.handle('mixxx:getSampleTracks', async (_, limit = 10) => {
    return mixxxDatabase.getSampleTracks(limit)
  })

  ipcMain.handle('mixxx:getGenres', async () => {
    return mixxxDatabase.getGenres()
  })

  ipcMain.handle('mixxx:getAvailableCrates', async () => {
    return mixxxDatabase.getAvailableCrates()
  })

  ipcMain.handle('mixxx:getAvailableKeys', async () => {
    return mixxxDatabase.getAvailableKeys()
  })

  ipcMain.handle('mixxx:getTracks', async (_, filters) => {
    return mixxxDatabase.getTracks(filters)
  })

  ipcMain.handle('mixxx:getTrackById', async (_, trackId) => {
    return mixxxDatabase.getTrackById(trackId)
  })
}
