import { SUITS, RANKS, NUM_DECKS } from '../constants'
import type { Card } from '../types'

/** Fisher-Yates shuffle (in-place). */
export function shuffle(cards: Card[]): Card[] {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

/** Create and shuffle a single 52-card deck. */
export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return shuffle(deck)
}

/** Create and shuffle a multi-deck shoe (default 6 decks). */
export function createShoe(numDecks: number = NUM_DECKS): Card[] {
  const shoe: Card[] = []
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({ suit, rank })
      }
    }
  }
  return shuffle(shoe)
}
