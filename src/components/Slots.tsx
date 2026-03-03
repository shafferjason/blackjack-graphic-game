import { useState, useCallback, useMemo } from 'react'
import { useSlots, SYMBOL_DISPLAY, PAYOUT_TABLE } from '../hooks/useSlots'
import type { SlotSymbol } from '../hooks/useSlots'

interface SlotsProps {
  chips: number
  onChipsChange: (newChips: number) => void
}

const BET_OPTIONS = [1, 5, 10, 25, 50, 100]

// VIP tier thresholds
const VIP_TIERS = [
  { name: 'Bronze', min: 0, max: 25, icon: '\u25C6', cls: 'bronze' },
  { name: 'Silver', min: 25, max: 75, icon: '\u25C7', cls: 'silver' },
  { name: 'Gold', min: 75, max: 200, icon: '\u2726', cls: 'gold' },
  { name: 'Diamond', min: 200, max: Infinity, icon: '\u2666', cls: 'diamond' },
] as const

function getVipTier(totalSpins: number) {
  const tier = VIP_TIERS.find(t => totalSpins >= t.min && totalSpins < t.max) ?? VIP_TIERS[3]
  const nextTier = VIP_TIERS[VIP_TIERS.indexOf(tier) + 1]
  const progressInTier = nextTier
    ? ((totalSpins - tier.min) / (nextTier.min - tier.min)) * 100
    : 100
  return { ...tier, progress: Math.min(progressInTier, 100) }
}

function ReelSymbol({ symbol, spinning, stopped, index }: {
  symbol: SlotSymbol
  spinning: boolean
  stopped: boolean
  index: number
}) {
  const isActive = !spinning || stopped
  return (
    <div
      className={`slots-reel ${spinning && !stopped ? 'slots-reel--spinning' : ''} ${stopped && spinning ? 'slots-reel--landing' : ''}`}
      style={spinning && !stopped ? { animationDelay: `${index * 0.05}s` } : undefined}
    >
      <div className={`slots-reel__symbol ${isActive ? 'slots-reel__symbol--visible' : ''}`}>
        {SYMBOL_DISPLAY[symbol]}
      </div>
    </div>
  )
}

