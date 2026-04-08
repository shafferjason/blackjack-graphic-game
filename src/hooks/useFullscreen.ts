import { useState, useCallback, useEffect } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hudVisible, setHudVisible] = useState(false)

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // Fullscreen API not supported — toggle CSS-only fullscreen
      setIsFullscreen(true)
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        setIsFullscreen(false)
      }
    } catch {
      setIsFullscreen(false)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen || document.fullscreenElement) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  // Sync state with browser fullscreen events
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleHud = useCallback(() => {
    setHudVisible(prev => !prev)
  }, [])

  // Close HUD when leaving fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setHudVisible(false)
    }
  }, [isFullscreen])

  return {
    isFullscreen,
    hudVisible,
    toggleFullscreen,
    toggleHud,
  }
}
