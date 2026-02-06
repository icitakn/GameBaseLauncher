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
}
