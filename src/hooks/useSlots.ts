import { useReducer, useCallback, useEffect, useRef } from 'react'

// ── Types ──

export type SlotsPhase = 'idle' | 'spinning' | 'stopping' | 'result'

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

// Payouts: multiplier on bet amount — 777 is the GRAND PRIZE JACKPOT (highest payout)
export const PAYOUT_TABLE: { match: string; multiplier: number; description: string; isJackpot?: boolean }[] = [
  { match: '7-7-7', multiplier: 777, description: '7-7-7 GRAND JACKPOT', isJackpot: true },
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

function calculatePayout(reels: SlotSymbol[], bet: number): { multiplier: number; label: string; isJackpot: boolean } {
  const key = reels.join('-')

  // Check triple matches
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    const entry = PAYOUT_TABLE.find(p => p.match === key)
    if (entry) return { multiplier: entry.multiplier, label: entry.description, isJackpot: !!entry.isJackpot }
  }

  // Two cherries (first two)
  if (reels[0] === 'cherry' && reels[1] === 'cherry') {
    return { multiplier: 3, label: 'Two Cherries', isJackpot: false }
  }

  // One cherry (first reel)
  if (reels[0] === 'cherry') {
    return { multiplier: 1, label: 'One Cherry — Push', isJackpot: false }
  }

  return { multiplier: 0, label: '', isJackpot: false }
}

export interface SlotsState {
  phase: SlotsPhase
  reels: SlotSymbol[]  // 3 reels
  stoppedReels: [boolean, boolean, boolean]  // which reels have landed
  bet: number
  winAmount: number
  winLabel: string
  message: string
  isJackpot: boolean
  lastWins: { reels: SlotSymbol[]; amount: number }[]
  winStreak: number
  totalSpins: number
  biggestWin: number
  displayedWin: number  // for animated count-up
}

type SlotsAction =
  | { type: 'SET_BET'; amount: number }
  | { type: 'SPIN' }
  | { type: 'STOP_REEL'; index: number; symbol: SlotSymbol }
  | { type: 'RESOLVE'; reels: SlotSymbol[] }
  | { type: 'UPDATE_DISPLAYED_WIN'; amount: number }
  | { type: 'NEW_ROUND' }

function slotsReducer(state: SlotsState, action: SlotsAction): SlotsState {
  switch (action.type) {
    case 'SET_BET':
      return { ...state, bet: action.amount }

    case 'SPIN':
      return {
        ...state,
        phase: 'spinning',
        message: '',
        winAmount: 0,
        winLabel: '',
        isJackpot: false,
        displayedWin: 0,
        stoppedReels: [false, false, false],
        totalSpins: state.totalSpins + 1,
      }

    case 'STOP_REEL': {
      const newReels = [...state.reels] as SlotSymbol[]
      newReels[action.index] = action.symbol
      const newStopped = [...state.stoppedReels] as [boolean, boolean, boolean]
      newStopped[action.index] = true
      return {
        ...state,
        phase: 'stopping',
        reels: newReels,
        stoppedReels: newStopped,
      }
    }

    case 'RESOLVE': {
      const { multiplier, label, isJackpot } = calculatePayout(action.reels, state.bet)
      const winAmount = state.bet * multiplier
      let message: string
      if (isJackpot) {
        message = `GRAND JACKPOT!!! 7-7-7! You win $${winAmount.toLocaleString()}!!!`
      } else if (multiplier > 0) {
        message = multiplier === 1
          ? `${label} — Push! Bet returned.`
          : `${label}! You win $${winAmount.toLocaleString()}!`
      } else {
        message = 'No match. Try again!'
      }

      const isWin = winAmount > state.bet
      const lastWins = isWin
        ? [{ reels: action.reels, amount: winAmount }, ...state.lastWins].slice(0, 5)
        : state.lastWins
      const winStreak = isWin ? state.winStreak + 1 : 0
      const biggestWin = Math.max(state.biggestWin, winAmount)

      if (winStreak >= 3) {
        message += ` 🔥 ${winStreak}-win streak!`
      }

      return {
        ...state,
        phase: 'result',
        reels: action.reels,
        winAmount,
        winLabel: label,
        message,
        isJackpot,
        lastWins,
        winStreak,
        biggestWin,
      }
    }

    case 'UPDATE_DISPLAYED_WIN':
      return { ...state, displayedWin: action.amount }

    case 'NEW_ROUND':
      return {
        ...state,
        phase: 'idle',
        winAmount: 0,
        winLabel: '',
        message: '',
        isJackpot: false,
        displayedWin: 0,
        stoppedReels: [false, false, false],
      }

    default:
      return state
  }
}

function createInitialState(): SlotsState {
  return {
    phase: 'idle',
    reels: ['cherry', 'bell', 'star'],
    stoppedReels: [true, true, true],
    bet: 10,
    winAmount: 0,
    winLabel: '',
    message: '',
    isJackpot: false,
    lastWins: [],
    winStreak: 0,
    totalSpins: 0,
    biggestWin: 0,
    displayedWin: 0,
  }
}

// Stagger timing — reel 1 stops first, then 2, then 3
const SPIN_BASE_MS = 800
const REEL_STAGGER_MS = 300

export function useSlots(chips: number, onChipsChange: (newChips: number) => void) {
  const [state, dispatch] = useReducer(slotsReducer, undefined, createInitialState)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const chipsAtSpinRef = useRef(chips)
  const countUpRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
      if (countUpRef.current) cancelAnimationFrame(countUpRef.current)
    }
  }, [])

  // Animated win count-up
  useEffect(() => {
    if (state.phase !== 'result' || state.winAmount <= 0) return
    const target = state.winAmount
    const duration = Math.min(1500, Math.max(400, target * 2))
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * target)
      dispatch({ type: 'UPDATE_DISPLAYED_WIN', amount: current })
      if (progress < 1) {
        countUpRef.current = requestAnimationFrame(animate)
      }
    }
    countUpRef.current = requestAnimationFrame(animate)
    return () => {
      if (countUpRef.current) cancelAnimationFrame(countUpRef.current)
    }
  }, [state.phase, state.winAmount])

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

    // Clear previous timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    // Staggered reel stops
    reels.forEach((symbol, i) => {
      const delay = SPIN_BASE_MS + (i * REEL_STAGGER_MS)
      const timer = setTimeout(() => {
        dispatch({ type: 'STOP_REEL', index: i, symbol })
      }, delay)
      timersRef.current.push(timer)
    })

    // Final resolve after all reels stopped
    const resolveDelay = SPIN_BASE_MS + (2 * REEL_STAGGER_MS) + 200
    const resolveTimer = setTimeout(() => {
      dispatch({ type: 'RESOLVE', reels })
    }, resolveDelay)
    timersRef.current.push(resolveTimer)
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
