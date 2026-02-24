import { GAME_STATES } from '../constants'
import type { GameState, GameAction, GamePhase } from '../types'

// ── Action types ──
export const ACTIONS = {
  PLACE_BET: 'PLACE_BET',
  CLEAR_BET: 'CLEAR_BET',
  DEAL: 'DEAL',
  HIT: 'HIT',
  STAND: 'STAND',
  DOUBLE: 'DOUBLE',
  SPLIT: 'SPLIT',
  SPLIT_HIT: 'SPLIT_HIT',
  SPLIT_STAND: 'SPLIT_STAND',
  SPLIT_RESOLVE: 'SPLIT_RESOLVE',
  INSURE: 'INSURE',
  SURRENDER: 'SURRENDER',
  DEALER_DRAW: 'DEALER_DRAW',
  RESOLVE: 'RESOLVE',
  NEW_ROUND: 'NEW_ROUND',
  RESET: 'RESET',
} as const

// ── Legal transitions: for each state, which actions are allowed ──
const VALID_ACTIONS: Record<string, string[]> = {
  [GAME_STATES.IDLE]:            [ACTIONS.PLACE_BET, ACTIONS.RESET],
  [GAME_STATES.BETTING]:         [ACTIONS.PLACE_BET, ACTIONS.CLEAR_BET, ACTIONS.DEAL, ACTIONS.RESET],
  [GAME_STATES.DEALING]:         [ACTIONS.RESOLVE],
  [GAME_STATES.PLAYER_TURN]:     [ACTIONS.HIT, ACTIONS.STAND, ACTIONS.DOUBLE, ACTIONS.SPLIT, ACTIONS.INSURE, ACTIONS.SURRENDER],
  [GAME_STATES.SPLITTING]:       [ACTIONS.SPLIT_HIT, ACTIONS.SPLIT_STAND, ACTIONS.SPLIT_RESOLVE],
  [GAME_STATES.DOUBLING]:        [ACTIONS.RESOLVE],
  [GAME_STATES.INSURANCE_OFFER]: [ACTIONS.INSURE, ACTIONS.RESOLVE],
  [GAME_STATES.SURRENDERING]:    [ACTIONS.RESOLVE],
  [GAME_STATES.DEALER_TURN]:     [ACTIONS.DEALER_DRAW, ACTIONS.RESOLVE],
  [GAME_STATES.RESOLVING]:       [ACTIONS.NEW_ROUND, ACTIONS.RESET],
  [GAME_STATES.GAME_OVER]:       [ACTIONS.NEW_ROUND, ACTIONS.RESET],
}

function isValidAction(state: GamePhase, action: string): boolean {
  const allowed = VALID_ACTIONS[state]
  return allowed ? allowed.includes(action) : false
}

// ── Initial state ──
export function createInitialState(startingBankroll: number): GameState {
  return {
    phase: GAME_STATES.BETTING as GamePhase,
    deck: [],
    playerHand: [],
    dealerHand: [],
    message: 'Place your bet to start!',
    chips: startingBankroll,
    bet: 0,
    insuranceBet: 0,
    result: null,
    dealerRevealed: false,
    stats: { wins: 0, losses: 0, pushes: 0 },
    splitHands: [],
    activeHandIndex: 0,
    isSplit: false,
  }
}

