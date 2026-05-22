import { UUID } from 'crypto'
import { useCallback, useState } from 'react'
import { useConfirmDialog } from './useConfirmDialog'
import { toast } from 'react-toastify'
import { t } from 'i18next'

export function useGameLauncher() {
  const [isLoading, setIsLoading] = useState(false)
  const { openConfirmDialog } = useConfirmDialog()

  const launchGame = useCallback(
    async (gamebaseId: UUID, gameId: number, gameName: string, emulatorId?: string) => {
      setIsLoading(true)
      openConfirmDialog({
        mode: 'okonly',
        message: 'Starting ' + gameName,
        title: 'Starting game'
      })
      try {
        const result = await window.electron.execute(gamebaseId, gameId, emulatorId)
        if (result.fileModified) {
          openConfirmDialog({
            mode: 'yesno',
            message: 'Do you want to repack the game?',
            title: 'Repacking'
          }).then(async (result) => {
            if (result) {
            }
          })
        }
      } catch (error) {
        toast.error(t('common.error_occured') + error)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { launchGame, isLoading }
}
