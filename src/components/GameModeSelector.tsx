export type GameMode = 'blackjack' | 'texas_holdem' | 'roulette' | 'slots'

interface GameModeSelectorProps {
  currentMode: GameMode
  onModeChange: (mode: GameMode) => void
}

const MODES: { id: GameMode; label: string; icon: string; disabled: boolean; comingSoon: boolean }[] = [
  { id: 'blackjack', label: 'Blackjack', icon: '\u2660', disabled: false, comingSoon: false },
  { id: 'texas_holdem', label: 'Texas Hold\'em', icon: '\u2663', disabled: false, comingSoon: false },
  { id: 'roulette', label: 'Roulette', icon: '\u25CE', disabled: false, comingSoon: false },
  { id: 'slots', label: 'Slots', icon: '\u2731', disabled: false, comingSoon: false },
]

export default function GameModeSelector({ currentMode, onModeChange }: GameModeSelectorProps) {
  return (
    <div className="mode-selector" role="tablist" aria-label="Game mode">
      {MODES.map(mode => (
        <button
          key={mode.id}
          role="tab"
          aria-selected={currentMode === mode.id}
          aria-disabled={mode.disabled}
          className={[
            'mode-selector__btn',
            currentMode === mode.id ? 'mode-selector__btn--active' : '',
            mode.disabled ? 'mode-selector__btn--disabled' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => !mode.disabled && onModeChange(mode.id)}
          disabled={mode.disabled}
          title={mode.comingSoon ? `${mode.label} — Coming Soon` : mode.label}
        >
          <span className="mode-selector__icon" aria-hidden="true">{mode.icon}</span>
          <span className="mode-selector__label">{mode.label}</span>
          {mode.comingSoon && <span className="mode-selector__badge">Soon</span>}
        </button>
      ))}
    </div>
  )
}
