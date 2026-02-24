import { useRef, useEffect } from 'react'
import { useGameSettings } from '../config/GameSettingsContext'
import type { GamePhase } from '../types'

interface ActionControlsProps {
  gameState: GamePhase
  chips: number
  bet: number
  canDouble: boolean
  canSplit: boolean
  canSurrender: boolean
  canDoubleAfterSplit: boolean
  maxInsuranceBet: number
  onHit: () => void
  onStand: () => void
  onDoubleDown: () => void
  onSplit: () => void
  onSurrender: () => void
  onAcceptInsurance: (amount: number) => void
  onDeclineInsurance: () => void
  onNewRound: () => void
  onReset: () => void
  onButtonClick?: () => void
}

export default function ActionControls({ gameState, chips, bet, canDouble, canSplit, canSurrender, canDoubleAfterSplit, maxInsuranceBet, onHit, onStand, onDoubleDown, onSplit, onSurrender, onAcceptInsurance, onDeclineInsurance, onNewRound, onReset, onButtonClick }: ActionControlsProps) {
  const { GAME_STATES } = useGameSettings()
  const primaryButtonRef = useRef<HTMLButtonElement>(null)

  // Focus the primary action button when game phase changes
  useEffect(() => {
    const timer = setTimeout(() => {
      primaryButtonRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [gameState])

  if (gameState === GAME_STATES.INSURANCE_OFFER) {
    return (
      <div className="play-panel" role="group" aria-label="Insurance decision">
        <div className="chip-info" aria-label={`Bankroll: $${chips}, Current bet: $${bet}`}>
          <span className="chip-coin">$</span>{chips}
          <span className="bet-tag">Bet: ${bet}</span>
        </div>
        <div className="insurance-label" id="insurance-prompt">Insurance? (up to ${maxInsuranceBet})</div>
        <div className="play-buttons" role="group" aria-labelledby="insurance-prompt">
          <button ref={primaryButtonRef} className="btn btn-insurance" onClick={() => { onButtonClick?.(); onAcceptInsurance(maxInsuranceBet) }} title="Insure (I)" aria-label={`Accept insurance for $${maxInsuranceBet}, press I`}>
            Insure ${maxInsuranceBet}
          </button>
          <button className="btn btn-stand" onClick={() => { onButtonClick?.(); onDeclineInsurance() }} title="No Insurance (N)" aria-label="Decline insurance, press N">No Insurance</button>
        </div>
      </div>
    )
  }

  if (gameState === GAME_STATES.PLAYER_TURN) {
    return (
      <div className="play-panel" role="group" aria-label="Player actions">
        <div className="chip-info" aria-label={`Bankroll: $${chips}, Current bet: $${bet}`}>
          <span className="chip-coin">$</span>{chips}
          <span className="bet-tag">Bet: ${bet}</span>
        </div>
        <div className="play-buttons" role="group" aria-label="Choose your action">
          <button ref={primaryButtonRef} className="btn btn-hit" onClick={() => { onButtonClick?.(); onHit() }} title="Hit (H)" aria-label="Hit, draw a card, press H">Hit</button>
          <button className="btn btn-stand" onClick={() => { onButtonClick?.(); onStand() }} title="Stand (S)" aria-label="Stand, keep current hand, press S">Stand</button>
          <button className="btn btn-double" onClick={() => { onButtonClick?.(); onDoubleDown() }} disabled={!canDouble} title="Double (D)" aria-label={`Double down${!canDouble ? ', unavailable' : ', press D'}`}>Double</button>
          <button className="btn btn-split" onClick={() => { onButtonClick?.(); onSplit() }} disabled={!canSplit} title="Split (P)" aria-label={`Split pairs${!canSplit ? ', unavailable' : ', press P'}`}>Split</button>
          <button className="btn btn-surrender" onClick={() => { onButtonClick?.(); onSurrender() }} disabled={!canSurrender} title="Surrender (R)" aria-label={`Surrender${!canSurrender ? ', unavailable' : ', press R'}`}>Surrender</button>
        </div>
      </div>
    )
  }

  if (gameState === GAME_STATES.SPLITTING) {
    return (
      <div className="play-panel" role="group" aria-label="Split hand actions">
        <div className="chip-info" aria-label={`Bankroll: $${chips}, Bet per hand: $${bet}`}>
          <span className="chip-coin">$</span>{chips}
          <span className="bet-tag">Bet: ${bet} x2</span>
        </div>
        <div className="play-buttons" role="group" aria-label="Choose your action for this split hand">
          <button ref={primaryButtonRef} className="btn btn-hit" onClick={() => { onButtonClick?.(); onHit() }} title="Hit (H)" aria-label="Hit, draw a card, press H">Hit</button>
          <button className="btn btn-stand" onClick={() => { onButtonClick?.(); onStand() }} title="Stand (S)" aria-label="Stand, keep current hand, press S">Stand</button>
          {canDoubleAfterSplit && (
            <button className="btn btn-double" onClick={() => { onButtonClick?.(); onDoubleDown() }} disabled={chips < bet} title="Double (D)" aria-label={`Double down${chips < bet ? ', unavailable' : ', press D'}`}>Double</button>
          )}
        </div>
      </div>
    )
  }

  if (gameState === GAME_STATES.DEALING || gameState === GAME_STATES.DEALER_TURN) {
    return (
      <div className="play-panel" role="status" aria-label="Dealer is playing">
        <div className="chip-info" aria-label={`Bankroll: $${chips}`}>
          <span className="chip-coin">$</span>{chips}
        </div>
        <div className="dealer-playing" aria-live="polite">Dealer is drawing...</div>
      </div>
    )
  }

  if (gameState === GAME_STATES.DOUBLING || gameState === GAME_STATES.SURRENDERING) {
    return (
      <div className="play-panel" role="status">
        <div className="chip-info" aria-label={`Bankroll: $${chips}`}>
          <span className="chip-coin">$</span>{chips}
        </div>
        <div className="dealer-playing" aria-live="polite">{gameState === GAME_STATES.DOUBLING ? 'Doubling down...' : 'Surrendering...'}</div>
      </div>
    )
  }

  if (gameState === GAME_STATES.GAME_OVER || gameState === GAME_STATES.RESOLVING) {
    return (
      <div className="result-panel" role="group" aria-label="Round complete">
        <div className="chip-info" aria-label={`Bankroll: $${chips}`}>
          <span className="chip-coin">$</span>{chips}
        </div>
        <div className="result-buttons" role="group" aria-label="Start next round or reset">
          <button ref={primaryButtonRef} className="btn btn-primary" onClick={() => { onButtonClick?.(); onNewRound() }} disabled={chips <= 0} title="New Round (N / Enter)" aria-label={chips <= 0 ? 'New round, unavailable, out of chips' : 'Start new round, press N or Enter'}>
            New Round
          </button>
          <button className="btn btn-outline" onClick={() => { onButtonClick?.(); onReset() }} aria-label="Reset game to starting bankroll">
            Reset
          </button>
        </div>
      </div>
    )
  }

  return null
}
