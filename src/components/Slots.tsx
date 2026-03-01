import { useState, useCallback } from 'react'
import { useSlots, SYMBOL_DISPLAY, PAYOUT_TABLE } from '../hooks/useSlots'
import type { SlotSymbol } from '../hooks/useSlots'

interface SlotsProps {
  chips: number
  onChipsChange: (newChips: number) => void
}

const BET_OPTIONS = [1, 5, 10, 25, 50, 100]

function ReelSymbol({ symbol, spinning, index }: { symbol: SlotSymbol; spinning: boolean; index: number }) {
  return (
    <div className={`slots-reel ${spinning ? 'slots-reel--spinning' : ''}`} style={spinning ? { animationDelay: `${index * 0.15}s` } : undefined}>
      <div className="slots-reel__symbol">
        {SYMBOL_DISPLAY[symbol]}
      </div>
    </div>
  )
}

export default function Slots({ chips, onChipsChange }: SlotsProps) {
  const { state, setBet, spin, newRound } = useSlots(chips, onChipsChange)
  const [showPaytable, setShowPaytable] = useState(false)

  const isIdle = state.phase === 'idle'
  const isSpinning = state.phase === 'spinning'
  const isResult = state.phase === 'result'
  const isWin = isResult && state.winAmount > state.bet

  const handleBetChange = useCallback((amount: number) => {
    setBet(amount)
  }, [setBet])

  return (
    <div className="slots-machine">
      {/* Header */}
      <div className="slots-header">
        <h2 className="slots-title">SLOTS</h2>
        <button
          className="slots-paytable-toggle"
          onClick={() => setShowPaytable(!showPaytable)}
          aria-expanded={showPaytable}
        >
          {showPaytable ? 'Hide' : 'Paytable'}
        </button>
      </div>

      {/* Paytable */}
      {showPaytable && (
        <div className="slots-paytable" role="table" aria-label="Payout table">
          {PAYOUT_TABLE.map((entry, i) => (
            <div key={i} className="slots-paytable__row">
              <span className="slots-paytable__desc">{entry.description}</span>
              <span className="slots-paytable__mult">x{entry.multiplier}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reels */}
      <div className={`slots-reels-frame ${isWin ? 'slots-reels-frame--win' : ''}`}>
        <div className="slots-reels">
          {state.reels.map((symbol, i) => (
            <ReelSymbol key={i} symbol={symbol} spinning={isSpinning} index={i} />
          ))}
        </div>
      </div>

      {/* Win label */}
      {isResult && state.winLabel && (
        <div className={`slots-win-label ${isWin ? 'slots-win-label--big' : ''}`}>
          {state.winLabel}
          {state.winAmount > 0 && <span className="slots-win-amount"> — ${state.winAmount}</span>}
        </div>
      )}

      {/* Message */}
      <div className={`slots-message ${isWin ? 'slots-message--win' : ''}`}>
        <p>{state.message}</p>
      </div>

      {/* Bet controls */}
      {(isIdle || isResult) && (
        <div className="slots-bet-area">
          <span className="slots-bet-label">Bet:</span>
          <div className="slots-bet-options" role="radiogroup" aria-label="Select bet amount">
            {BET_OPTIONS.filter(a => a <= chips || a === state.bet).map(amount => (
              <button
                key={amount}
                className={`slots-bet-btn ${state.bet === amount ? 'slots-bet-btn--active' : ''}`}
                onClick={() => handleBetChange(amount)}
                disabled={amount > chips}
                role="radio"
                aria-checked={state.bet === amount}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="slots-controls">
        {isIdle && (
          <button
            className="btn btn-primary btn-lg slots-spin-btn"
            onClick={spin}
            disabled={state.bet > chips || state.bet <= 0}
          >
            SPIN — ${state.bet}
          </button>
        )}
        {isResult && (
          <button
            className="btn btn-primary btn-lg slots-spin-btn"
            onClick={() => { newRound(); setTimeout(spin, 50) }}
            disabled={state.bet > chips || state.bet <= 0}
          >
            SPIN AGAIN — ${state.bet}
          </button>
        )}
        {isSpinning && (
          <div className="slots-spinning-text">
            <div className="slots-spinning-text__dot" />
            Spinning...
          </div>
        )}
      </div>

      {/* Recent wins */}
      {state.lastWins.length > 0 && (
        <div className="slots-recent-wins">
          <span className="slots-recent-wins__label">Recent Wins</span>
          <div className="slots-recent-wins__list">
            {state.lastWins.map((w, i) => (
              <div key={i} className="slots-recent-wins__entry">
                {w.reels.map(s => SYMBOL_DISPLAY[s]).join(' ')} — ${w.amount}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
