import { useReducer, useCallback, useEffect, useRef } from 'react'

// ── Types ──

export type CoinFlipPhase = 'idle' | 'flipping' | 'result'
export type CoinSide = 'heads' | 'tails'

export interface CoinSkin {
  id: string
  name: string
  price: number
  headsLabel: string
  tailsLabel: string
  headsEmoji: string
  tailsEmoji: string
  headsColor: string
  tailsColor: string
  edgeColor: string
  description: string
}

export const COIN_SKINS: CoinSkin[] = [
  {
    id: 'classic',
    name: 'Classic Gold',
    price: 0,
    headsLabel: 'HEADS',
    tailsLabel: 'TAILS',
    headsEmoji: '👑',
    tailsEmoji: '🦅',
    headsColor: '#d4a017',
    tailsColor: '#b8860b',
    edgeColor: '#8b6914',
    description: 'The standard gold coin. Timeless.',
  },
  {
    id: 'neon',
    name: 'Neon Chip',
    price: 200,
    headsLabel: 'H',
    tailsLabel: 'T',
    headsEmoji: '⚡',
    tailsEmoji: '🌀',
    headsColor: '#00e5ff',
    tailsColor: '#ff006e',
    edgeColor: '#0a1628',
    description: 'Cyberpunk casino chip with neon glow.',
  },
  {
    id: 'ruby',
    name: 'Ruby Token',
    price: 500,
    headsLabel: 'HEADS',
    tailsLabel: 'TAILS',
    headsEmoji: '💎',
    tailsEmoji: '🔥',
    headsColor: '#9b111e',
    tailsColor: '#8b0000',
    edgeColor: '#5c0000',
    description: 'Deep crimson token forged in flame.',
  },
  {
    id: 'frost',
    name: 'Arctic Shard',
    price: 750,
    headsLabel: 'HEADS',
    tailsLabel: 'TAILS',
    headsEmoji: '❄️',
    tailsEmoji: '🌊',
    headsColor: '#81d4fa',
    tailsColor: '#0d47a1',
    edgeColor: '#b3e5fc',
    description: 'Frozen crystal from beneath the aurora.',
  },
  {
    id: 'dragon',
    name: 'Dragon Scale',
    price: 1500,
    headsLabel: 'HEADS',
    tailsLabel: 'TAILS',
    headsEmoji: '🐉',
    tailsEmoji: '🔮',
    headsColor: '#ffd700',
    tailsColor: '#722f37',
    edgeColor: '#e65100',
    description: 'Legendary scale shed by an ancient wyrm.',
  },
]

// ── Coin Skin Persistence ──

const COIN_SKIN_STORAGE_KEY = 'coinflip-skins'

export interface CoinSkinState {
  ownedSkinIds: string[]
  activeSkinId: string
}

function defaultCoinSkinState(): CoinSkinState {
  return { ownedSkinIds: ['classic'], activeSkinId: 'classic' }
}

export function loadCoinSkinState(): CoinSkinState {
  try {
    const raw = localStorage.getItem(COIN_SKIN_STORAGE_KEY)
    if (!raw) return defaultCoinSkinState()
    const parsed = JSON.parse(raw) as Partial<CoinSkinState>
    return {
      ownedSkinIds: Array.isArray(parsed.ownedSkinIds) ? parsed.ownedSkinIds : ['classic'],
      activeSkinId: typeof parsed.activeSkinId === 'string' ? parsed.activeSkinId : 'classic',
    }
  } catch {
    return defaultCoinSkinState()
  }
}

export function saveCoinSkinState(state: CoinSkinState): void {
  localStorage.setItem(COIN_SKIN_STORAGE_KEY, JSON.stringify(state))
}

export function getCoinSkinById(id: string): CoinSkin | undefined {
  return COIN_SKINS.find(s => s.id === id)
}

// ── Game State ──

export interface CoinFlipState {
  phase: CoinFlipPhase
  choice: CoinSide | null
  result: CoinSide | null
  bet: number
  betInput: string
  winAmount: number
  message: string
  history: { choice: CoinSide; result: CoinSide; bet: number; won: boolean }[]
}