// ── Reducer ──
export function gameReducer(state: GameState, action: GameAction): GameState {
  const { type } = action

  if (!isValidAction(state.phase, type)) {
    if (import.meta.env.DEV) {
      console.warn(
        `[GameFSM] Illegal action "${type}" in state "${state.phase}" — ignored`
      )
    }
    return state
  }

  if (import.meta.env.DEV) {
    const payload = 'payload' in action ? action.payload : ''
    console.log(`[GameFSM] ${state.phase} → ${type}`, payload || '')
  }

  switch (type) {
    case ACTIONS.PLACE_BET: {
      const { amount } = action.payload
      if (state.chips < amount) return state
      return {
        ...state,
        bet: state.bet + amount,
        phase: GAME_STATES.BETTING as GamePhase,
      }
    }

    case ACTIONS.CLEAR_BET:
      return { ...state, bet: 0 }

    case ACTIONS.DEAL: {
      const { deck, playerHand, dealerHand } = action.payload
      return {
        ...state,
        deck,
        playerHand,
        dealerHand,
        chips: state.chips - state.bet,
        result: null,
        dealerRevealed: false,
        phase: GAME_STATES.DEALING as GamePhase,
        message: 'Dealing...',
      }
    }

    case ACTIONS.RESOLVE: {
      // RESOLVE can come from DEALING (blackjack), DOUBLING, SURRENDERING, or DEALER_TURN
      const { message, result, chips, dealerRevealed, stats, phase } = action.payload
      return {
        ...state,
        message,
        result,
        chips: chips !== undefined ? chips : state.chips,
        dealerRevealed: dealerRevealed !== undefined ? dealerRevealed : state.dealerRevealed,
        stats: stats || state.stats,
        phase: (phase || GAME_STATES.GAME_OVER) as GamePhase,
      }
    }

    case ACTIONS.HIT: {
      const { playerHand, deck, phase } = action.payload
      return {
        ...state,
        playerHand,
        deck,
        phase: (phase || GAME_STATES.PLAYER_TURN) as GamePhase,
      }
    }

    case ACTIONS.STAND: {
      return {
        ...state,
        dealerRevealed: true,
        phase: GAME_STATES.DEALER_TURN as GamePhase,
        message: 'Dealer is playing...',
      }
    }

    case ACTIONS.DOUBLE: {
      const { playerHand, deck } = action.payload
      return {
        ...state,
        playerHand,
        deck,
        chips: state.chips - state.bet,
        bet: state.bet * 2,
        dealerRevealed: true,
        phase: GAME_STATES.DOUBLING as GamePhase,
        message: 'Doubling down...',
      }
    }

    case ACTIONS.SPLIT: {
      const { splitHands, deck } = action.payload
      return {
        ...state,
        deck,
        splitHands,
        activeHandIndex: 0,
        isSplit: true,
        chips: state.chips - state.bet, // deduct additional bet for second hand
        playerHand: splitHands[0].cards,
        phase: GAME_STATES.SPLITTING as GamePhase,
        message: 'Playing hand 1...',
      }
    }

    case ACTIONS.SPLIT_HIT: {
      const { hand, deck: newDeck } = action.payload
      const updatedHands = state.splitHands.map((h, i) =>
        i === state.activeHandIndex ? { ...h, cards: hand } : h
      )
      return {
        ...state,
        deck: newDeck,
        splitHands: updatedHands,
        playerHand: hand,
      }
    }

    case ACTIONS.SPLIT_STAND: {
      const updatedHands = state.splitHands.map((h, i) =>
        i === state.activeHandIndex ? { ...h, stood: true } : h
      )
      const nextIndex = state.activeHandIndex + 1
      if (nextIndex < updatedHands.length) {
        return {
          ...state,
          splitHands: updatedHands,
          activeHandIndex: nextIndex,
          playerHand: updatedHands[nextIndex].cards,
          message: `Playing hand ${nextIndex + 1}...`,
        }
      }
      // All hands stood — move to dealer turn
      return {
        ...state,
        splitHands: updatedHands,
        dealerRevealed: true,
        phase: GAME_STATES.DEALER_TURN as GamePhase,
        message: 'Dealer is playing...',
      }
    }

    case ACTIONS.SPLIT_RESOLVE: {
      const { splitHands: resolvedHands, chips, stats, message: msg } = action.payload
      return {
        ...state,
        splitHands: resolvedHands,
        chips,
        stats,
        message: msg,
        result: 'lose', // placeholder; individual results are on splitHands
        dealerRevealed: true,
        phase: GAME_STATES.GAME_OVER as GamePhase,
      }
    }

    case ACTIONS.INSURE: {
      const { amount } = action.payload
      if (amount > 0) {
        return {
          ...state,
          insuranceBet: amount,
          chips: state.chips - amount,
          phase: GAME_STATES.PLAYER_TURN as GamePhase,
          message: 'Insurance taken. Hit or Stand?',
        }
      }
      // Declined insurance
      return {
        ...state,
        insuranceBet: 0,
        phase: GAME_STATES.PLAYER_TURN as GamePhase,
        message: 'Hit or Stand?',
      }
    }

    case ACTIONS.SURRENDER: {
      const halfBet = Math.floor(state.bet / 2)
      return {
        ...state,
        chips: state.chips + halfBet,
        dealerRevealed: true,
        phase: GAME_STATES.SURRENDERING as GamePhase,
        message: 'Surrendered — half bet returned.',
        result: 'lose',
      }
    }

    case ACTIONS.DEALER_DRAW: {
      const { dealerHand, deck } = action.payload
      return {
        ...state,
        dealerHand,
        deck,
      }
    }

    case ACTIONS.NEW_ROUND:
      return {
        ...state,
        playerHand: [],
        dealerHand: [],
        deck: [],
        bet: 0,
        insuranceBet: 0,
        result: null,
        dealerRevealed: false,
        message: 'Place your bet to start!',
        phase: GAME_STATES.BETTING as GamePhase,
        splitHands: [],
        activeHandIndex: 0,
        isSplit: false,
      }

    case ACTIONS.RESET: {
      const startingBankroll = action.payload?.startingBankroll
      return createInitialState(startingBankroll || state.chips)
    }

    default:
      return state
  }
}

export { VALID_ACTIONS }
