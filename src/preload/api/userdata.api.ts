import { GameUserDataDTO } from '@shared/models/form-schemes.model'
import { GameBase, GamePlayed, MusicListened } from '@shared/models/settings.model'
import { ipcRenderer } from 'electron'
import { UUID } from 'node:crypto'

export const userdataApi = {
  getGamebaseStats: (
    gamebase: GameBase
  ): Promise<{ gameSessions: GamePlayed[]; musicSessions: MusicListened[] }> =>
    ipcRenderer.invoke('userdata:getGamebaseStats', gamebase.id),

  getGameUserdata: (gameId: number, gamebaseId: UUID): Promise<GameUserDataDTO> =>
    ipcRenderer.invoke('userdata:get', gameId, gamebaseId)
}
