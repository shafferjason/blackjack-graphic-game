import { useState } from 'react'
import { getHiLoValue, calculateTrueCount, getDecksRemaining, getCountAdvice } from '../utils/counting'
import type { Card } from '../types'

interface CountingOverlayProps {
  runningCount: number
  cardsRemaining: number
  lastDealtCard: Card | null
  accuracy: { correct: number; total: number }
  selfTestMode: boolean
  onToggleSelfTest: () => void
  onSubmitCount: (guess: number) => void
  showCountInput: boolean
}

export default function CountingOverlay({
  runningCount,
  cardsRemaining,
  lastDealtCard,
  accuracy,
  selfTestMode,
  onToggleSelfTest,
  onSubmitCount,
  showCountInput,
}: CountingOverlayProps) {
  const [countGuess, setCountGuess] = useState('')

  const decksRemaining = getDecksRemaining(cardsRemaining)
  const trueCount = calculateTrueCount(runningCount, decksRemaining)
  const advice = getCountAdvice(trueCount)
  const accuracyPct = accuracy.total > 0
    ? Math.round((accuracy.correct / accuracy.total) * 100)
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const guess = parseInt(countGuess, 10)
    if (!isNaN(guess)) {
      onSubmitCount(guess)
      setCountGuess('')
    }
  }

  const lastCardValue = lastDealtCard ? getHiLoValue(lastDealtCard) : null
  const lastCardLabel = lastCardValue !== null
    ? (lastCardValue > 0 ? '+1' : lastCardValue < 0 ? '-1' : '0')
    : null

  return (
    <div className="counting-overlay" role="region" aria-label="Card counting practice">
      {!selfTestMode && (
        <div className="counting-counts">
          <div className="counting-count-item">
            <span className="counting-label">Running</span>
            <span className={`counting-value ${runningCount > 0 ? 'count-positive' : runningCount < 0 ? 'count-negative' : ''}`}>
              {runningCount > 0 ? '+' : ''}{runningCount}
            </span>
          </div>
          <div className="counting-count-item">
            <span className="counting-label">True</span>
            <span className={`counting-value ${trueCount > 0 ? 'count-positive' : trueCount < 0 ? 'count-negative' : ''}`}>
              {trueCount > 0 ? '+' : ''}{trueCount}
            </span>
          </div>
          {lastDealtCard && (
            <div className="counting-count-item counting-last-card">
              <span className="counting-label">Last</span>
              <span className={`counting-value ${lastCardValue! > 0 ? 'count-positive' : lastCardValue! < 0 ? 'count-negative' : ''}`}>
                {lastCardLabel}
              </span>
            </div>
          )}
        </div>
      )}

      {selfTestMode && !showCountInput && (
        <div className="counting-hidden-badge">
          <span className="counting-hidden-icon">?</span>
          <span className="counting-hidden-text">Count hidden — track mentally</span>
        </div>
      )}

      {selfTestMode && showCountInput && (
        <form className="counting-guess-form" onSubmit={handleSubmit}>
          <label className="counting-guess-label">What's the running count?</label>
          <div className="counting-guess-row">
            <input
              type="number"
              className="counting-guess-input"
              value={countGuess}
              onChange={e => setCountGuess(e.target.value)}
              placeholder="0"
              autoFocus
              aria-label="Enter your count guess"
            />
            <button type="submit" className="btn counting-guess-btn">Check</button>
          </div>
        </form>
      )}

      {!selfTestMode && (
        <div className="counting-advice" aria-live="polite">
          {advice}
        </div>
      )}

      <div className="counting-footer">
        {accuracy.total > 0 && (
          <span className="counting-accuracy">
            Accuracy: {accuracyPct}% ({accuracy.correct}/{accuracy.total})
          </span>
        )}
        <button
          className="counting-toggle-test"
          onClick={onToggleSelfTest}
          aria-pressed={selfTestMode}
        >
          {selfTestMode ? 'Show Count' : 'Self-Test'}
        </button>
      </div>
    </div>
  )
}
