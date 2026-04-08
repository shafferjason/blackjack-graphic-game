import { type ReactNode } from 'react'

export type GameMode = 'blackjack' | 'poker_draw' | 'texas_holdem' | 'roulette' | 'slots' | 'coin_flip'

interface GameModeSelectorProps {
  currentMode: GameMode
  onModeChange: (mode: GameMode) => void
}

/* ── Inline SVG icons — thematic, crisp at any size ── */

const IconBlackjack = () => (
  <svg viewBox="0 0 24 24" fill="none" className="mode-selector__svg">
    {/* Ace card behind */}
    <rect x="3" y="2" width="12" height="16" rx="1.5" fill="currentColor" opacity="0.25" />
    {/* Front card */}
    <rect x="9" y="6" width="12" height="16" rx="1.5" fill="currentColor" opacity="0.5" />
    {/* "21" text */}
    <text x="15" y="17" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="700" fontFamily="inherit">21</text>
  </svg>
)

const IconPokerDraw = () => (
  <svg viewBox="0 0 24 24" fill="none" className="mode-selector__svg">
    {/* Fan of 5 cards */}
    <rect x="4" y="5" width="8" height="12" rx="1" fill="currentColor" opacity="0.15" transform="rotate(-20 8 11)" />
    <rect x="6" y="4" width="8" height="12" rx="1" fill="currentColor" opacity="0.25" transform="rotate(-10 10 10)" />
    <rect x="8" y="3.5" width="8" height="12" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="10" y="4" width="8" height="12" rx="1" fill="currentColor" opacity="0.55" transform="rotate(10 14 10)" />
    <rect x="12" y="5" width="8" height="12" rx="1" fill="currentColor" opacity="0.7" transform="rotate(20 16 11)" />
    {/* Swap arrows */}
    <path d="M4 20 L8 18 M8 22 L4 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M20 20 L16 18 M16 22 L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const IconTexasHoldem = () => (
  <svg viewBox="0 0 24 24" fill="none" className="mode-selector__svg">
    {/* Two hole cards */}
    <rect x="2" y="2" width="8" height="11" rx="1.2" fill="currentColor" opacity="0.6" transform="rotate(-8 6 7.5)" />
    <rect x="7" y="2" width="8" height="11" rx="1.2" fill="currentColor" opacity="0.6" transform="rotate(8 11 7.5)" />
    {/* Poker chips stack */}
    <ellipse cx="17" cy="18" rx="5" ry="2.2" fill="currentColor" opacity="0.3" />
    <ellipse cx="17" cy="16.5" rx="5" ry="2.2" fill="currentColor" opacity="0.45" />
    <ellipse cx="17" cy="15" rx="5" ry="2.2" fill="currentColor" opacity="0.65" />
    {/* Chip stripe */}
    <line x1="14" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
  </svg>
)

const IconRoulette = () => (
  <svg viewBox="0 0 24 24" fill="none" className="mode-selector__svg">
    {/* Outer wheel rim */}
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    {/* Inner wheel */}
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1" opacity="0.35" />
    {/* Wheel spokes */}
    <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="4.9" y1="4.9" x2="7" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <line x1="17" y1="17" x2="19.1" y2="19.1" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <line x1="19.1" y1="4.9" x2="17" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <line x1="7" y1="17" x2="4.9" y2="19.1" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    {/* Center hub */}
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.7" />
    {/* Ball */}
    <circle cx="17.5" cy="5.5" r="1.5" fill="currentColor" opacity="0.9" />
  </svg>
)

