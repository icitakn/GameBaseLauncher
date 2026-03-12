import { UUID } from 'crypto'
import { ipcRenderer } from 'electron'

export const executeApi = {
  execute: (gamebaseId: UUID, gameId: UUID | number, emulatorId?: string) =>
    ipcRenderer.invoke('execute:game', gamebaseId, gameId, emulatorId),

  playMusic: (gamebaseId: UUID, options: { gameId?: number; musicId?: number }) =>
    ipcRenderer.invoke('execute:music', gamebaseId, options)
}
