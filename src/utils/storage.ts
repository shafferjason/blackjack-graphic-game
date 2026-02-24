import type { GameState, GameStats, DetailedStats, HandHistoryEntry } from '../types'

const STORAGE_KEYS = {
  GAME_STATE: 'blackjack-game-state',
  HOUSE_RULES: 'blackjack-house-rules',
  HAND_HISTORY: 'blackjack-hand-history',
} as const

const MAX_HAND_HISTORY = 200

/** Fields we persist between sessions */
export interface PersistedGameState {
  chips: number
  stats: GameStats
  detailedStats?: DetailedStats
  bet: number
  phase: string
  playerHand: GameState['playerHand']
  dealerHand: GameState['dealerHand']
  deck: GameState['deck']
  dealerRevealed: boolean
  result: GameState['result']
  message: string
  insuranceBet: number
  splitHands: GameState['splitHands']
  activeHandIndex: number
  isSplit: boolean
  shoeSize: number
  cutCardReached: boolean
}

export function saveGameState(state: GameState): void {
  try {
    const persisted: PersistedGameState = {
      chips: state.chips,
      stats: state.stats,
      detailedStats: state.detailedStats,
      bet: state.bet,
      phase: state.phase,
      playerHand: state.playerHand,
      dealerHand: state.dealerHand,
      deck: state.deck,
      dealerRevealed: state.dealerRevealed,
      result: state.result,
      message: state.message,
      insuranceBet: state.insuranceBet,
      splitHands: state.splitHands,
      activeHandIndex: state.activeHandIndex,
      isSplit: state.isSplit,
      shoeSize: state.shoeSize,
      cutCardReached: state.cutCardReached,
    }
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(persisted))
  } catch {
    // ignore storage errors (quota exceeded, etc.)
  }
}

export function loadGameState(): PersistedGameState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATE)
    if (stored) {
      const parsed = JSON.parse(stored) as PersistedGameState
      // Basic validation
      if (typeof parsed.chips === 'number' && parsed.stats) {
        return parsed
      }
    }
  } catch {
    // ignore parse errors
  }
  return null
}

export function saveHandHistory(history: HandHistoryEntry[]): void {
  try {
    const trimmed = history.slice(-MAX_HAND_HISTORY)
    localStorage.setItem(STORAGE_KEYS.HAND_HISTORY, JSON.stringify(trimmed))
  } catch {
    // ignore storage errors (quota exceeded, etc.)
  }
}

export function loadHandHistory(): HandHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HAND_HISTORY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed.slice(-MAX_HAND_HISTORY)
      }
    }
  } catch {
    // ignore parse errors
  }
  return []
}

export function clearAllStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE)
    localStorage.removeItem(STORAGE_KEYS.HOUSE_RULES)
    localStorage.removeItem(STORAGE_KEYS.HAND_HISTORY)
  } catch {
    // ignore storage errors
  }
}
