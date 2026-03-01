import { useReducer, useCallback, useEffect, useRef } from 'react'

// ── Types ──

export type SlotsPhase = 'idle' | 'spinning' | 'result'

export const SLOT_SYMBOLS = ['7', 'BAR', 'cherry', 'bell', 'lemon', 'grape', 'diamond', 'star'] as const
export type SlotSymbol = typeof SLOT_SYMBOLS[number]

export const SYMBOL_DISPLAY: Record<SlotSymbol, string> = {
  '7': '7️⃣',
  'BAR': '🅱️',
  'cherry': '🍒',
  'bell': '🔔',
  'lemon': '🍋',
  'grape': '🍇',
  'diamond': '💎',
  'star': '⭐',
}

// Weighted symbol distribution (lower index = rarer)
const REEL_WEIGHTS: { symbol: SlotSymbol; weight: number }[] = [
  { symbol: '7', weight: 2 },
  { symbol: 'diamond', weight: 3 },
  { symbol: 'star', weight: 4 },
  { symbol: 'BAR', weight: 5 },
  { symbol: 'bell', weight: 8 },
  { symbol: 'cherry', weight: 10 },
  { symbol: 'grape', weight: 12 },
  { symbol: 'lemon', weight: 12 },
]

const TOTAL_WEIGHT = REEL_WEIGHTS.reduce((s, w) => s + w.weight, 0)

function randomSymbol(): SlotSymbol {
  let r = Math.random() * TOTAL_WEIGHT
  for (const entry of REEL_WEIGHTS) {
    r -= entry.weight
    if (r <= 0) return entry.symbol
  }
  return 'lemon'
}

// Payouts: multiplier on bet amount
export const PAYOUT_TABLE: { match: string; multiplier: number; description: string }[] = [
  { match: '7-7-7', multiplier: 100, description: 'Triple 7s — JACKPOT' },
  { match: 'diamond-diamond-diamond', multiplier: 50, description: 'Triple Diamonds' },
  { match: 'star-star-star', multiplier: 30, description: 'Triple Stars' },
  { match: 'BAR-BAR-BAR', multiplier: 20, description: 'Triple BARs' },
  { match: 'bell-bell-bell', multiplier: 15, description: 'Triple Bells' },
  { match: 'cherry-cherry-cherry', multiplier: 10, description: 'Triple Cherries' },
  { match: 'grape-grape-grape', multiplier: 8, description: 'Triple Grapes' },
  { match: 'lemon-lemon-lemon', multiplier: 5, description: 'Triple Lemons' },
  { match: 'cherry-cherry-*', multiplier: 3, description: 'Two Cherries' },
  { match: 'cherry-*-*', multiplier: 1, description: 'One Cherry' },
]

function calculatePayout(reels: SlotSymbol[], bet: number): { multiplier: number; label: string } {
  const key = reels.join('-')

  // Check triple matches
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    const entry = PAYOUT_TABLE.find(p => p.match === key)
    if (entry) return { multiplier: entry.multiplier, label: entry.description }
  }

  // Two cherries (first two)
  if (reels[0] === 'cherry' && reels[1] === 'cherry') {
    return { multiplier: 3, label: 'Two Cherries' }
  }

  // One cherry (first reel)
  if (reels[0] === 'cherry') {
    return { multiplier: 1, label: 'One Cherry — Push' }
  }

  return { multiplier: 0, label: '' }
}

export interface SlotsState {
  phase: SlotsPhase
  reels: SlotSymbol[]  // 3 reels
  bet: number
  winAmount: number
  winLabel: string
  message: string
  lastWins: { reels: SlotSymbol[]; amount: number }[]
}

type SlotsAction =
  | { type: 'SET_BET'; amount: number }
  | { type: 'SPIN' }
  | { type: 'RESOLVE'; reels: SlotSymbol[] }
  | { type: 'NEW_ROUND' }

function slotsReducer(state: SlotsState, action: SlotsAction): SlotsState {
  switch (action.type) {
    case 'SET_BET':
      return { ...state, bet: action.amount }

    case 'SPIN':
      return { ...state, phase: 'spinning', message: 'Spinning...', winAmount: 0, winLabel: '' }

    case 'RESOLVE': {
      const { multiplier, label } = calculatePayout(action.reels, state.bet)
      const winAmount = state.bet * multiplier
      let message: string
      if (multiplier > 0) {
        message = multiplier === 1
          ? `${label} — Push! Bet returned.`
          : `${label}! You win $${winAmount}!`
      } else {
        message = 'No match. Try again!'
      }
      const lastWins = winAmount > state.bet
        ? [{ reels: action.reels, amount: winAmount }, ...state.lastWins].slice(0, 5)
        : state.lastWins

      return {
        ...state,
        phase: 'result',
        reels: action.reels,
        winAmount,
        winLabel: label,
        message,
        lastWins,
      }
    }

    case 'NEW_ROUND':
      return {
        ...state,
        phase: 'idle',
        winAmount: 0,
        winLabel: '',
        message: 'Set your bet and spin!',
      }

    default:
      return state
  }
}

function createInitialState(): SlotsState {
  return {
    phase: 'idle',
    reels: ['cherry', 'bell', 'star'],
    bet: 10,
    winAmount: 0,
    winLabel: '',
    message: 'Set your bet and spin!',
    lastWins: [],
  }
}

export function useSlots(chips: number, onChipsChange: (newChips: number) => void) {
  const [state, dispatch] = useReducer(slotsReducer, undefined, createInitialState)
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chipsAtSpinRef = useRef(chips)

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current)
    }
  }, [])

  const setBet = useCallback((amount: number) => {
    if (state.phase !== 'idle') return
    const clamped = Math.max(1, Math.min(amount, chips))
    dispatch({ type: 'SET_BET', amount: clamped })
  }, [state.phase, chips])

  const spin = useCallback(() => {
    if (state.phase !== 'idle' || state.bet > chips || state.bet <= 0) return

    chipsAtSpinRef.current = chips
    onChipsChange(chips - state.bet)
    dispatch({ type: 'SPIN' })

    const reels: SlotSymbol[] = [randomSymbol(), randomSymbol(), randomSymbol()]

    spinTimerRef.current = setTimeout(() => {
      dispatch({ type: 'RESOLVE', reels })
    }, 1800)
  }, [state.phase, state.bet, chips, onChipsChange])

  // Add winnings when result resolves
  useEffect(() => {
    if (state.phase === 'result' && state.winAmount > 0) {
      const currentChips = chipsAtSpinRef.current - state.bet
      onChipsChange(currentChips + state.winAmount)
    }
  }, [state.phase, state.winAmount, state.bet, onChipsChange])

  const newRound = useCallback(() => {
    dispatch({ type: 'NEW_ROUND' })
  }, [])

  return {
    state,
    setBet,
    spin,
    newRound,
  }
}
