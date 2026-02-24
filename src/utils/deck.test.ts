import { describe, it, expect } from 'vitest'
import { createDeck, createShoe, shuffle } from './deck'

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

describe('shuffle', () => {
  it('returns the same array reference', () => {
    const cards = createDeck()
    const result = shuffle(cards)
    expect(result).toBe(cards)
  })

  it('preserves all cards', () => {
    const cards = createDeck()
    const before = cards.map(c => `${c.rank}-${c.suit}`).sort()
    shuffle(cards)
    const after = cards.map(c => `${c.rank}-${c.suit}`).sort()
    expect(after).toEqual(before)
  })
})

describe('createShoe', () => {
  it('creates a 6-deck shoe with 312 cards by default', () => {
    const shoe = createShoe()
    expect(shoe).toHaveLength(312)
  })

  it('creates a shoe with the specified number of decks', () => {
    const shoe = createShoe(4)
    expect(shoe).toHaveLength(208)
  })

  it('contains correct number of each card (6 of each in a 6-deck shoe)', () => {
    const shoe = createShoe(6)
    const counts = new Map<string, number>()
    for (const card of shoe) {
      const key = `${card.rank}-${card.suit}`
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    // 13 ranks × 4 suits = 52 unique cards, each appearing 6 times
    expect(counts.size).toBe(52)
    for (const count of counts.values()) {
      expect(count).toBe(6)
    }
  })

  it('contains all 4 suits', () => {
    const shoe = createShoe()
    const suits = [...new Set(shoe.map(c => c.suit))]
    expect(suits.sort()).toEqual(['clubs', 'diamonds', 'hearts', 'spades'])
  })

  it('is shuffled (not in factory order)', () => {
    const shoe = createShoe()
    // Check first 52 cards aren't in perfect order
    const firstDeck = shoe.slice(0, 52)
    const unshuffled: string[] = []
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades']) {
      for (const rank of ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']) {
        unshuffled.push(`${rank}-${suit}`)
      }
    }
    const asStrings = firstDeck.map(c => `${c.rank}-${c.suit}`)
    expect(JSON.stringify(asStrings)).not.toBe(JSON.stringify(unshuffled))
  })

  it('single-deck shoe has 52 cards', () => {
    const shoe = createShoe(1)
    expect(shoe).toHaveLength(52)
  })
})
