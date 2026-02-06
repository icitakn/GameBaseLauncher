import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SettingsContext } from '../contexts/settings.context'
import { GameBase } from '@shared/models/settings.model'

export function useSelectedGamebase() {
  const { gamebaseId } = useParams()
  const { settings, setSettings } = useContext(SettingsContext)
  const [selectedGamebase, setSelectedGamebase] = useState<GameBase>()

  useEffect(() => {
    if (gamebaseId && settings) {
      const gamebase = settings.gamebases.find((gb) => gb.id === gamebaseId)
      if (gamebase) {
        setSelectedGamebase(gamebase)
      }
    } else {
      setSelectedGamebase(undefined)
    }
  }, [gamebaseId, settings])

  return { selectedGamebase, setSettings }
}