// Particle burst on wins
function WinParticles({ isJackpot, isWin }: { isJackpot: boolean; isWin: boolean }) {
  const particles = useMemo(() => {
    if (!isWin && !isJackpot) return []
    const count = isJackpot ? 24 : 12
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 360
      const distance = 40 + Math.random() * 60
      const size = isJackpot ? 3 + Math.random() * 5 : 2 + Math.random() * 3
      const duration = 0.8 + Math.random() * 0.6
      const delay = Math.random() * 0.3
      // Purple/cyan/pink hues for neon theme
      const hueOptions = [280, 190, 330, 260]
      const hue = hueOptions[i % hueOptions.length] + Math.random() * 20
      return { angle, distance, size, duration, delay, hue, id: i }
    })
  }, [isJackpot, isWin])

  if (!isWin && !isJackpot) return null

  return (
    <div className="slots-particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="slots-particle"
          style={{
            '--angle': `${p.angle}deg`,
            '--distance': `${p.distance}px`,
            '--size': `${p.size}px`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--hue': `${p.hue}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Coin shower for big wins
function CoinShower({ active, count }: { active: boolean; count: number }) {
  const coins = useMemo(() => {
    if (!active) return []
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 1.5 + Math.random() * 1,
      size: 10 + Math.random() * 8,
      wobble: -15 + Math.random() * 30,
    }))
  }, [active, count])

  if (!active) return null

  return (
    <div className="slots-coin-shower" aria-hidden="true">
      {coins.map(c => (
        <div
          key={c.id}
          className="slots-coin"
          style={{
            '--left': `${c.left}%`,
            '--delay': `${c.delay}s`,
            '--duration': `${c.duration}s`,
            '--size': `${c.size}px`,
            '--wobble': `${c.wobble}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// VIP Tier Badge
function VipBadge({ totalSpins }: { totalSpins: number }) {
  const tier = getVipTier(totalSpins)
  return (
    <div className={`slots-vip-badge slots-vip-badge--${tier.cls}`}>
      <span className="slots-vip-badge__icon">{tier.icon}</span>
      <span>{tier.name}</span>
      {tier.progress < 100 && (
        <div className="slots-vip-badge__progress">
          <div
            className="slots-vip-badge__progress-fill"
            style={{ width: `${tier.progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Win Streak Multiplier Trail
function MultiplierTrail({ winStreak }: { winStreak: number }) {
  const steps = 5
  return (
    <div className="slots-multiplier-trail" aria-hidden="true">
      {Array.from({ length: steps }, (_, i) => (
        <div
          key={i}
          className={`slots-multiplier-trail__step ${
            i < winStreak
              ? winStreak >= 3 ? 'slots-multiplier-trail__step--hot' : 'slots-multiplier-trail__step--active'
              : ''
          }`}
        />
      ))}
    </div>
  )
}

export default function Slots({ chips, onChipsChange }: SlotsProps) {
  const { state, setBet, spin, newRound } = useSlots(chips, onChipsChange)
  const [showPaytable, setShowPaytable] = useState(false)

  const isIdle = state.phase === 'idle'
  const isSpinning = state.phase === 'spinning' || state.phase === 'stopping'
  const isResult = state.phase === 'result'
  const isWin = isResult && state.winAmount > state.bet
  const isJackpot = isResult && state.isJackpot
  const isPush = isResult && state.winAmount > 0 && state.winAmount <= state.bet

  // Determine win tier for celebration scaling
  const winTier = isJackpot ? 'jackpot' : (state.winAmount >= state.bet * 20) ? 'big' : isWin ? 'normal' : null

  const handleBetChange = useCallback((amount: number) => {
    setBet(amount)
  }, [setBet])

  const canSpin = (isIdle || isResult) && state.bet <= chips && state.bet > 0

  const handleSpin = useCallback(() => {
    if (isResult) {
      newRound()
      setTimeout(spin, 50)
    } else {
      spin()
    }
  }, [isResult, newRound, spin])

  // Check if all 3 reels match (for highlight)
  const allMatch = isResult && state.reels[0] === state.reels[1] && state.reels[1] === state.reels[2]

  // Progressive jackpot display value (visual only — bet * 777)
  const jackpotDisplay = state.bet * 777

  return (
    <div className="slots-3d-scene">
    <div className={`slots-machine ${isJackpot ? 'slots-machine--jackpot' : ''} ${isWin && !isJackpot ? 'slots-machine--win' : ''}`}>

      {/* 3D side panels */}
      <div className="slots-side-panel slots-side-panel--left" aria-hidden="true" />
      <div className="slots-side-panel slots-side-panel--right" aria-hidden="true" />

      {/* Ambient glow behind machine */}
      <div className={`slots-ambient ${isJackpot ? 'slots-ambient--jackpot' : ''} ${isWin && !isJackpot ? 'slots-ambient--win' : ''}`} aria-hidden="true" />

      {/* Coin shower overlay */}
      <CoinShower active={winTier === 'jackpot' || winTier === 'big'} count={winTier === 'jackpot' ? 30 : 15} />

      {/* Cabinet top — 3D marquee with depth overhang and LED lights */}
      <div className="slots-cabinet-top">
        <div className="slots-cabinet-top__depth" aria-hidden="true" />
        <div className="slots-cabinet-top__arch" />
        <div className="slots-marquee">
          <div className="slots-marquee__lights">
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="slots-marquee__bulb" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <h2 className="slots-title">
            {isJackpot ? '\u2605 JACKPOT \u2605' : '\u2666 LUCKY 7s \u2666'}
          </h2>
          <div className="slots-marquee__lights">
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className="slots-marquee__bulb" style={{ animationDelay: `${(i + 7) * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>

      {/* PREMIUM FEATURE 1: Progressive jackpot counter with live bet-scaled value */}
      <div className="slots-payout-bar">
        <button
          className="slots-paytable-toggle"
          onClick={() => setShowPaytable(!showPaytable)}
          aria-expanded={showPaytable}
        >
          {showPaytable ? 'Hide Paytable' : 'Show Paytable'}
        </button>
        <div className="slots-payout-bar__jackpot">
          GRAND JACKPOT 7-7-7: <span className="slots-payout-bar__jackpot-value">${jackpotDisplay.toLocaleString()}</span>
        </div>
      </div>

      {/* PREMIUM FEATURE 2: VIP Tier Badge */}
      <VipBadge totalSpins={state.totalSpins} />

      {/* Paytable */}
      {showPaytable && (
        <div className="slots-paytable" role="table" aria-label="Payout table">
          {PAYOUT_TABLE.map((entry, i) => (
            <div key={i} className={`slots-paytable__row ${entry.isJackpot ? 'slots-paytable__row--jackpot' : ''}`}>
              <span className="slots-paytable__desc">{entry.description}</span>
              <span className={`slots-paytable__mult ${entry.isJackpot ? 'slots-paytable__mult--jackpot' : ''}`}>\u00d7{entry.multiplier}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reel window — 3D recessed frame with glass reflections */}
      <div className={`slots-reels-frame ${isWin ? 'slots-reels-frame--win' : ''} ${isJackpot ? 'slots-reels-frame--jackpot' : ''}`}>
        <div className="slots-reels-frame__glass" />
        <div className="slots-reels-frame__reflection" aria-hidden="true" />
        <div className={`slots-payline ${isWin ? 'slots-payline--win' : ''} ${isJackpot ? 'slots-payline--jackpot' : ''}`} />

        {/* Win particles burst from center of reels */}
        <WinParticles isJackpot={isJackpot} isWin={isWin} />

        <div className="slots-reels">
          {state.reels.map((symbol, i) => (
            <div key={i} className={`slots-reel-wrapper ${isResult && (allMatch || (isWin && i < (state.reels[0] === 'cherry' ? (state.reels[1] === 'cherry' ? 2 : 1) : 3))) ? 'slots-reel-wrapper--winning' : ''}`}>
              <ReelSymbol
                symbol={symbol}
                spinning={isSpinning}
                stopped={state.stoppedReels[i]}
                index={i}
              />
            </div>
          ))}
        </div>
      </div>

      {/* PREMIUM FEATURE 3: Win Streak Multiplier Trail */}
      <MultiplierTrail winStreak={state.winStreak} />

      {/* Win display area */}
      <div className="slots-result-area">
        {/* Win label */}
        {isResult && state.winLabel && (
          <div className={`slots-win-label ${isWin ? 'slots-win-label--big' : ''} ${isJackpot ? 'slots-win-label--jackpot' : ''} ${isPush ? 'slots-win-label--push' : ''}`}>
            <span className="slots-win-label__text">
              {isJackpot && <span className="slots-win-label__stars">{'\u2605'} </span>}
              {state.winLabel}
              {isJackpot && <span className="slots-win-label__stars"> {'\u2605'}</span>}
            </span>
            {state.winAmount > 0 && (
              <span className={`slots-win-amount ${isJackpot ? 'slots-win-amount--jackpot' : ''}`}>
                ${state.displayedWin.toLocaleString()}
              </span>
            )}
            {isWin && state.winAmount > 0 && (
              <span className="slots-win-multiplier">\u00d7{Math.round(state.winAmount / state.bet)}</span>
            )}
          </div>
        )}

        {/* Message */}
        {state.message && (
          <div
            className={`slots-message ${isWin ? 'slots-message--win' : ''} ${isJackpot ? 'slots-message--jackpot' : ''}`}
            role="status"
            aria-live="polite"
          >
            <p>{state.message}</p>
          </div>
        )}

        {/* No-win message for losses */}
        {isResult && !state.winLabel && (
          <div className="slots-message slots-message--loss" role="status" aria-live="polite">
            <p>{state.message}</p>
          </div>
        )}
      </div>

      {/* Session stats bar */}
      <div className="slots-stats-bar">
        <div className="slots-stat">
          <span className="slots-stat__label">Spins</span>
          <span className="slots-stat__value">{state.totalSpins}</span>
        </div>
        {state.winStreak >= 2 && (
          <div className="slots-stat slots-stat--streak">
            <span className="slots-stat__label">Streak</span>
            <span className="slots-stat__value slots-stat__value--streak">{state.winStreak}</span>
          </div>
        )}
        {state.biggestWin > 0 && (
          <div className="slots-stat">
            <span className="slots-stat__label">Best</span>
            <span className="slots-stat__value">${state.biggestWin.toLocaleString()}</span>
          </div>
        )}
        <div className="slots-stat">
          <span className="slots-stat__label">Balance</span>
          <span className="slots-stat__value">${chips.toLocaleString()}</span>
        </div>
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
          {!isSpinning ? (
            <>
              <button
                className={`slots-spin-btn ${!canSpin ? 'slots-spin-btn--disabled' : ''}`}
                onClick={handleSpin}
                disabled={!canSpin}
                aria-label={`Spin for $${state.bet}`}
              >
                <span className="slots-spin-btn__icon">{'\u25B6'}</span>
                {isResult ? 'SPIN AGAIN' : 'SPIN'} — ${state.bet}
              </button>
              {/* Decorative side lever */}
              <div className="slots-lever-inline" aria-hidden="true">
                <div className="slots-lever__knob" />
                <div className="slots-lever__shaft" />
                <div className="slots-lever__base" />
              </div>
            </>
          ) : (
            <div className="slots-spinning-text" aria-live="polite">
              <div className="slots-spinning-text__dot" />
              Spinning...
            </div>
          )}
        </div>

        {/* Insufficient funds message */}
        {(isIdle || isResult) && state.bet > chips && (
          <div className="slots-insufficient" role="alert">
            Insufficient chips — lower your bet
          </div>
        )}
      </div>

      {/* Coin tray — recent wins */}
      {state.lastWins.length > 0 && (
        <div className="slots-coin-tray">
          <span className="slots-coin-tray__label">Recent Wins</span>
          <div className="slots-coin-tray__list">
            {state.lastWins.map((w, i) => (
              <div key={i} className={`slots-coin-tray__entry ${i === 0 && isWin ? 'slots-coin-tray__entry--latest' : ''}`}>
                <span className="slots-coin-tray__symbols">{w.reels.map(s => SYMBOL_DISPLAY[s]).join(' ')}</span>
                <span className="slots-coin-tray__amount">${w.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
