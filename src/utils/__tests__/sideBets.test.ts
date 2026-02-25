import { describe, it, expect } from 'vitest'
import { evaluatePerfectPairs, evaluateTwentyOnePlusThree, calculateSideBetPayout } from '../sideBets'
import type { Card } from '../../types'

function card(rank: Card['rank'], suit: Card['suit']): Card {
  return { rank, suit }
}

describe('evaluatePerfectPairs', () => {
  it('returns perfect pair for same rank and suit', () => {
    const result = evaluatePerfectPairs(card('K', 'hearts'), card('K', 'hearts'))
    expect(result.type).toBe('perfect_pair')
    expect(result.payout).toBe(25)
  })

  it('returns colored pair for same rank and color', () => {
    const result = evaluatePerfectPairs(card('Q', 'hearts'), card('Q', 'diamonds'))
    expect(result.type).toBe('colored_pair')
    expect(result.payout).toBe(12)
  })

  it('returns mixed pair for same rank different color', () => {
    const result = evaluatePerfectPairs(card('J', 'hearts'), card('J', 'spades'))
    expect(result.type).toBe('mixed_pair')
    expect(result.payout).toBe(6)
  })

  it('returns no pair for different ranks', () => {
    const result = evaluatePerfectPairs(card('K', 'hearts'), card('Q', 'hearts'))
    expect(result.type).toBe('no_pair')
    expect(result.payout).toBe(0)
  })

  it('handles ace pairs', () => {
    const result = evaluatePerfectPairs(card('A', 'spades'), card('A', 'spades'))
    expect(result.type).toBe('perfect_pair')
    expect(result.payout).toBe(25)
  })

  it('handles number card pairs', () => {
    const result = evaluatePerfectPairs(card('7', 'clubs'), card('7', 'spades'))
    expect(result.type).toBe('colored_pair')
    expect(result.payout).toBe(12)
  })
})

describe('evaluateTwentyOnePlusThree', () => {
  it('returns suited trips for three same rank same suit', () => {
    const result = evaluateTwentyOnePlusThree(
      card('K', 'hearts'), card('K', 'hearts'), card('K', 'hearts')
    )
    expect(result.type).toBe('suited_trips')
    expect(result.payout).toBe(100)
  })

  it('returns straight flush', () => {
    const result = evaluateTwentyOnePlusThree(
      card('J', 'hearts'), card('Q', 'hearts'), card('K', 'hearts')
    )
    expect(result.type).toBe('straight_flush')
    expect(result.payout).toBe(40)
  })

  it('returns three of a kind for same rank different suits', () => {
    const result = evaluateTwentyOnePlusThree(
      card('8', 'hearts'), card('8', 'clubs'), card('8', 'spades')
    )
    expect(result.type).toBe('three_of_a_kind')
    expect(result.payout).toBe(30)
  })

  it('returns straight for consecutive ranks different suits', () => {
    const result = evaluateTwentyOnePlusThree(
      card('5', 'hearts'), card('6', 'clubs'), card('7', 'spades')
    )
    expect(result.type).toBe('straight')
    expect(result.payout).toBe(10)
  })

  it('returns flush for same suit non-consecutive', () => {
    const result = evaluateTwentyOnePlusThree(
      card('2', 'hearts'), card('7', 'hearts'), card('K', 'hearts')
    )
    expect(result.type).toBe('flush')
    expect(result.payout).toBe(5)
  })

  it('returns nothing for no hand', () => {
    const result = evaluateTwentyOnePlusThree(
      card('2', 'hearts'), card('7', 'clubs'), card('K', 'spades')
    )
    expect(result.type).toBe('nothing')
    expect(result.payout).toBe(0)
  })

  it('handles ace-high straight (Q-K-A)', () => {
    const result = evaluateTwentyOnePlusThree(
      card('Q', 'hearts'), card('K', 'clubs'), card('A', 'spades')
    )
    expect(result.type).toBe('straight')
    expect(result.payout).toBe(10)
  })

  it('handles low straight (A-2-3)', () => {
    const result = evaluateTwentyOnePlusThree(
      card('A', 'hearts'), card('2', 'clubs'), card('3', 'spades')
    )
    expect(result.type).toBe('straight')
    expect(result.payout).toBe(10)
  })
})

describe('calculateSideBetPayout', () => {
  it('returns 0 for no payout', () => {
    expect(calculateSideBetPayout(10, 0)).toBe(0)
  })

  it('returns bet + winnings for perfect pair 25:1', () => {
    expect(calculateSideBetPayout(10, 25)).toBe(260) // 10 * 25 + 10
  })

  it('returns bet + winnings for flush 5:1', () => {
    expect(calculateSideBetPayout(25, 5)).toBe(150) // 25 * 5 + 25
  })

  it('returns bet + winnings for suited trips 100:1', () => {
    expect(calculateSideBetPayout(5, 100)).toBe(505) // 5 * 100 + 5
  })
})
