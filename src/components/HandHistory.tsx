import { useState, useRef, useEffect } from 'react'
import type { HandHistoryEntry, HandHistoryStep, Card } from '../types'
import { calculateScore } from '../utils/scoring'

interface HandHistoryProps {
  history: HandHistoryEntry[]
}

function cardLabel(card: Card): string {
  const suitSymbols: Record<string, string> = {
    hearts: '\u2665',
    diamonds: '\u2666',
    clubs: '\u2663',
    spades: '\u2660',
  }
  return `${card.rank}${suitSymbols[card.suit] || card.suit}`
}

function cardColor(card: Card): string {
  return card.suit === 'hearts' || card.suit === 'diamonds' ? '#e74c3c' : '#f0ece4'
}

function resultLabel(result: string): string {
  if (result === 'blackjack') return 'Blackjack!'
  return result.charAt(0).toUpperCase() + result.slice(1)
}

function resultClass(result: string): string {
  if (result === 'blackjack') return 'hh-result-win'
  return `hh-result-${result}`
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MiniCards({ cards, hidden }: { cards: Card[]; hidden?: boolean }) {
  return (
    <span className="hh-mini-cards">
      {cards.map((c, i) => (
        <span
          key={i}
          className="hh-mini-card"
          style={{ color: hidden && i === 1 ? '#666' : cardColor(c) }}
        >
          {hidden && i === 1 ? '??' : cardLabel(c)}
        </span>
      ))}
    </span>
  )
}

function HandReplay({ entry, onClose }: { entry: HandHistoryEntry; onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const steps = entry.steps

  const step = steps[stepIndex] as HandHistoryStep | undefined

  const canPrev = stepIndex > 0
  const canNext = stepIndex < steps.length - 1

  const actionLabels: Record<string, string> = {
    deal: 'Deal',
    hit: 'Hit',
    stand: 'Stand',
    double: 'Double Down',
    split: 'Split',
    surrender: 'Surrender',
    insurance: 'Insurance',
    dealer_draw: 'Dealer Draws',
    result: 'Result',
  }

  return (
    <div className="hh-replay">
      <div className="hh-replay-header">
        <h3>Hand #{entry.id} Replay</h3>
        <button className="settings-close" onClick={onClose} aria-label="Close replay">&times;</button>
      </div>

      <div className="hh-replay-body">
        <div className="hh-replay-step-label">
          Step {stepIndex + 1} of {steps.length}: <strong>{actionLabels[step?.action || ''] || step?.action}</strong>
        </div>

        {step && (
          <div className="hh-replay-table">
            <div className="hh-replay-hand">
              <span className="hh-replay-hand-label">Dealer</span>
              <div className="hh-replay-cards">
                {step.dealerHand.map((c, i) => (
                  <span
                    key={i}
                    className="hh-replay-card"
                    style={{ color: !step.dealerRevealed && i === 1 ? '#666' : cardColor(c) }}
                  >
                    {!step.dealerRevealed && i === 1 ? '??' : cardLabel(c)}
                  </span>
                ))}
              </div>
              {step.dealerRevealed && (
                <span className="hh-replay-score">{calculateScore(step.dealerHand)}</span>
              )}
            </div>

            {step.splitHands && step.splitHands.length > 0 ? (
              <div className="hh-replay-splits">
                {step.splitHands.map((sh, i) => (
                  <div key={i} className="hh-replay-hand">
                    <span className="hh-replay-hand-label">Hand {i + 1}</span>
                    <div className="hh-replay-cards">
                      {sh.cards.map((c, j) => (
                        <span key={j} className="hh-replay-card" style={{ color: cardColor(c) }}>
                          {cardLabel(c)}
                        </span>
                      ))}
                    </div>
                    <span className="hh-replay-score">{calculateScore(sh.cards)}</span>
                    {sh.result && (
                      <span className={`hh-replay-badge ${resultClass(sh.result)}`}>
                        {resultLabel(sh.result)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="hh-replay-hand">
                <span className="hh-replay-hand-label">Player</span>
                <div className="hh-replay-cards">
                  {step.playerHand.map((c, i) => (
                    <span key={i} className="hh-replay-card" style={{ color: cardColor(c) }}>
                      {cardLabel(c)}
                    </span>
                  ))}
                </div>
                <span className="hh-replay-score">{calculateScore(step.playerHand)}</span>
              </div>
            )}
          </div>
        )}

        {step?.action === 'result' && (
          <div className={`hh-replay-result ${resultClass(entry.result)}`}>
            {resultLabel(entry.result)} &mdash; Payout: ${entry.payout}
          </div>
        )}

        <div className="hh-replay-controls">
          <button
            className="btn btn-outline hh-replay-btn"
            disabled={!canPrev}
            onClick={() => setStepIndex(s => s - 1)}
            aria-label="Previous step"
          >
            &larr; Prev
          </button>
          <button
            className="btn btn-outline hh-replay-btn"
            disabled={!canNext}
            onClick={() => setStepIndex(s => s + 1)}
            aria-label="Next step"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HandHistory({ history }: HandHistoryProps) {
  const [open, setOpen] = useState(false)
  const [replayEntry, setReplayEntry] = useState<HandHistoryEntry | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, history.length])

  // Focus close button when dialog opens and handle Escape key
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setReplayEntry(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const reversed = [...history].reverse()

  return (
    <>
      <button
        className="stats-toggle"
        onClick={() => setOpen(true)}
        title="Hand History"
        aria-label="Open hand history"
      >
        &#x1F4D6;
      </button>

      {open && (
        <div className="stats-overlay" onClick={() => { setOpen(false); setReplayEntry(null) }} role="dialog" aria-modal="true" aria-label="Hand History">
          <div className="hh-panel" onClick={e => e.stopPropagation()} ref={panelRef}>
            <div className="stats-header">
              <h2>Hand History</h2>
              <button ref={closeButtonRef} className="settings-close" onClick={() => { setOpen(false); setReplayEntry(null) }} aria-label="Close hand history">&times;</button>
            </div>

            {replayEntry ? (
              <HandReplay entry={replayEntry} onClose={() => setReplayEntry(null)} />
            ) : (
              <div className="hh-body">
                {history.length === 0 ? (
                  <div className="hh-empty">No hands played yet.</div>
                ) : (
                  <>
                    <div className="hh-count">{history.length} hand{history.length !== 1 ? 's' : ''} recorded (max 200)</div>
                    <div className="hh-list" ref={listRef}>
                      {reversed.map(entry => (
                        <div key={entry.id} className={`hh-entry ${resultClass(entry.result)}`}>
                          <div className="hh-entry-top">
                            <span className="hh-entry-id">#{entry.id}</span>
                            <span className="hh-entry-time">{formatTime(entry.timestamp)}</span>
                            <span className={`hh-entry-result ${resultClass(entry.result)}`}>
                              {resultLabel(entry.result)}
                            </span>
                          </div>
                          <div className="hh-entry-cards">
                            <span className="hh-entry-label">P:</span>
                            {entry.isSplit && entry.splitResults ? (
                              entry.splitResults.map((sr, i) => (
                                <span key={i} className="hh-split-group">
                                  <MiniCards cards={sr.cards} />
                                  <span className={`hh-mini-result ${resultClass(sr.result)}`}>
                                    {sr.result === 'win' ? 'W' : sr.result === 'lose' ? 'L' : 'P'}
                                  </span>
                                  {i < entry.splitResults!.length - 1 && <span className="hh-split-sep">|</span>}
                                </span>
                              ))
                            ) : (
                              <MiniCards cards={entry.playerFinalHand} />
                            )}
                            <span className="hh-entry-vs">vs</span>
                            <span className="hh-entry-label">D:</span>
                            <MiniCards cards={entry.dealerFinalHand} />
                          </div>
                          <div className="hh-entry-bottom">
                            <span className="hh-entry-bet">Bet: ${entry.bet}{entry.insuranceBet > 0 ? ` (+$${entry.insuranceBet} ins)` : ''}</span>
                            <span className="hh-entry-payout">Payout: ${entry.payout}</span>
                            <span className="hh-entry-actions">
                              {entry.actions.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                            </span>
                          </div>
                          {entry.steps.length > 0 && (
                            <button
                              className="hh-replay-trigger"
                              onClick={() => setReplayEntry(entry)}
                              aria-label={`Replay hand #${entry.id}`}
                            >
                              Replay
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
