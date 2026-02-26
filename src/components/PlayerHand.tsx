import Card from './Card'
import type { Hand } from '../types'

interface PlayerHandProps {
  hand: Hand
  playerScore: number
}

export default function PlayerHand({ hand, playerScore }: PlayerHandProps) {
  const scoreText = hand.length > 0
    ? playerScore > 21
      ? `Your score: ${playerScore}, bust`
      : `Your score: ${playerScore}`
    : 'Your hand is empty'

  return (
    <section className="hand-area" aria-label="Your hand">
      <div className="hand-header">
        <span className="hand-title">You</span>
        {hand.length > 0 && (
          <span className={`score-pill ${playerScore > 21 ? 'bust' : ''}`} aria-live="polite" aria-label={scoreText}>{playerScore}</span>
        )}
      </div>
      <div className="cards-row" role="list" aria-label="Your cards">
        {hand.map((card, i) => (
          <Card
            key={card.id}
            card={card}
            index={i}
            animationType={i < 2 ? 'deal' : 'hit'}
          />
        ))}
        {hand.length === 0 && (
          <>
            <div className="card-slot" aria-hidden="true" />
            <div className="card-slot" aria-hidden="true" />
          </>
        )}
      </div>
    </section>
  )
}
