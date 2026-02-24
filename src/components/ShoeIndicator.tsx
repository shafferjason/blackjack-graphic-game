interface ShoeIndicatorProps {
  cardsRemaining: number
  shoeSize: number
  cutCardReached: boolean
}

export default function ShoeIndicator({ cardsRemaining, shoeSize, cutCardReached }: ShoeIndicatorProps) {
  if (shoeSize === 0) return null

  const pctRemaining = cardsRemaining / shoeSize
  const cutLine = 1 - 0.75 // 25% from top = 75% penetration

  // Color shifts from green → yellow → red as shoe depletes
  const barColor = pctRemaining > 0.5
    ? '#22c55e'
    : pctRemaining > 0.25
    ? '#eab308'
    : '#ef4444'

  return (
    <div className="shoe-indicator" title={`${cardsRemaining} of ${shoeSize} cards remaining`}>
      <div className="shoe-label">Shoe</div>
      <div className="shoe-track">
        <div
          className="shoe-fill"
          style={{
            height: `${pctRemaining * 100}%`,
            background: barColor,
          }}
        />
        <div
          className="shoe-cut-card"
          style={{ bottom: `${cutLine * 100}%` }}
          title="Cut card"
        />
      </div>
      <div className="shoe-count">{cardsRemaining}</div>
      {cutCardReached && <div className="shoe-reshuffle">Reshuffle</div>}
    </div>
  )
}