const IconSlots = () => (
  <svg viewBox="0 0 24 24" fill="none" className="mode-selector__svg">
    {/* Machine body */}
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
    {/* Three reel windows */}
    <rect x="5" y="7" width="4" height="7" rx="0.8" fill="currentColor" opacity="0.2" />
    <rect x="10" y="7" width="4" height="7" rx="0.8" fill="currentColor" opacity="0.2" />
    <rect x="15" y="7" width="4" height="7" rx="0.8" fill="currentColor" opacity="0.2" />
    {/* Lucky 7s */}
    <text x="7" y="12.5" textAnchor="middle" fill="currentColor" fontSize="5" fontWeight="700" fontFamily="inherit" opacity="0.85">7</text>
    <text x="12" y="12.5" textAnchor="middle" fill="currentColor" fontSize="5" fontWeight="700" fontFamily="inherit" opacity="0.85">7</text>
    <text x="17" y="12.5" textAnchor="middle" fill="currentColor" fontSize="5" fontWeight="700" fontFamily="inherit" opacity="0.85">7</text>
    {/* Pull handle */}
    <line x1="22.5" y1="6" x2="22.5" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <circle cx="22.5" cy="5.5" r="1.5" fill="currentColor" opacity="0.7" />
    {/* Win line */}
    <line x1="4" y1="10.5" x2="20" y2="10.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="1.5 1" />
  </svg>
)

const IconCoinFlip = () => (
  <svg viewBox="0 0 24 24" fill="none" className="mode-selector__svg">
    {/* Coin edge (3D tilt effect) */}
    <ellipse cx="12" cy="13" rx="9" ry="9.5" fill="currentColor" opacity="0.15" />
    {/* Main coin face */}
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="0.7" opacity="0.3" />
    {/* Dollar sign */}
    <text x="12" y="15.5" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="700" fontFamily="inherit" opacity="0.7">$</text>
    {/* Flip motion arcs */}
    <path d="M3 5 Q6 1 9 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
    <path d="M21 5 Q18 1 15 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
  </svg>
)

const MODE_ICONS: Record<GameMode, ReactNode> = {
  blackjack: <IconBlackjack />,
  poker_draw: <IconPokerDraw />,
  texas_holdem: <IconTexasHoldem />,
  roulette: <IconRoulette />,
  slots: <IconSlots />,
  coin_flip: <IconCoinFlip />,
}

const MODES: { id: GameMode; label: string; description: string; disabled: boolean; comingSoon: boolean }[] = [
  { id: 'blackjack', label: 'Blackjack', description: 'Beat the dealer to 21 — hit, stand, double, or split', disabled: false, comingSoon: false },
  { id: 'poker_draw', label: '5-Card Draw', description: 'Draw poker — swap cards to build the best 5-card hand', disabled: false, comingSoon: false },
  { id: 'texas_holdem', label: "Texas Hold'em", description: "Community card poker — combine your 2 cards with 5 shared", disabled: false, comingSoon: false },
  { id: 'roulette', label: 'Roulette', description: 'Bet on where the ball lands — numbers, colors, or groups', disabled: false, comingSoon: false },
  { id: 'slots', label: 'Slots', description: 'Spin the reels and match symbols for payouts', disabled: false, comingSoon: false },
  { id: 'coin_flip', label: 'Coin Flip', description: 'Heads or tails — simple 50/50 bet', disabled: false, comingSoon: false },
]

export default function GameModeSelector({ currentMode, onModeChange }: GameModeSelectorProps) {
  return (
    <div className="mode-selector" role="tablist" aria-label="Game mode">
      {MODES.map(mode => {
        const isActive = currentMode === mode.id
        return (
          <button
            key={mode.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={mode.disabled}
            className={[
              'mode-selector__btn',
              isActive ? 'mode-selector__btn--active' : '',
              mode.disabled ? 'mode-selector__btn--disabled' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => !mode.disabled && onModeChange(mode.id)}
            disabled={mode.disabled}
          >
            <span className="mode-selector__icon" aria-hidden="true">{MODE_ICONS[mode.id]}</span>
            <span className="mode-selector__label">{mode.label}</span>
            {mode.comingSoon && <span className="mode-selector__badge">Soon</span>}
            <span className="mode-selector__tooltip" role="tooltip">
              <strong>{mode.label}</strong>
              <span>{mode.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
