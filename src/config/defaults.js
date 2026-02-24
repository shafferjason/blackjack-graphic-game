export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const STARTING_BANKROLL = 1000
export const CHIP_DENOMINATIONS = [10, 25, 50, 100]
export const DEALER_STAND_THRESHOLD = 17
export const BLACKJACK_PAYOUT_RATIO = 1.5

export const DEALER_PLAY_INITIAL_DELAY = 400
export const DEALER_DRAW_DELAY = 600

export const NUM_DECKS = 6 // Placeholder for configurable number of decks
export const DECK_PENETRATION = 0.75 // Placeholder for configurable deck penetration

export const GAME_STATES = {
  BETTING: 'betting',
  PLAYING: 'playing',
  DEALER_TURN: 'dealer_turn',
  GAME_OVER: 'game_over',
}
