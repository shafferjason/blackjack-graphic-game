import { useEffect } from 'react'

/**
 * Locks body scroll when a modal is open to prevent background content
 * from scrolling on mobile devices. Uses a counter to handle nested modals.
 */
let lockCount = 0

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    lockCount++
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      lockCount--
      if (lockCount === 0) {
        document.body.style.overflow = prev
      }
    }
  }, [active])
}
