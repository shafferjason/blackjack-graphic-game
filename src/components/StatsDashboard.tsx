import { useState } from 'react'
import type { GameStats, DetailedStats, GameResult } from '../types'

interface StatsDashboardProps {
  stats: GameStats
  detailedStats: DetailedStats
  chips: number
}

function WinRateBar({ stats }: { stats: GameStats }) {
  const total = stats.wins + stats.losses + stats.pushes
  if (total === 0) return null

  const winPct = (stats.wins / total) * 100
  const lossPct = (stats.losses / total) * 100
  const pushPct = (stats.pushes / total) * 100

  return (
    <div className="stats-chart-section">
      <div className="stats-chart-label">Win / Loss / Push Rate</div>
      <svg width="100%" height="32" viewBox="0 0 300 32" preserveAspectRatio="none">
        <rect x="0" y="4" width={winPct * 3} height="24" rx="4" fill="#4ade80" opacity="0.85" />
        <rect x={winPct * 3} y="4" width={lossPct * 3} height="24" rx="0" fill="#f87171" opacity="0.85" />
        <rect x={(winPct + lossPct) * 3} y="4" width={pushPct * 3} height="24" rx="4" fill="#60a5fa" opacity="0.85" />
      </svg>
      <div className="stats-bar-legend">
        <span className="stats-legend-win">W {winPct.toFixed(1)}%</span>
        <span className="stats-legend-loss">L {lossPct.toFixed(1)}%</span>
        <span className="stats-legend-push">D {pushPct.toFixed(1)}%</span>
      </div>
    </div>
  )
}

