import { useState } from 'react'
import { useGameSettings } from '../config/GameSettingsContext'
import type { CardBackTheme } from '../types'

interface SettingsPanelProps {
  isPlaying: boolean
  onResetEverything: () => void
}

export default function SettingsPanel({ isPlaying, onResetEverything }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const settings = useGameSettings()

  const {
    NUM_DECKS,
    DEALER_HITS_SOFT_17,
    BLACKJACK_PAYOUT_RATIO,
    ALLOW_DOUBLE_AFTER_SPLIT,
    ALLOW_SURRENDER,
    CARD_BACK_THEME,
    updateSetting,
  } = settings

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
      >
        &#9881;
      </button>

      {open && (
        <div className="settings-overlay" onClick={() => { setOpen(false); setShowResetConfirm(false) }}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <h2>House Rules</h2>
              <button className="settings-close" onClick={() => { setOpen(false); setShowResetConfirm(false) }}>&times;</button>
            </div>

            {isPlaying && (
              <div className="settings-notice">
                Changes take effect next round.
              </div>
            )}

            <div className="settings-body">
              {/* Number of Decks */}
              <div className="setting-row">
                <label className="setting-label">Number of Decks</label>
                <div className="setting-options">
                  {[1, 2, 6, 8].map(n => (
                    <button
                      key={n}
                      className={`setting-chip ${NUM_DECKS === n ? 'setting-chip-active' : ''}`}
                      onClick={() => updateSetting('NUM_DECKS', n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dealer Soft 17 */}
              <div className="setting-row">
                <label className="setting-label">Dealer on Soft 17</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${!DEALER_HITS_SOFT_17 ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('DEALER_HITS_SOFT_17', false)}
                  >
                    Stands
                  </button>
                  <button
                    className={`setting-chip ${DEALER_HITS_SOFT_17 ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('DEALER_HITS_SOFT_17', true)}
                  >
                    Hits
                  </button>
                </div>
              </div>

              {/* Blackjack Payout */}
              <div className="setting-row">
                <label className="setting-label">Blackjack Payout</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${BLACKJACK_PAYOUT_RATIO === 1.5 ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('BLACKJACK_PAYOUT_RATIO', 1.5)}
                  >
                    3:2
                  </button>
                  <button
                    className={`setting-chip ${BLACKJACK_PAYOUT_RATIO === 1.2 ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('BLACKJACK_PAYOUT_RATIO', 1.2)}
                  >
                    6:5
                  </button>
                </div>
              </div>

              {/* Double After Split */}
              <div className="setting-row">
                <label className="setting-label">Double After Split</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${ALLOW_DOUBLE_AFTER_SPLIT ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('ALLOW_DOUBLE_AFTER_SPLIT', true)}
                  >
                    Allowed
                  </button>
                  <button
                    className={`setting-chip ${!ALLOW_DOUBLE_AFTER_SPLIT ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('ALLOW_DOUBLE_AFTER_SPLIT', false)}
                  >
                    Not Allowed
                  </button>
                </div>
              </div>

              {/* Surrender */}
              <div className="setting-row">
                <label className="setting-label">Surrender</label>
                <div className="setting-options">
                  <button
                    className={`setting-chip ${ALLOW_SURRENDER ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('ALLOW_SURRENDER', true)}
                  >
                    Allowed
                  </button>
                  <button
                    className={`setting-chip ${!ALLOW_SURRENDER ? 'setting-chip-active' : ''}`}
                    onClick={() => updateSetting('ALLOW_SURRENDER', false)}
                  >
                    Not Allowed
                  </button>
                </div>
              </div>

              {/* Card Back Theme */}
              <div className="setting-row">
                <label className="setting-label">Card Back Design</label>
                <div className="setting-options">
                  {cardBackThemes.map(t => (
                    <button
                      key={t.value}
                      className={`setting-chip card-back-chip ${CARD_BACK_THEME === t.value ? 'setting-chip-active' : ''}`}
                      onClick={() => updateSetting('CARD_BACK_THEME', t.value)}
                    >
                      <span className="card-back-swatch" style={{ background: t.color }} />
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
