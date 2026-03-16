import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { usePokerDraw, DRAW_PAYOUT_TABLE } from '../hooks/usePokerDraw'
import type { Card as CardType } from '../types'
import type { PokerHandRank } from '../utils/pokerHands'
import Card from './Card'
import {
  playCardDeal,
  playChipPlace,
  playChipCollect,
  playWinFanfare,
  playLossThud,
  playButtonClick,
} from '../utils/sound'

interface PokerDrawProps {
  chips: number
  onChipsChange: (newChips: number) => void
}

const CHIP_DENOMINATIONS = [5, 10, 25, 50, 100]

const PAYOUT_LABELS: { rank: PokerHandRank; label: string }[] = [
  { rank: 'royal_flush', label: 'Royal Flush' },
  { rank: 'straight_flush', label: 'Straight Flush' },
  { rank: 'four_of_a_kind', label: 'Four of a Kind' },
  { rank: 'full_house', label: 'Full House' },
  { rank: 'flush', label: 'Flush' },
  { rank: 'straight', label: 'Straight' },
  { rank: 'three_of_a_kind', label: 'Three of a Kind' },
  { rank: 'two_pair', label: 'Two Pair' },
  { rank: 'one_pair', label: 'Jacks or Better' },
]

/* Win celebration sparkle burst */
function WinBurst() {
  const sparkles = useMemo(() => {
    const count = 12
    return Array.from({ length: count }, (_, i) => ({
      angle: (360 / count) * i,
      distance: 50 + Math.random() * 60,
      delay: i * 35,
    }))
  }, [])

  return (
    <div className="pd-win-burst" aria-hidden="true">
      {sparkles.map((s, i) => (
        <div
          key={i}
          className="pd-win-burst__sparkle"
          style={{
            '--sparkle-angle': `${s.angle}deg`,
            '--sparkle-distance': `${s.distance}px`,
            '--sparkle-delay': `${s.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

export default function PokerDraw({ chips, onChipsChange }: PokerDrawProps) {
  const { state, actions } = usePokerDraw(chips, onChipsChange)
  const [cardAnimating, setCardAnimating] = useState<boolean[]>([false, false, false, false, false])

  const isBetting = state.phase === 'betting'
  const isHolding = state.phase === 'holding'
  const isResult = state.phase === 'result'
  const isWin = isResult && state.winAmount > 0

  // ── Audio effects ──
  const prevPhaseRef = useRef(state.phase)
  useEffect(() => {
    const prev = prevPhaseRef.current
    prevPhaseRef.current = state.phase

    if (state.phase === 'holding' && prev === 'betting') {
      // Deal sound
      for (let i = 0; i < 5; i++) {
        setTimeout(() => playCardDeal(), i * 80)
      }
    }

    if (state.phase === 'result' && prev === 'holding') {
      // Draw replacement card sounds
      const discardCount = state.held.filter(h => !h).length
      for (let i = 0; i < discardCount; i++) {
        setTimeout(() => playCardDeal(), i * 80)
      }
      // Win/loss after cards settle
      setTimeout(() => {
        if (state.winAmount > 0) {
          playWinFanfare()
          setTimeout(() => playChipCollect(), 300)
        } else {
          playLossThud()
        }
      }, discardCount * 80 + 300)
    }
  }, [state.phase, state.winAmount, state.held])

  // ── Bet chip sound ──
  const prevBetRef = useRef(state.bet)
  useEffect(() => {
    if (state.bet > prevBetRef.current) {
      playChipPlace()
    }
    prevBetRef.current = state.bet
  }, [state.bet])

  // ── Card draw animation ──
  useEffect(() => {
    if (state.phase === 'result' && state.hasDrawn) {
      const newAnimating = state.held.map(h => !h)
      setCardAnimating(newAnimating)
      const t = setTimeout(() => setCardAnimating([false, false, false, false, false]), 500)
      return () => clearTimeout(t)
    }
  }, [state.phase, state.hasDrawn, state.held])

  const handleDeal = useCallback(() => {
    playButtonClick()
    actions.deal()
  }, [actions])

  const handleDraw = useCallback(() => {
    playButtonClick()
    actions.draw()
  }, [actions])

  const handleNewRound = useCallback(() => {
    playButtonClick()
    actions.newRound()
  }, [actions])

  const handleToggleHold = useCallback((index: number) => {
    playButtonClick()
    actions.toggleHold(index)
  }, [actions])

  const handlePlaceBet = useCallback((amount: number) => {
    actions.placeBet(amount)
  }, [actions])

  // ── Table styling classes ──
  const tableClass = [
    'pd-table',
    isBetting ? 'pd-table--idle' : '',
    isHolding ? 'pd-table--active' : '',
    isWin ? 'pd-table--win' : '',
    isResult && !isWin ? 'pd-table--lose' : '',
  ].filter(Boolean).join(' ')

  const bannerClass = [
    'pd-banner',
    isWin ? 'pd-banner--win' : '',
    isResult && !isWin ? 'pd-banner--lose' : '',
  ].filter(Boolean).join(' ')

  // Highlight matching payout row
  const matchingRank = isResult && state.handResult
    ? (state.handResult.rank === 'one_pair' && state.winAmount === 0
      ? null // non-qualifying pair
      : state.handResult.rank === 'high_card'
        ? null
        : state.handResult.rank)
    : null

  return (
    <div className={tableClass}>
      {/* Payout table */}
      <div className="pd-payout-table" aria-label="Payout table">
        <div className="pd-payout-table__title">Payouts</div>
        <div className="pd-payout-table__grid">
          {PAYOUT_LABELS.map(({ rank, label }) => (
            <div
              key={rank}
              className={[
                'pd-payout-row',
                matchingRank === rank ? 'pd-payout-row--active' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="pd-payout-row__hand">{label}</span>
              <span className="pd-payout-row__mult">{DRAW_PAYOUT_TABLE[rank]}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards area */}
      <div className="pd-cards-area" aria-label="Your hand">
        {state.hand.length > 0 ? (
          <div className="pd-hand">
            {state.hand.map((card, i) => (
              <div key={`${card.rank}-${card.suit}-${i}`} className="pd-card-slot">
                {isHolding && state.held[i] && (
                  <div className="pd-held-badge">HELD</div>
                )}
                <button
                  className={[
                    'pd-card-wrapper',
                    isHolding ? 'pd-card-wrapper--interactive' : '',
                    isHolding && state.held[i] ? 'pd-card-wrapper--held' : '',
                    cardAnimating[i] ? 'pd-card--replacing' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={isHolding ? () => handleToggleHold(i) : undefined}
                  disabled={!isHolding}
                  aria-label={`${card.rank} of ${card.suit}${state.held[i] ? ' (held)' : ''}`}
                  aria-pressed={isHolding ? state.held[i] : undefined}
                >
                  <Card card={card} index={i} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="pd-empty-hand">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="pd-card-placeholder" />
            ))}
          </div>
        )}
      </div>

      {/* Win sparkles */}
      {isWin && <WinBurst />}

      {/* Banner */}
      <div className={bannerClass}>
        <p>{state.message}</p>
        {isResult && state.handResult && (
          <div className="pd-result-detail">
            {isWin && <span className="pd-result-payout">+${state.winAmount}</span>}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="pd-controls">
        {isBetting && (
          <div className="pd-betting">
            <div className="pd-bet-display">
              <span className="pd-bet-label">Bet</span>
              <span className="pd-bet-amount">${state.bet}</span>
            </div>
            <div className="pd-chip-row">
              {CHIP_DENOMINATIONS.map(denom => (
                <button
                  key={denom}
                  className="pd-chip-btn"
                  onClick={() => handlePlaceBet(denom)}
                  disabled={state.chips - state.bet < denom}
                  aria-label={`Bet $${denom}`}
                >
                  ${denom}
                </button>
              ))}
            </div>
            <div className="pd-bet-actions">
              <button
                className="btn btn-outline"
                onClick={() => { playButtonClick(); actions.clearBet() }}
                disabled={state.bet === 0}
              >
                Clear
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleDeal}
                disabled={state.bet === 0}
              >
                Deal
              </button>
            </div>
          </div>
        )}

        {isHolding && (
          <div className="pd-hold-controls">
            <p className="pd-hold-hint">Tap cards to hold, then draw.</p>
            <button className="btn btn-primary btn-lg" onClick={handleDraw}>
              Draw
            </button>
          </div>
        )}

        {isResult && (
          <button className="btn btn-primary btn-lg" onClick={handleNewRound}>
            Play Again
          </button>
        )}
      </div>

      {/* Chip display */}
      <div className="pd-chips-display">
        <span className="pd-chips-label">Chips</span>
        <span className="pd-chips-amount">${state.chips}</span>
      </div>
    </div>
  )
}
