import { useReducer, useCallback, useEffect, useRef } from 'react'

// ── Types ──

export type RoulettePhase = 'betting' | 'spinning' | 'result'

export type RouletteBetType =
  | 'straight'    // single number (35:1)
  | 'red'         // red numbers (1:1)
  | 'black'       // black numbers (1:1)
  | 'odd'         // odd numbers (1:1)
  | 'even'        // even numbers (1:1)
  | 'low'         // 1-18 (1:1)
  | 'high'        // 19-36 (1:1)
  | 'dozen_1'     // 1-12 (2:1)
  | 'dozen_2'     // 13-24 (2:1)
  | 'dozen_3'     // 25-36 (2:1)
  | 'col_1'       // column 1 (2:1)
  | 'col_2'       // column 2 (2:1)
  | 'col_3'       // column 3 (2:1)

export interface RouletteBet {
  type: RouletteBetType
  amount: number
  number?: number // only for straight bets
}

export interface RouletteState {
  phase: RoulettePhase
  bets: RouletteBet[]
  result: number | null   // 0-36
  lastResults: number[]   // history of last 10 results
  totalBet: number
  winAmount: number
  message: string
}

type RouletteAction =
  | { type: 'PLACE_BET'; bet: RouletteBet }
  | { type: 'REMOVE_BET'; betType: RouletteBetType; number?: number }
  | { type: 'CLEAR_BETS' }
  | { type: 'SPIN' }
  | { type: 'RESOLVE'; result: number }
  | { type: 'NEW_ROUND' }
  | { type: 'SYNC_CHIPS'; chips: number }

// ── Constants ──

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

// Wheel order (European single-zero)
export const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const PAYOUT_MAP: Record<RouletteBetType, number> = {
  straight: 35,
  red: 1,
  black: 1,
  odd: 1,
  even: 1,
  low: 1,
  high: 1,
  dozen_1: 2,
  dozen_2: 2,
  dozen_3: 2,
  col_1: 2,
  col_2: 2,
  col_3: 2,
}

export function getNumberColor(n: number): 'red' | 'black' | 'green' {
  if (n === 0) return 'green'
  return RED_NUMBERS.includes(n) ? 'red' : 'black'
}

function isBetWin(bet: RouletteBet, result: number): boolean {
  switch (bet.type) {
    case 'straight': return bet.number === result
    case 'red': return RED_NUMBERS.includes(result)
    case 'black': return BLACK_NUMBERS.includes(result)
    case 'odd': return result > 0 && result % 2 === 1
    case 'even': return result > 0 && result % 2 === 0
    case 'low': return result >= 1 && result <= 18
    case 'high': return result >= 19 && result <= 36
    case 'dozen_1': return result >= 1 && result <= 12
    case 'dozen_2': return result >= 13 && result <= 24
    case 'dozen_3': return result >= 25 && result <= 36
    case 'col_1': return result > 0 && result % 3 === 1
    case 'col_2': return result > 0 && result % 3 === 2
    case 'col_3': return result > 0 && result % 3 === 0
  }
}

function calculateWinnings(bets: RouletteBet[], result: number): number {
  let total = 0
  for (const bet of bets) {
    if (isBetWin(bet, result)) {
      total += bet.amount + bet.amount * PAYOUT_MAP[bet.type]
    }
  }
  return total
}

