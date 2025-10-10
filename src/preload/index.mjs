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

  selectDatabaseFile: () => ipcRenderer.invoke('app:selectDatabaseFile'),
  mixxx: {
    getStatus: () => ipcRenderer.invoke('mixxx:getStatus'),
    connect: dbPath => ipcRenderer.invoke('mixxx:connect', dbPath),
    disconnect: () => ipcRenderer.invoke('mixxx:disconnect'),
    getStats: () => ipcRenderer.invoke('mixxx:getStats'),
    getSampleTracks: (limit = 10) =>
      ipcRenderer.invoke('mixxx:getSampleTracks', limit),
    getGenres: () => ipcRenderer.invoke('mixxx:getGenres')
  },

  // Future Claude API operations
  // sendQuery: (query) => ipcRenderer.invoke('claude:query', query),
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
