import type { Card, Rank, Suit } from '../types'

export type PokerHandRank =
  | 'high_card'
  | 'one_pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush'
  | 'royal_flush'

export interface PokerHandResult {
  rank: PokerHandRank
  label: string
  score: number       // higher = better hand
  bestFive: Card[]    // the 5 cards that form the hand
}

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
}

const HAND_BASE_SCORES: Record<PokerHandRank, number> = {
  high_card: 0,
  one_pair: 1_000_000,
  two_pair: 2_000_000,
  three_of_a_kind: 3_000_000,
  straight: 4_000_000,
  flush: 5_000_000,
  full_house: 6_000_000,
  four_of_a_kind: 7_000_000,
  straight_flush: 8_000_000,
  royal_flush: 9_000_000,
}

const HAND_LABELS: Record<PokerHandRank, string> = {
  high_card: 'High Card',
  one_pair: 'One Pair',
  two_pair: 'Two Pair',
  three_of_a_kind: 'Three of a Kind',
  straight: 'Straight',
  flush: 'Flush',
  full_house: 'Full House',
  four_of_a_kind: 'Four of a Kind',
  straight_flush: 'Straight Flush',
  royal_flush: 'Royal Flush',
}

function rankVal(card: Card): number {
  return RANK_VALUES[card.rank]
}

function sortByRankDesc(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankVal(b) - rankVal(a))
}

/** Compute a kicker score from up to 5 values (each 0-14) */
function kickerScore(values: number[]): number {
  let score = 0
  for (let i = 0; i < values.length && i < 5; i++) {
    score += values[i] * Math.pow(15, 4 - i)
  }
  return score
}

/** Get all 5-card combinations from an array of cards */
function combinations5(cards: Card[]): Card[][] {
  const result: Card[][] = []
  const n = cards.length
  for (let i = 0; i < n - 4; i++) {
    for (let j = i + 1; j < n - 3; j++) {
      for (let k = j + 1; k < n - 2; k++) {
        for (let l = k + 1; l < n - 1; l++) {
          for (let m = l + 1; m < n; m++) {
            result.push([cards[i], cards[j], cards[k], cards[l], cards[m]])
          }
        }
      }
    }
  }
  return result
}

/** Evaluate exactly 5 cards */
function evaluate5(cards: Card[]): { rank: PokerHandRank; score: number } {
  const sorted = sortByRankDesc(cards)
  const values = sorted.map(rankVal)
  const suits = sorted.map(c => c.suit)

  const isFlush = suits.every(s => s === suits[0])

  // Check straight (including A-low: A2345)
  let isStraight = false
  let straightHigh = 0
  if (values[0] - values[4] === 4 && new Set(values).size === 5) {
    isStraight = true
    straightHigh = values[0]
  } else if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
    // A-2-3-4-5 (wheel)
    isStraight = true
    straightHigh = 5
  }

  // Count ranks
  const counts: Record<number, number> = {}
  for (const v of values) counts[v] = (counts[v] || 0) + 1
  const groups = Object.entries(counts)
    .map(([v, c]) => ({ value: Number(v), count: c }))
    .sort((a, b) => b.count - a.count || b.value - a.value)

  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      return { rank: 'royal_flush', score: HAND_BASE_SCORES.royal_flush }
    }
    return { rank: 'straight_flush', score: HAND_BASE_SCORES.straight_flush + straightHigh }
  }

  if (groups[0].count === 4) {
    const quad = groups[0].value
    const kicker = groups[1].value
    return { rank: 'four_of_a_kind', score: HAND_BASE_SCORES.four_of_a_kind + quad * 15 + kicker }
  }

  if (groups[0].count === 3 && groups[1].count === 2) {
    return { rank: 'full_house', score: HAND_BASE_SCORES.full_house + groups[0].value * 15 + groups[1].value }
  }

  if (isFlush) {
    return { rank: 'flush', score: HAND_BASE_SCORES.flush + kickerScore(values) }
  }

  if (isStraight) {
    return { rank: 'straight', score: HAND_BASE_SCORES.straight + straightHigh }
  }

  if (groups[0].count === 3) {
    const trip = groups[0].value
    const kickers = groups.slice(1).map(g => g.value)
    return { rank: 'three_of_a_kind', score: HAND_BASE_SCORES.three_of_a_kind + trip * 225 + kickerScore(kickers) }
  }

  if (groups[0].count === 2 && groups[1].count === 2) {
    const highPair = Math.max(groups[0].value, groups[1].value)
    const lowPair = Math.min(groups[0].value, groups[1].value)
    const kicker = groups[2].value
    return { rank: 'two_pair', score: HAND_BASE_SCORES.two_pair + highPair * 225 + lowPair * 15 + kicker }
  }

  if (groups[0].count === 2) {
    const pair = groups[0].value
    const kickers = groups.slice(1).map(g => g.value)
    return { rank: 'one_pair', score: HAND_BASE_SCORES.one_pair + pair * 3375 + kickerScore(kickers) }
  }

  return { rank: 'high_card', score: HAND_BASE_SCORES.high_card + kickerScore(values) }
}

/**
 * Evaluate the best 5-card poker hand from a set of cards (typically 7: 2 hole + 5 community).
 * Works with 5, 6, or 7 cards.
 */
export function evaluateHand(cards: Card[]): PokerHandResult {
  if (cards.length < 5) {
    return { rank: 'high_card', label: 'High Card', score: 0, bestFive: cards }
  }

  if (cards.length === 5) {
    const result = evaluate5(cards)
    return { ...result, label: HAND_LABELS[result.rank], bestFive: cards }
  }

  const combos = combinations5(cards)
  let best: { rank: PokerHandRank; score: number } = { rank: 'high_card', score: -1 }
  let bestCards: Card[] = combos[0]

  for (const combo of combos) {
    const result = evaluate5(combo)
    if (result.score > best.score) {
      best = result
      bestCards = combo
    }
  }

  return { rank: best.rank, label: HAND_LABELS[best.rank], score: best.score, bestFive: bestCards }
}

/** Compare two evaluated hands. Returns positive if a wins, negative if b wins, 0 for tie. */
export function compareHands(a: PokerHandResult, b: PokerHandResult): number {
  return a.score - b.score
}

/** Get a display-friendly card string */
export function cardToString(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    hearts: '\u2665',
    diamonds: '\u2666',
    clubs: '\u2663',
    spades: '\u2660',
  }
  return `${card.rank}${suitSymbols[card.suit]}`
}
