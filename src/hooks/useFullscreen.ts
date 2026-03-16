import { useState, useCallback, useEffect, useRef } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hudVisible, setHudVisible] = useState(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // Fallscreen API not supported — toggle CSS-only fullscreen
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

  // Auto-hide HUD after inactivity in fullscreen
  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      setHudVisible(false)
    }, 3000)
  }, [])

  const showHud = useCallback(() => {
    setHudVisible(true)
    scheduleHide()
  }, [scheduleHide])

  // When entering fullscreen, show HUD briefly then auto-hide
  useEffect(() => {
    if (isFullscreen) {
      setHudVisible(true)
      scheduleHide()
    } else {
      setHudVisible(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [isFullscreen, scheduleHide])

  // Track mouse/touch movement in fullscreen to reveal HUD
  useEffect(() => {
    if (!isFullscreen) return

    const handleMove = () => showHud()
    const handleTouch = () => showHud()

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchstart', handleTouch)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchstart', handleTouch)
    }
  }, [isFullscreen, showHud])

  return {
    isFullscreen,
    hudVisible,
    toggleFullscreen,
    showHud,
  }
}
