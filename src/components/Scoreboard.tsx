import type { GameStats } from '../types'

interface ScoreboardProps {
  stats: GameStats
}

export default function Scoreboard({ stats }: ScoreboardProps) {
  return (
    <div className="stats-bar">
      <span className="stat win-stat">W {stats.wins}</span>
      <span className="stat loss-stat">L {stats.losses}</span>
      <span className="stat push-stat">D {stats.pushes}</span>
    </div>
  )
}
