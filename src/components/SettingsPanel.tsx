import { useState } from 'react'
import { useGameSettings } from '../config/GameSettingsContext'

interface SettingsPanelProps {
  isPlaying: boolean
}

export default function SettingsPanel({ isPlaying }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const settings = useGameSettings()

  const {
    NUM_DECKS,
    DEALER_HITS_SOFT_17,
    BLACKJACK_PAYOUT_RATIO,
    ALLOW_DOUBLE_AFTER_SPLIT,
    ALLOW_SURRENDER,
    updateSetting,
  } = settings

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
        <div className="settings-overlay" onClick={() => setOpen(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <h2>House Rules</h2>
              <button className="settings-close" onClick={() => setOpen(false)}>&times;</button>
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}
