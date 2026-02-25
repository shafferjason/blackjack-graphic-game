import { useState, useRef, useEffect } from 'react'
import { useGameSettings } from '../config/GameSettingsContext'
import type { CardBackTheme, TableFeltTheme } from '../types'

interface SettingsPanelProps {
  isPlaying: boolean
  onResetEverything: () => void
}

export default function SettingsPanel({ isPlaying, onResetEverything }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const settings = useGameSettings()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus close button when dialog opens and handle Escape key
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setShowResetConfirm(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const {
    NUM_DECKS,
    DEALER_HITS_SOFT_17,
    BLACKJACK_PAYOUT_RATIO,
    ALLOW_DOUBLE_AFTER_SPLIT,
    ALLOW_SURRENDER,
    CARD_BACK_THEME,
    TABLE_FELT_THEME,
    STRATEGY_TRAINER_ENABLED,
    CARD_COUNTING_ENABLED,
    SIDE_BETS_ENABLED,
    updateSetting,
  } = settings

  const feltThemes: { value: TableFeltTheme; label: string; color: string }[] = [
    { value: 'classic-green', label: 'Green', color: '#0b6623' },
    { value: 'navy-blue', label: 'Blue', color: '#1a3a6b' },
    { value: 'casino-red', label: 'Red', color: '#6b1a1a' },
    { value: 'royal-purple', label: 'Purple', color: '#4a1a6b' },
  ]

  const cardBackThemes: { value: CardBackTheme; label: string; color: string }[] = [
    { value: 'classic-blue', label: 'Blue', color: '#1a3a5c' },
    { value: 'casino-red', label: 'Red', color: '#5c1a1a' },
    { value: 'royal-green', label: 'Green', color: '#1a4a2a' },
    { value: 'midnight-gold', label: 'Gold', color: '#1a1a2e' },
  ]

  const handleResetEverything = () => {
    onResetEverything()
    setShowResetConfirm(false)
    setOpen(false)
  }

  return (
    <>
      <button
        className="settings-toggle"
        onClick={() => setOpen(!open)}
        title="House Rules"
        aria-label="Open house rules settings"
      >
        &#9881;
      </button>

      {open && (
        <div className="settings-overlay" onClick={() => { setOpen(false); setShowResetConfirm(false) }} role="dialog" aria-modal="true" aria-label="House Rules Settings">
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <h2>House Rules</h2>
              <button ref={closeButtonRef} className="settings-close" onClick={() => { setOpen(false); setShowResetConfirm(false) }} aria-label="Close settings">&times;</button>
            </div>

            {isPlaying && (
              <div className="settings-notice">
                Changes take effect next round.
              </div>
            )}

            <div className="settings-body">
              {/* Number of Decks */}
              <div className="setting-row" role="group" aria-label="Number of Decks">
                <label className="setting-label">Number of Decks</label>
                <div className="setting-options">
                  {[1, 2, 6, 8].map(n => (
                    <button
                      key={n}
                      className={`setting-chip ${NUM_DECKS === n ? 'setting-chip-active' : ''}`}
                      onClick={() => updateSetting('NUM_DECKS', n)}
                      aria-pressed={NUM_DECKS === n}
                      aria-label={`${n} deck${n > 1 ? 's' : ''}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dealer Soft 17 */}
              <div className="setting-row" role="group" aria-label="Dealer on Soft 17">
                <label className="setting-label">Dealer on Soft 17</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${!DEALER_HITS_SOFT_17 ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('DEALER_HITS_SOFT_17', false)}
                    aria-pressed={!DEALER_HITS_SOFT_17}
                  >
                    Stands
                  </button>
                  <button
                    className={`setting-chip ${DEALER_HITS_SOFT_17 ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('DEALER_HITS_SOFT_17', true)}
                    aria-pressed={DEALER_HITS_SOFT_17}
                  >
                    Hits
                  </button>
                </div>
              </div>

              {/* Blackjack Payout */}
              <div className="setting-row" role="group" aria-label="Blackjack Payout">
                <label className="setting-label">Blackjack Payout</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${BLACKJACK_PAYOUT_RATIO === 1.5 ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('BLACKJACK_PAYOUT_RATIO', 1.5)}
                    aria-pressed={BLACKJACK_PAYOUT_RATIO === 1.5}
                  >
                    3:2
                  </button>
                  <button
                    className={`setting-chip ${BLACKJACK_PAYOUT_RATIO === 1.2 ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('BLACKJACK_PAYOUT_RATIO', 1.2)}
                    aria-pressed={BLACKJACK_PAYOUT_RATIO === 1.2}
                  >
                    6:5
                  </button>
                </div>
              </div>

              {/* Double After Split */}
              <div className="setting-row" role="group" aria-label="Double After Split">
                <label className="setting-label">Double After Split</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${ALLOW_DOUBLE_AFTER_SPLIT ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('ALLOW_DOUBLE_AFTER_SPLIT', true)}
                    aria-pressed={ALLOW_DOUBLE_AFTER_SPLIT}
                  >
                    Allowed
                  </button>
                  <button
                    className={`setting-chip ${!ALLOW_DOUBLE_AFTER_SPLIT ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('ALLOW_DOUBLE_AFTER_SPLIT', false)}
                    aria-pressed={!ALLOW_DOUBLE_AFTER_SPLIT}
                  >
                    Not Allowed
                  </button>
                </div>
              </div>

              {/* Surrender */}
              <div className="setting-row" role="group" aria-label="Surrender">
                <label className="setting-label">Surrender</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${ALLOW_SURRENDER ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('ALLOW_SURRENDER', true)}
                    aria-pressed={ALLOW_SURRENDER}
                  >
                    Allowed
                  </button>
                  <button
                    className={`setting-chip ${!ALLOW_SURRENDER ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('ALLOW_SURRENDER', false)}
                    aria-pressed={!ALLOW_SURRENDER}
                  >
                    Not Allowed
                  </button>
                </div>
              </div>

              {/* Strategy Trainer */}
              <div className="setting-row" role="group" aria-label="Strategy Trainer Mode">
                <label className="setting-label">Strategy Trainer</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${STRATEGY_TRAINER_ENABLED ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('STRATEGY_TRAINER_ENABLED', true)}
                    aria-pressed={STRATEGY_TRAINER_ENABLED}
                  >
                    On
                  </button>
                  <button
                    className={`setting-chip ${!STRATEGY_TRAINER_ENABLED ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('STRATEGY_TRAINER_ENABLED', false)}
                    aria-pressed={!STRATEGY_TRAINER_ENABLED}
                  >
                    Off
                  </button>
                </div>
              </div>

              {/* Card Counting Practice */}
              <div className="setting-row" role="group" aria-label="Card Counting Practice Mode">
                <label className="setting-label">Card Counting</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${CARD_COUNTING_ENABLED ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('CARD_COUNTING_ENABLED', true)}
                    aria-pressed={CARD_COUNTING_ENABLED}
                  >
                    On
                  </button>
                  <button
                    className={`setting-chip ${!CARD_COUNTING_ENABLED ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('CARD_COUNTING_ENABLED', false)}
                    aria-pressed={!CARD_COUNTING_ENABLED}
                  >
                    Off
                  </button>
                </div>
              </div>

              {/* Side Bets */}
              <div className="setting-row" role="group" aria-label="Side Bets">
                <label className="setting-label">Side Bets</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${SIDE_BETS_ENABLED ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('SIDE_BETS_ENABLED', true)}
                    aria-pressed={SIDE_BETS_ENABLED}
                  >
                    On
                  </button>
                  <button
                    className={`setting-chip ${!SIDE_BETS_ENABLED ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('SIDE_BETS_ENABLED', false)}
                    aria-pressed={!SIDE_BETS_ENABLED}
                  >
                    Off
                  </button>
                </div>
              </div>

              {/* Card Back Theme */}
              <div className="setting-row" role="group" aria-label="Card Back Design">
                <label className="setting-label">Card Back Design</label>
                <div className="setting-options">
                  {cardBackThemes.map(t => (
                    <button
                      key={t.value}
                      className={`setting-chip card-back-chip ${CARD_BACK_THEME === t.value ? 'setting-chip-active' : ''}`}
                      onClick={() => updateSetting('CARD_BACK_THEME', t.value)}
                      aria-pressed={CARD_BACK_THEME === t.value}
                      aria-label={`${t.label} card back`}
                    >
                      <span className="card-back-swatch" style={{ background: t.color }} aria-hidden="true" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Felt Color */}
              <div className="setting-row" role="group" aria-label="Table Felt Color">
                <label className="setting-label">Table Felt Color</label>
                <div className="setting-options">
                  {feltThemes.map(t => (
                    <button
                      key={t.value}
                      className={`setting-chip card-back-chip ${TABLE_FELT_THEME === t.value ? 'setting-chip-active' : ''}`}
                      onClick={() => updateSetting('TABLE_FELT_THEME', t.value)}
                      aria-pressed={TABLE_FELT_THEME === t.value}
                      aria-label={`${t.label} table felt`}
                    >
                      <span className="card-back-swatch" style={{ background: t.color }} aria-hidden="true" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Everything */}
              <div className="setting-row reset-section">
                {!showResetConfirm ? (
                  <button
                    className="btn-reset-everything"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    Reset Everything
                  </button>
                ) : (
                  <div className="reset-confirm">
                    <p className="reset-confirm-text">
                      This will reset your bankroll, stats, and settings to defaults. Are you sure?
                    </p>
                    <div className="reset-confirm-buttons">
                      <button
                        className="btn-reset-confirm"
                        onClick={handleResetEverything}
                      >
                        Yes, Reset
                      </button>
                      <button
                        className="btn-reset-cancel"
                        onClick={() => setShowResetConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
