import type { Card, Hand } from '../types'
import { calculateScore, cardValue } from './scoring'

// Strategy actions
export type StrategyAction = 'H' | 'S' | 'D' | 'P' | 'Dh' | 'Ds' | 'Rh' | 'Rs' | 'Rp'

// H  = Hit
// S  = Stand
// D  = Double (hit if not allowed)
// P  = Split
// Dh = Double if allowed, otherwise Hit
// Ds = Double if allowed, otherwise Stand
// Rh = Surrender if allowed, otherwise Hit
// Rs = Surrender if allowed, otherwise Stand
// Rp = Surrender if allowed, otherwise Split

// Dealer upcard index: A=0, 2=1, 3=2, ..., 10=9
function dealerIndex(card: Card): number {
  if (card.rank === 'A') return 0
  const v = cardValue(card)
  return v - 1 // 2→1, 3→2, ..., 10→9
}

// ── Hard totals (player has no usable ace, or hard total) ──
// Rows: hard 5 through hard 20 (index 0 = hard 5)
// Cols: dealer A, 2, 3, 4, 5, 6, 7, 8, 9, 10
//                A     2     3     4     5     6     7     8     9     10
const HARD: StrategyAction[][] = [
  /* 5  */ ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H' ],
  /* 6  */ ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H' ],
  /* 7  */ ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H' ],
  /* 8  */ ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H' ],
  /* 9  */ ['H',  'H',  'Dh', 'Dh', 'Dh', 'Dh', 'H',  'H',  'H',  'H' ],
  /* 10 */ ['H',  'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'H' ],
  /* 11 */ ['Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh'],
  /* 12 */ ['H',  'H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H' ],
  /* 13 */ ['H',  'S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H' ],
  /* 14 */ ['H',  'S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H' ],
  /* 15 */ ['Rh', 'S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'Rh'],
  /* 16 */ ['Rh', 'S',  'S',  'S',  'S',  'S',  'H',  'H',  'Rh', 'Rh'],
  /* 17 */ ['Rs', 'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S' ],
  /* 18 */ ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S' ],
  /* 19 */ ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S' ],
  /* 20 */ ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S' ],
]

// ── Soft totals (player has a usable ace counted as 11) ──
// Rows: soft 13 (A,2) through soft 20 (A,9) — index 0 = soft 13
// Cols: dealer A, 2, 3, 4, 5, 6, 7, 8, 9, 10
//                  A     2     3     4     5     6     7     8     9     10
const SOFT: StrategyAction[][] = [
  /* A,2 (13) */ ['H',  'H',  'H',  'H',  'Dh', 'Dh', 'H',  'H',  'H',  'H' ],
  /* A,3 (14) */ ['H',  'H',  'H',  'H',  'Dh', 'Dh', 'H',  'H',  'H',  'H' ],
  /* A,4 (15) */ ['H',  'H',  'H',  'Dh', 'Dh', 'Dh', 'H',  'H',  'H',  'H' ],
  /* A,5 (16) */ ['H',  'H',  'H',  'Dh', 'Dh', 'Dh', 'H',  'H',  'H',  'H' ],
  /* A,6 (17) */ ['H',  'H',  'Dh', 'Dh', 'Dh', 'Dh', 'H',  'H',  'H',  'H' ],
  /* A,7 (18) */ ['H',  'Ds', 'Ds', 'Ds', 'Ds', 'Ds', 'S',  'S',  'H',  'H' ],
  /* A,8 (19) */ ['S',  'S',  'S',  'S',  'S',  'Ds', 'S',  'S',  'S',  'S' ],
  /* A,9 (20) */ ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S' ],
]

// ── Pair splitting ──
// Rows: pair of A, 2, 3, 4, 5, 6, 7, 8, 9, 10
// Cols: dealer A, 2, 3, 4, 5, 6, 7, 8, 9, 10
//                   A     2     3     4     5     6     7     8     9     10
const PAIRS: StrategyAction[][] = [
  /* A,A */       ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P' ],
  /* 2,2 */       ['H',  'P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H' ],
  /* 3,3 */       ['H',  'P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H' ],
  /* 4,4 */       ['H',  'H',  'H',  'H',  'P',  'P',  'H',  'H',  'H',  'H' ],
  /* 5,5 */       ['H',  'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'Dh', 'H' ],
  /* 6,6 */       ['H',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H' ],
  /* 7,7 */       ['H',  'P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H' ],
  /* 8,8 */       ['Rp', 'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'Rp'],
  /* 9,9 */       ['S',  'P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S' ],
  /* 10,10 */     ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S' ],
]

// Pair row index from rank
function pairRowIndex(rank: string): number {
  if (rank === 'A') return 0
  if (['J', 'Q', 'K'].includes(rank)) return 9 // 10-value
  return parseInt(rank) - 1 // '2'→1, '3'→2, ..., '10'→9
}

// Check if the hand is soft (has an ace counted as 11)
function isSoftHand(hand: Hand): boolean {
  const hasAce = hand.some(c => c.rank === 'A')
  if (!hasAce) return false
  const hardTotal = hand.reduce((sum, card) => {
    if (card.rank === 'A') return sum + 1
    return sum + cardValue(card)
  }, 0)
  // If adding 10 to hard total (treating one ace as 11) doesn't bust, it's soft
  return hardTotal + 10 <= 21
}

// Resolve a strategy code to a player-friendly action
export type ResolvedAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender'

function resolveAction(
  code: StrategyAction,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean
): ResolvedAction {
  switch (code) {
    case 'H': return 'hit'
    case 'S': return 'stand'
    case 'D': return canDouble ? 'double' : 'hit'
    case 'P': return canSplit ? 'split' : 'hit'
    case 'Dh': return canDouble ? 'double' : 'hit'
    case 'Ds': return canDouble ? 'double' : 'stand'
    case 'Rh': return canSurrender ? 'surrender' : 'hit'
    case 'Rs': return canSurrender ? 'surrender' : 'stand'
    case 'Rp': return canSurrender ? 'surrender' : (canSplit ? 'split' : 'hit')
    default: return 'hit'
  }
}

export interface StrategyResult {
  optimalAction: ResolvedAction
  rawCode: StrategyAction
}

/**
 * Get the optimal basic strategy action for a player hand vs dealer upcard.
 */
export function getOptimalAction(
  playerHand: Hand,
  dealerUpcard: Card,
  options: {
    canDouble: boolean
    canSplit: boolean
    canSurrender: boolean
  }
): StrategyResult {
  const dIdx = dealerIndex(dealerUpcard)
  const score = calculateScore(playerHand)

  // Check for pair (only on initial 2-card hand)
  if (playerHand.length === 2 && playerHand[0].rank === playerHand[1].rank) {
    const pIdx = pairRowIndex(playerHand[0].rank)
    const code = PAIRS[pIdx][dIdx]
    return {
      optimalAction: resolveAction(code, options.canDouble, options.canSplit, options.canSurrender),
      rawCode: code,
    }
  }

  // Also check 10-value pairs (e.g., K-Q)
  if (
    playerHand.length === 2 &&
    cardValue(playerHand[0]) === 10 &&
    cardValue(playerHand[1]) === 10
  ) {
    const code = PAIRS[9][dIdx] // 10,10 row
    return {
      optimalAction: resolveAction(code, options.canDouble, options.canSplit, options.canSurrender),
      rawCode: code,
    }
  }

  // Check for soft hand
  if (isSoftHand(playerHand)) {
    // Soft total ranges from 13 to 20
    const softIdx = score - 13
    if (softIdx >= 0 && softIdx < SOFT.length) {
      const code = SOFT[softIdx][dIdx]
      return {
        optimalAction: resolveAction(code, options.canDouble, options.canSplit, options.canSurrender),
        rawCode: code,
      }
    }
  }

  // Hard total
  if (score >= 5 && score <= 20) {
    const hardIdx = score - 5
    const code = HARD[hardIdx][dIdx]
    return {
      optimalAction: resolveAction(code, options.canDouble, options.canSplit, options.canSurrender),
      rawCode: code,
    }
  }

  // score >= 21 should never happen during player action, but fallback
  return { optimalAction: 'stand', rawCode: 'S' }
}

// Human-readable action names
export function actionLabel(action: ResolvedAction): string {
  switch (action) {
    case 'hit': return 'Hit'
    case 'stand': return 'Stand'
    case 'double': return 'Double'
    case 'split': return 'Split'
    case 'surrender': return 'Surrender'
  }
}
