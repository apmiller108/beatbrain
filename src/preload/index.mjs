import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  getPath: name => ipcRenderer.invoke('app:getPath', name),

  // User preferences
  getUserPreference: (category, key) =>
    ipcRenderer.invoke('app:getUserPreference', category, key),
  setUserPreference: (category, key, value) => {
    ipcRenderer.invoke('app:setUserPreference', category, key, value)
  },
  getUserPreferencesForCategory: category =>
    ipcRenderer.invoke('app:getUserPreferencesForCategory', category),

  // User settings
  getTrackFilters: () => ipcRenderer.invoke('app:getTrackFilters'),
  saveTrackFilters: filters => ipcRenderer.invoke('app:saveTrackFilters', filters),
  getSetting: key => ipcRenderer.invoke('app:getSetting', key),
  setSetting: (key, value) => ipcRenderer.invoke('app:setSetting', key, value),

  selectDatabaseFile: () => ipcRenderer.invoke('app:selectDatabaseFile'),

  // Playlists
  createPlaylist: (playlistData, tracks) => ipcRenderer.invoke('app:createPlaylist', playlistData, tracks),
  getAllPlaylists: () => ipcRenderer.invoke('app:getAllPlaylists'),
  getPlaylistById: id => ipcRenderer.invoke('app:getPlaylistById', id),
  updatePlaylist: (id, playlistData) => ipcRenderer.invoke('app:updatePlaylist', id, playlistData),
  updateTrackPosition: (playlistId, trackId, newPosition) => ipcRenderer.invoke('app:updateTrackPosition', playlistId, trackId, newPosition),
  updateTrackPositions: (playlistId, tracks) => ipcRenderer.invoke('app:updateTrackPositions', playlistId, tracks),
  addTrackToPlaylist: (playlistId, trackData) => ipcRenderer.invoke('app:addTrackToPlaylist', playlistId, trackData),
  removeTrackFromPlaylist: (playlistId, trackId) => ipcRenderer.invoke('app:removeTrackFromPlaylist', playlistId, trackId),
  deletePlaylist: id => ipcRenderer.invoke('app:deletePlaylist', id),

  // File operations
  saveM3UPlaylist: (options) => ipcRenderer.invoke('file:saveM3UPlaylist', options),
  openFileInFolder: (filePath) => ipcRenderer.invoke('file:openFileInFolder', filePath),

  // Mixxx integration
  mixxx: {
    getStatus: () => ipcRenderer.invoke('mixxx:getStatus'),
    connect: dbPath => ipcRenderer.invoke('mixxx:connect', dbPath),
    disconnect: () => ipcRenderer.invoke('mixxx:disconnect'),
    getStats: () => ipcRenderer.invoke('mixxx:getStats'),
    getSampleTracks: (limit = 10) =>
      ipcRenderer.invoke('mixxx:getSampleTracks', limit),
    getGenres: () => ipcRenderer.invoke('mixxx:getGenres'),
    getTracks: (filters) => ipcRenderer.invoke('mixxx:getTracks', filters)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
