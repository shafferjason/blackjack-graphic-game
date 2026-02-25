export interface MultiplayerState {
  name: string
  bankroll: number
  bet: number
  result: string | null
  isActive: boolean
  wins: number
  losses: number
}

interface MultiplayerBarProps {
  players: MultiplayerState[]
  activeIndex: number
  phase: 'betting' | 'playing' | 'results'
}

export default function MultiplayerBar({ players, activeIndex, phase }: MultiplayerBarProps) {
  return (
    <div className="mp-bar" role="region" aria-label="Multiplayer status">
      {players.map((player, i) => (
        <div
          key={i}
          className={`mp-player-slot ${i === activeIndex ? 'mp-player-active' : ''} ${player.result === 'win' || player.result === 'blackjack' ? 'mp-player-won' : ''} ${player.result === 'lose' ? 'mp-player-lost' : ''}`}
          aria-current={i === activeIndex ? 'true' : undefined}
          aria-label={`${player.name}: $${player.bankroll}${player.bet > 0 ? `, bet $${player.bet}` : ''}${i === activeIndex ? ' (active)' : ''}`}
        >
          <span className="mp-slot-name">{player.name}</span>
          <span className="mp-slot-bankroll">${player.bankroll}</span>
          {player.bet > 0 && phase !== 'results' && (
            <span className="mp-slot-bet">Bet: ${player.bet}</span>
          )}
          {phase === 'results' && player.result && (
            <span className={`mp-slot-result mp-result-${player.result}`}>
              {player.result === 'win' ? 'WIN' : player.result === 'blackjack' ? 'BJ!' : player.result === 'push' ? 'PUSH' : 'LOSE'}
            </span>
          )}
          <span className="mp-slot-record">{player.wins}W/{player.losses}L</span>
        </div>
      ))}
    </div>
  )
}
