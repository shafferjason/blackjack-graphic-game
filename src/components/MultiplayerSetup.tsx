import { useState, useEffect } from 'react'

export interface PlayerConfig {
  name: string
  bankroll: number
}

interface MultiplayerSetupProps {
  onStart: (players: PlayerConfig[]) => void
  onCancel: () => void
}

const DEFAULT_BANKROLL = 1000

export default function MultiplayerSetup({ onStart, onCancel }: MultiplayerSetupProps) {
  const [players, setPlayers] = useState<PlayerConfig[]>([
    { name: 'Player 1', bankroll: DEFAULT_BANKROLL },
    { name: 'Player 2', bankroll: DEFAULT_BANKROLL },
  ])

  const addPlayer = () => {
    if (players.length >= 4) return
    setPlayers(prev => [...prev, {
      name: `Player ${prev.length + 1}`,
      bankroll: DEFAULT_BANKROLL,
    }])
  }

  const removePlayer = (index: number) => {
    if (players.length <= 2) return
    setPlayers(prev => prev.filter((_, i) => i !== index))
  }

  const updateName = (index: number, name: string) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, name } : p))
  }

  const canStart = players.length >= 2 && players.every(p => p.name.trim().length > 0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div className="mp-setup-overlay" role="dialog" aria-modal="true" aria-label="Multiplayer setup" onClick={onCancel}>
      <div className="mp-setup-panel" onClick={e => e.stopPropagation()}>
        <div className="mp-setup-header">
          <h2>Local Multiplayer</h2>
          <button className="settings-close" onClick={onCancel} aria-label="Cancel">&times;</button>
        </div>

        <div className="mp-setup-body">
          <p className="mp-setup-desc">Add 2-4 players for hot-seat multiplayer. Players take turns at the same table.</p>

          <div className="mp-players-list">
            {players.map((player, index) => (
              <div key={index} className="mp-player-row">
                <span className="mp-player-num">{index + 1}</span>
                <input
                  type="text"
                  className="mp-player-name"
                  value={player.name}
                  onChange={e => updateName(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  maxLength={12}
                  aria-label={`Player ${index + 1} name`}
                />
                <span className="mp-player-bankroll">${player.bankroll}</span>
                {players.length > 2 && (
                  <button
                    className="mp-player-remove"
                    onClick={() => removePlayer(index)}
                    aria-label={`Remove ${player.name}`}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {players.length < 4 && (
            <button className="mp-add-player" onClick={addPlayer}>
              + Add Player
            </button>
          )}
        </div>

        <div className="mp-setup-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onStart(players)} disabled={!canStart}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  )
}
