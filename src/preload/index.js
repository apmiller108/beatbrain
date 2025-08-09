import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  getPath: name => ipcRenderer.invoke('app:getPath', name),

  // Future database operations
  // loadDatabase: (path) => ipcRenderer.invoke('db:load', path),
  // getTracks: () => ipcRenderer.invoke('db:getTracks'),
  // getCrates: () => ipcRenderer.invoke('db:getCrates'),

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
