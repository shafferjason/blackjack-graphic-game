import type { GameStats } from '../types'

interface ScoreboardProps {
  stats: GameStats
}

export default function Scoreboard({ stats }: ScoreboardProps) {
  return (
    <div className="stats-bar" role="status" aria-live="polite" aria-label="Game score">
      <span className="stat win-stat" aria-label={`Wins: ${stats.wins}`}>W {stats.wins}</span>
      <span className="stat loss-stat" aria-label={`Losses: ${stats.losses}`}>L {stats.losses}</span>
      <span className="stat push-stat" aria-label={`Draws: ${stats.pushes}`}>D {stats.pushes}</span>
    </div>
  )
}
