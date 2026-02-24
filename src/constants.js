// ── Card definitions ──
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

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

// ── Game state machine ──
export const GAME_STATES = {
  BETTING: 'betting',
  PLAYING: 'playing',
  DEALER_TURN: 'dealer_turn',
  GAME_OVER: 'game_over',
}
