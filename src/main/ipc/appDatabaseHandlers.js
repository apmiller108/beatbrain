import { ipcMain } from "electron";

export function registerAppDatabaseHandlers(appDatabase) {
  // User preferences handlers

  ipcMain.handle('app:getUserPreference', async (_, category, key) => {
    return appDatabase.getUserPreference(category, key)
  })

  ipcMain.handle('app:getUserPreferencesForCategory', async (_, category) => {
    return appDatabase.getUserPreferencesForCategory(category)
  })

  ipcMain.handle('app:setUserPreference', async (_, category, key, value) => {
    return appDatabase.setUserPreference(category, key, value)
  })

  // User settings handlers

  ipcMain.handle('app:getTrackFilters', async () => {
    return appDatabase.getTrackFilters()
  })

  ipcMain.handle('app:saveTrackFilters', async (_, filters) => {
    return appDatabase.saveTrackFilters(filters)
  })

  ipcMain.handle('app:saveSearchFilters', async (_, filters) => {
    return appDatabase.saveSearchFilters(filters)
  })

  ipcMain.handle('app:getSetting', async (_, key) => {
    return appDatabase.getSetting(key)
  })

  ipcMain.handle('app:setSetting', async (_, key, value) => {
    return appDatabase.setSetting(key, value)
  })

  // Playlist handlers

  ipcMain.handle('app:createPlaylist', async (_, playlistData, tracks) => {
    return appDatabase.createPlaylist(playlistData, tracks)
  })

  ipcMain.handle('app:getAllPlaylists', async () => {
    return appDatabase.getAllPlaylists()
  })

  ipcMain.handle('app:getPlaylistById', async (_, id) => {
    return appDatabase.getPlaylist(id)
  })

  ipcMain.handle('app:updatePlaylist', async (_, id, playlistData) => {
    return appDatabase.updatePlaylist(id, playlistData)
  })

  ipcMain.handle('app:updateTrackPosition', async (_, playlistId, trackId, newPosition) => {
    return appDatabase.updateTrackPosition(playlistId, trackId, newPosition)
  })

  ipcMain.handle('app:updateTrackPositions', async (_, playlistId, tracks) => {
    return appDatabase.updateTrackPositions(playlistId, tracks)
  })

  ipcMain.handle('app:removeTrackFromPlaylist', async (_, playlistId, trackId) => {
    return appDatabase.removeTrackFromPlaylist(playlistId, trackId)
  })

  ipcMain.handle('app:deletePlaylist', async (_, id) => {
    return appDatabase.deletePlaylist(id)
  })

  ipcMain.handle('app:addTracksToPlaylist', async (_, playlistId, trackSourceIds) => {
    return appDatabase.addTracksToPlaylist(playlistId, trackSourceIds)
  })

}
