import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
// import icon from '../../resources/icon.png?asset'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
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

  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

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

// Future database handlers
// ipcMain.handle('db:load', async (_, dbPath) => {
//   // Database loading logic
// })

// Future Claude API handlers
// ipcMain.handle('claude:query', async (_, query) => {
//   // Claude API logic
// })
