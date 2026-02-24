import { describe, it, expect } from 'vitest'
import { cardValue, calculateScore, isBlackjack } from './scoring'

describe('cardValue', () => {
  it('returns 10 for face cards (J, Q, K)', () => {
    expect(cardValue({ rank: 'J', suit: 'hearts' })).toBe(10)
    expect(cardValue({ rank: 'Q', suit: 'spades' })).toBe(10)
    expect(cardValue({ rank: 'K', suit: 'clubs' })).toBe(10)
  })

  it('returns 11 for Ace', () => {
    expect(cardValue({ rank: 'A', suit: 'hearts' })).toBe(11)
  })

  it('returns face value for number cards', () => {
    expect(cardValue({ rank: '2', suit: 'hearts' })).toBe(2)
    expect(cardValue({ rank: '5', suit: 'diamonds' })).toBe(5)
    expect(cardValue({ rank: '9', suit: 'clubs' })).toBe(9)
    expect(cardValue({ rank: '10', suit: 'spades' })).toBe(10)
  })
})

describe('calculateScore', () => {
  it('sums number cards correctly', () => {
    const hand = [
      { rank: '5', suit: 'hearts' },
      { rank: '3', suit: 'clubs' },
    ]
    expect(calculateScore(hand)).toBe(8)
  })

  it('counts face cards as 10', () => {
    const hand = [
      { rank: 'K', suit: 'spades' },
      { rank: 'Q', suit: 'hearts' },
    ]
    expect(calculateScore(hand)).toBe(20)
  })

  it('treats Ace as 11 when score <= 21', () => {
    const hand = [
      { rank: 'A', suit: 'hearts' },
      { rank: '6', suit: 'clubs' },
    ]
    expect(calculateScore(hand)).toBe(17)
  })

  it('reduces Ace from 11 to 1 when score exceeds 21', () => {
    const hand = [
      { rank: 'A', suit: 'hearts' },
      { rank: '9', suit: 'clubs' },
      { rank: '5', suit: 'diamonds' },
    ]
    // 11 + 9 + 5 = 25, reduce ace: 1 + 9 + 5 = 15
    expect(calculateScore(hand)).toBe(15)
  })

  it('handles multiple aces correctly', () => {
    const hand = [
      { rank: 'A', suit: 'hearts' },
      { rank: 'A', suit: 'spades' },
      { rank: '9', suit: 'clubs' },
    ]
    // 11 + 11 + 9 = 31, reduce one ace: 1 + 11 + 9 = 21
    expect(calculateScore(hand)).toBe(21)
  })

  it('handles three aces', () => {
    const hand = [
      { rank: 'A', suit: 'hearts' },
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'clubs' },
      { rank: '8', suit: 'diamonds' },
    ]
    // 11+11+11+8 = 41, reduce one: 31, reduce two: 21
    expect(calculateScore(hand)).toBe(21)
  })

  it('handles four aces', () => {
    const hand = [
      { rank: 'A', suit: 'hearts' },
      { rank: 'A', suit: 'spades' },
      { rank: 'A', suit: 'clubs' },
      { rank: 'A', suit: 'diamonds' },
    ]
    // 11+11+11+11 = 44, reduce 3 aces: 1+1+1+11 = 14
    expect(calculateScore(hand)).toBe(14)
  })

  it('returns bust score when inevitable', () => {
    const hand = [
      { rank: 'K', suit: 'hearts' },
      { rank: 'Q', suit: 'spades' },
      { rank: '5', suit: 'clubs' },
    ]
    expect(calculateScore(hand)).toBe(25)
  })

  it('returns 0 for empty hand', () => {
    expect(calculateScore([])).toBe(0)
  })

  it('handles blackjack (Ace + 10)', () => {
    const hand = [
      { rank: 'A', suit: 'hearts' },
      { rank: '10', suit: 'spades' },
    ]
    expect(calculateScore(hand)).toBe(21)
  })

  it('handles blackjack (Ace + face card)', () => {
    const hand = [
      { rank: 'A', suit: 'hearts' },
      { rank: 'K', suit: 'spades' },
    ]
    expect(calculateScore(hand)).toBe(21)
  })

  it('handles soft 17 (Ace + 6)', () => {
    const hand = [
      { rank: 'A', suit: 'hearts' },
      { rank: '6', suit: 'clubs' },
    ]
    expect(calculateScore(hand)).toBe(17)
  })
})

describe('isBlackjack', () => {
  it('returns true for Ace + 10-value (natural 21)', () => {
    expect(isBlackjack([
      { rank: 'A', suit: 'hearts' },
      { rank: 'K', suit: 'spades' },
    ])).toBe(true)
  })

  it('returns true for Ace + 10', () => {
    expect(isBlackjack([
      { rank: 'A', suit: 'clubs' },
      { rank: '10', suit: 'hearts' },
    ])).toBe(true)
  })

  it('returns false for 3-card 21', () => {
    expect(isBlackjack([
      { rank: '7', suit: 'hearts' },
      { rank: '7', suit: 'spades' },
      { rank: '7', suit: 'clubs' },
    ])).toBe(false)
  })

  it('returns false for 2-card non-21', () => {
    expect(isBlackjack([
      { rank: 'K', suit: 'hearts' },
      { rank: '5', suit: 'spades' },
    ])).toBe(false)
  })

  it('returns false for empty hand', () => {
    expect(isBlackjack([])).toBe(false)
  })

  it('returns false for single card', () => {
    expect(isBlackjack([{ rank: 'A', suit: 'hearts' }])).toBe(false)
  })
})
