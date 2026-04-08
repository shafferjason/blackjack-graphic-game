import { useReducer, useCallback, useEffect, useRef } from 'react'
import type { Card } from '../types'
import { createDeck } from '../utils/deck'
import { evaluateHand } from '../utils/pokerHands'
import type { PokerHandResult, PokerHandRank } from '../utils/pokerHands'

// ── Types ──

export type DrawPhase =
  | 'betting'     // Place ante/bet
  | 'dealing'     // Cards being dealt (brief animation state)
  | 'holding'     // Select cards to hold, then draw
  | 'result'      // Show final hand and payout

export interface DrawState {
  phase: DrawPhase
  deck: Card[]
  hand: Card[]
  held: boolean[]      // which cards are held (true = keep)
  bet: number
  chips: number
  handResult: PokerHandResult | null
  payout: number       // multiplier applied
  winAmount: number    // actual chips won (0 if loss)
  message: string
  hasDrawn: boolean    // whether the draw has occurred
}

type DrawAction =
  | { type: 'PLACE_BET'; amount: number }
  | { type: 'CLEAR_BET' }
  | { type: 'DEAL' }
  | { type: 'TOGGLE_HOLD'; index: number }
  | { type: 'DRAW' }
  | { type: 'NEW_ROUND' }
  | { type: 'SYNC_CHIPS'; chips: number }

// ── Payout table (Jacks or Better) ──

const PAYOUT_TABLE: Record<PokerHandRank, number> = {
  royal_flush: 250,
  straight_flush: 50,
  four_of_a_kind: 25,
  full_house: 9,
  flush: 6,
  straight: 4,
  three_of_a_kind: 3,
  two_pair: 2,
  one_pair: 1,      // Only Jacks or Better qualifies
  high_card: 0,
}

export const DRAW_PAYOUT_TABLE = PAYOUT_TABLE

/** Check if a one_pair hand qualifies (Jacks or Better) */
function qualifiesJacksOrBetter(result: PokerHandResult): boolean {
  if (result.rank !== 'one_pair') return true // all other hands qualify as-is
  // Find the pair rank from the best five
  const ranks = result.bestFive.map(c => c.rank)
  const counts: Record<string, number> = {}
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1
  const pairRank = Object.entries(counts).find(([, c]) => c === 2)?.[0]
  return pairRank !== undefined && ['J', 'Q', 'K', 'A'].includes(pairRank)
}

function calculatePayout(result: PokerHandResult, bet: number): { multiplier: number; winAmount: number } {
  let multiplier = PAYOUT_TABLE[result.rank]
  // One pair only pays if Jacks or Better
  if (result.rank === 'one_pair' && !qualifiesJacksOrBetter(result)) {
    multiplier = 0
  }
  const winAmount = multiplier > 0 ? bet * multiplier : 0
  return { multiplier, winAmount }
}

// ── Reducer ──

function createInitialState(chips: number): DrawState {
  return {
    phase: 'betting',
    deck: [],
    hand: [],
    held: [false, false, false, false, false],
    bet: 0,
    chips,
    handResult: null,
    payout: 0,
    winAmount: 0,
    message: 'Place your bet and deal!',
    hasDrawn: false,
  }
}

function drawReducer(state: DrawState, action: DrawAction): DrawState {
  switch (action.type) {
    case 'SYNC_CHIPS': {
      if (state.phase === 'betting') {
        return { ...state, chips: action.chips }
      }
      return state
    }

    case 'PLACE_BET': {
      if (state.phase !== 'betting') return state
      const newBet = Math.min(state.bet + action.amount, state.chips)
      return { ...state, bet: newBet, message: `Bet: $${newBet}` }
    }

    case 'CLEAR_BET': {
      if (state.phase !== 'betting') return state
      return { ...state, bet: 0, message: 'Place your bet and deal!' }
    }

    case 'DEAL': {
      if (state.phase !== 'betting' || state.bet <= 0) return state
      const deck = createDeck()
      const hand = [deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!, deck.pop()!]
      const chips = state.chips - state.bet
      return {
        ...state,
        phase: 'holding',
        deck,
        hand,
        held: [false, false, false, false, false],
        chips,
        handResult: null,
        payout: 0,
        winAmount: 0,
        message: 'Select cards to hold, then draw.',
        hasDrawn: false,
      }
    }

    case 'TOGGLE_HOLD': {
      if (state.phase !== 'holding') return state
      const held = [...state.held]
      held[action.index] = !held[action.index]
      return { ...state, held }
    }

    case 'DRAW': {
      if (state.phase !== 'holding') return state
      const deck = [...state.deck]
      const hand = state.hand.map((card, i) => {
        if (state.held[i]) return card
        return deck.pop()!
      })

      const result = evaluateHand(hand)
      const { multiplier, winAmount } = calculatePayout(result, state.bet)
      const chips = state.chips + winAmount

      const isWin = winAmount > 0
      const message = isWin
        ? `${result.label}! You win $${winAmount}!`
        : result.rank === 'one_pair' && !qualifiesJacksOrBetter(result)
          ? `${result.label} — needs Jacks or Better to qualify.`
          : `${result.label} — no win this time.`

      return {
        ...state,
        phase: 'result',
        deck,
        hand,
        handResult: result,
        payout: multiplier,
        winAmount,
        chips,
        message,
        hasDrawn: true,
      }
    }

    case 'NEW_ROUND': {
      return {
        ...state,
        phase: 'betting',
        hand: [],
        held: [false, false, false, false, false],
        handResult: null,
        payout: 0,
        winAmount: 0,
        message: 'Place your bet and deal!',
        hasDrawn: false,
        // Keep chips and bet for quick replay
      }
    }

    default:
      return state
  }
}

// ── Hook ──

export function usePokerDraw(chips: number, onChipsChange: (newChips: number) => void) {
  const [state, dispatch] = useReducer(drawReducer, chips, createInitialState)
  const prevChipsRef = useRef(chips)

  // Sync chips from parent when in betting phase
  useEffect(() => {
    if (chips !== prevChipsRef.current && state.phase === 'betting') {
      dispatch({ type: 'SYNC_CHIPS', chips })
      prevChipsRef.current = chips
    }
  }, [chips, state.phase])

  // Report chip changes back to parent on result
  useEffect(() => {
    if (state.phase === 'result') {
      prevChipsRef.current = state.chips
      onChipsChange(state.chips)
    }
  }, [state.phase, state.chips, onChipsChange])

  // Also sync when starting a new round with different bet deduction
  useEffect(() => {
    if (state.phase === 'holding') {
      prevChipsRef.current = state.chips
      onChipsChange(state.chips)
    }
  }, [state.phase, state.chips, onChipsChange])

  const placeBet = useCallback((amount: number) => dispatch({ type: 'PLACE_BET', amount }), [])
  const clearBet = useCallback(() => dispatch({ type: 'CLEAR_BET' }), [])
  const deal = useCallback(() => dispatch({ type: 'DEAL' }), [])
  const toggleHold = useCallback((index: number) => dispatch({ type: 'TOGGLE_HOLD', index }), [])
  const draw = useCallback(() => dispatch({ type: 'DRAW' }), [])
  const newRound = useCallback(() => dispatch({ type: 'NEW_ROUND' }), [])

  return {
    state,
    actions: { placeBet, clearBet, deal, toggleHold, draw, newRound },
  }
}
