import { ipcRenderer } from 'electron'
import { GameDTO } from '@shared/models/form-schemes.model'

export const fileApi = {
  getOrCreateSettings: () => ipcRenderer.invoke('file:getOrCreateSettings'),
  checkImportFile: (filename: string) => ipcRenderer.invoke('file:checkImportFile', filename),

  loadImages: (game: GameDTO, gamebaseId: string) =>
    ipcRenderer.invoke('file:loadImages', game, gamebaseId),
  readDir: (path: string) => ipcRenderer.invoke('file:readDir', path),
  readFile: (file: string, path: string, archive?: string) =>
    ipcRenderer.invoke('file:readFile', file, path, archive)
}
