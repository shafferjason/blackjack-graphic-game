export default function ChipStack({ chips, bet }) {
  return (
    <div className="chip-stack">
      <div className="chip-total">
        <span className="chip-coin">$</span>
        <span>{chips}</span>
      </div>
      {bet > 0 && <div className="bet-display">Bet: <strong>${bet}</strong></div>}
    </div>
  )
}