function rouletteReducer(state: RouletteState, action: RouletteAction): RouletteState {
  switch (action.type) {
    case 'PLACE_BET': {
      const existing = state.bets.findIndex(
        b => b.type === action.bet.type && b.number === action.bet.number
      )
      let bets: RouletteBet[]
      if (existing >= 0) {
        bets = state.bets.map((b, i) =>
          i === existing ? { ...b, amount: b.amount + action.bet.amount } : b
        )
      } else {
        bets = [...state.bets, action.bet]
      }
      const totalBet = bets.reduce((s, b) => s + b.amount, 0)
      return { ...state, bets, totalBet, message: '' }
    }

    case 'REMOVE_BET': {
      const bets = state.bets.filter(
        b => !(b.type === action.betType && b.number === action.number)
      )
      const totalBet = bets.reduce((s, b) => s + b.amount, 0)
      return { ...state, bets, totalBet }
    }

    case 'CLEAR_BETS':
      return { ...state, bets: [], totalBet: 0, message: '' }

    case 'SPIN':
      return { ...state, phase: 'spinning', message: 'Spinning...' }

    case 'RESOLVE': {
      const result = action.result
      const winAmount = calculateWinnings(state.bets, result)
      const color = getNumberColor(result)
      const colorLabel = color === 'green' ? 'Green' : color === 'red' ? 'Red' : 'Black'
      const lastResults = [result, ...state.lastResults].slice(0, 10)

      let message: string
      if (winAmount > 0) {
        const profit = winAmount - state.totalBet
        message = `${result} ${colorLabel}! You win $${profit > 0 ? profit : winAmount}!`
      } else {
        message = `${result} ${colorLabel}. You lose $${state.totalBet}.`
      }

      return {
        ...state,
        phase: 'result',
        result,
        lastResults,
        winAmount,
        message,
      }
    }

    case 'NEW_ROUND':
      return {
        ...state,
        phase: 'betting',
        bets: [],
        totalBet: 0,
        result: null,
        winAmount: 0,
        message: 'Place your bets!',
      }

    default:
      return state
  }
}

function createInitialState(): RouletteState {
  return {
    phase: 'betting',
    bets: [],
    result: null,
    lastResults: [],
    totalBet: 0,
    winAmount: 0,
    message: 'Place your bets!',
  }
}

export function useRoulette(chips: number, onChipsChange: (newChips: number) => void) {
  const [state, dispatch] = useReducer(rouletteReducer, undefined, createInitialState)
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chipsAtSpinRef = useRef(chips)

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current)
    }
  }, [])

  const placeBet = useCallback((betType: RouletteBetType, amount: number, number?: number) => {
    if (state.phase !== 'betting') return
    if (amount > chips - state.totalBet) return
    dispatch({ type: 'PLACE_BET', bet: { type: betType, amount, number } })
  }, [state.phase, chips, state.totalBet])

  const removeBet = useCallback((betType: RouletteBetType, number?: number) => {
    if (state.phase !== 'betting') return
    dispatch({ type: 'REMOVE_BET', betType, number })
  }, [state.phase])

  const clearBets = useCallback(() => {
    if (state.phase !== 'betting') return
    dispatch({ type: 'CLEAR_BETS' })
  }, [state.phase])

  const spin = useCallback(() => {
    if (state.phase !== 'betting' || state.bets.length === 0) return

    // Deduct total bet from chips
    chipsAtSpinRef.current = chips
    onChipsChange(chips - state.totalBet)

    dispatch({ type: 'SPIN' })

    // Generate result after spin animation delay
    const result = Math.floor(Math.random() * 37) // 0-36
    spinTimerRef.current = setTimeout(() => {
      dispatch({ type: 'RESOLVE', result })
    }, 2500)
  }, [state.phase, state.bets.length, chips, state.totalBet, onChipsChange])

  // Add winnings when result resolves
  useEffect(() => {
    if (state.phase === 'result' && state.winAmount > 0) {
      // Chips were already deducted at spin time; add back winnings
      const currentChips = chipsAtSpinRef.current - state.totalBet
      onChipsChange(currentChips + state.winAmount)
    }
  }, [state.phase, state.winAmount, state.totalBet, onChipsChange])

  const newRound = useCallback(() => {
    dispatch({ type: 'NEW_ROUND' })
  }, [])

  return {
    state,
    placeBet,
    removeBet,
    clearBets,
    spin,
    newRound,
  }
}
