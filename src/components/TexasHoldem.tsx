import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useTexasHoldem } from '../hooks/useTexasHoldem'
import type { HoldemPlayer } from '../hooks/useTexasHoldem'
import type { Card as CardType } from '../types'
import Card from './Card'
import {
  playCardDeal,
  playChipPlace,
  playChipCollect,
  playWinFanfare,
  playLossThud,
  playButtonClick,
} from '../utils/sound'

interface TexasHoldemProps {
  chips: number
  onChipsChange: (newChips: number) => void
}

function PlayerSeat({ player, isActive, showCards, isWinner }: { player: HoldemPlayer; isActive: boolean; showCards: boolean; isWinner: boolean }) {
  const seatClass = [
    'holdem-seat',
    isActive ? 'holdem-seat--active' : '',
    player.folded ? 'holdem-seat--folded' : '',
    player.isAllIn ? 'holdem-seat--allin' : '',
    player.isDealer ? 'holdem-seat--dealer' : '',
    isWinner ? 'holdem-seat--winner' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={seatClass} aria-label={`${player.name}${player.isDealer ? ' (Dealer)' : ''}`}>
      <div className="holdem-seat__info">
        <span className="holdem-seat__name">
          {player.isDealer && <span className="dealer-chip" aria-label="Dealer">D</span>}
          {player.name}
        </span>
        <span className="holdem-seat__chips">${player.chips}</span>
      </div>
      <div className="holdem-seat__cards">
        {player.hand.map((card, i) => (
          <div key={i} className="holdem-card-wrapper">
            <Card card={card} hidden={!showCards && !player.isHuman} index={i} />
          </div>
        ))}
      </div>
      {player.lastAction && (
        <div className="holdem-seat__action">{player.lastAction}</div>
      )}
      {player.currentBet > 0 && (
        <div className="holdem-seat__bet">${player.currentBet}</div>
      )}
      {player.handResult && showCards && (
        <div className="holdem-seat__hand-result">{player.handResult.label}</div>
      )}
      {player.folded && <div className="holdem-seat__folded-tag">FOLDED</div>}
    </div>
  )
}

function CommunityCards({ cards, phase }: { cards: CardType[]; phase: string }) {
  const slots = 5
  const prevCountRef = useRef(0)

  // Track which cards are newly dealt for animation
  const newCardCount = cards.length
  const prevCount = prevCountRef.current
  useEffect(() => {
    prevCountRef.current = cards.length
  }, [cards.length])

  const communityClass = [
    'holdem-community',
    phase === 'flop' ? 'holdem-community--flop' : '',
    phase === 'turn' ? 'holdem-community--turn' : '',
    phase === 'river' ? 'holdem-community--river' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={communityClass} aria-label="Community cards">
      <div className="holdem-community__label">Community Cards</div>
      <div className="holdem-community__cards">
        {Array.from({ length: slots }, (_, i) => {
          const card = cards[i]
          if (card) {
            const isNewlyDealt = i >= prevCount && i < newCardCount
            const wrapperClass = [
              'holdem-card-wrapper',
              'holdem-card-wrapper--community',
              isNewlyDealt ? 'holdem-card--dealing' : '',
            ].filter(Boolean).join(' ')
            return (
              <div
                key={i}
                className={wrapperClass}
                style={isNewlyDealt ? { animationDelay: `${(i - prevCount) * 100}ms` } : undefined}
              >
                <Card card={card} index={i} />
              </div>
            )
          }
          return <div key={i} className="holdem-card-placeholder" />
        })}
      </div>
    </div>
  )
}

