import 'reflect-metadata'
import { app, BrowserWindow, session, protocol, net } from 'electron'
import path from 'path'
import { registerGamebaseController, shutdown } from './controllers/gamebase.controller'
import { registerEntityController } from './controllers/entity.controller'
import { registerExecuteController } from './controllers/execute.controller'
import { registerFileController } from './controllers/file.controller'
import { is } from '@electron-toolkit/utils'
import log from 'electron-log'
import { platform } from 'os'
import { registerUserDataController } from './controllers/userdata.controller'

let appUrl = 'http://localhost:5173'
const wsUrl = 'ws://localhost:5173'
const CHROMIUM_PDF_VIEWER = 'chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai'

const createWindow = (): void => {
  registerEntityController()
  registerExecuteController()
  registerGamebaseController()
  registerFileController()
  registerUserDataController()

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
      // devTools: false,
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // Development Mode
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then(() => {
      appUrl = mainWindow.webContents.getURL()
    })
  } else {
    // Production Mode
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).then(() => {
      appUrl = mainWindow.webContents.getURL()
    })
  }

  // Open the DevTools only in development
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }

  log.initialize()

  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const allowed =
      details.url.startsWith('file://') ||
      details.url.startsWith('localfile://') ||
      details.url.startsWith('blob:') ||
      details.url.startsWith(CHROMIUM_PDF_VIEWER) ||
      details.url.startsWith('chrome://') ||
      details.url.startsWith('devtools://') ||
      details.url.startsWith(appUrl) ||
      details.url.startsWith(wsUrl)

    if (!allowed) {
      console.warn('BLOCKED:', details.url)
      log.warn('Blocking access to ' + details.url)
    }

    callback({ cancel: !allowed })
  })
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length > 0) {
      const mainWindow = allWindows[0]
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'localfile',
      privileges: {
        standard: true,
        secure: true,
        stream: true,
        supportFetchAPI: true,
        bypassCSP: true
      }
    }
  ])

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  app.whenReady().then(() => {
    protocol.handle('localfile', async (request) => {
      let rawPath = request.url.replace('localfile://', '')
      rawPath = rawPath.replace(/^([a-zA-Z])\//, '$1:/')
      const fileUrl = platform() === 'win32' ? `file:///${rawPath}` : `file://${rawPath}`

      console.log('Protocol request URL:', request.url)
      console.log('Raw path:', rawPath)
      console.log('File URL:', fileUrl)

      try {
        const response = await net.fetch(fileUrl)
        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        return response
      } catch (error) {
        console.error('Protocol handler error:', error)
        throw error
      }
    })

    createWindow()

    app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
}

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  shutdown()
})

process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))
