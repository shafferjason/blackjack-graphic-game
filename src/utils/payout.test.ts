import { describe, it, expect } from 'vitest'
import { getBlackjackPayout, getWinPayout, getPushPayout } from './payout'

describe('getBlackjackPayout', () => {
  it('pays 3:2 for blackjack (bet + round(bet * 1.5))', () => {
    expect(getBlackjackPayout(100)).toBe(250)
  })

  it('rounds fractional payouts', () => {
    // 10 + round(10 * 1.5) = 10 + 15 = 25
    expect(getBlackjackPayout(10)).toBe(25)
    // 25 + round(25 * 1.5) = 25 + 38 = 63 (rounds up from 37.5)
    expect(getBlackjackPayout(25)).toBe(63)
    // 50 + round(50 * 1.5) = 50 + 75 = 125
    expect(getBlackjackPayout(50)).toBe(125)
  })

  it('rounds odd bet amounts up (fairer than floor)', () => {
    // 15 + round(15 * 1.5) = 15 + 23 = 38 (rounds up from 22.5)
    expect(getBlackjackPayout(15)).toBe(38)
  })

  it('returns 0 for zero bet', () => {
    expect(getBlackjackPayout(0)).toBe(0)
  })

  it('handles 6:5 payout ratio', () => {
    // 100 + round(100 * 1.2) = 100 + 120 = 220
    expect(getBlackjackPayout(100, 1.2)).toBe(220)
    // 25 + round(25 * 1.2) = 25 + 30 = 55
    expect(getBlackjackPayout(25, 1.2)).toBe(55)
  })
})

describe('getWinPayout', () => {
  it('returns double the bet', () => {
    expect(getWinPayout(100)).toBe(200)
    expect(getWinPayout(50)).toBe(100)
    expect(getWinPayout(10)).toBe(20)
  })

  it('returns 0 for zero bet', () => {
    expect(getWinPayout(0)).toBe(0)
  })
})

describe('getPushPayout', () => {
  it('returns the original bet', () => {
    expect(getPushPayout(100)).toBe(100)
    expect(getPushPayout(50)).toBe(50)
  })

  it('returns 0 for zero bet', () => {
    expect(getPushPayout(0)).toBe(0)
  })
})
