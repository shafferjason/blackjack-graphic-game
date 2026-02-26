import { useState, useEffect, useCallback, useRef } from 'react'
import './ChipAnimation.css'

interface AnimatedChip {
  id: number
  amount: number
  direction: 'to-bet' | 'to-player'
}

interface ChipAnimationProps {
  /** Triggers a chip-to-bet animation when incremented */
  betTrigger: { amount: number; seq: number }
  /** Triggers a chip-to-player animation when incremented */
  winTrigger: { amount: number; seq: number }
}

const CHIP_COLORS: Record<number, string> = {
  10: 'chip-anim-10',
  25: 'chip-anim-25',
  50: 'chip-anim-50',
  100: 'chip-anim-100',
}

function getChipClass(amount: number): string {
  // Find the best matching chip denomination
  if (amount >= 100) return CHIP_COLORS[100]
  if (amount >= 50) return CHIP_COLORS[50]
  if (amount >= 25) return CHIP_COLORS[25]
  return CHIP_COLORS[10]
}

/** Break a payout amount into visual chip tokens for the animation */
function decomposeIntoChips(amount: number): number[] {
  const chips: number[] = []
  const denoms = [100, 50, 25, 10]
  let remaining = amount
  for (const d of denoms) {
    while (remaining >= d && chips.length < 5) {
      chips.push(d)
      remaining -= d
    }
  }
  // If there's leftover (e.g. odd payout), add one more small chip
  if (remaining > 0 && chips.length < 5) {
    chips.push(10)
  }
  // Limit to 5 chips max for visual clarity
  return chips.slice(0, 5)
}

export default function ChipAnimation({ betTrigger, winTrigger }: ChipAnimationProps) {
  const [chips, setChips] = useState<AnimatedChip[]>([])
  const idRef = useRef(0)
  const prevBetSeq = useRef(betTrigger.seq)
  const prevWinSeq = useRef(winTrigger.seq)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const removeChip = useCallback((chipId: number) => {
    setChips(prev => prev.filter(c => c.id !== chipId))
  }, [])

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  // Bet placement animation
  useEffect(() => {
    if (betTrigger.seq === prevBetSeq.current) return
    prevBetSeq.current = betTrigger.seq

    const newChip: AnimatedChip = {
      id: ++idRef.current,
      amount: betTrigger.amount,
      direction: 'to-bet',
    }
    setChips(prev => [...prev, newChip])

    // Auto-remove after animation completes
    const chipId = newChip.id
    const t = setTimeout(() => removeChip(chipId), 600)
    timersRef.current.push(t)
  }, [betTrigger, removeChip])

  // Win payout animation
  useEffect(() => {
    if (winTrigger.seq === prevWinSeq.current) return
    prevWinSeq.current = winTrigger.seq

    const chipAmounts = decomposeIntoChips(winTrigger.amount)
    const newChips: AnimatedChip[] = chipAmounts.map((amount) => ({
      id: ++idRef.current,
      amount,
      direction: 'to-player' as const,
    }))

    // Stagger the win chips slightly
    newChips.forEach((chip, i) => {
      const t1 = setTimeout(() => {
        setChips(prev => [...prev, chip])
        const t2 = setTimeout(() => removeChip(chip.id), 700)
        timersRef.current.push(t2)
      }, i * 100)
      timersRef.current.push(t1)
    })
  }, [winTrigger, removeChip])

  if (chips.length === 0) return null

  return (
    <div className="chip-animation-layer" aria-hidden="true">
      {chips.map(chip => (
        <div
          key={chip.id}
          className={`chip-anim ${getChipClass(chip.amount)} ${chip.direction}`}
        >
          ${chip.amount}
        </div>
      ))}
    </div>
  )
}
