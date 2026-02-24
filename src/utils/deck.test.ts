import { describe, it, expect } from 'vitest'
import { createDeck } from './deck'

describe('createDeck', () => {
  it('returns 52 cards', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(52)
  })

  it('contains all 4 suits', () => {
    const deck = createDeck()
    const suits = [...new Set(deck.map(c => c.suit))]
    expect(suits.sort()).toEqual(['clubs', 'diamonds', 'hearts', 'spades'])
  })

  it('contains all 13 ranks per suit', () => {
    const deck = createDeck()
    const expectedRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as const) {
      const ranks = deck.filter(c => c.suit === suit).map(c => c.rank).sort()
      expect(ranks).toEqual(expectedRanks.sort())
    }
  })

  it('each card has suit and rank properties', () => {
    const deck = createDeck()
    for (const card of deck) {
      expect(card).toHaveProperty('suit')
      expect(card).toHaveProperty('rank')
    }
  })

  it('shuffles the deck (not in factory order)', () => {
    // Run multiple attempts — a non-shuffled deck is astronomically unlikely
    const unshuffled: string[] = []
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades']) {
      for (const rank of ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']) {
        unshuffled.push(`${rank}-${suit}`)
      }
    }

    let foundDifference = false
    for (let attempt = 0; attempt < 5; attempt++) {
      const deck = createDeck()
      const asStrings = deck.map(c => `${c.rank}-${c.suit}`)
      if (JSON.stringify(asStrings) !== JSON.stringify(unshuffled)) {
        foundDifference = true
        break
      }
    }
    expect(foundDifference).toBe(true)
  })

  it('has no duplicate cards', () => {
    const deck = createDeck()
    const keys = deck.map(c => `${c.rank}-${c.suit}`)
    const unique = new Set(keys)
    expect(unique.size).toBe(52)
  })
})
