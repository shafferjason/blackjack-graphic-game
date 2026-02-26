import { useRef, useEffect } from 'react'
import ChipStack from './ChipStack'
import { useGameSettings } from '../config/GameSettingsContext'

interface BettingControlsProps {
  chips: number
  bet: number
  onPlaceBet: (amount: number) => void
  onClearBet: () => void
  onAllIn: () => void
  onDeal: () => void
  onButtonClick?: () => void
}

export default function BettingControls({ chips, bet, onPlaceBet, onClearBet, onAllIn, onDeal, onButtonClick }: BettingControlsProps) {
  const { CHIP_DENOMINATIONS } = useGameSettings()
  const firstChipRef = useRef<HTMLButtonElement>(null)

  // Focus first available chip button on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      firstChipRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="betting-panel" role="group" aria-label="Place your bet">
      <ChipStack chips={chips} bet={bet} />
      <div className="chip-row" role="group" aria-label="Chip denominations">
        {CHIP_DENOMINATIONS.map((amount, index) => (
          <button
            key={amount}
            ref={index === 0 ? firstChipRef : undefined}
            className={`chip chip-${amount}`}
            onClick={() => onPlaceBet(amount)}
            disabled={chips < amount || (chips - bet) < amount}
            title={`$${amount} chip (${index + 1})`}
            aria-label={`Add $${amount} chip to bet, press ${index + 1}`}
          >
            ${amount}
          </button>
        ))}
      </div>
      <div className="bet-actions" role="group" aria-label="Bet actions">
        <button className="btn btn-outline" onClick={() => { onButtonClick?.(); onClearBet() }} disabled={bet === 0} title="Clear bet (C)" aria-label="Clear bet, press C">Clear</button>
        <button className="btn btn-allin" onClick={() => { onButtonClick?.(); onAllIn() }} disabled={chips === 0 && bet === 0} title="All In (A)" aria-label={`All in, bet entire bankroll of $${chips}, press A`}>All In</button>
        <button className="btn btn-primary" onClick={() => { onButtonClick?.(); onDeal() }} disabled={bet === 0} title="Deal (N / Enter)" aria-label={bet === 0 ? 'Deal cards, place a bet first' : `Deal cards with $${bet} bet, press Enter`}>Deal</button>
      </div>
    </div>
  )
}
