import { describe, it, expect } from 'vitest'
import { getOptimalAction } from './basicStrategy'
import type { Card } from '../types'

function card(rank: string, suit = 'spades'): Card {
  return { rank, suit } as Card
}

const fullOptions = { canDouble: true, canSplit: true, canSurrender: true }
const noSpecial = { canDouble: false, canSplit: false, canSurrender: false }

describe('getOptimalAction', () => {
  describe('hard totals', () => {
    it('hard 8 vs dealer 6 → hit', () => {
      const result = getOptimalAction([card('3'), card('5')], card('6'), fullOptions)
      expect(result.optimalAction).toBe('hit')
    })

    it('hard 11 vs dealer 6 → double', () => {
      const result = getOptimalAction([card('5'), card('6')], card('6'), fullOptions)
      expect(result.optimalAction).toBe('double')
    })

    it('hard 11 vs dealer 6, no double → hit', () => {
      const result = getOptimalAction([card('5'), card('6')], card('6'), noSpecial)
      expect(result.optimalAction).toBe('hit')
    })

    it('hard 16 vs dealer A → surrender', () => {
      const result = getOptimalAction([card('10'), card('6')], card('A'), fullOptions)
      expect(result.optimalAction).toBe('surrender')
    })

    it('hard 16 vs dealer A, no surrender → hit', () => {
      const result = getOptimalAction([card('10'), card('6')], card('A'), noSpecial)
      expect(result.optimalAction).toBe('hit')
    })

    it('hard 13 vs dealer 5 → stand', () => {
      const result = getOptimalAction([card('10'), card('3')], card('5'), fullOptions)
      expect(result.optimalAction).toBe('stand')
    })

    it('hard 17 vs dealer 10 → stand', () => {
      const result = getOptimalAction([card('10'), card('7')], card('10'), fullOptions)
      expect(result.optimalAction).toBe('stand')
    })

    it('hard 12 vs dealer 4 → stand', () => {
      const result = getOptimalAction([card('10'), card('2')], card('4'), fullOptions)
      expect(result.optimalAction).toBe('stand')
    })

    it('hard 12 vs dealer 2 → hit', () => {
      const result = getOptimalAction([card('10'), card('2')], card('2'), fullOptions)
      expect(result.optimalAction).toBe('hit')
    })
  })

  describe('soft totals', () => {
    it('soft 17 (A,6) vs dealer 4 → double', () => {
      const result = getOptimalAction([card('A'), card('6')], card('4'), fullOptions)
      expect(result.optimalAction).toBe('double')
    })

    it('soft 18 (A,7) vs dealer 9 → hit', () => {
      const result = getOptimalAction([card('A'), card('7')], card('9'), fullOptions)
      expect(result.optimalAction).toBe('hit')
    })

    it('soft 18 (A,7) vs dealer 6 → double', () => {
      const result = getOptimalAction([card('A'), card('7')], card('6'), fullOptions)
      expect(result.optimalAction).toBe('double')
    })

    it('soft 18 (A,7) vs dealer 6, no double → stand', () => {
      const result = getOptimalAction([card('A'), card('7')], card('6'), noSpecial)
      expect(result.optimalAction).toBe('stand')
    })

    it('soft 19 (A,8) vs dealer 5 → stand', () => {
      const result = getOptimalAction([card('A'), card('8')], card('5'), fullOptions)
      expect(result.optimalAction).toBe('stand')
    })

    it('soft 13 (A,2) vs dealer 5 → double', () => {
      const result = getOptimalAction([card('A'), card('2')], card('5'), fullOptions)
      expect(result.optimalAction).toBe('double')
    })
  })

  describe('pairs', () => {
    it('A,A vs dealer 6 → split', () => {
      const result = getOptimalAction([card('A'), card('A')], card('6'), fullOptions)
      expect(result.optimalAction).toBe('split')
    })

    it('8,8 vs dealer 10 → split', () => {
      const result = getOptimalAction([card('8'), card('8')], card('10'), fullOptions)
      // Rp: surrender if allowed, otherwise split
      expect(result.optimalAction).toBe('surrender')
    })

    it('8,8 vs dealer 10, no surrender → split', () => {
      const result = getOptimalAction([card('8'), card('8')], card('10'), { canDouble: true, canSplit: true, canSurrender: false })
      expect(result.optimalAction).toBe('split')
    })

    it('10,10 vs dealer 5 → stand', () => {
      const result = getOptimalAction([card('10'), card('10')], card('5'), fullOptions)
      expect(result.optimalAction).toBe('stand')
    })

    it('9,9 vs dealer 7 → stand', () => {
      const result = getOptimalAction([card('9'), card('9')], card('7'), fullOptions)
      expect(result.optimalAction).toBe('stand')
    })

    it('9,9 vs dealer 6 → split', () => {
      const result = getOptimalAction([card('9'), card('9')], card('6'), fullOptions)
      expect(result.optimalAction).toBe('split')
    })

    it('5,5 vs dealer 9 → double', () => {
      const result = getOptimalAction([card('5'), card('5')], card('9'), fullOptions)
      expect(result.optimalAction).toBe('double')
    })

    it('K,Q (10-value pair) vs dealer 6 → stand', () => {
      const result = getOptimalAction([card('K'), card('Q')], card('6'), fullOptions)
      expect(result.optimalAction).toBe('stand')
    })
  })

  describe('multi-card hands', () => {
    it('3-card hard 15 vs dealer 10 → hit (surrender not available after hit)', () => {
      const result = getOptimalAction([card('5'), card('3'), card('7')], card('10'), { canDouble: false, canSplit: false, canSurrender: false })
      expect(result.optimalAction).toBe('hit')
    })

    it('3-card soft 17 (A,2,4) vs dealer 4 → hit (no double on 3+ cards)', () => {
      const result = getOptimalAction([card('A'), card('2'), card('4')], card('4'), { canDouble: false, canSplit: false, canSurrender: false })
      expect(result.optimalAction).toBe('hit')
    })
  })
})
