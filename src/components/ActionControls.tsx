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
}

export default function ActionControls({ gameState, chips, bet, canDouble, canSplit, canSurrender, canDoubleAfterSplit, maxInsuranceBet, onHit, onStand, onDoubleDown, onSplit, onSurrender, onAcceptInsurance, onDeclineInsurance, onNewRound, onReset }: ActionControlsProps) {
  const { GAME_STATES } = useGameSettings()

  if (gameState === GAME_STATES.INSURANCE_OFFER) {
    return (
      <div className="play-panel">
        <div className="chip-info">
          <span className="chip-coin">$</span>{chips}
          <span className="bet-tag">Bet: ${bet}</span>
        </div>
        <div className="insurance-label">Insurance? (up to ${maxInsuranceBet})</div>
        <div className="play-buttons">
          <button className="btn btn-insurance" onClick={() => onAcceptInsurance(maxInsuranceBet)}>
            Insure ${maxInsuranceBet}
          </button>
          <button className="btn btn-stand" onClick={onDeclineInsurance}>No Insurance</button>
        </div>
      </div>
    )
  }

  if (gameState === GAME_STATES.PLAYER_TURN) {
    return (
      <div className="play-panel">
        <div className="chip-info">
          <span className="chip-coin">$</span>{chips}
          <span className="bet-tag">Bet: ${bet}</span>
        </div>
        <div className="play-buttons">
          <button className="btn btn-hit" onClick={onHit}>Hit</button>
          <button className="btn btn-stand" onClick={onStand}>Stand</button>
          <button className="btn btn-double" onClick={onDoubleDown} disabled={!canDouble}>Double</button>
          <button className="btn btn-split" onClick={onSplit} disabled={!canSplit}>Split</button>
          <button className="btn btn-surrender" onClick={onSurrender} disabled={!canSurrender}>Surrender</button>
        </div>
      </div>
    )
  }

  if (gameState === GAME_STATES.SPLITTING) {
    return (
      <div className="play-panel">
        <div className="chip-info">
          <span className="chip-coin">$</span>{chips}
          <span className="bet-tag">Bet: ${bet} x2</span>
        </div>
        <div className="play-buttons">
          <button className="btn btn-hit" onClick={onHit}>Hit</button>
          <button className="btn btn-stand" onClick={onStand}>Stand</button>
          {canDoubleAfterSplit && (
            <button className="btn btn-double" onClick={onDoubleDown} disabled={chips < bet}>Double</button>
          )}
        </div>
      </div>
    )
  }

  if (gameState === GAME_STATES.DEALING || gameState === GAME_STATES.DEALER_TURN) {
    return (
      <div className="play-panel">
        <div className="chip-info">
          <span className="chip-coin">$</span>{chips}
        </div>
        <div className="dealer-playing">Dealer is drawing...</div>
      </div>
    )
  }

  if (gameState === GAME_STATES.DOUBLING || gameState === GAME_STATES.SURRENDERING) {
    return (
      <div className="play-panel">
        <div className="chip-info">
          <span className="chip-coin">$</span>{chips}
        </div>
        <div className="dealer-playing">{gameState === GAME_STATES.DOUBLING ? 'Doubling down...' : 'Surrendering...'}</div>
      </div>
    )
  }

  if (gameState === GAME_STATES.GAME_OVER || gameState === GAME_STATES.RESOLVING) {
    return (
      <div className="result-panel">
        <div className="chip-info">
          <span className="chip-coin">$</span>{chips}
        </div>
        <div className="result-buttons">
          <button className="btn btn-primary" onClick={onNewRound} disabled={chips <= 0}>
            New Round
          </button>
          <button className="btn btn-outline" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    )
  }

  return null
}
