import type { ResolvedAction } from '../utils/basicStrategy'
import { actionLabel } from '../utils/basicStrategy'

interface StrategyOverlayProps {
  optimalAction: ResolvedAction | null
  lastFeedback: { action: string; correct: boolean } | null
  accuracy: { correct: number; total: number }
}

export default function StrategyOverlay({ optimalAction, lastFeedback, accuracy }: StrategyOverlayProps) {
  const pct = accuracy.total > 0 ? Math.round((accuracy.correct / accuracy.total) * 100) : 0

  return (
    <div className="strategy-overlay" role="region" aria-label="Basic strategy trainer">
      {/* Strategy suggestion */}
      {optimalAction && (
        <div className="strategy-suggestion" aria-live="polite">
          <span className="strategy-label">Optimal:</span>
          <span className="strategy-action">{actionLabel(optimalAction)}</span>
        </div>
      )}

      {/* Feedback flash */}
      {lastFeedback && (
        <div
          className={`strategy-feedback ${lastFeedback.correct ? 'strategy-correct' : 'strategy-mistake'}`}
          aria-live="assertive"
        >
          {lastFeedback.correct ? 'Correct!' : `Optimal was ${lastFeedback.action}`}
        </div>
      )}

      {/* Accuracy meter */}
      {accuracy.total > 0 && (
        <div className="strategy-accuracy" aria-label={`Strategy accuracy: ${pct}% over ${accuracy.total} decisions`}>
          <span className="strategy-accuracy-label">Accuracy:</span>
          <span className="strategy-accuracy-value">{pct}%</span>
          <span className="strategy-accuracy-detail">({accuracy.correct}/{accuracy.total})</span>
        </div>
      )}
    </div>
  )
}
