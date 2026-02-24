import { describe, it, expect } from 'vitest'
import { getBlackjackPayout, getWinPayout, getPushPayout } from './payout'

describe('getBlackjackPayout', () => {
  it('pays 3:2 for blackjack (bet + floor(bet * 1.5))', () => {
    expect(getBlackjackPayout(100)).toBe(250)
  })

  it('floors fractional payouts', () => {
    // 10 + floor(10 * 1.5) = 10 + 15 = 25
    expect(getBlackjackPayout(10)).toBe(25)
    // 25 + floor(25 * 1.5) = 25 + 37 = 62
    expect(getBlackjackPayout(25)).toBe(62)
    // 50 + floor(50 * 1.5) = 50 + 75 = 125
    expect(getBlackjackPayout(50)).toBe(125)
  })

  it('handles odd bet amounts (floors correctly)', () => {
    // 15 + floor(15 * 1.5) = 15 + 22 = 37
    expect(getBlackjackPayout(15)).toBe(37)
  })

  it('returns 0 for zero bet', () => {
    expect(getBlackjackPayout(0)).toBe(0)
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
