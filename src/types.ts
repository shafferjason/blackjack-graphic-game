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

// ── Detailed Statistics ──
export interface DetailedStats {
  totalHandsPlayed: number
  totalBetAmount: number
  totalPayoutAmount: number
  blackjackCount: number
  doubleCount: number
  splitCount: number
  surrenderCount: number
  insuranceTaken: number
  insuranceWon: number
  currentWinStreak: number
  currentLossStreak: number
  biggestWinStreak: number
  biggestLossStreak: number
  startingChips: number
  chipHistory: number[]       // chip totals after each hand (last 50)
  resultHistory: GameResult[] // last 50 results for charts
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

// ── Split Hand ──
export interface SplitHand {
  cards: Hand
  bet: number
  result: GameResult | null
  stood: boolean
}

// ── Game State ──
export interface GameState {
  phase: GamePhase
  deck: Deck
  playerHand: Hand
  dealerHand: Hand
  message: string
  chips: number
  bet: number
  insuranceBet: number
  result: GameResult | null
  dealerRevealed: boolean
  stats: GameStats
  detailedStats: DetailedStats
  splitHands: SplitHand[]
  activeHandIndex: number
  isSplit: boolean
  shoeSize: number       // total cards when shoe was created
  cutCardReached: boolean // true when remaining cards pass the cut card
}

// ── Game Actions ──
export type GameAction =
  | { type: 'PLACE_BET'; payload: { amount: number } }
  | { type: 'CLEAR_BET' }
  | { type: 'DEAL'; payload: { deck: Deck; playerHand: Hand; dealerHand: Hand } }
  | { type: 'HIT'; payload: { playerHand: Hand; deck: Deck; phase?: GamePhase } }
  | { type: 'STAND' }
  | { type: 'DOUBLE'; payload: { playerHand: Hand; deck: Deck } }
  | { type: 'SPLIT'; payload: { splitHands: SplitHand[]; deck: Deck } }
  | { type: 'SPLIT_HIT'; payload: { hand: Hand; deck: Deck } }
  | { type: 'SPLIT_STAND' }
  | { type: 'SPLIT_DOUBLE'; payload: { hand: Hand; deck: Deck; bet: number } }
  | { type: 'SPLIT_RESOLVE'; payload: { splitHands: SplitHand[]; chips: number; stats: GameStats; message: string } }
  | { type: 'INSURE'; payload: { amount: number } }
  | { type: 'SURRENDER' }
  | { type: 'DEALER_DRAW'; payload: { dealerHand: Hand; deck: Deck } }
  | { type: 'RESOLVE'; payload: ResolvePayload }
  | { type: 'NEW_ROUND' }
  | { type: 'RESET'; payload?: { startingBankroll: number } }
  | { type: 'RESTORE_STATE'; payload: Partial<GameState> }

export interface ResolvePayload {
  message: string
  result: GameResult | null
  chips?: number
  dealerRevealed?: boolean
  stats?: GameStats
  phase?: GamePhase
}

// ── House Rules (configurable) ──
export interface HouseRules {
  NUM_DECKS: number
  DEALER_HITS_SOFT_17: boolean
  BLACKJACK_PAYOUT_RATIO: number
  ALLOW_DOUBLE_AFTER_SPLIT: boolean
  ALLOW_SURRENDER: boolean
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
  MAX_SPLIT_HANDS: number
  GAME_STATES: Record<string, GamePhase>
  DEALER_HITS_SOFT_17: boolean
  ALLOW_DOUBLE_AFTER_SPLIT: boolean
  ALLOW_SURRENDER: boolean
  updateSetting: (key: string, value: unknown) => void
  resetSettings: () => void
}
