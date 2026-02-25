import { useState } from 'react'
import type { PerfectPairsResult, TwentyOnePlusThreeResult } from '../utils/sideBets'

interface SideBetsProps {
  chips: number
  mainBet: number
  perfectPairsBet: number
  twentyOnePlusThreeBet: number
  onPlacePerfectPairs: (amount: number) => void
  onPlaceTwentyOnePlusThree: (amount: number) => void
  onClearSideBets: () => void
  sideBetResult: {
    perfectPairs: PerfectPairsResult | null
    twentyOnePlusThree: TwentyOnePlusThreeResult | null
  } | null
  showResults: boolean
}

const SIDE_BET_AMOUNTS = [5, 10, 25]

export default function SideBets({
  chips,
  mainBet,
  perfectPairsBet,
  twentyOnePlusThreeBet,
  onPlacePerfectPairs,
  onPlaceTwentyOnePlusThree,
  onClearSideBets,
  sideBetResult,
  showResults,
}: SideBetsProps) {
  const [showInfo, setShowInfo] = useState(false)
  const availableChips = chips - mainBet - perfectPairsBet - twentyOnePlusThreeBet

  return (
    <div className="side-bets" role="region" aria-label="Side bets">
      <div className="side-bets-header">
        <span className="side-bets-title">Side Bets</span>
        <button
          className="side-bets-info-btn"
          onClick={() => setShowInfo(!showInfo)}
          aria-expanded={showInfo}
          aria-label="Side bet payout information"
        >
          ?
        </button>
        {(perfectPairsBet > 0 || twentyOnePlusThreeBet > 0) && (
          <button
            className="side-bets-clear"
            onClick={onClearSideBets}
            aria-label="Clear all side bets"
          >
            Clear
          </button>
        )}
      </div>

      {showInfo && (
        <div className="side-bets-info">
          <div className="side-bets-info-section">
            <strong>Perfect Pairs</strong>
            <div className="side-bets-payouts">
              <span>Perfect (same suit): 25:1</span>
              <span>Colored (same color): 12:1</span>
              <span>Mixed (diff color): 6:1</span>
            </div>
          </div>
          <div className="side-bets-info-section">
            <strong>21+3</strong>
            <div className="side-bets-payouts">
              <span>Suited Trips: 100:1</span>
              <span>Straight Flush: 40:1</span>
              <span>Three of a Kind: 30:1</span>
              <span>Straight: 10:1</span>
              <span>Flush: 5:1</span>
            </div>
          </div>
        </div>
      )}

      {showResults && sideBetResult && (
        <div className="side-bets-results" aria-live="polite">
          {sideBetResult.perfectPairs && perfectPairsBet > 0 && (
            <div className={`side-bet-result ${sideBetResult.perfectPairs.payout > 0 ? 'side-bet-win' : 'side-bet-lose'}`}>
              <span className="side-bet-result-label">Pairs:</span>
              <span className="side-bet-result-value">
                {sideBetResult.perfectPairs.label}
                {sideBetResult.perfectPairs.payout > 0 && ` (+$${perfectPairsBet * sideBetResult.perfectPairs.payout})`}
              </span>
            </div>
          )}
          {sideBetResult.twentyOnePlusThree && twentyOnePlusThreeBet > 0 && (
            <div className={`side-bet-result ${sideBetResult.twentyOnePlusThree.payout > 0 ? 'side-bet-win' : 'side-bet-lose'}`}>
              <span className="side-bet-result-label">21+3:</span>
              <span className="side-bet-result-value">
                {sideBetResult.twentyOnePlusThree.label}
                {sideBetResult.twentyOnePlusThree.payout > 0 && ` (+$${twentyOnePlusThreeBet * sideBetResult.twentyOnePlusThree.payout})`}
              </span>
            </div>
          )}
        </div>
      )}

      {!showResults && (
        <div className="side-bets-controls">
          <div className="side-bet-row" role="group" aria-label="Perfect Pairs side bet">
            <span className="side-bet-name">Perfect Pairs</span>
            <div className="side-bet-chips">
              {SIDE_BET_AMOUNTS.map(amount => (
                <button
                  key={`pp-${amount}`}
                  className={`side-bet-chip ${perfectPairsBet === amount ? 'side-bet-chip-active' : ''}`}
                  onClick={() => onPlacePerfectPairs(perfectPairsBet === amount ? 0 : amount)}
                  disabled={perfectPairsBet !== amount && availableChips < amount}
                  aria-pressed={perfectPairsBet === amount}
                  aria-label={`${perfectPairsBet === amount ? 'Remove' : 'Place'} $${amount} Perfect Pairs bet`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            {perfectPairsBet > 0 && (
              <span className="side-bet-amount">${perfectPairsBet}</span>
            )}
          </div>

          <div className="side-bet-row" role="group" aria-label="21+3 side bet">
            <span className="side-bet-name">21+3</span>
            <div className="side-bet-chips">
              {SIDE_BET_AMOUNTS.map(amount => (
                <button
                  key={`tp-${amount}`}
                  className={`side-bet-chip ${twentyOnePlusThreeBet === amount ? 'side-bet-chip-active' : ''}`}
                  onClick={() => onPlaceTwentyOnePlusThree(twentyOnePlusThreeBet === amount ? 0 : amount)}
                  disabled={twentyOnePlusThreeBet !== amount && availableChips < amount}
                  aria-pressed={twentyOnePlusThreeBet === amount}
                  aria-label={`${twentyOnePlusThreeBet === amount ? 'Remove' : 'Place'} $${amount} 21+3 bet`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            {twentyOnePlusThreeBet > 0 && (
              <span className="side-bet-amount">${twentyOnePlusThreeBet}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
