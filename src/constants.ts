import type { GamePhase } from './types'

// ── Card definitions ──
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const

// ── Bankroll & betting ──
export const STARTING_BANKROLL = 1000
export const CHIP_DENOMINATIONS = [10, 25, 50, 100]

// ── Dealer rules ──
export const DEALER_STAND_THRESHOLD = 17

// ── Payouts ──
export const BLACKJACK_PAYOUT_RATIO = 1.5

// ── Animation durations (ms) ──
export const DEALER_PLAY_INITIAL_DELAY = 400
export const DEALER_DRAW_DELAY = 600
export const CARD_DEAL_ANIMATION_MS = 400
export const CARD_DEAL_STAGGER_MS = 100

// ── Deck configuration ──
export const NUM_DECKS = 6
export const DECK_PENETRATION = 0.75

// ── Split rules ──
export const MAX_SPLIT_HANDS = 3

// ── Configurable house rules (defaults) ──
export const DEALER_HITS_SOFT_17 = false    // false = stand on soft 17 (S17)
export const ALLOW_DOUBLE_AFTER_SPLIT = false
export const ALLOW_SURRENDER = true
export const CARD_BACK_THEME = 'classic-blue' as const
export const TABLE_FELT_THEME = 'classic-green' as const
export const STRATEGY_TRAINER_ENABLED = false

// ── Game state machine ──
export const GAME_STATES: Record<string, GamePhase> = {
  IDLE: 'idle',
  BETTING: 'betting',
  DEALING: 'dealing',
  PLAYER_TURN: 'player_turn',
  SPLITTING: 'splitting',
  DOUBLING: 'doubling',
  INSURANCE_OFFER: 'insurance_offer',
  SURRENDERING: 'surrendering',
  DEALER_TURN: 'dealer_turn',
  RESOLVING: 'resolving',
  GAME_OVER: 'game_over',
}
