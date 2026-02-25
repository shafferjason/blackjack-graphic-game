import { describe, it, expect } from 'vitest'
import { getHiLoValue, calculateRunningCount, calculateTrueCount, getDecksRemaining, getCountAdvice } from '../counting'
import type { Card } from '../../types'

function card(rank: Card['rank'], suit: Card['suit'] = 'hearts'): Card {
  return { rank, suit }
}

describe('getHiLoValue', () => {
  it('returns +1 for low cards (2-6)', () => {
    expect(getHiLoValue(card('2'))).toBe(1)
    expect(getHiLoValue(card('3'))).toBe(1)
    expect(getHiLoValue(card('4'))).toBe(1)
    expect(getHiLoValue(card('5'))).toBe(1)
    expect(getHiLoValue(card('6'))).toBe(1)
  })

  it('returns 0 for neutral cards (7-9)', () => {
    expect(getHiLoValue(card('7'))).toBe(0)
    expect(getHiLoValue(card('8'))).toBe(0)
    expect(getHiLoValue(card('9'))).toBe(0)
  })

  it('returns -1 for high cards (10, J, Q, K, A)', () => {
    expect(getHiLoValue(card('10'))).toBe(-1)
    expect(getHiLoValue(card('J'))).toBe(-1)
    expect(getHiLoValue(card('Q'))).toBe(-1)
    expect(getHiLoValue(card('K'))).toBe(-1)
    expect(getHiLoValue(card('A'))).toBe(-1)
  })
})

describe('calculateRunningCount', () => {
  it('returns 0 for empty array', () => {
    expect(calculateRunningCount([])).toBe(0)
  })

  it('calculates correctly for mixed cards', () => {
    const cards = [card('2'), card('K'), card('5'), card('A'), card('7')]
    // +1 -1 +1 -1 0 = 0
    expect(calculateRunningCount(cards)).toBe(0)
  })

  it('calculates positive count for low-heavy dealt', () => {
    const cards = [card('2'), card('3'), card('4'), card('5'), card('6')]
    expect(calculateRunningCount(cards)).toBe(5)
  })

  it('calculates negative count for high-heavy dealt', () => {
    const cards = [card('10'), card('J'), card('Q'), card('K'), card('A')]
    expect(calculateRunningCount(cards)).toBe(-5)
  })
})

describe('calculateTrueCount', () => {
  it('divides running count by decks remaining', () => {
    expect(calculateTrueCount(6, 3)).toBe(2)
    expect(calculateTrueCount(-4, 2)).toBe(-2)
  })

  it('rounds to one decimal place', () => {
    expect(calculateTrueCount(5, 3)).toBe(1.7)
  })

  it('handles very few decks remaining', () => {
    const tc = calculateTrueCount(4, 0.5)
    expect(tc).toBe(8)
  })

  it('returns running count when decks remaining is 0', () => {
    expect(calculateTrueCount(5, 0)).toBe(5)
  })
})

describe('getDecksRemaining', () => {
  it('calculates based on cards in shoe', () => {
    expect(getDecksRemaining(312)).toBe(6) // 6 decks
    expect(getDecksRemaining(52)).toBe(1)  // 1 deck
    expect(getDecksRemaining(156)).toBe(3) // 3 decks
  })

  it('returns minimum 0.5 to avoid division issues', () => {
    expect(getDecksRemaining(0)).toBe(0.5)
    expect(getDecksRemaining(10)).toBeCloseTo(0.5, 0)
  })
})

describe('getCountAdvice', () => {
  it('gives high advantage advice for true count >= 3', () => {
    expect(getCountAdvice(3)).toContain('High advantage')
    expect(getCountAdvice(5)).toContain('High advantage')
  })

  it('gives slight advantage advice for true count 1-2', () => {
    expect(getCountAdvice(1)).toContain('Slight advantage')
    expect(getCountAdvice(2)).toContain('Slight advantage')
  })

  it('gives neutral advice for true count 0', () => {
    expect(getCountAdvice(0)).toContain('Neutral')
  })

  it('gives disadvantage advice for negative count', () => {
    expect(getCountAdvice(-2)).toContain('Disadvantage')
    expect(getCountAdvice(-5)).toContain('Disadvantage')
  })
})
