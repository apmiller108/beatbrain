import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import appDatabase from './database/appDatabase'
import mixxxDatabase from './database/mixxxDatabase'
import { registerAppDatabaseHandlers } from './ipc/appDatabaseHandlers'
import { registerMixxxDatabaseHandlers } from './ipc/mixxxDatabaseHandlers'
import { registerFileHandlers } from './ipc/fileHandlers'

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

  registerAppDatabaseHandlers(appDatabase)
  registerMixxxDatabaseHandlers(mixxxDatabase)
  registerFileHandlers()

  createWindow()
})

app.on('before-quit', () => {
  appDatabase.close()
  mixxxDatabase.disconnect()
})

app.on('window-all-closed', () => {
  app.quit()
})
