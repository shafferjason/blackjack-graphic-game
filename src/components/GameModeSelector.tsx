export type GameMode = 'blackjack' | 'poker_draw' | 'texas_holdem' | 'roulette' | 'slots' | 'coin_flip'

interface GameModeSelectorProps {
  currentMode: GameMode
  onModeChange: (mode: GameMode) => void
}

const MODES: { id: GameMode; label: string; icon: string; description: string; disabled: boolean; comingSoon: boolean }[] = [
  { id: 'blackjack', label: 'Blackjack', icon: '\u2660', description: 'Beat the dealer to 21 — hit, stand, double, or split', disabled: false, comingSoon: false },
  { id: 'poker_draw', label: '5-Card Draw', icon: '\u2662', description: 'Draw poker — swap cards to build the best 5-card hand', disabled: false, comingSoon: false },
  { id: 'texas_holdem', label: "Texas Hold'em", icon: '\u2663', description: "Community card poker — combine your 2 cards with 5 shared", disabled: false, comingSoon: false },
  { id: 'roulette', label: 'Roulette', icon: '\u25CE', description: 'Bet on where the ball lands — numbers, colors, or groups', disabled: false, comingSoon: false },
  { id: 'slots', label: 'Slots', icon: '\u2731', description: 'Spin the reels and match symbols for payouts', disabled: false, comingSoon: false },
  { id: 'coin_flip', label: 'Coin Flip', icon: '\u{1FA99}', description: 'Heads or tails — simple 50/50 bet', disabled: false, comingSoon: false },
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
            <span className="mode-selector__icon" aria-hidden="true">{mode.icon}</span>
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
