import { UUID } from 'crypto'
import { ipcRenderer } from 'electron'
import { EntityType } from '@shared/types/database.types'

export const entityApi = {
  getAll: (
    tableName: string,
    filter: { [name: string]: any[] },
    gamebaseId: UUID,
    useBatching = true
  ) => ipcRenderer.invoke('entity:getAll', tableName, filter, gamebaseId, useBatching),

  getCount: (tableName: string, filter: { [name: string]: any[] }, gamebaseId: UUID) =>
    ipcRenderer.invoke('entity:getCount', tableName, filter, gamebaseId),

  onLoadProgress: (
    callback: (data: {
      tableName: string
      loaded: number
      total: number
      percentage: number
    }) => void
  ) => {
    const subscription = (
      _: any,
      data: {
        tableName: string
        loaded: number
        total: number
        percentage: number
      }
    ) => callback(data)
    ipcRenderer.on('entity:loadProgress', subscription)

    return () => {
      ipcRenderer.removeListener('entity:loadProgress', subscription)
    }
  },

  upsertEntity: (entity: any, type: EntityType, gamebaseId: UUID) =>
    ipcRenderer.invoke('entity:upsertEntity', entity, type, gamebaseId),

  deleteEntity: (entity: any, type: EntityType, gamebaseId: UUID) =>
    ipcRenderer.invoke('entity:deleteEntity', entity, type, gamebaseId)
}
