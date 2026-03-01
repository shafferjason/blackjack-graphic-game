import { useState, useCallback, useMemo } from 'react'
import { useTexasHoldem } from '../hooks/useTexasHoldem'
import type { HoldemPlayer } from '../hooks/useTexasHoldem'
import type { Card as CardType } from '../types'
import Card from './Card'

interface TexasHoldemProps {
  chips: number
  onChipsChange: (newChips: number) => void
}

function PlayerSeat({ player, isActive, showCards }: { player: HoldemPlayer; isActive: boolean; showCards: boolean }) {
  const seatClass = [
    'holdem-seat',
    isActive ? 'holdem-seat--active' : '',
    player.folded ? 'holdem-seat--folded' : '',
    player.isAllIn ? 'holdem-seat--allin' : '',
    player.isDealer ? 'holdem-seat--dealer' : '',
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

function CommunityCards({ cards }: { cards: CardType[] }) {
  const slots = 5
  return (
    <div className="holdem-community" aria-label="Community cards">
      <div className="holdem-community__label">Community Cards</div>
      <div className="holdem-community__cards">
        {Array.from({ length: slots }, (_, i) => {
          const card = cards[i]
          if (card) {
            return (
              <div key={i} className="holdem-card-wrapper holdem-card-wrapper--community">
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

export default function TexasHoldem({ chips, onChipsChange }: TexasHoldemProps) {
  const { state, humanPlayer, isHumanTurn, toCall, canCheck, canCall, canRaise, actions } = useTexasHoldem(chips, onChipsChange)
  const [raiseAmount, setRaiseAmount] = useState(20)

  const handleRaise = useCallback(() => {
    actions.raise(raiseAmount)
  }, [actions, raiseAmount])

  const isShowdown = state.phase === 'round_over' && state.winner !== null
  const isIdle = state.phase === 'idle'
  const isRoundOver = state.phase === 'round_over'

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

  return (
    <div className="holdem-table">
      {/* Pot & Phase */}
      <div className="holdem-info-bar">
        <div className="holdem-pot">
          <span className="holdem-pot__label">Pot</span>
          <span className="holdem-pot__amount">${state.pot}</span>
        </div>
        {phaseLabel && <div className="holdem-phase-pill">{phaseLabel}</div>}
      </div>

      {/* AI Players at top */}
      <div className="holdem-opponents">
        {state.players.filter(p => !p.isHuman).map(player => (
          <PlayerSeat
            key={player.id}
            player={player}
            isActive={state.currentPlayerIndex === state.players.indexOf(player) && !isIdle && !isRoundOver}
            showCards={isShowdown && !player.folded}
          />
        ))}
      </div>

      {/* Community Cards */}
      <CommunityCards cards={state.communityCards} />

      {/* Message Banner */}
      <div className={`holdem-banner ${state.winner ? 'holdem-banner--win' : ''}`}>
        <p>{state.message}</p>
      </div>

      {/* Human Player */}
      <div className="holdem-player-area">
        <PlayerSeat
          player={humanPlayer}
          isActive={isHumanTurn}
          showCards={true}
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
