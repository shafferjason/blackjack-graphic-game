import { GAME_STATES } from '../constants'

// ── Action types ──
export const ACTIONS = {
  PLACE_BET: 'PLACE_BET',
  CLEAR_BET: 'CLEAR_BET',
  DEAL: 'DEAL',
  HIT: 'HIT',
  STAND: 'STAND',
  DOUBLE: 'DOUBLE',
  SPLIT: 'SPLIT',
  INSURE: 'INSURE',
  SURRENDER: 'SURRENDER',
  DEALER_DRAW: 'DEALER_DRAW',
  RESOLVE: 'RESOLVE',
  NEW_ROUND: 'NEW_ROUND',
  RESET: 'RESET',
}

// ── Legal transitions: for each state, which actions are allowed ──
const VALID_ACTIONS = {
  [GAME_STATES.IDLE]:            [ACTIONS.PLACE_BET, ACTIONS.RESET],
  [GAME_STATES.BETTING]:         [ACTIONS.PLACE_BET, ACTIONS.CLEAR_BET, ACTIONS.DEAL, ACTIONS.RESET],
  [GAME_STATES.DEALING]:         [ACTIONS.RESOLVE],
  [GAME_STATES.PLAYER_TURN]:     [ACTIONS.HIT, ACTIONS.STAND, ACTIONS.DOUBLE, ACTIONS.SPLIT, ACTIONS.INSURE, ACTIONS.SURRENDER],
  [GAME_STATES.SPLITTING]:       [ACTIONS.HIT, ACTIONS.STAND],
  [GAME_STATES.DOUBLING]:        [ACTIONS.RESOLVE],
  [GAME_STATES.INSURANCE_OFFER]: [ACTIONS.INSURE, ACTIONS.HIT, ACTIONS.STAND],
  [GAME_STATES.SURRENDERING]:    [ACTIONS.RESOLVE],
  [GAME_STATES.DEALER_TURN]:     [ACTIONS.DEALER_DRAW, ACTIONS.RESOLVE],
  [GAME_STATES.RESOLVING]:       [ACTIONS.NEW_ROUND, ACTIONS.RESET],
  [GAME_STATES.GAME_OVER]:       [ACTIONS.NEW_ROUND, ACTIONS.RESET],
}

function isValidAction(state, action) {
  const allowed = VALID_ACTIONS[state]
  return allowed ? allowed.includes(action) : false
}

// ── Initial state ──
export function createInitialState(startingBankroll) {
  return {
    phase: GAME_STATES.BETTING,
    deck: [],
    playerHand: [],
    dealerHand: [],
    message: 'Place your bet to start!',
    chips: startingBankroll,
    bet: 0,
    result: null,
    dealerRevealed: false,
    stats: { wins: 0, losses: 0, pushes: 0 },
  }
}

// ── Reducer ──
export function gameReducer(state, action) {
  const { type, payload } = action

  if (!isValidAction(state.phase, type)) {
    if (import.meta.env.DEV) {
      console.warn(
        `[GameFSM] Illegal action "${type}" in state "${state.phase}" — ignored`
      )
    }
    return state
  }

  if (import.meta.env.DEV) {
    console.log(`[GameFSM] ${state.phase} → ${type}`, payload || '')
  }

  switch (type) {
    case ACTIONS.PLACE_BET: {
      const { amount } = payload
      if (state.chips < amount) return state
      return {
        ...state,
        bet: state.bet + amount,
        phase: GAME_STATES.BETTING,
      }
    }

    case ACTIONS.CLEAR_BET:
      return { ...state, bet: 0 }

    case ACTIONS.DEAL: {
      const { deck, playerHand, dealerHand } = payload
      return {
        ...state,
        deck,
        playerHand,
        dealerHand,
        chips: state.chips - state.bet,
        result: null,
        dealerRevealed: false,
        phase: GAME_STATES.DEALING,
        message: 'Dealing...',
      }
    }

    case ACTIONS.RESOLVE: {
      // RESOLVE can come from DEALING (blackjack), DOUBLING, SURRENDERING, or DEALER_TURN
      const { message, result, chips, dealerRevealed, stats, phase } = payload
      return {
        ...state,
        message,
        result,
        chips: chips !== undefined ? chips : state.chips,
        dealerRevealed: dealerRevealed !== undefined ? dealerRevealed : state.dealerRevealed,
        stats: stats || state.stats,
        phase: phase || GAME_STATES.GAME_OVER,
      }
    }

    case ACTIONS.HIT: {
      const { playerHand, deck, phase } = payload
      return {
        ...state,
        playerHand,
        deck,
        phase: phase || GAME_STATES.PLAYER_TURN,
      }
    }

    case ACTIONS.STAND: {
      return {
        ...state,
        dealerRevealed: true,
        phase: GAME_STATES.DEALER_TURN,
        message: 'Dealer is playing...',
      }
    }

    case ACTIONS.DOUBLE: {
      const { playerHand, deck } = payload
      return {
        ...state,
        playerHand,
        deck,
        chips: state.chips - state.bet,
        bet: state.bet * 2,
        dealerRevealed: true,
        phase: GAME_STATES.DOUBLING,
        message: 'Doubling down...',
      }
    }

    case ACTIONS.SPLIT:
      // Placeholder for future split implementation
      return {
        ...state,
        phase: GAME_STATES.SPLITTING,
        message: 'Splitting...',
      }

    case ACTIONS.INSURE:
      // Placeholder for future insurance implementation
      return {
        ...state,
        phase: GAME_STATES.INSURANCE_OFFER,
        message: 'Insurance?',
      }

    case ACTIONS.SURRENDER: {
      const halfBet = Math.floor(state.bet / 2)
      return {
        ...state,
        chips: state.chips + halfBet,
        dealerRevealed: true,
        phase: GAME_STATES.SURRENDERING,
        message: 'Surrendered — half bet returned.',
        result: 'lose',
      }
    }

    case ACTIONS.DEALER_DRAW: {
      const { dealerHand, deck } = payload
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
        result: null,
        dealerRevealed: false,
        message: 'Place your bet to start!',
        phase: GAME_STATES.BETTING,
      }

    case ACTIONS.RESET: {
      const { startingBankroll } = payload || {}
      return createInitialState(startingBankroll || state.chips)
    }

    default:
      return state
  }
}

export { VALID_ACTIONS }
