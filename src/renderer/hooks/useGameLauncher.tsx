import { UUID } from 'crypto'
import { useCallback, useState } from 'react'
import { useConfirmDialog } from './useConfirmDialog'
import { toast } from 'react-toastify'
import { t } from 'i18next'
import { useSelectedGamebase } from './useGamebase'

export function useGameLauncher() {
  const [isLoading, setIsLoading] = useState(false)
  const { openConfirmDialog } = useConfirmDialog()
  const { selectedGamebase } = useSelectedGamebase()

  const launchGame = useCallback(
    async (gamebaseId: UUID, gameId: number, gameName: string, emulatorId?: string) => {
      setIsLoading(true)
      openConfirmDialog({
        mode: 'okonly',
        message: t('game.launch.message') + gameName,
        title: t('game.launch.title')
      })
      try {
        const result = await window.electron.execute(gamebaseId, gameId, emulatorId)
        if (selectedGamebase?.repacking?.repackGames && result.fileModified) {
          let repack = true
          if (selectedGamebase?.repacking?.askBefore) {
            openConfirmDialog({
              mode: 'yesno',
              message: t('game.launch.repack'),
              title: t('game.launch.repack_title')
            }).then(async (result) => {
              repack = result
            })
          }

          if (repack) {
            const result = await window.electron.repackGame(gameId, gamebaseId)
            if (selectedGamebase.repacking.notifyAfter) {
              if (result) {
                toast.success(t('game.launch.repack_success'))
              } else {
                toast.success(t('game.launch.repack_failed'))
              }
            }
          }
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
