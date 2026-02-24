import type { Card, Hand } from '../types'

export function cardValue(card: Card): number {
  if (['J', 'Q', 'K'].includes(card.rank)) return 10
  if (card.rank === 'A') return 11
  return parseInt(card.rank)
}

export function calculateScore(hand: Hand): number {
  let score = hand.reduce((sum, card) => sum + cardValue(card), 0)
  let aces = hand.filter(c => c.rank === 'A').length
  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }
  return score
}

export function isBlackjack(hand: Hand): boolean {
  return hand.length === 2 && calculateScore(hand) === 21
}

export function isSoft17(hand: Hand): boolean {
  const score = calculateScore(hand)
  if (score !== 17) return false
  // Check if the hand has an ace counted as 11
  const hasAce = hand.some(c => c.rank === 'A')
  if (!hasAce) return false
  // If the hard total (all aces as 1) would be 7 or less, then an ace is being used as 11
  const hardTotal = hand.reduce((sum, card) => {
    if (card.rank === 'A') return sum + 1
    return sum + cardValue(card)
  }, 0)
  return hardTotal <= 11
}
