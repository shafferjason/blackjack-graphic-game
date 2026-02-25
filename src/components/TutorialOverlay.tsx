import { useState, useRef, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'blackjack-tutorial-dismissed'

function shouldShowOnFirstVisit(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'true'
  } catch {
    return true
  }
}

function persistDismiss(dontShowAgain: boolean): void {
  if (dontShowAgain) {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore storage errors
    }
  }
}

export default function TutorialOverlay() {
  const [open, setOpen] = useState(() => shouldShowOnFirstVisit())
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleClose = useCallback(() => {
    persistDismiss(dontShowAgain)
    setOpen(false)
  }, [dontShowAgain])

  const handleOpen = useCallback(() => {
    setOpen(true)
    setDontShowAgain(false)
  }, [])

  return (
    <>
      <button
        className="help-toggle"
        onClick={handleOpen}
        title="How to Play"
        aria-label="Open how to play tutorial"
      >
        ?
      </button>

      {open && (
        <div
          className="tutorial-overlay"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="How to Play Blackjack"
        >
          <div className="tutorial-panel" onClick={e => e.stopPropagation()}>
            <div className="tutorial-header">
              <h2>How to Play</h2>
              <button
                ref={closeButtonRef}
                className="settings-close"
                onClick={handleClose}
                aria-label="Close tutorial"
              >
                &times;
              </button>
            </div>

            <div className="tutorial-body">
              <section className="tutorial-section">
                <h3 className="tutorial-section-title">Objective</h3>
                <p className="tutorial-text">
                  Beat the dealer by getting a hand value closer to 21 without going over (busting).
                </p>
              </section>

              <section className="tutorial-section">
                <h3 className="tutorial-section-title">Card Values</h3>
                <div className="tutorial-card-values">
                  <div className="tutorial-value-item">
                    <span className="tutorial-value-cards">2–10</span>
                    <span className="tutorial-value-desc">Face value</span>
                  </div>
                  <div className="tutorial-value-item">
                    <span className="tutorial-value-cards">J, Q, K</span>
                    <span className="tutorial-value-desc">Worth 10</span>
                  </div>
                  <div className="tutorial-value-item">
                    <span className="tutorial-value-cards">Ace</span>
                    <span className="tutorial-value-desc">1 or 11</span>
                  </div>
                </div>
              </section>

              <section className="tutorial-section">
                <h3 className="tutorial-section-title">Game Flow</h3>
                <ol className="tutorial-steps">
                  <li>Place your bet using the chip buttons</li>
                  <li>Press <strong>Deal</strong> to receive your cards</li>
                  <li>Choose an action: Hit, Stand, Double, Split, or Surrender</li>
                  <li>The dealer reveals their hand and draws to 17+</li>
                  <li>Closest to 21 wins. Blackjack (Ace + 10) pays 3:2</li>
                </ol>
              </section>

              <section className="tutorial-section">
                <h3 className="tutorial-section-title">Actions</h3>
                <div className="tutorial-actions-grid">
                  <div className="tutorial-action">
                    <kbd className="tutorial-key">H</kbd>
                    <div>
                      <strong>Hit</strong>
                      <span className="tutorial-action-desc">Draw another card</span>
                    </div>
                  </div>
                  <div className="tutorial-action">
                    <kbd className="tutorial-key">S</kbd>
                    <div>
                      <strong>Stand</strong>
                      <span className="tutorial-action-desc">Keep your hand</span>
                    </div>
                  </div>
                  <div className="tutorial-action">
                    <kbd className="tutorial-key">D</kbd>
                    <div>
                      <strong>Double</strong>
                      <span className="tutorial-action-desc">Double bet, one card only</span>
                    </div>
                  </div>
                  <div className="tutorial-action">
                    <kbd className="tutorial-key">P</kbd>
                    <div>
                      <strong>Split</strong>
                      <span className="tutorial-action-desc">Split matching cards</span>
                    </div>
                  </div>
                  <div className="tutorial-action">
                    <kbd className="tutorial-key">R</kbd>
                    <div>
                      <strong>Surrender</strong>
                      <span className="tutorial-action-desc">Forfeit half your bet</span>
                    </div>
                  </div>
                  <div className="tutorial-action">
                    <kbd className="tutorial-key">I</kbd>
                    <div>
                      <strong>Insurance</strong>
                      <span className="tutorial-action-desc">Side bet vs dealer Ace</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="tutorial-section">
                <h3 className="tutorial-section-title">Betting Shortcuts</h3>
                <div className="tutorial-shortcuts">
                  <span><kbd className="tutorial-key">1</kbd>–<kbd className="tutorial-key">4</kbd> Chip amounts</span>
                  <span><kbd className="tutorial-key">C</kbd> Clear bet</span>
                  <span><kbd className="tutorial-key">Enter</kbd> Deal</span>
                  <span><kbd className="tutorial-key">Space</kbd> New round</span>
                </div>
              </section>

              <section className="tutorial-section">
                <h3 className="tutorial-section-title">Basic Strategy Tips</h3>
                <ul className="tutorial-tips">
                  <li>Always stand on 17 or higher</li>
                  <li>Always hit on 8 or below</li>
                  <li>Double down on 11 when dealer shows 2–10</li>
                  <li>Split Aces and 8s, never split 10s or 5s</li>
                  <li>Hit on soft 17 (Ace + 6)</li>
                </ul>
              </section>

              <div className="tutorial-footer">
                <label className="tutorial-checkbox-label">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={e => setDontShowAgain(e.target.checked)}
                    className="tutorial-checkbox"
                  />
                  <span>Don&apos;t show again on startup</span>
                </label>
                <button
                  className="btn btn-primary tutorial-got-it"
                  onClick={handleClose}
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