type CoinFlipAction =
  | { type: 'SET_CHOICE'; side: CoinSide }
  | { type: 'SET_BET_INPUT'; value: string }
  | { type: 'FLIP' }
  | { type: 'RESOLVE'; result: CoinSide }
  | { type: 'NEW_ROUND' }

function coinFlipReducer(state: CoinFlipState, action: CoinFlipAction): CoinFlipState {
  switch (action.type) {
    case 'SET_CHOICE':
      return { ...state, choice: action.side }

    case 'SET_BET_INPUT':
      return { ...state, betInput: action.value }

    case 'FLIP':
      return {
        ...state,
        phase: 'flipping',
        bet: parseInt(state.betInput, 10) || 0,
        message: 'Flipping...',
        winAmount: 0,
        result: null,
      }

    case 'RESOLVE': {
      const won = state.choice === action.result
      const winAmount = won ? state.bet * 2 : 0
      const message = won
        ? `${action.result.toUpperCase()}! You win $${state.bet}!`
        : `${action.result.toUpperCase()}. You lose $${state.bet}.`
      const entry = { choice: state.choice!, result: action.result, bet: state.bet, won }
      return {
        ...state,
        phase: 'result',
        result: action.result,
        winAmount,
        message,
        history: [entry, ...state.history].slice(0, 10),
      }
    }

    case 'NEW_ROUND':
      return {
        ...state,
        phase: 'idle',
        result: null,
        winAmount: 0,
        message: 'Pick a side and place your bet!',
      }

    default:
      return state
  }
}

function createInitialState(): CoinFlipState {
  return {
    phase: 'idle',
    choice: null,
    result: null,
    bet: 0,
    betInput: '10',
    winAmount: 0,
    message: 'Pick a side and place your bet!',
    history: [],
  }
}

// ── Hook ──

export function useCoinFlip(chips: number, onChipsChange: (newChips: number) => void) {
  const [state, dispatch] = useReducer(coinFlipReducer, undefined, createInitialState)
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chipsAtFlipRef = useRef(chips)

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current)
    }
  }, [])

  const setChoice = useCallback((side: CoinSide) => {
    if (state.phase !== 'idle') return
    dispatch({ type: 'SET_CHOICE', side })
  }, [state.phase])

  const setBetInput = useCallback((value: string) => {
    if (state.phase !== 'idle') return
    dispatch({ type: 'SET_BET_INPUT', value })
  }, [state.phase])

  const validateBet = useCallback((): string | null => {
    const num = parseInt(state.betInput, 10)
    if (state.betInput.trim() === '' || isNaN(num)) return 'Enter a valid number.'
    if (num <= 0) return 'Bet must be greater than zero.'
    if (num > chips) return 'Not enough chips.'
    if (!state.choice) return 'Pick heads or tails first.'
    return null
  }, [state.betInput, state.choice, chips])

  const flip = useCallback(() => {
    if (state.phase !== 'idle') return
    const error = validateBet()
    if (error) return

    const betAmount = parseInt(state.betInput, 10)
    chipsAtFlipRef.current = chips
    onChipsChange(chips - betAmount)
    dispatch({ type: 'FLIP' })

    const result: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails'

    flipTimerRef.current = setTimeout(() => {
      dispatch({ type: 'RESOLVE', result })
    }, 1500)
  }, [state.phase, state.betInput, chips, onChipsChange, validateBet])

  // Add winnings when result resolves
  useEffect(() => {
    if (state.phase === 'result' && state.winAmount > 0) {
      const currentChips = chipsAtFlipRef.current - state.bet
      onChipsChange(currentChips + state.winAmount)
    }
  }, [state.phase, state.winAmount, state.bet, onChipsChange])

  const newRound = useCallback(() => {
    dispatch({ type: 'NEW_ROUND' })
  }, [])

  return {
    state,
    setChoice,
    setBetInput,
    validateBet,
    flip,
    newRound,
  }
}
