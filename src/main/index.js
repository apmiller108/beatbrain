import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import fs from 'fs'
import appDatabase from './database/appDatabase'
import mixxxDatabase from './database/mixxxDatabase'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: join(__dirname, './assets/beatbrain_logo.png') } : {}),
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

function initializeAppDataDir() {
  const userDataPath = app.getPath('userData')

  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.beatbrain')
  }

  try {
    initializeAppDataDir()
    appDatabase.initialize(app.getPath('userData'))
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

  createWindow()
})

app.on('before-quit', () => {
  appDatabase.close()
  mixxxDatabase.disconnect()
})

app.on('window-all-closed', () => {
  app.quit()
})
