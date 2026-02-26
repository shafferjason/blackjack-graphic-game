import { useRef, useEffect, useState, useCallback } from 'react'
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
  lastBet?: number
}

export default function BettingControls({ chips, bet, onPlaceBet, onClearBet, onAllIn, onDeal, onButtonClick, lastBet = 0 }: BettingControlsProps) {
  const { CHIP_DENOMINATIONS } = useGameSettings()
  const firstChipRef = useRef<HTMLButtonElement>(null)
  const [chipHistory, setChipHistory] = useState<number[]>([])

  // Focus first available chip button on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      firstChipRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handlePlaceChip = useCallback((amount: number) => {
    onButtonClick?.()
    setChipHistory(prev => [...prev, amount])
    onPlaceBet(amount)
  }, [onPlaceBet, onButtonClick])

  const handleUndo = useCallback(() => {
    if (chipHistory.length === 0) return
    onButtonClick?.()
    // Remove the last chip by clearing and re-placing all except the last
    const newHistory = chipHistory.slice(0, -1)
    onClearBet()
    for (const amount of newHistory) {
      onPlaceBet(amount)
    }
    setChipHistory(newHistory)
  }, [chipHistory, onClearBet, onPlaceBet, onButtonClick])

  const handleClear = useCallback(() => {
    onButtonClick?.()
    setChipHistory([])
    onClearBet()
  }, [onClearBet, onButtonClick])

  const handleRepeatBet = useCallback(() => {
    if (lastBet <= 0 || lastBet > chips) return
    onButtonClick?.()
    onClearBet()
    onPlaceBet(lastBet)
    setChipHistory([lastBet])
  }, [lastBet, chips, onClearBet, onPlaceBet, onButtonClick])

  return (
    <div className="betting-panel" role="group" aria-label="Place your bet">
      <ChipStack chips={chips} bet={bet} />
      <div className="chip-row" role="group" aria-label="Chip denominations">
        {CHIP_DENOMINATIONS.map((amount, index) => (
          <button
            key={amount}
            ref={index === 0 ? firstChipRef : undefined}
            className={`chip chip-${amount}`}
            onClick={() => handlePlaceChip(amount)}
            disabled={chips < amount || (chips - bet) < amount}
            title={`$${amount} chip (${index + 1})`}
            aria-label={`Add $${amount} chip to bet, press ${index + 1}`}
          >
            ${amount}
          </button>
        ))}
      </div>
      <div className="bet-actions" role="group" aria-label="Bet actions">
        <button className="btn btn-outline" onClick={handleUndo} disabled={chipHistory.length === 0} title="Undo last chip (U)" aria-label="Undo last chip, press U">Undo</button>
        <button className="btn btn-outline" onClick={handleClear} disabled={bet === 0} title="Clear bet (C)" aria-label="Clear bet, press C">Clear</button>
        {lastBet > 0 && bet === 0 && lastBet <= chips && (
          <button className="btn btn-outline" onClick={handleRepeatBet} title="Repeat last bet (B)" aria-label={`Repeat last bet of $${lastBet}, press B`}>Repeat ${lastBet}</button>
        )}
        <button className="btn btn-allin" onClick={() => { onButtonClick?.(); onAllIn() }} disabled={chips === 0 && bet === 0} title="All In (A)" aria-label={`All in, bet entire bankroll of $${chips}, press A`}>All In</button>
        <button className="btn btn-primary" onClick={() => { onButtonClick?.(); onDeal() }} disabled={bet === 0} title="Deal (N / Enter)" aria-label={bet === 0 ? 'Deal cards, place a bet first' : `Deal cards with $${bet} bet, press Enter`}>Deal</button>
      </div>
    </div>
  )
}
