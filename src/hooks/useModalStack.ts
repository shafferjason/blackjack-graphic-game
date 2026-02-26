import { useEffect, useRef, useCallback } from 'react'

// Global modal stack — each open modal registers a close handler.
// Escape key closes only the topmost modal.
const modalStack: Array<{ id: string; close: () => void }> = []

let globalListenerAttached = false

function attachGlobalListener() {
  if (globalListenerAttached) return
  globalListenerAttached = true
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && modalStack.length > 0) {
      e.stopPropagation()
      const topmost = modalStack[modalStack.length - 1]
      topmost.close()
    }
  })
}

let nextId = 0

export function useModalStack(open: boolean, onClose: () => void) {
  const idRef = useRef(`modal-${++nextId}`)

  // Keep onClose ref fresh to avoid stale closures
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const stableClose = useCallback(() => {
    onCloseRef.current()
  }, [])

  useEffect(() => {
    attachGlobalListener()

    if (!open) return

    const entry = { id: idRef.current, close: stableClose }
    modalStack.push(entry)

    return () => {
      const idx = modalStack.findIndex(m => m.id === entry.id)
      if (idx >= 0) modalStack.splice(idx, 1)
    }
  }, [open, stableClose])
}
