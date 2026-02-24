// ── Card & Deck ──
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  suit: Suit
  rank: Rank
  id?: number
}

export type Hand = Card[]
export type Deck = Card[]

// ── Game Stats ──
export interface GameStats {
  wins: number
  losses: number
  pushes: number
}

// ── Game Phase ──
export type GamePhase =
  | 'idle'
  | 'betting'
  | 'dealing'
  | 'player_turn'
  | 'splitting'
  | 'doubling'
  | 'insurance_offer'
  | 'surrendering'
  | 'dealer_turn'
  | 'resolving'
  | 'game_over'

// ── Result ──
export type GameResult = 'win' | 'lose' | 'push' | 'blackjack'

// ── Game State ──
export interface GameState {
  phase: GamePhase
  deck: Deck
  playerHand: Hand
  dealerHand: Hand
  message: string
  chips: number
  bet: number
  result: GameResult | null
  dealerRevealed: boolean
  stats: GameStats
}

// ── Game Actions ──
export type GameAction =
  | { type: 'PLACE_BET'; payload: { amount: number } }
  | { type: 'CLEAR_BET' }
  | { type: 'DEAL'; payload: { deck: Deck; playerHand: Hand; dealerHand: Hand } }
  | { type: 'HIT'; payload: { playerHand: Hand; deck: Deck; phase?: GamePhase } }
  | { type: 'STAND' }
  | { type: 'DOUBLE'; payload: { playerHand: Hand; deck: Deck } }
  | { type: 'SPLIT' }
  | { type: 'INSURE' }
  | { type: 'SURRENDER' }
  | { type: 'DEALER_DRAW'; payload: { dealerHand: Hand; deck: Deck } }
  | { type: 'RESOLVE'; payload: ResolvePayload }
  | { type: 'NEW_ROUND' }
  | { type: 'RESET'; payload?: { startingBankroll: number } }

export interface ResolvePayload {
  message: string
  result: GameResult | null
  chips?: number
  dealerRevealed?: boolean
  stats?: GameStats
  phase?: GamePhase
}

// ── Game Settings ──
export interface GameSettings {
  SUITS: readonly string[]
  RANKS: readonly string[]
  STARTING_BANKROLL: number
  CHIP_DENOMINATIONS: number[]
  DEALER_STAND_THRESHOLD: number
  BLACKJACK_PAYOUT_RATIO: number
  DEALER_PLAY_INITIAL_DELAY: number
  DEALER_DRAW_DELAY: number
  CARD_DEAL_ANIMATION_MS: number
  CARD_DEAL_STAGGER_MS: number
  NUM_DECKS: number
  DECK_PENETRATION: number
  GAME_STATES: Record<string, GamePhase>
  updateSetting: (key: string, value: unknown) => void
}
