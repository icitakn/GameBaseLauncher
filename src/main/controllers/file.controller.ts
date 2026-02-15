import { ipcMain } from 'electron'
import {
  encodeImageToBase64,
  getOrCreateSettings,
  getSettings,
  getSimilarFilesInFolder,
  listFilesInContainer,
  listFilesInZip,
  readC64FromZip,
  readDir
} from '../services/file.service'
import { checkImportFile } from '../services/database.service'
import { GameDTO } from '@shared/models/form-schemes.model'
import path from 'path'
import { promisify } from 'util'
import { exec } from 'child_process'
import * as os from 'os'
import { readdirSync } from 'fs'
import log from 'electron-log'

export const registerFileController = () => {
  ipcMain.handle('file:getOrCreateSettings', async () => {
    return getOrCreateSettings()
  })

  ipcMain.handle('file:checkImportFile', async (_, filename: string) => {
    return checkImportFile(filename)
  })

  ipcMain.handle('file:loadImages', async (_, game: GameDTO, gamebaseId: string) => {
    if (game?.scrnshotFilename) {
      const settings = getSettings()
      const gamebase = settings.gamebases.find((gb) => gb.id === gamebaseId)

      if (!gamebase || !gamebase.folders || !gamebase.folders.images) {
        throw new Error('Image folder not set!', { cause: 1 })
      }

      const imgPath = path.join(gamebase.folders.images, game.scrnshotFilename)
      const files = getSimilarFilesInFolder(imgPath)
      const images = files.map((file) => encodeImageToBase64(file))
      return images
    }

    return []
  })

  ipcMain.handle('file:readDir', async (_event, dirPath) => {
    return await readDir(dirPath)
  })

  ipcMain.handle(
    'file:readFile',
    async (_event, file: string, _filePath: string, archive?: string) => {
      let result
      if ((file as string).endsWith('.zip')) {
        result = listFilesInZip(file)
      } else {
        if (archive) {
          result = readC64FromZip(archive, file)
        } else {
          result = listFilesInContainer(file)
        }
      }
      return result
    }
  )

  const execAsync = promisify(exec)

  ipcMain.handle('file:getAvailableDrives', async () => {
    const platform = os.platform()

    if (platform === 'win32') {
      // Windows: Use WMIC to get drive list
      try {
        const { stdout } = await execAsync('wmic logicaldisk get name,description,volumename')
        const lines = stdout.split('\n').filter((line) => line.trim())
        const drives: { path: string; label: string; description: string }[] = []

        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const match = lines[i].match(/([^\s]+)\s+([A-Z]:)/)
          if (match) {
            const description = match[1]
            const letter = match[2]
            drives.push({
              path: `${letter}\\`,
              label: `${letter}`,
              description: description === 'Local' ? 'Local Disk' : description
            })
          }
        }
        return drives
      } catch (error) {
        log.error('Error getting Windows drives:', error)
        return [{ path: 'C:\\', label: 'C:', description: 'Local Disk' }]
      }
    } else if (platform === 'darwin') {
      // macOS: Check /Volumes
      try {
        const volumesPath = '/Volumes'
        const volumes = readdirSync(volumesPath)

        return volumes.map((volume) => ({
          path: `/Volumes/${volume}`,
          label: volume,
          description: 'Volume'
        }))
      } catch (error) {
        log.error('Error getting macOS volumes:', error)
        return [{ path: '/', label: 'Root', description: 'Root' }]
      }
    } else {
      // Linux/Unix: Return common mount points
      try {
        const { stdout } = await execAsync('df -h | grep "^/"')
        const lines = stdout.split('\n').filter((line) => line.trim())
        const mounts: { path: string; label: string; description: string }[] = []

        for (const line of lines) {
          const parts = line.split(/\s+/)
          if (parts.length >= 6) {
            const mountPoint = parts[5]
            mounts.push({
              path: mountPoint,
              label: mountPoint === '/' ? 'Root' : mountPoint.split('/').pop() || mountPoint,
              description: 'Mount Point'
            })
          }
        }

        return mounts.length > 0 ? mounts : [{ path: '/', label: 'Root', description: 'Root' }]
      } catch (error) {
        log.error('Error getting Linux mounts:', error)
        return [{ path: '/', label: 'Root', description: 'Root' }]
      }
    }
  })
}
