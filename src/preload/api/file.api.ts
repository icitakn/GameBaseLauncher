import { ipcRenderer } from 'electron'
import { GameDTO } from '@shared/models/form-schemes.model'
import { ExtraFileResult } from '@shared/types/file.types'

export const fileApi = {
  getOrCreateSettings: () => ipcRenderer.invoke('file:getOrCreateSettings'),
  checkImportFile: (filename: string) => ipcRenderer.invoke('file:checkImportFile', filename),

  loadPhotoByPath: (imgpath: string, gamebaseId: string) =>
    ipcRenderer.invoke('file:loadPhotoByPath', imgpath, gamebaseId),
  loadImages: (game: GameDTO, gamebaseId: string) =>
    ipcRenderer.invoke('file:loadImages', game, gamebaseId),
  readDir: (path: string) => ipcRenderer.invoke('file:readDir', path),
  readFile: (file: string, path: string, archive?: string) =>
    ipcRenderer.invoke('file:readFile', file, path, archive),
  getAvailableDrives: () => ipcRenderer.invoke('file:getAvailableDrives'),
  readExtra: (
    filePath: string,
    fileToRun: string | undefined,
    extraFolder: string,
    gamebaseId: string
  ): Promise<ExtraFileResult> =>
    ipcRenderer.invoke('file:readExtra', filePath, fileToRun, extraFolder, gamebaseId),
  repackGame: (game: number, gamebaseId: string) =>
    ipcRenderer.invoke('file:repackGame', game, gamebaseId)
}
