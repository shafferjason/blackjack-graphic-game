import ChipStack from './ChipStack'
import { useGameSettings } from '../config/GameSettingsContext'

interface BettingControlsProps {
  chips: number
  bet: number
  onPlaceBet: (amount: number) => void
  onClearBet: () => void
  onDeal: () => void
  onButtonClick?: () => void
}

export default function BettingControls({ chips, bet, onPlaceBet, onClearBet, onDeal, onButtonClick }: BettingControlsProps) {
  const { CHIP_DENOMINATIONS } = useGameSettings()
  return (
    <div className="betting-panel">
      <ChipStack chips={chips} bet={bet} />
      <div className="chip-row">
        {CHIP_DENOMINATIONS.map((amount, index) => (
          <button
            key={amount}
            className={`chip chip-${amount}`}
            onClick={() => onPlaceBet(amount)}
            disabled={chips < amount || (chips - bet) < amount}
            title={`$${amount} chip (${index + 1})`}
          >
            ${amount}
          </button>
        ))}
      </div>
      <div className="bet-actions">
        <button className="btn btn-outline" onClick={() => { onButtonClick?.(); onClearBet() }} disabled={bet === 0} title="Clear bet (C)">Clear</button>
        <button className="btn btn-primary" onClick={() => { onButtonClick?.(); onDeal() }} disabled={bet === 0} title="Deal (N / Enter)">Deal</button>
      </div>
    </div>
  )
}