/* Win celebration sparkle burst */
function WinBurst() {
  const sparkles = useMemo(() => {
    const count = 10
    return Array.from({ length: count }, (_, i) => ({
      angle: (360 / count) * i,
      distance: 60 + Math.random() * 50,
      delay: i * 40,
    }))
  }, [])

  return (
    <div className="holdem-win-burst" aria-hidden="true">
      {sparkles.map((s, i) => (
        <div
          key={i}
          className="holdem-win-burst__sparkle"
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

export default function TexasHoldem({ chips, onChipsChange }: TexasHoldemProps) {
  const { state, humanPlayer, isHumanTurn, toCall, canCheck, canCall, canRaise, actions } = useTexasHoldem(chips, onChipsChange)
  const [raiseAmount, setRaiseAmount] = useState(20)
  const [potGrowing, setPotGrowing] = useState(false)

  const handleRaise = useCallback(() => {
    actions.raise(raiseAmount)
  }, [actions, raiseAmount])

  const isShowdown = state.phase === 'round_over' && state.winner !== null
  const isIdle = state.phase === 'idle'
  const isRoundOver = state.phase === 'round_over'
  const humanWon = isRoundOver && state.winner?.includes('You')
  const humanLost = isRoundOver && !humanWon && state.winner !== null

  // ── Phase-based table class ──
  const tableClass = [
    'holdem-table',
    isIdle ? 'holdem-table--idle' : '',
    !isIdle && !isRoundOver ? 'holdem-table--active' : '',
    isShowdown && !humanWon && !humanLost ? 'holdem-table--showdown' : '',
    humanWon ? 'holdem-table--win' : '',
    humanLost ? 'holdem-table--lose' : '',
  ].filter(Boolean).join(' ')

  // ── Audio: phase transitions ──
  const prevPhaseRef = useRef(state.phase)
  const prevPotRef = useRef(state.pot)
  useEffect(() => {
    const prevPhase = prevPhaseRef.current
    prevPhaseRef.current = state.phase

    // Deal cards sound when hand starts
    if (prevPhase === 'idle' && state.phase === 'pre_flop') {
      playCardDeal()
      setTimeout(() => playCardDeal(), 90)
      setTimeout(() => playCardDeal(), 175)
      setTimeout(() => playCardDeal(), 260)
    }

    // Community card sounds (flop/turn/river)
    if (state.phase === 'flop' && prevPhase === 'pre_flop') {
      playCardDeal()
      setTimeout(() => playCardDeal(), 80)
      setTimeout(() => playCardDeal(), 160)
    }
    if ((state.phase === 'turn' && prevPhase === 'flop') ||
        (state.phase === 'river' && prevPhase === 'turn')) {
      playCardDeal()
    }

    // Round over — win/loss
    if (state.phase === 'round_over' && prevPhase !== 'round_over') {
      const won = state.winner?.includes('You')
      setTimeout(() => {
        if (won) {
          playWinFanfare()
          setTimeout(() => playChipCollect(), 350)
        } else {
          playLossThud()
        }
      }, 200)
    }
  }, [state.phase, state.winner])

  // ── Audio + visual: chip bets (pot growth) ──
  useEffect(() => {
    if (state.pot > prevPotRef.current && state.pot > 0) {
      playChipPlace()
      setPotGrowing(true)
      const t = setTimeout(() => setPotGrowing(false), 350)
      return () => clearTimeout(t)
    }
    prevPotRef.current = state.pot
  }, [state.pot])

  // Determine min/max raise
  const minRaise = state.minRaise
  const maxRaise = humanPlayer.chips

  // Update raise slider range
  const clampedRaise = useMemo(() => {
    return Math.max(minRaise, Math.min(raiseAmount, maxRaise))
  }, [minRaise, maxRaise, raiseAmount])

  const phaseLabel = state.phase === 'pre_flop' ? 'Pre-Flop'
    : state.phase === 'flop' ? 'Flop'
    : state.phase === 'turn' ? 'Turn'
    : state.phase === 'river' ? 'River'
    : state.phase === 'round_over' ? 'Round Over'
    : ''

  // Banner class
  const bannerClass = [
    'holdem-banner',
    humanWon ? 'holdem-banner--win' : '',
    humanLost ? 'holdem-banner--lose' : '',
  ].filter(Boolean).join(' ')

  // Pot class
  const potClass = [
    'holdem-pot',
    potGrowing ? 'holdem-pot--growing' : '',
  ].filter(Boolean).join(' ')

  // Determine winner player name for seat highlighting
  const winnerName = isRoundOver ? state.winner : null

  return (
    <div className={tableClass}>
      {/* Pot & Phase */}
      <div className="holdem-info-bar">
        <div className={potClass}>
          <span className="holdem-pot__label">Pot</span>
          <span className="holdem-pot__amount">${state.pot}</span>
        </div>
        {phaseLabel && <div className="holdem-phase-pill" key={state.phase}>{phaseLabel}</div>}
      </div>

      {/* AI Players at top */}
      <div className="holdem-opponents">
        {state.players.filter(p => !p.isHuman).map(player => (
          <PlayerSeat
            key={player.id}
            player={player}
            isActive={state.currentPlayerIndex === state.players.indexOf(player) && !isIdle && !isRoundOver}
            showCards={isShowdown && !player.folded}
            isWinner={winnerName !== null && winnerName.includes(player.name)}
          />
        ))}
      </div>

      {/* Community Cards */}
      <CommunityCards cards={state.communityCards} phase={state.phase} />

      {/* Win celebration sparkles */}
      {humanWon && <WinBurst />}

      {/* Message Banner */}
      <div className={bannerClass}>
        <p>{state.message}</p>
      </div>

      {/* Human Player */}
      <div className="holdem-player-area">
        <PlayerSeat
          player={humanPlayer}
          isActive={isHumanTurn}
          showCards={true}
          isWinner={humanWon === true}
        />
      </div>

      {/* Controls */}
      <div className="holdem-controls">
        {isIdle && (
          <button className="btn btn-primary btn-lg" onClick={actions.startRound} disabled={humanPlayer.chips <= 0}>
            Deal
          </button>
        )}

        {isRoundOver && (
          <button className="btn btn-primary btn-lg" onClick={actions.newRound}>
            Next Hand
          </button>
        )}

        {isHumanTurn && (
          <div className="holdem-action-buttons">
            <button className="btn btn-danger" onClick={actions.fold}>
              Fold
            </button>
            {canCheck && (
              <button className="btn btn-outline" onClick={actions.check}>
                Check
              </button>
            )}
            {canCall && (
              <button className="btn btn-primary" onClick={actions.call}>
                Call ${toCall}
              </button>
            )}
            {canRaise && (
              <div className="holdem-raise-group">
                <input
                  type="range"
                  min={minRaise}
                  max={maxRaise}
                  step={state.bigBlind}
                  value={clampedRaise}
                  onChange={e => setRaiseAmount(Number(e.target.value))}
                  className="holdem-raise-slider"
                  aria-label="Raise amount"
                />
                <button className="btn btn-accent" onClick={handleRaise}>
                  Raise ${clampedRaise}
                </button>
              </div>
            )}
            <button className="btn btn-allin" onClick={actions.allIn}>
              All In
            </button>
          </div>
        )}

        {!isHumanTurn && !isIdle && !isRoundOver && (
          <div className="holdem-waiting">
            <div className="holdem-waiting__spinner" />
            <span>Waiting for {state.players[state.currentPlayerIndex]?.name}...</span>
          </div>
        )}
      </div>
    </div>
  )
}
