import { GAME_STATES } from '../constants'

export default function ActionControls({ gameState, chips, bet, onHit, onStand, onNewRound, onReset }) {
  if (gameState === GAME_STATES.PLAYING) {
    return (
      <div className="play-panel">
        <div className="chip-info">
          <span className="chip-coin">$</span>{chips}
          <span className="bet-tag">Bet: ${bet}</span>
        </div>
        <div className="play-buttons">
          <button className="btn btn-hit" onClick={onHit}>Hit</button>
          <button className="btn btn-stand" onClick={onStand}>Stand</button>
        </div>
      </div>
    )
  }

  if (gameState === GAME_STATES.DEALER_TURN) {
    return (
      <div className="play-panel">
        <div className="chip-info">
          <span className="chip-coin">$</span>{chips}
        </div>
        <div className="dealer-playing">Dealer is drawing...</div>
      </div>
    )
  }

  if (gameState === GAME_STATES.GAME_OVER) {
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
