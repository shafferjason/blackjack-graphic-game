import { describe, it, expect } from 'vitest'
import { evaluateHand, compareHands } from './pokerHands'
import type { Card } from '../types'

const c = (rank: Card['rank'], suit: Card['suit']): Card => ({ rank, suit })

describe('evaluateHand', () => {
  it('identifies a royal flush', () => {
    const cards = [c('A', 'spades'), c('K', 'spades'), c('Q', 'spades'), c('J', 'spades'), c('10', 'spades')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('royal_flush')
  })

  it('identifies a straight flush', () => {
    const cards = [c('9', 'hearts'), c('8', 'hearts'), c('7', 'hearts'), c('6', 'hearts'), c('5', 'hearts')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('straight_flush')
  })

  it('identifies four of a kind', () => {
    const cards = [c('7', 'hearts'), c('7', 'diamonds'), c('7', 'clubs'), c('7', 'spades'), c('K', 'hearts')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('four_of_a_kind')
  })

  it('identifies a full house', () => {
    const cards = [c('10', 'hearts'), c('10', 'diamonds'), c('10', 'clubs'), c('4', 'spades'), c('4', 'hearts')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('full_house')
  })

  it('identifies a flush', () => {
    const cards = [c('A', 'clubs'), c('J', 'clubs'), c('8', 'clubs'), c('5', 'clubs'), c('3', 'clubs')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('flush')
  })

  it('identifies a straight', () => {
    const cards = [c('9', 'hearts'), c('8', 'diamonds'), c('7', 'clubs'), c('6', 'spades'), c('5', 'hearts')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('straight')
  })

  it('identifies A-2-3-4-5 wheel straight', () => {
    const cards = [c('A', 'hearts'), c('2', 'diamonds'), c('3', 'clubs'), c('4', 'spades'), c('5', 'hearts')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('straight')
  })

  it('identifies three of a kind', () => {
    const cards = [c('Q', 'hearts'), c('Q', 'diamonds'), c('Q', 'clubs'), c('8', 'spades'), c('3', 'hearts')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('three_of_a_kind')
  })

  it('identifies two pair', () => {
    const cards = [c('J', 'hearts'), c('J', 'diamonds'), c('4', 'clubs'), c('4', 'spades'), c('A', 'hearts')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('two_pair')
  })

  it('identifies one pair', () => {
    const cards = [c('K', 'hearts'), c('K', 'diamonds'), c('J', 'clubs'), c('7', 'spades'), c('2', 'hearts')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('one_pair')
  })

  it('identifies high card', () => {
    const cards = [c('A', 'hearts'), c('J', 'diamonds'), c('8', 'clubs'), c('5', 'spades'), c('3', 'hearts')]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('high_card')
  })
})

describe('compareHands - tiebreakers', () => {
  it('pair of Kings beats pair of 6s (the reported bug scenario)', () => {
    // Player: K♥ 3♦ on board 6♣ K♦ 5♣ 7♠ J♠
    const playerCards = [
      c('K', 'hearts'), c('3', 'diamonds'),
      c('6', 'clubs'), c('K', 'diamonds'), c('5', 'clubs'), c('7', 'spades'), c('J', 'spades'),
    ]
    // Opponent: 6♠ 8♠ on same board
    const opponentCards = [
      c('6', 'spades'), c('8', 'spades'),
      c('6', 'clubs'), c('K', 'diamonds'), c('5', 'clubs'), c('7', 'spades'), c('J', 'spades'),
    ]

    const playerHand = evaluateHand(playerCards)
    const opponentHand = evaluateHand(opponentCards)

    expect(playerHand.rank).toBe('one_pair')
    expect(opponentHand.rank).toBe('one_pair')
    expect(compareHands(playerHand, opponentHand)).toBeGreaterThan(0)
  })

  it('higher pair always beats lower pair regardless of kickers', () => {
    // Pair of Aces with low kickers vs pair of 2s with high kickers
    const pairAces = [c('A', 'hearts'), c('A', 'diamonds'), c('3', 'clubs'), c('4', 'spades'), c('5', 'hearts')]
    const pair2s = [c('2', 'hearts'), c('2', 'diamonds'), c('K', 'clubs'), c('Q', 'spades'), c('J', 'hearts')]

    const acesResult = evaluateHand(pairAces)
    const twosResult = evaluateHand(pair2s)

    expect(compareHands(acesResult, twosResult)).toBeGreaterThan(0)
  })

  it('same pair rank uses kickers to break tie', () => {
    const pairKingsHighKicker = [c('K', 'hearts'), c('K', 'diamonds'), c('A', 'clubs'), c('5', 'spades'), c('3', 'hearts')]
    const pairKingsLowKicker = [c('K', 'clubs'), c('K', 'spades'), c('Q', 'diamonds'), c('5', 'hearts'), c('3', 'diamonds')]

    const highResult = evaluateHand(pairKingsHighKicker)
    const lowResult = evaluateHand(pairKingsLowKicker)

    expect(compareHands(highResult, lowResult)).toBeGreaterThan(0)
  })

  it('higher trips always beat lower trips regardless of kickers', () => {
    const tripsKings = [c('K', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('2', 'spades'), c('3', 'hearts')]
    const trips5s = [c('5', 'hearts'), c('5', 'diamonds'), c('5', 'clubs'), c('A', 'spades'), c('Q', 'hearts')]

    const kingsResult = evaluateHand(tripsKings)
    const fivesResult = evaluateHand(trips5s)

    expect(compareHands(kingsResult, fivesResult)).toBeGreaterThan(0)
  })

  it('higher two pair beats lower two pair', () => {
    const acesAndKings = [c('A', 'hearts'), c('A', 'diamonds'), c('K', 'clubs'), c('K', 'spades'), c('2', 'hearts')]
    const queensAndJacks = [c('Q', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('J', 'spades'), c('A', 'hearts')]

    expect(compareHands(evaluateHand(acesAndKings), evaluateHand(queensAndJacks))).toBeGreaterThan(0)
  })

  it('flush beats straight', () => {
    const flush = [c('A', 'clubs'), c('J', 'clubs'), c('8', 'clubs'), c('5', 'clubs'), c('3', 'clubs')]
    const straight = [c('9', 'hearts'), c('8', 'diamonds'), c('7', 'clubs'), c('6', 'spades'), c('5', 'hearts')]

    expect(compareHands(evaluateHand(flush), evaluateHand(straight))).toBeGreaterThan(0)
  })

  it('full house beats flush', () => {
    const fullHouse = [c('10', 'hearts'), c('10', 'diamonds'), c('10', 'clubs'), c('4', 'spades'), c('4', 'hearts')]
    const flush = [c('A', 'clubs'), c('K', 'clubs'), c('Q', 'clubs'), c('J', 'clubs'), c('9', 'clubs')]

    expect(compareHands(evaluateHand(fullHouse), evaluateHand(flush))).toBeGreaterThan(0)
  })

  it('best 5 from 7 cards works correctly', () => {
    // Has a flush hidden in 7 cards
    const cards = [
      c('A', 'hearts'), c('K', 'hearts'), c('10', 'hearts'), c('7', 'hearts'), c('3', 'hearts'),
      c('2', 'clubs'), c('4', 'diamonds'),
    ]
    const result = evaluateHand(cards)
    expect(result.rank).toBe('flush')
  })

  it('exact tie returns 0', () => {
    const hand1 = [c('A', 'hearts'), c('K', 'hearts'), c('Q', 'hearts'), c('J', 'hearts'), c('10', 'hearts')]
    const hand2 = [c('A', 'spades'), c('K', 'spades'), c('Q', 'spades'), c('J', 'spades'), c('10', 'spades')]

    expect(compareHands(evaluateHand(hand1), evaluateHand(hand2))).toBe(0)
  })
})