function ChipHistoryChart({ chipHistory, startingChips }: { chipHistory: number[]; startingChips: number }) {
  if (chipHistory.length < 2) return null

  const data = [startingChips, ...chipHistory]
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 280
  const h = 80
  const padY = 6

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * w + 10
    const y = h - padY - ((val - min) / range) * (h - padY * 2)
    return `${x},${y}`
  })

  const startY = h - padY - ((startingChips - min) / range) * (h - padY * 2)

  return (
    <div className="stats-chart-section">
      <div className="stats-chart-label">Chip History (last {chipHistory.length} hands)</div>
      <svg width="100%" height={h + 10} viewBox={`0 0 300 ${h + 10}`} preserveAspectRatio="none">
        {/* Baseline at starting chips */}
        <line x1="10" y1={startY} x2={w + 10} y2={startY} stroke="rgba(255,255,255,0.15)" strokeDasharray="4" />
        {/* Line */}
        <polyline
          fill="none"
          stroke="#d4a644"
          strokeWidth="2"
          points={points.join(' ')}
        />
        {/* Area fill */}
        <polygon
          fill="url(#chipGrad)"
          opacity="0.3"
          points={`10,${h - padY} ${points.join(' ')} ${w + 10},${h - padY}`}
        />
        <defs>
          <linearGradient id="chipGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a644" />
            <stop offset="100%" stopColor="#d4a644" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function ResultStrip({ resultHistory }: { resultHistory: GameResult[] }) {
  if (resultHistory.length === 0) return null

  const colorMap: Record<string, string> = {
    win: '#4ade80',
    blackjack: '#f0d68a',
    lose: '#f87171',
    push: '#60a5fa',
  }

  const barW = Math.min(6, 280 / resultHistory.length)

  return (
    <div className="stats-chart-section">
      <div className="stats-chart-label">Recent Results</div>
      <svg width="100%" height="24" viewBox={`0 0 300 24`} preserveAspectRatio="none">
        {resultHistory.map((r, i) => (
          <rect
            key={i}
            x={10 + i * (barW + 1)}
            y="2"
            width={barW}
            height="20"
            rx="1"
            fill={colorMap[r] || '#666'}
            opacity="0.85"
          />
        ))}
      </svg>
      <div className="stats-bar-legend">
        <span className="stats-legend-win">Win</span>
        <span style={{ color: '#f0d68a', fontSize: '0.7rem' }}>BJ</span>
        <span className="stats-legend-loss">Loss</span>
        <span className="stats-legend-push">Push</span>
      </div>
    </div>
  )
}

export default function StatsDashboard({ stats, detailedStats, chips }: StatsDashboardProps) {
  const [open, setOpen] = useState(false)

  const totalHands = detailedStats.totalHandsPlayed
  const totalWagered = detailedStats.totalBetAmount
  const avgBet = totalHands > 0 ? totalWagered / totalHands : 0
  const netProfit = chips - detailedStats.startingChips
  const roi = totalWagered > 0 ? (netProfit / totalWagered) * 100 : 0
  const bjFreq = totalHands > 0 ? (detailedStats.blackjackCount / totalHands) * 100 : 0

  return (
    <>
      <button
        className="stats-toggle"
        onClick={() => setOpen(true)}
        title="Statistics"
        aria-label="Open statistics dashboard"
      >
        &#x1F4CA;
      </button>

      {open && (
        <div className="stats-overlay" onClick={() => setOpen(false)}>
          <div className="stats-panel" onClick={e => e.stopPropagation()}>
            <div className="stats-header">
              <h2>Statistics</h2>
              <button className="settings-close" onClick={() => setOpen(false)}>&times;</button>
            </div>

            <div className="stats-body">
              {/* Key metrics grid */}
              <div className="stats-grid">
                <div className="stats-metric">
                  <span className="stats-metric-value">{totalHands}</span>
                  <span className="stats-metric-label">Hands Played</span>
                </div>
                <div className="stats-metric">
                  <span className="stats-metric-value">{stats.wins}</span>
                  <span className="stats-metric-label">Wins</span>
                </div>
                <div className="stats-metric">
                  <span className="stats-metric-value">{stats.losses}</span>
                  <span className="stats-metric-label">Losses</span>
                </div>
                <div className="stats-metric">
                  <span className="stats-metric-value">{stats.pushes}</span>
                  <span className="stats-metric-label">Pushes</span>
                </div>
              </div>

              <WinRateBar stats={stats} />

              <div className="stats-grid">
                <div className="stats-metric">
                  <span className="stats-metric-value">{bjFreq.toFixed(1)}%</span>
                  <span className="stats-metric-label">Blackjack Freq</span>
                </div>
                <div className="stats-metric">
                  <span className="stats-metric-value">${avgBet.toFixed(0)}</span>
                  <span className="stats-metric-label">Avg Bet</span>
                </div>
                <div className="stats-metric">
                  <span className={`stats-metric-value ${netProfit >= 0 ? 'stats-positive' : 'stats-negative'}`}>
                    {netProfit >= 0 ? '+' : ''}${netProfit}
                  </span>
                  <span className="stats-metric-label">Net Profit/Loss</span>
                </div>
                <div className="stats-metric">
                  <span className={`stats-metric-value ${roi >= 0 ? 'stats-positive' : 'stats-negative'}`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                  </span>
                  <span className="stats-metric-label">ROI</span>
                </div>
              </div>

              <ChipHistoryChart chipHistory={detailedStats.chipHistory} startingChips={detailedStats.startingChips} />

              <div className="stats-grid">
                <div className="stats-metric">
                  <span className="stats-metric-value stats-positive">{detailedStats.biggestWinStreak}</span>
                  <span className="stats-metric-label">Best Win Streak</span>
                </div>
                <div className="stats-metric">
                  <span className="stats-metric-value stats-negative">{detailedStats.biggestLossStreak}</span>
                  <span className="stats-metric-label">Worst Loss Streak</span>
                </div>
              </div>

              <ResultStrip resultHistory={detailedStats.resultHistory} />

              {/* Hand type breakdown */}
              <div className="stats-chart-section">
                <div className="stats-chart-label">Hand Types</div>
                <div className="stats-hand-types">
                  <div className="stats-hand-type">
                    <span className="stats-ht-count">{detailedStats.blackjackCount}</span>
                    <span className="stats-ht-label">Blackjack</span>
                  </div>
                  <div className="stats-hand-type">
                    <span className="stats-ht-count">{detailedStats.doubleCount}</span>
                    <span className="stats-ht-label">Double</span>
                  </div>
                  <div className="stats-hand-type">
                    <span className="stats-ht-count">{detailedStats.splitCount}</span>
                    <span className="stats-ht-label">Split</span>
                  </div>
                  <div className="stats-hand-type">
                    <span className="stats-ht-count">{detailedStats.surrenderCount}</span>
                    <span className="stats-ht-label">Surrender</span>
                  </div>
                  {detailedStats.insuranceTaken > 0 && (
                    <div className="stats-hand-type">
                      <span className="stats-ht-count">{detailedStats.insuranceWon}/{detailedStats.insuranceTaken}</span>
                      <span className="stats-ht-label">Insurance W/T</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
