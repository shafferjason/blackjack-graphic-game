import Card from './Card'
import { cardValue } from '../utils/scoring'
import type { Hand } from '../types'

interface DealerHandProps {
  hand: Hand
  dealerRevealed: boolean
  dealerVisibleScore: number
}

export default function DealerHand({ hand, dealerRevealed, dealerVisibleScore }: DealerHandProps) {
  return (
    <section className="hand-area">
      <div className="hand-header">
        <span className="hand-title">Dealer</span>
        {hand.length > 0 && (
          <span className="score-pill">
            {dealerRevealed ? dealerVisibleScore : `${cardValue(hand[0])} + ?`}
          </span>
        )}
      </div>
      <div className="cards-row">
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
            <div className="card-slot" />
            <div className="card-slot" />
          </>
        )}
      </div>
    </section>
  )
}
