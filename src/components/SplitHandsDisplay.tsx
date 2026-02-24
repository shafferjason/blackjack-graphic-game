import Card from './Card'
import { calculateScore } from '../utils/scoring'
import type { SplitHand } from '../types'

interface SplitHandsDisplayProps {
  splitHands: SplitHand[]
  activeHandIndex: number
  isPlaying: boolean
}

export default function SplitHandsDisplay({ splitHands, activeHandIndex, isPlaying }: SplitHandsDisplayProps) {
  return (
    <div className="split-hands-container" role="region" aria-label="Split hands">
      {splitHands.map((hand, i) => {
        const score = calculateScore(hand.cards)
        const isActive = isPlaying && i === activeHandIndex
        const isBust = score > 21
        const resultClass = hand.result === 'win' ? 'split-win' : hand.result === 'lose' ? 'split-lose' : hand.result === 'push' ? 'split-push' : ''
        const handLabel = `Hand ${i + 1}${isActive ? ', currently playing' : ''}${isBust ? ', bust' : ''}, score: ${score}`

        return (
          <section
            key={i}
            className={`split-hand ${isActive ? 'split-hand-active' : ''} ${resultClass}`}
            aria-label={handLabel}
            aria-current={isActive ? 'true' : undefined}
          >
            <div className="hand-header">
              <span className="hand-title">Hand {i + 1}</span>
              {hand.cards.length > 0 && (
                <span className={`score-pill ${isBust ? 'bust' : ''}`} aria-label={`Score: ${score}${isBust ? ', bust' : ''}`}>{score}</span>
              )}
              {hand.result && (
                <span className={`split-result-badge split-result-${hand.result}`}>
                  {hand.result === 'win' ? 'Win' : hand.result === 'lose' ? 'Lose' : 'Push'}
                </span>
              )}
            </div>
            <div className="cards-row" role="list" aria-label={`Hand ${i + 1} cards`}>
              {hand.cards.map((card, ci) => (
                <Card
                  key={card.id}
                  card={card}
                  index={ci}
                  animationType={ci < 2 ? 'none' : 'hit'}
                />
              ))}
            </div>
            <div className="split-bet-tag" aria-label={`Bet: $${hand.bet}`}>Bet: ${hand.bet}</div>
          </section>
        )
      })}
    </div>
  )
}
