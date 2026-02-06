import { useEffect, useRef, useContext, useCallback } from 'react'
import { Settings, GameBase } from '@shared/models/settings.model'
import { SettingsContext } from '@renderer/contexts/settings.context'

/**
 * Hook for adaptive polling of gamebase states
 * Polls more frequently when import is running, less frequently when stable
 */
export function useGamebasePolling() {
  const { settings, setSettings } = useContext(SettingsContext)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const unchangedCountRef = useRef(0)
  const previousGamebasesRef = useRef<GameBase[] | undefined>(undefined)

  const poll = useCallback(async () => {
    try {
      const updatedSettings: Settings = await window.electron.getOrCreateSettings()

      // Check if something has changed
      const previousJson = JSON.stringify(previousGamebasesRef.current)
      const currentJson = JSON.stringify(updatedSettings.gamebases)
      const hasChanged = previousJson !== currentJson

      if (hasChanged) {
        console.log('Gamebase state changed - resetting interval')
        // IMPORTANT: Create new reference so React detects the update
        setSettings({
          ...updatedSettings,
          gamebases: [...updatedSettings.gamebases]
        })
        unchangedCountRef.current = 0
        previousGamebasesRef.current = updatedSettings.gamebases
      } else {
        unchangedCountRef.current += 1
        console.log(`No change detected - unchanged count: ${unchangedCountRef.current}`)
      }

      // Determine interval
      let nextInterval = 1000 // Default: 1 second

      // If import is running: poll more frequently
      const hasActiveImports = updatedSettings.gamebases?.some(
        (gb) => gb.state && gb.state.endsWith('%')
      )

      if (hasActiveImports) {
        // During import: 1-2 seconds
        nextInterval = hasChanged ? 1000 : 2000
        console.log(`Active import detected - interval: ${nextInterval}ms`)
      } else {
        // No active import: scale up slowly
        if (unchangedCountRef.current >= 10) {
          nextInterval = 30000 // 30 seconds
        } else if (unchangedCountRef.current >= 5) {
          nextInterval = 10000 // 10 seconds
        } else if (unchangedCountRef.current >= 3) {
          nextInterval = 5000 // 5 seconds
        } else {
          nextInterval = 2000 // 2 seconds
        }
        console.log(
          `No active import - interval: ${nextInterval}ms (unchanged: ${unchangedCountRef.current})`
        )
      }

      // Schedule next poll
      timeoutRef.current = setTimeout(poll, nextInterval)
    } catch (error) {
      console.error('Gamebase polling error:', error)
      // Retry after 5 seconds on error
      timeoutRef.current = setTimeout(poll, 5000)
    }
  }, [setSettings]) // setSettings as dependency

  useEffect(() => {
    console.log('Starting gamebase polling')
    // Set initial reference
    previousGamebasesRef.current = settings?.gamebases

    // Start initial poll
    poll()

    // Cleanup
    return () => {
      console.log('Stopping gamebase polling')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [poll]) // poll as dependency

  const hasActiveImports = settings?.gamebases?.some((gb) => gb.state && gb.state.endsWith('%'))

  return { hasActiveImports }
}
