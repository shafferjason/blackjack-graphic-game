import ChipStack from './ChipStack'
import { useGameSettings } from '../config/GameSettingsContext'

export default function BettingControls({ chips, bet, onPlaceBet, onClearBet, onDeal }) {
  const { CHIP_DENOMINATIONS } = useGameSettings()
  return (
    <div className="betting-panel">
      <ChipStack chips={chips} bet={bet} />
      <div className="chip-row">
        {CHIP_DENOMINATIONS.map(amount => (
          <button
            key={amount}
            className={`chip chip-${amount}`}
            onClick={() => onPlaceBet(amount)}
            disabled={chips < amount || (chips - bet) < amount}
          >
            ${amount}
          </button>
        ))}
      </div>
      <div className="bet-actions">
        <button className="btn btn-outline" onClick={onClearBet} disabled={bet === 0}>Clear</button>
        <button className="btn btn-primary" onClick={onDeal} disabled={bet === 0}>Deal</button>
      </div>
    </div>
  )
}
