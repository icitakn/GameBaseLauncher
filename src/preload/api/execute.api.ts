import { UUID } from 'crypto'
import { ipcRenderer } from 'electron'

export const executeApi = {
  execute: (gamebaseId: UUID, gameId: UUID | number) =>
    ipcRenderer.invoke('execute:game', gamebaseId, gameId),

  playMusic: (gamebaseId: UUID, options: { gameId?: number; musicId?: number }) =>
    ipcRenderer.invoke('execute:music', gamebaseId, options)
}
