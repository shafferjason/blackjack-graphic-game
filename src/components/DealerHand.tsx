import Card from './Card'
import { cardValue } from '../utils/scoring'
import type { Hand } from '../types'

interface DealerHandProps {
  hand: Hand
  dealerRevealed: boolean
  dealerVisibleScore: number
}

export default function DealerHand({ hand, dealerRevealed, dealerVisibleScore }: DealerHandProps) {
  const scoreText = hand.length > 0
    ? dealerRevealed
      ? `Dealer score: ${dealerVisibleScore}`
      : `Dealer showing: ${cardValue(hand[0])}, one card hidden`
    : 'Dealer hand empty'

  return (
    <section className="hand-area" aria-label="Dealer hand">
      <div className="hand-header">
        <span className="hand-title">Dealer</span>
        {hand.length > 0 && (
          <span className="score-pill" aria-live="polite" aria-label={scoreText}>
            {dealerRevealed ? dealerVisibleScore : `${cardValue(hand[0])} + ?`}
          </span>
        )}
      </div>
      <div className="cards-row" role="list" aria-label="Dealer cards">
        {hand.map((card, i) => (
          <Card
            key={card.id}
            card={card}
            hidden={i === 1 && !dealerRevealed}
            index={i}
            flipReveal={i === 1}
            animationType={i < 4 ? 'deal' : 'hit'}
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
