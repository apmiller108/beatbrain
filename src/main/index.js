import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import appDatabase from './database/appDatabase'
import mixxxDatabase from './database/mixxxDatabase'
import icon from '../renderer/src/assets/beatbrain_logo.png?v=0.0.1'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the remote URL for development or the local html file for production.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173') // Vite's default port
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.beatbrain')
  }

  try {
    appDatabase.initialize()
    console.log('Application database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize application', error)
    app.quit()
  }


  // IPC handlers
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })

  ipcMain.handle('app:getPlatform', () => {
    return process.platform
  })

  ipcMain.handle('app:getPath', (_, name) => {
    return app.getPath(name)
  })

  // Mixxx database handlers
  ipcMain.handle('mixxx:getStatus', () => {
    return mixxxDatabase.getStatus()
  })

  ipcMain.handle('mixxx:connect', async(_, dbPath) => {
    return mixxxDatabase.connect(dbPath)
  })

  ipcMain.handle('mixxx:disconnect', async() => {
    return mixxxDatabase.disconnect()
  })

  ipcMain.handle('mixxx:getStats', async() => {
    return mixxxDatabase.getLibraryStats()
  })

  ipcMain.handle('mixxx:getSampleTracks', async(_, limit = 10) => {
    return mixxxDatabase.getSampleTracks(limit)
  })

  ipcMain.handle('mixxx:testConnection', () => {
    return mixxxDatabase.testConnection()
  })

  ipcMain.handle('app:selectDatabaseFile', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Select Mixxx Database File',
      filters: [
        { name: 'SQLite Database', extensions: ['sqlite', 'db'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

  // User preferences handlers
  ipcMain.handle('app:getUserPreference', async (_, category, key) => {
    return appDatabase.getUserPreference(category, key)
  })

  ipcMain.handle('app:setUserPreference', async (_, category, key, value) => {
    return appDatabase.setUserPreference(category, key, value)
  })

  createWindow()
})

app.on('before-quit', () => {
  appDatabase.close()
  mixxxDatabase.disconnect()
})

app.on('window-all-closed', () => {
  app.quit()
})

