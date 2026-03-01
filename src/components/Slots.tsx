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
  const isJackpot = isResult && state.isJackpot

  const handleBetChange = useCallback((amount: number) => {
    setBet(amount)
  }, [setBet])

  return (
    <div className={`slots-machine ${isJackpot ? 'slots-machine--jackpot' : ''}`}>
      {/* Cabinet top — arched marquee with retro title */}
      <div className="slots-cabinet-top">
        <div className="slots-cabinet-top__arch" />
        <div className="slots-marquee">
          <div className="slots-marquee__lights">
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="slots-marquee__bulb" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <h2 className="slots-title">
            {isJackpot ? '★ JACKPOT ★' : '♦ LUCKY 7s ♦'}
          </h2>
          <div className="slots-marquee__lights">
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="slots-marquee__bulb" style={{ animationDelay: `${(i + 7) * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Grand jackpot payout panel */}
      <div className="slots-payout-bar">
        <button
          className="slots-paytable-toggle"
          onClick={() => setShowPaytable(!showPaytable)}
          aria-expanded={showPaytable}
        >
          {showPaytable ? 'Hide Paytable' : 'Show Paytable'}
        </button>
        <div className="slots-payout-bar__jackpot">
          GRAND JACKPOT 7-7-7: <span className="slots-payout-bar__jackpot-value">777×</span>
        </div>
      </div>

      {/* Paytable */}
      {showPaytable && (
        <div className="slots-paytable" role="table" aria-label="Payout table">
          {PAYOUT_TABLE.map((entry, i) => (
            <div key={i} className={`slots-paytable__row ${entry.isJackpot ? 'slots-paytable__row--jackpot' : ''}`}>
              <span className="slots-paytable__desc">{entry.description}</span>
              <span className={`slots-paytable__mult ${entry.isJackpot ? 'slots-paytable__mult--jackpot' : ''}`}>×{entry.multiplier}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reel window — 3 vertical reel windows with strong bezel borders */}
      <div className={`slots-reels-frame ${isWin ? 'slots-reels-frame--win' : ''} ${isJackpot ? 'slots-reels-frame--jackpot' : ''}`}>
        <div className="slots-reels-frame__glass" />
        <div className="slots-payline" />
        <div className="slots-reels">
          {state.reels.map((symbol, i) => (
            <ReelSymbol key={i} symbol={symbol} spinning={isSpinning} index={i} />
          ))}
        </div>
      </div>

      {/* Win label */}
      {isResult && state.winLabel && (
        <div className={`slots-win-label ${isWin ? 'slots-win-label--big' : ''} ${isJackpot ? 'slots-win-label--jackpot' : ''}`}>
          {isJackpot && <span className="slots-win-label__stars">★ </span>}
          {state.winLabel}
          {isJackpot && <span className="slots-win-label__stars"> ★</span>}
          {state.winAmount > 0 && <span className="slots-win-amount"> — ${state.winAmount}</span>}
        </div>
      )}

      {/* Message */}
      <div className={`slots-message ${isWin ? 'slots-message--win' : ''} ${isJackpot ? 'slots-message--jackpot' : ''}`}>
        <p>{state.message}</p>
      </div>

      {/* Cabinet body — controls panel with lever */}
      <div className="slots-controls-panel">
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

        {/* Spin button with decorative side lever */}
        <div className="slots-controls">
          {isIdle && (
            <>
              <button
                className="slots-spin-btn"
                onClick={spin}
                disabled={state.bet > chips || state.bet <= 0}
              >
                <span className="slots-spin-btn__icon">▶</span>
                SPIN — ${state.bet}
              </button>
              {/* Decorative side lever */}
              <div className="slots-lever-inline" aria-hidden="true">
                <div className="slots-lever__knob" />
                <div className="slots-lever__shaft" />
                <div className="slots-lever__base" />
              </div>
            </>
          )}
          {isResult && (
            <>
              <button
                className="slots-spin-btn"
                onClick={() => { newRound(); setTimeout(spin, 50) }}
                disabled={state.bet > chips || state.bet <= 0}
              >
                <span className="slots-spin-btn__icon">▶</span>
                SPIN AGAIN — ${state.bet}
              </button>
              <div className="slots-lever-inline" aria-hidden="true">
                <div className="slots-lever__knob" />
                <div className="slots-lever__shaft" />
                <div className="slots-lever__base" />
              </div>
            </>
          )}
          {isSpinning && (
            <div className="slots-spinning-text">
              <div className="slots-spinning-text__dot" />
              Spinning...
            </div>
          )}
        </div>
      </div>

      {/* Coin tray — recent wins */}
      {state.lastWins.length > 0 && (
        <div className="slots-coin-tray">
          <span className="slots-coin-tray__label">Coin Tray — Recent Wins</span>
          <div className="slots-coin-tray__list">
            {state.lastWins.map((w, i) => (
              <div key={i} className="slots-coin-tray__entry">
                {w.reels.map(s => SYMBOL_DISPLAY[s]).join(' ')} — ${w.amount}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
