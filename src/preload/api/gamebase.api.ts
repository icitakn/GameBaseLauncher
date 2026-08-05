import { ipcRenderer } from 'electron'
import { UUID } from 'crypto'
import { GameBase, GamebaseInfo, Settings } from '../../shared/models/settings.model'

export const gamebaseApi = {
  editGamebase: (gamebase: GameBase) => ipcRenderer.invoke('gamebase:editGamebase', gamebase),
  addGamebase: (gamebase: GameBase) => ipcRenderer.invoke('gamebase:addGamebase', gamebase),
  deleteGamebase: (gamebaseId: UUID) => ipcRenderer.invoke('gamebase:deleteGamebase', gamebaseId),
  getLicenses: () => ipcRenderer.invoke('gamebase:getLicenses'),
  getAppInfo: () => ipcRenderer.invoke('gamebase:getAppInfo'),
  saveSettings: (settings: Settings) => ipcRenderer.invoke('gamebase:saveSettings', settings),
  getGamebaseInfo: (gamebaseId: UUID): Promise<GamebaseInfo> =>
    ipcRenderer.invoke('gamebase:getInfo', gamebaseId)
}
