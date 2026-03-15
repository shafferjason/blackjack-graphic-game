import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useRoulette, getNumberColor, WHEEL_NUMBERS } from '../hooks/useRoulette'
import type { RouletteBetType } from '../hooks/useRoulette'

interface RouletteProps {
  chips: number
  onChipsChange: (newChips: number) => void
}

const CHIP_AMOUNTS = [1, 5, 10, 25, 100]

/** Denomination color coding — matches real casino chip colors */
const CHIP_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1:   { bg: '#f5f5f5', border: '#ccc',    text: '#333' },
  5:   { bg: '#c0392b', border: '#922b21', text: '#fff' },
  10:  { bg: '#2980b9', border: '#1f6692', text: '#fff' },
  25:  { bg: '#27ae60', border: '#1e8449', text: '#fff' },
  100: { bg: '#1a1a1a', border: '#444',    text: '#f0d264' },
}

/** Color for each pocket on the wheel */
const POCKET_COLORS: Record<string, string> = {
  red: '#b91c1c',
  black: '#1a1a1a',
  green: '#166534',
}

// Layout: numbers 1-36 in 3 columns, 12 rows
const BOARD_ROWS: number[][] = []
for (let row = 0; row < 12; row++) {
  BOARD_ROWS.push([row * 3 + 1, row * 3 + 2, row * 3 + 3])
}

/** Generate a 37-pocket conic-gradient with gold fret separators */
function buildWheelGradient(): string {
  const count = WHEEL_NUMBERS.length
  const sliceDeg = 360 / count
  const fretWidth = 0.5
  const stops: string[] = []
  for (let i = 0; i < count; i++) {
    const color = POCKET_COLORS[getNumberColor(WHEEL_NUMBERS[i])]
    const startDeg = i * sliceDeg
    const endDeg = (i + 1) * sliceDeg
    // Gold fret line before each pocket
    stops.push(`#8b6914 ${startDeg.toFixed(2)}deg`)
    stops.push(`#a07818 ${(startDeg + fretWidth / 2).toFixed(2)}deg`)
    stops.push(`${color} ${(startDeg + fretWidth).toFixed(2)}deg`)
    stops.push(`${color} ${endDeg.toFixed(2)}deg`)
  }
  return `conic-gradient(from 0deg, ${stops.join(', ')})`
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

  // ── Wheel rotation: result-synced landing ──
  const [wheelDeg, setWheelDeg] = useState(0)
  const wheelBaseRef = useRef(0)
  const spinTargetRef = useRef(0)
  const prevPhaseRef = useRef(state.phase)

  const handleNumberClick = useCallback((n: number) => {
    placeBet('straight', selectedChip, n)
  }, [placeBet, selectedChip])

  const handleOutsideBet = useCallback((type: RouletteBetType) => {
    placeBet(type, selectedChip)
  }, [placeBet, selectedChip])

  const isBetting = state.phase === 'betting'
  const isSpinning = state.phase === 'spinning'
  const isResult = state.phase === 'result'

  // Spin: add fast rotation with deceleration
  useEffect(() => {
    const prevPhase = prevPhaseRef.current
    prevPhaseRef.current = state.phase

    if (state.phase === 'spinning' && prevPhase !== 'spinning') {
      const spinAmount = 1800 + Math.random() * 360
      spinTargetRef.current = wheelBaseRef.current + spinAmount
      setWheelDeg(spinTargetRef.current)
    }
  }, [state.phase])

  // Result: settle wheel to land winning number at pointer
  useEffect(() => {
    if (isResult && state.result !== null) {
      const idx = WHEEL_NUMBERS.indexOf(state.result)
      if (idx < 0) return
      const pocketDeg = (idx / WHEEL_NUMBERS.length) * 360
      const offset = (360 - pocketDeg) % 360 || 360
      const target = spinTargetRef.current + offset
      wheelBaseRef.current = target
      setWheelDeg(target)
    }
  }, [isResult, state.result])

  // Get active bets for highlighting
  const activeStraights = new Set(
    state.bets.filter(b => b.type === 'straight').map(b => b.number!)
  )
  const activeOutside = new Set(
    state.bets.filter(b => b.type !== 'straight').map(b => b.type)
  )

  // 37-pocket wheel gradient (memoized)
  const wheelGradient = useMemo(() => buildWheelGradient(), [])

  // Phase-based root class
  const phaseClass = isSpinning
    ? 'roulette-table--spinning'
    : isResult
      ? state.winAmount > 0 ? 'roulette-table--result-win' : 'roulette-table--result-lose'
      : 'roulette-table--betting'

  // Wheel inline rotation + transition
  const wheelTransition = isSpinning
    ? 'transform 2.5s cubic-bezier(0.12, 0.76, 0.3, 1)'
    : isResult
      ? 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none'

  const wheelNumberOffset = -85

  return (
    <div className={`roulette-table ${phaseClass}`}>
      {/* Accessible result announcement */}
      <div className="roulette-sr-result" aria-live="assertive" role="status">
        {isResult && state.result !== null && (
          `Result: ${state.result} ${getNumberColor(state.result)}. ${state.message}`
        )}
      </div>

      {/* Wheel visualization */}
      <div className="roulette-wheel-area">
        <div className="roulette-wheel-container">
          {/* Ball — orbits during spin, settles at result */}
          {isSpinning && (
            <div className="roulette-ball roulette-ball--spinning" aria-hidden="true" />
          )}
          {isResult && state.result !== null && (
            <div className="roulette-ball roulette-ball--settled" aria-hidden="true" />
          )}

          <div
            className="roulette-wheel"
            style={{
              background: wheelGradient,
              transform: `rotate(${wheelDeg}deg)`,
              transition: wheelTransition,
            }}
          >
            <div className="roulette-wheel__inner">
              {state.result !== null ? (
                <div className={`roulette-wheel__result roulette-wheel__result--${getNumberColor(state.result)} ${isResult ? 'roulette-wheel__result--revealing' : ''}`}>
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
                  style={{ transform: `rotate(${(i / WHEEL_NUMBERS.length) * 360}deg) translateY(${wheelNumberOffset}px)` }}
                  aria-hidden="true"
                >
                  {n}
                </span>
              ))}
            </div>
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
            <span key={i} className={`roulette-history__dot roulette-history__dot--${getNumberColor(n)} ${i === 0 ? 'roulette-history__dot--latest' : ''}`}>
              {n}
            </span>
          ))}
        </div>
      )}

      {/* Chip selector */}
      {isBetting && (
        <div className="roulette-chips roulette-phase-fade" role="radiogroup" aria-label="Select chip value">
          {CHIP_AMOUNTS.filter(a => a <= chips).map(amount => {
            const colors = CHIP_COLORS[amount] || CHIP_COLORS[1]
            return (
              <button
                key={amount}
                className={`roulette-chip ${selectedChip === amount ? 'roulette-chip--selected' : ''}`}
                onClick={() => setSelectedChip(amount)}
                role="radio"
                aria-checked={selectedChip === amount}
                style={{
                  background: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  borderWidth: '3px',
                  borderStyle: 'solid',
                }}
              >
                ${amount}
              </button>
            )
          })}
        </div>
      )}

      {/* Betting board */}
      {isBetting && (
        <div className="roulette-board roulette-phase-fade">
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
