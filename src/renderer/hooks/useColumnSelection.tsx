import { useCallback } from 'react'
import { useSelectedGamebase } from './useGamebase'
import { GameBase } from '@shared/models/settings.model'

export function useColumnSelection(tableName: string) {
  const { selectedGamebase, setSelectedGamebase } = useSelectedGamebase()

  const getColumnKeys = useCallback(
    (defaultKeys: string[]): string[] => {
      if (!selectedGamebase) return defaultKeys
      const saved = selectedGamebase.columnSelections?.[tableName]
      if (Array.isArray(saved) && saved.length > 0) return saved
      return defaultKeys
    },
    [selectedGamebase, tableName]
  )

  const saveColumnKeys = useCallback(
    async (keys: string[]) => {
      if (!selectedGamebase) return
      const updated: GameBase = {
        ...selectedGamebase,
        columnSelections: {
          ...(selectedGamebase.columnSelections ?? {}),
          [tableName]: keys
        }
      }
      setSelectedGamebase?.(updated)
      await window.electron.editGamebase(updated)
    },
    [selectedGamebase, setSelectedGamebase, tableName]
  )

  return { getColumnKeys, saveColumnKeys }
}
