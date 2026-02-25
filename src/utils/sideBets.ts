import type { Card, Suit } from '../types'

// ── Perfect Pairs ──
export type PerfectPairsResult =
  | { type: 'perfect_pair'; label: string; payout: number }
  | { type: 'colored_pair'; label: string; payout: number }
  | { type: 'mixed_pair'; label: string; payout: number }
  | { type: 'no_pair'; label: string; payout: number }

const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
}

export function evaluatePerfectPairs(card1: Card, card2: Card): PerfectPairsResult {
  if (card1.rank !== card2.rank) {
    return { type: 'no_pair', label: 'No Pair', payout: 0 }
  }

  if (card1.suit === card2.suit) {
    return { type: 'perfect_pair', label: 'Perfect Pair', payout: 25 }
  }

  if (SUIT_COLORS[card1.suit] === SUIT_COLORS[card2.suit]) {
    return { type: 'colored_pair', label: 'Colored Pair', payout: 12 }
  }

  return { type: 'mixed_pair', label: 'Mixed Pair', payout: 6 }
}

// ── 21+3 ──
export type TwentyOnePlusThreeResult =
  | { type: 'suited_trips'; label: string; payout: number }
  | { type: 'straight_flush'; label: string; payout: number }
  | { type: 'three_of_a_kind'; label: string; payout: number }
  | { type: 'straight'; label: string; payout: number }
  | { type: 'flush'; label: string; payout: number }
  | { type: 'nothing'; label: string; payout: number }

const RANK_ORDER: Record<string, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13,
}

function isFlush(cards: Card[]): boolean {
  return cards.every(c => c.suit === cards[0].suit)
}

function isStraight(cards: Card[]): boolean {
  const values = cards.map(c => RANK_ORDER[c.rank]).sort((a, b) => a - b)
  // Normal sequence
  if (values[2] - values[1] === 1 && values[1] - values[0] === 1) return true
  // Ace-high wrap: Q-K-A
  const sorted = cards.map(c => RANK_ORDER[c.rank]).sort((a, b) => a - b)
  if (sorted[0] === 1 && sorted[1] === 12 && sorted[2] === 13) return true
  return false
}

function isThreeOfAKind(cards: Card[]): boolean {
  return cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank
}

export function evaluateTwentyOnePlusThree(
  playerCard1: Card,
  playerCard2: Card,
  dealerUpcard: Card,
): TwentyOnePlusThreeResult {
  const cards = [playerCard1, playerCard2, dealerUpcard]

  const trips = isThreeOfAKind(cards)
  const flush = isFlush(cards)
  const straight = isStraight(cards)

  if (trips && flush) {
    return { type: 'suited_trips', label: 'Suited Three of a Kind', payout: 100 }
  }
  if (straight && flush) {
    return { type: 'straight_flush', label: 'Straight Flush', payout: 40 }
  }
  if (trips) {
    return { type: 'three_of_a_kind', label: 'Three of a Kind', payout: 30 }
  }
  if (straight) {
    return { type: 'straight', label: 'Straight', payout: 10 }
  }
  if (flush) {
    return { type: 'flush', label: 'Flush', payout: 5 }
  }

  return { type: 'nothing', label: 'No Hand', payout: 0 }
}

export function calculateSideBetPayout(betAmount: number, payoutMultiplier: number): number {
  if (payoutMultiplier === 0) return 0
  return betAmount * payoutMultiplier + betAmount // return bet + winnings
}
