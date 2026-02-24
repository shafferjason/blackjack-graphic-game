import Card from './Card'
import type { Hand } from '../types'

interface PlayerHandProps {
  hand: Hand
  playerScore: number
}

export default function PlayerHand({ hand, playerScore }: PlayerHandProps) {
  return (
    <section className="hand-area">
      <div className="hand-header">
        <span className="hand-title">You</span>
        {hand.length > 0 && (
          <span className={`score-pill ${playerScore > 21 ? 'bust' : ''}`}>{playerScore}</span>
        )}
      </div>
      <div className="cards-row">
        {hand.map((card, i) => (
          <Card
            key={card.id}
            card={card}
            index={i}
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
