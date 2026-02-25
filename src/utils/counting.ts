import type { Card, Rank } from '../types'

/**
 * Hi-Lo card counting system:
 * - 2-6: +1 (low cards)
 * - 7-9: 0 (neutral)
 * - 10, J, Q, K, A: -1 (high cards)
 */

const HI_LO_VALUES: Record<Rank, number> = {
  '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
}

export function getHiLoValue(card: Card): number {
  return HI_LO_VALUES[card.rank]
}

export function calculateRunningCount(revealedCards: Card[]): number {
  return revealedCards.reduce((count, card) => count + getHiLoValue(card), 0)
}

export function calculateTrueCount(runningCount: number, decksRemaining: number): number {
  if (decksRemaining <= 0) return runningCount
  return Math.round((runningCount / decksRemaining) * 10) / 10
}

export function getDecksRemaining(cardsInShoe: number): number {
  return Math.max(cardsInShoe / 52, 0.5)
}

export function getCountAdvice(trueCount: number): string {
  if (trueCount >= 3) return 'High advantage — increase bets'
  if (trueCount >= 1) return 'Slight advantage — bet normally or slightly more'
  if (trueCount >= -1) return 'Neutral — bet minimum'
  return 'Disadvantage — bet minimum'
}
