import { useState, useCallback } from 'react'
import { useRoulette, getNumberColor, WHEEL_NUMBERS } from '../hooks/useRoulette'
import type { RouletteBetType } from '../hooks/useRoulette'

interface RouletteProps {
  chips: number
  onChipsChange: (newChips: number) => void
}

const CHIP_AMOUNTS = [1, 5, 10, 25, 100]

// Layout: numbers 1-36 in 3 columns, 12 rows
const BOARD_ROWS: number[][] = []
for (let row = 0; row < 12; row++) {
  BOARD_ROWS.push([row * 3 + 1, row * 3 + 2, row * 3 + 3])
}

function NumberCell({ n, isActive, onClick }: { n: number; isActive: boolean; onClick: () => void }) {
  const color = getNumberColor(n)
  return (
    <button
      className={`roulette-cell roulette-cell--${color} ${isActive ? 'roulette-cell--active' : ''}`}
      onClick={onClick}
      aria-label={`Bet on ${n}`}
    >
      {n}
    </button>
  )
}

export default function Roulette({ chips, onChipsChange }: RouletteProps) {
  const { state, placeBet, clearBets, spin, newRound } = useRoulette(chips, onChipsChange)
  const [selectedChip, setSelectedChip] = useState(10)

  const handleNumberClick = useCallback((n: number) => {
    placeBet('straight', selectedChip, n)
  }, [placeBet, selectedChip])

  const handleOutsideBet = useCallback((type: RouletteBetType) => {
    placeBet(type, selectedChip)
  }, [placeBet, selectedChip])

  const isBetting = state.phase === 'betting'
  const isSpinning = state.phase === 'spinning'
  const isResult = state.phase === 'result'

  // Get the active bets for highlighting
  const activeStraights = new Set(
    state.bets.filter(b => b.type === 'straight').map(b => b.number!)
  )
  const activeOutside = new Set(
    state.bets.filter(b => b.type !== 'straight').map(b => b.type)
  )

  return (
    <div className="roulette-table">
      {/* Wheel visualization */}
      <div className="roulette-wheel-area">
        <div className={`roulette-wheel ${isSpinning ? 'roulette-wheel--spinning' : ''}`}>
          <div className="roulette-wheel__inner">
            {state.result !== null ? (
              <div className={`roulette-wheel__result roulette-wheel__result--${getNumberColor(state.result)}`}>
                {state.result}
              </div>
            ) : (
              <div className="roulette-wheel__logo">R</div>
            )}
          </div>
          <div className="roulette-wheel__ring">
            {WHEEL_NUMBERS.map((n, i) => (
              <span
                key={n}
                className={`roulette-wheel__number roulette-wheel__number--${getNumberColor(n)} ${state.result === n ? 'roulette-wheel__number--hit' : ''}`}
                style={{ transform: `rotate(${(i / WHEEL_NUMBERS.length) * 360}deg) translateY(-68px)` }}
                aria-hidden="true"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Message banner */}
      <div className={`roulette-banner ${state.winAmount > 0 && isResult ? 'roulette-banner--win' : ''} ${isResult && state.winAmount === 0 ? 'roulette-banner--lose' : ''}`}>
        <p>{state.message}</p>
      </div>

      {/* Last results */}
      {state.lastResults.length > 0 && (
        <div className="roulette-history" aria-label="Recent results">
          {state.lastResults.map((n, i) => (
            <span key={i} className={`roulette-history__dot roulette-history__dot--${getNumberColor(n)}`}>
              {n}
            </span>
          ))}
        </div>
      )}

      {/* Chip selector */}
      {isBetting && (
        <div className="roulette-chips" role="radiogroup" aria-label="Select chip value">
          {CHIP_AMOUNTS.filter(a => a <= chips).map(amount => (
            <button
              key={amount}
              className={`roulette-chip ${selectedChip === amount ? 'roulette-chip--selected' : ''}`}
              onClick={() => setSelectedChip(amount)}
              role="radio"
              aria-checked={selectedChip === amount}
            >
              ${amount}
            </button>
          ))}
        </div>
      )}

      {/* Betting board */}
      {isBetting && (
        <div className="roulette-board">
          {/* Zero */}
          <div className="roulette-board__zero">
            <NumberCell n={0} isActive={activeStraights.has(0)} onClick={() => handleNumberClick(0)} />
          </div>

          {/* Number grid */}
          <div className="roulette-board__grid">
            {BOARD_ROWS.map((row, ri) => (
              <div key={ri} className="roulette-board__row">
                {row.map(n => (
                  <NumberCell key={n} n={n} isActive={activeStraights.has(n)} onClick={() => handleNumberClick(n)} />
                ))}
              </div>
            ))}
          </div>

          {/* Column bets */}
          <div className="roulette-board__columns">
            <button className={`roulette-outside ${activeOutside.has('col_1') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('col_1')}>2:1</button>
            <button className={`roulette-outside ${activeOutside.has('col_2') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('col_2')}>2:1</button>
            <button className={`roulette-outside ${activeOutside.has('col_3') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('col_3')}>2:1</button>
          </div>

          {/* Dozen bets */}
          <div className="roulette-board__dozens">
            <button className={`roulette-outside roulette-outside--wide ${activeOutside.has('dozen_1') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('dozen_1')}>1-12</button>
            <button className={`roulette-outside roulette-outside--wide ${activeOutside.has('dozen_2') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('dozen_2')}>13-24</button>
            <button className={`roulette-outside roulette-outside--wide ${activeOutside.has('dozen_3') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('dozen_3')}>25-36</button>
          </div>

          {/* Outside bets */}
          <div className="roulette-board__outside">
            <button className={`roulette-outside ${activeOutside.has('low') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('low')}>1-18</button>
            <button className={`roulette-outside ${activeOutside.has('even') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('even')}>Even</button>
            <button className={`roulette-outside roulette-outside--red ${activeOutside.has('red') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('red')}>Red</button>
            <button className={`roulette-outside roulette-outside--black ${activeOutside.has('black') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('black')}>Black</button>
            <button className={`roulette-outside ${activeOutside.has('odd') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('odd')}>Odd</button>
            <button className={`roulette-outside ${activeOutside.has('high') ? 'roulette-outside--active' : ''}`} onClick={() => handleOutsideBet('high')}>19-36</button>
          </div>
        </div>
      )}

      {/* Active bets summary */}
      {state.bets.length > 0 && isBetting && (
        <div className="roulette-bet-summary">
          <span className="roulette-bet-summary__total">Total Bet: ${state.totalBet}</span>
          <span className="roulette-bet-summary__count">{state.bets.length} bet{state.bets.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Controls */}
      <div className="roulette-controls">
        {isBetting && (
          <>
            <button
              className="btn btn-primary btn-lg"
              onClick={spin}
              disabled={state.bets.length === 0 || state.totalBet > chips}
            >
              Spin
            </button>
            {state.bets.length > 0 && (
              <button className="btn btn-outline" onClick={clearBets}>
                Clear Bets
              </button>
            )}
          </>
        )}
        {isResult && (
          <button className="btn btn-primary btn-lg" onClick={newRound}>
            New Round
          </button>
        )}
        {isSpinning && (
          <div className="roulette-spinning-indicator">
            <div className="roulette-spinning-indicator__dot" />
            <span>Spinning...</span>
          </div>
        )}
      </div>
    </div>
  )
}
