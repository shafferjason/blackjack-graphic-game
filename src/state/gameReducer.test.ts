import { describe, it, expect } from 'vitest'
import { gameReducer, createInitialState, ACTIONS, VALID_ACTIONS } from './gameReducer'
import { GAME_STATES } from '../constants'
import type { GameState, GameAction, SplitHand } from '../types'

describe('createInitialState', () => {
  it('creates state with given bankroll', () => {
    const state = createInitialState(1000)
    expect(state.chips).toBe(1000)
    expect(state.phase).toBe(GAME_STATES.BETTING)
    expect(state.bet).toBe(0)
    expect(state.result).toBeNull()
    expect(state.dealerRevealed).toBe(false)
    expect(state.playerHand).toEqual([])
    expect(state.dealerHand).toEqual([])
    expect(state.deck).toEqual([])
    expect(state.stats).toEqual({ wins: 0, losses: 0, pushes: 0 })
    expect(state.splitHands).toEqual([])
    expect(state.activeHandIndex).toBe(0)
    expect(state.isSplit).toBe(false)
    expect(state.insuranceBet).toBe(0)
    expect(state.shoeSize).toBe(0)
    expect(state.cutCardReached).toBe(false)
  })

  it('uses custom bankroll', () => {
    const state = createInitialState(500)
    expect(state.chips).toBe(500)
  })
})

describe('gameReducer — state transitions', () => {
  describe('PLACE_BET', () => {
    it('adds chips to bet and transitions to BETTING', () => {
      const state = createInitialState(1000)
      const next = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 50 } })
      expect(next.bet).toBe(50)
      expect(next.phase).toBe(GAME_STATES.BETTING)
    })

    it('accumulates bets', () => {
      let state = createInitialState(1000)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 25 } })
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 50 } })
      expect(state.bet).toBe(75)
    })

    it('ignores bet if chips < amount', () => {
      const state = createInitialState(20)
      const next = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 50 } })
      expect(next.bet).toBe(0)
    })

    it('prevents overbetting beyond remaining chips (P0 #1)', () => {
      let state = createInitialState(100)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 50 } })
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 50 } })
      expect(state.bet).toBe(100)
      // Now try to bet another 50 — should be blocked since chips - bet = 0
      const next = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 50 } })
      expect(next.bet).toBe(100)
      expect(next.chips).toBe(100) // chips not yet deducted (deducted at DEAL)
    })
  })

  describe('CLEAR_BET', () => {
    it('resets bet to 0', () => {
      let state = createInitialState(1000)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 100 } })
      state = gameReducer(state, { type: ACTIONS.CLEAR_BET })
      expect(state.bet).toBe(0)
    })
  })

  describe('All In (CLEAR_BET + PLACE_BET for full bankroll)', () => {
    it('bets entire bankroll from zero bet', () => {
      let state = createInitialState(1000)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 1000 } })
      expect(state.bet).toBe(1000)
      expect(state.chips).toBe(1000) // chips not deducted until DEAL
    })

    it('clears partial bet then bets entire bankroll', () => {
      let state = createInitialState(500)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 100 } })
      expect(state.bet).toBe(100)
      // Clear and re-bet full amount (simulates All In handler)
      state = gameReducer(state, { type: ACTIONS.CLEAR_BET })
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 500 } })
      expect(state.bet).toBe(500)
    })

    it('does nothing when bankroll is 0', () => {
      const state = createInitialState(0)
      const next = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 0 } })
      expect(next.bet).toBe(0)
    })

    it('all-in bet followed by deal deducts full bankroll', () => {
      let state = createInitialState(750)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 750 } })

      const playerHand = [{ rank: 'K' as const, suit: 'hearts' as const, id: 1 }, { rank: '5' as const, suit: 'clubs' as const, id: 2 }]
      const dealerHand = [{ rank: '9' as const, suit: 'spades' as const, id: 3 }, { rank: '7' as const, suit: 'diamonds' as const, id: 4 }]
      const deck = [{ rank: '2' as const, suit: 'hearts' as const }]

      state = gameReducer(state, {
        type: ACTIONS.DEAL,
        payload: { deck, playerHand, dealerHand },
      })

      expect(state.chips).toBe(0) // entire bankroll wagered
      expect(state.bet).toBe(750)
      expect(state.phase).toBe(GAME_STATES.DEALING)
    })

    it('all-in is compatible with insurance flow (no chips for insurance)', () => {
      let state = createInitialState(200)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 200 } })

      const playerHand = [{ rank: '10' as const, suit: 'hearts' as const, id: 1 }, { rank: '5' as const, suit: 'clubs' as const, id: 2 }]
      const dealerHand = [{ rank: 'A' as const, suit: 'spades' as const, id: 3 }, { rank: '7' as const, suit: 'diamonds' as const, id: 4 }]

      state = gameReducer(state, {
        type: ACTIONS.DEAL,
        payload: { deck: [], playerHand, dealerHand },
      })

      expect(state.chips).toBe(0) // all in, no chips left for insurance
      // Decline insurance since no chips available
      const insuranceState = { ...state, phase: 'insurance_offer' as const }
      const afterInsure = gameReducer(insuranceState, { type: ACTIONS.INSURE, payload: { amount: 0 } })
      expect(afterInsure.insuranceBet).toBe(0)
      expect(afterInsure.chips).toBe(0)
      expect(afterInsure.phase).toBe('player_turn')
    })
  })

  describe('DEAL', () => {
    it('transitions to DEALING, deducts bet, sets hands', () => {
      let state = createInitialState(1000)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 100 } })

      const playerHand = [{ rank: 'K' as const, suit: 'hearts' as const, id: 1 }, { rank: '5' as const, suit: 'clubs' as const, id: 2 }]
      const dealerHand = [{ rank: '9' as const, suit: 'spades' as const, id: 3 }, { rank: '7' as const, suit: 'diamonds' as const, id: 4 }]
      const deck = [{ rank: '2' as const, suit: 'hearts' as const }]

      const next = gameReducer(state, {
        type: ACTIONS.DEAL,
        payload: { deck, playerHand, dealerHand },
      })

      expect(next.phase).toBe(GAME_STATES.DEALING)
      expect(next.chips).toBe(900) // 1000 - 100
      expect(next.playerHand).toEqual(playerHand)
      expect(next.dealerHand).toEqual(dealerHand)
      expect(next.dealerRevealed).toBe(false)
      expect(next.result).toBeNull()
      expect(next.message).toBe('Dealing...')
    })

    it('records shoeSize on first deal', () => {
      let state = createInitialState(1000)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 100 } })

      const deck = new Array(308).fill({ rank: '2' as const, suit: 'hearts' as const })
      const playerHand = [{ rank: 'K' as const, suit: 'hearts' as const, id: 1 }, { rank: '5' as const, suit: 'clubs' as const, id: 2 }]
      const dealerHand = [{ rank: '9' as const, suit: 'spades' as const, id: 3 }, { rank: '7' as const, suit: 'diamonds' as const, id: 4 }]

      const next = gameReducer(state, {
        type: ACTIONS.DEAL,
        payload: { deck, playerHand, dealerHand },
      })

      // shoeSize = deck(308) + player(2) + dealer(2) = 312
      expect(next.shoeSize).toBe(312)
      expect(next.cutCardReached).toBe(false) // 308/312 remaining > 25%
    })

    it('sets cutCardReached when shoe is depleted past cut card', () => {
      let state = createInitialState(1000)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 100 } })

      // Simulate shoe with only 50 cards remaining out of 312
      const deck = new Array(50).fill({ rank: '2' as const, suit: 'hearts' as const })
      const playerHand = [{ rank: 'K' as const, suit: 'hearts' as const, id: 1 }, { rank: '5' as const, suit: 'clubs' as const, id: 2 }]
      const dealerHand = [{ rank: '9' as const, suit: 'spades' as const, id: 3 }, { rank: '7' as const, suit: 'diamonds' as const, id: 4 }]

      // Set shoeSize to 312 (existing shoe)
      state = { ...state, shoeSize: 312 }

      const next = gameReducer(state, {
        type: ACTIONS.DEAL,
        payload: { deck, playerHand, dealerHand },
      })

      expect(next.shoeSize).toBe(312) // preserved from existing shoe
      expect(next.cutCardReached).toBe(true) // 50/312 < 25%
    })
  })

  describe('RESOLVE', () => {
    it('resolves from DEALING state (blackjack)', () => {
      let state = createInitialState(1000)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 100 } })
      state = gameReducer(state, {
        type: ACTIONS.DEAL,
        payload: { deck: [], playerHand: [], dealerHand: [] },
      })

      const next = gameReducer(state, {
        type: ACTIONS.RESOLVE,
        payload: {
          message: 'Blackjack!',
          result: 'blackjack',
          chips: 1150,
          dealerRevealed: true,
          stats: { wins: 1, losses: 0, pushes: 0 },
        },
      })

      expect(next.phase).toBe(GAME_STATES.GAME_OVER)
      expect(next.result).toBe('blackjack')
      expect(next.chips).toBe(1150)
      expect(next.dealerRevealed).toBe(true)
      expect(next.stats.wins).toBe(1)
    })

    it('can set custom phase (e.g. PLAYER_TURN)', () => {
      let state = createInitialState(1000)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 100 } })
      state = gameReducer(state, {
        type: ACTIONS.DEAL,
        payload: { deck: [], playerHand: [], dealerHand: [] },
      })

      const next = gameReducer(state, {
        type: ACTIONS.RESOLVE,
        payload: {
          message: 'Hit or Stand?',
          result: null,
          phase: 'player_turn',
        },
      })

      expect(next.phase).toBe(GAME_STATES.PLAYER_TURN)
    })
  })

  describe('HIT', () => {
    it('updates player hand and deck', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'player_turn',
        playerHand: [{ rank: '5', suit: 'hearts', id: 1 }],
        deck: [{ rank: '3', suit: 'clubs' }],
      }

      const newHand = [...state.playerHand, { rank: '3' as const, suit: 'clubs' as const, id: 2 }]
      const next = gameReducer(state, {
        type: ACTIONS.HIT,
        payload: { playerHand: newHand, deck: [], phase: 'player_turn' },
      })

      expect(next.playerHand).toEqual(newHand)
      expect(next.deck).toEqual([])
      expect(next.phase).toBe(GAME_STATES.PLAYER_TURN)
    })
  })

  describe('STAND', () => {
    it('reveals dealer and transitions to DEALER_TURN', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'player_turn',
      }

      const next = gameReducer(state, { type: ACTIONS.STAND })
      expect(next.dealerRevealed).toBe(true)
      expect(next.phase).toBe(GAME_STATES.DEALER_TURN)
      expect(next.message).toBe('Dealer is playing...')
    })
  })

  describe('DOUBLE', () => {
    it('doubles bet, deducts chips, reveals dealer', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'player_turn',
        chips: 900,
        bet: 100,
        playerHand: [{ rank: '5', suit: 'hearts', id: 1 }, { rank: '6', suit: 'clubs', id: 2 }],
      }

      const newHand = [...state.playerHand, { rank: '10' as const, suit: 'diamonds' as const, id: 3 }]
      const next = gameReducer(state, {
        type: ACTIONS.DOUBLE,
        payload: { playerHand: newHand, deck: [] },
      })

      expect(next.bet).toBe(200)
      expect(next.chips).toBe(800) // 900 - 100
      expect(next.playerHand).toEqual(newHand)
      expect(next.dealerRevealed).toBe(true)
      expect(next.phase).toBe(GAME_STATES.DOUBLING)
      expect(next.message).toBe('Doubling down...')
    })

    it('transitions from DOUBLING to GAME_OVER on RESOLVE', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'doubling',
        chips: 800,
        bet: 200,
        playerHand: [
          { rank: '5', suit: 'hearts', id: 1 },
          { rank: '6', suit: 'clubs', id: 2 },
          { rank: '10', suit: 'diamonds', id: 3 },
        ],
        dealerRevealed: true,
      }

      const next = gameReducer(state, {
        type: ACTIONS.RESOLVE,
        payload: {
          message: 'You win! 21 beats 18.',
          result: 'win',
          chips: 1200, // 800 + getWinPayout(200)
          dealerRevealed: true,
          stats: { wins: 1, losses: 0, pushes: 0 },
        },
      })

      expect(next.phase).toBe(GAME_STATES.GAME_OVER)
      expect(next.chips).toBe(1200)
      expect(next.result).toBe('win')
    })

    it('handles bust after double down', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'doubling',
        chips: 800,
        bet: 200,
        playerHand: [
          { rank: '10', suit: 'hearts', id: 1 },
          { rank: '8', suit: 'clubs', id: 2 },
          { rank: '5', suit: 'diamonds', id: 3 },
        ],
        dealerRevealed: true,
      }

      const next = gameReducer(state, {
        type: ACTIONS.RESOLVE,
        payload: {
          message: 'Bust! You went over 21 with 23.',
          result: 'lose',
          dealerRevealed: true,
          stats: { wins: 0, losses: 1, pushes: 0 },
        },
      })

      expect(next.phase).toBe(GAME_STATES.GAME_OVER)
      expect(next.result).toBe('lose')
      expect(next.chips).toBe(800) // no payout on bust
    })
  })

  describe('SPLIT', () => {
    it('transitions to SPLITTING, deducts additional bet, sets split hands', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'player_turn',
        chips: 900,
        bet: 100,
        playerHand: [
          { rank: '8', suit: 'hearts', id: 1 },
          { rank: '8', suit: 'clubs', id: 2 },
        ],
        deck: [
          { rank: '5', suit: 'diamonds', id: 3 },
          { rank: 'K', suit: 'spades', id: 4 },
        ],
      }

      const splitHands: SplitHand[] = [
        { cards: [{ rank: '8', suit: 'hearts', id: 1 }, { rank: '5', suit: 'diamonds', id: 3 }], bet: 100, result: null, stood: false },
        { cards: [{ rank: '8', suit: 'clubs', id: 2 }, { rank: 'K', suit: 'spades', id: 4 }], bet: 100, result: null, stood: false },
      ]

      const next = gameReducer(state, {
        type: ACTIONS.SPLIT,
        payload: { splitHands, deck: [] },
      })

      expect(next.phase).toBe(GAME_STATES.SPLITTING)
      expect(next.isSplit).toBe(true)
      expect(next.splitHands).toEqual(splitHands)
      expect(next.activeHandIndex).toBe(0)
      expect(next.chips).toBe(800) // 900 - 100 (additional bet)
      expect(next.playerHand).toEqual(splitHands[0].cards)
      expect(next.message).toBe('Playing hand 1...')
    })
  })

  describe('SPLIT_HIT', () => {
    it('updates active split hand cards', () => {
      const splitHands: SplitHand[] = [
        { cards: [{ rank: '8', suit: 'hearts', id: 1 }, { rank: '5', suit: 'diamonds', id: 3 }], bet: 100, result: null, stood: false },
        { cards: [{ rank: '8', suit: 'clubs', id: 2 }, { rank: 'K', suit: 'spades', id: 4 }], bet: 100, result: null, stood: false },
      ]

      const state: GameState = {
        ...createInitialState(1000),
        phase: 'splitting',
        chips: 800,
        bet: 100,
        splitHands,
        activeHandIndex: 0,
        isSplit: true,
        playerHand: splitHands[0].cards,
      }

      const newHand = [...splitHands[0].cards, { rank: '3' as const, suit: 'clubs' as const, id: 5 }]
      const next = gameReducer(state, {
        type: ACTIONS.SPLIT_HIT,
        payload: { hand: newHand, deck: [] },
      })

      expect(next.splitHands[0].cards).toEqual(newHand)
      expect(next.splitHands[1]).toEqual(splitHands[1]) // unchanged
      expect(next.playerHand).toEqual(newHand)
    })
  })

  describe('SPLIT_STAND', () => {
    it('advances to next hand when more hands remain', () => {
      const splitHands: SplitHand[] = [
        { cards: [{ rank: '8', suit: 'hearts', id: 1 }, { rank: '5', suit: 'diamonds', id: 3 }], bet: 100, result: null, stood: false },
        { cards: [{ rank: '8', suit: 'clubs', id: 2 }, { rank: 'K', suit: 'spades', id: 4 }], bet: 100, result: null, stood: false },
      ]

      const state: GameState = {
        ...createInitialState(1000),
        phase: 'splitting',
        chips: 800,
        bet: 100,
        splitHands,
        activeHandIndex: 0,
        isSplit: true,
        playerHand: splitHands[0].cards,
      }

      const next = gameReducer(state, { type: ACTIONS.SPLIT_STAND })
      expect(next.splitHands[0].stood).toBe(true)
      expect(next.activeHandIndex).toBe(1)
      expect(next.playerHand).toEqual(splitHands[1].cards)
      expect(next.message).toBe('Playing hand 2...')
      expect(next.phase).toBe(GAME_STATES.SPLITTING)
    })

    it('transitions to DEALER_TURN when all hands are done', () => {
      const splitHands: SplitHand[] = [
        { cards: [{ rank: '8', suit: 'hearts', id: 1 }, { rank: '5', suit: 'diamonds', id: 3 }], bet: 100, result: null, stood: true },
        { cards: [{ rank: '8', suit: 'clubs', id: 2 }, { rank: 'K', suit: 'spades', id: 4 }], bet: 100, result: null, stood: false },
      ]

      const state: GameState = {
        ...createInitialState(1000),
        phase: 'splitting',
        chips: 800,
        bet: 100,
        splitHands,
        activeHandIndex: 1,
        isSplit: true,
        playerHand: splitHands[1].cards,
      }

      const next = gameReducer(state, { type: ACTIONS.SPLIT_STAND })
      expect(next.splitHands[1].stood).toBe(true)
      expect(next.dealerRevealed).toBe(true)
      expect(next.phase).toBe(GAME_STATES.DEALER_TURN)
      expect(next.message).toBe('Dealer is playing...')
    })
  })

  describe('SPLIT_RESOLVE', () => {
    it('resolves all split hands and transitions to GAME_OVER', () => {
      const splitHands: SplitHand[] = [
        { cards: [{ rank: '8', suit: 'hearts', id: 1 }, { rank: 'K', suit: 'diamonds', id: 3 }], bet: 100, result: null, stood: true },
        { cards: [{ rank: '8', suit: 'clubs', id: 2 }, { rank: '5', suit: 'spades', id: 4 }], bet: 100, result: null, stood: true },
      ]

      const state: GameState = {
        ...createInitialState(1000),
        phase: 'splitting',
        chips: 800,
        bet: 100,
        splitHands,
        activeHandIndex: 1,
        isSplit: true,
        dealerHand: [{ rank: '10', suit: 'hearts', id: 10 }, { rank: '7', suit: 'clubs', id: 11 }],
      }

      const resolvedHands: SplitHand[] = [
        { ...splitHands[0], result: 'win' },
        { ...splitHands[1], result: 'lose' },
      ]

      const next = gameReducer(state, {
        type: ACTIONS.SPLIT_RESOLVE,
        payload: {
          splitHands: resolvedHands,
          chips: 1000, // 800 + 200 (win) + 0 (lose)
          stats: { wins: 1, losses: 1, pushes: 0 },
          message: 'Hand 1: Win | Hand 2: Lose',
        },
      })

      expect(next.phase).toBe(GAME_STATES.GAME_OVER)
      expect(next.chips).toBe(1000)
      expect(next.splitHands[0].result).toBe('win')
      expect(next.splitHands[1].result).toBe('lose')
      expect(next.dealerRevealed).toBe(true)
      expect(next.stats.wins).toBe(1)
      expect(next.stats.losses).toBe(1)
    })
  })

  describe('SURRENDER', () => {
    it('returns half bet and transitions to SURRENDERING', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'player_turn',
        chips: 900,
        bet: 100,
      }

      const next = gameReducer(state, { type: ACTIONS.SURRENDER })
      expect(next.chips).toBe(950) // 900 + floor(100/2)
      expect(next.dealerRevealed).toBe(true)
      expect(next.phase).toBe(GAME_STATES.SURRENDERING)
      expect(next.result).toBe('lose')
      expect(next.message).toContain('Surrendered')
    })

    it('floors odd bets on surrender', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'player_turn',
        chips: 975,
        bet: 25,
      }

      const next = gameReducer(state, { type: ACTIONS.SURRENDER })
      // floor(25/2) = 12
      expect(next.chips).toBe(987)
    })

    it('transitions from SURRENDERING to GAME_OVER on RESOLVE', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'surrendering',
        chips: 950,
        bet: 100,
        result: 'lose',
        dealerRevealed: true,
      }

      const next = gameReducer(state, {
        type: ACTIONS.RESOLVE,
        payload: {
          message: 'Surrendered — half bet returned.',
          result: 'lose',
          dealerRevealed: true,
          stats: { wins: 0, losses: 1, pushes: 0 },
        },
      })

      expect(next.phase).toBe(GAME_STATES.GAME_OVER)
      expect(next.result).toBe('lose')
      expect(next.stats.losses).toBe(1)
    })
  })

  describe('INSURE', () => {
    it('accepts insurance: deducts chips and transitions to PLAYER_TURN', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'insurance_offer',
        chips: 900,
        bet: 100,
        insuranceBet: 0,
        playerHand: [{ rank: '10', suit: 'hearts', id: 1 }, { rank: '5', suit: 'clubs', id: 2 }],
        dealerHand: [{ rank: 'A', suit: 'spades', id: 3 }, { rank: '7', suit: 'diamonds', id: 4 }],
      }

      const next = gameReducer(state, { type: ACTIONS.INSURE, payload: { amount: 50 } })
      expect(next.insuranceBet).toBe(50)
      expect(next.chips).toBe(850) // 900 - 50
      expect(next.phase).toBe(GAME_STATES.PLAYER_TURN)
      expect(next.message).toBe('Insurance taken. Hit or Stand?')
    })

    it('declines insurance: transitions to PLAYER_TURN without chip change', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'insurance_offer',
        chips: 900,
        bet: 100,
        insuranceBet: 0,
        playerHand: [{ rank: '10', suit: 'hearts', id: 1 }, { rank: '5', suit: 'clubs', id: 2 }],
        dealerHand: [{ rank: 'A', suit: 'spades', id: 3 }, { rank: '7', suit: 'diamonds', id: 4 }],
      }

      const next = gameReducer(state, { type: ACTIONS.INSURE, payload: { amount: 0 } })
      expect(next.insuranceBet).toBe(0)
      expect(next.chips).toBe(900)
      expect(next.phase).toBe(GAME_STATES.PLAYER_TURN)
      expect(next.message).toBe('Hit or Stand?')
    })
  })

  describe('DEALER_DRAW', () => {
    it('updates dealer hand and deck', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'dealer_turn',
        dealerHand: [{ rank: '7', suit: 'hearts', id: 1 }],
        deck: [{ rank: '9', suit: 'clubs' }],
      }

      const newDealerHand = [...state.dealerHand, { rank: '9' as const, suit: 'clubs' as const, id: 2 }]
      const next = gameReducer(state, {
        type: ACTIONS.DEALER_DRAW,
        payload: { dealerHand: newDealerHand, deck: [] },
      })

      expect(next.dealerHand).toEqual(newDealerHand)
      expect(next.deck).toEqual([])
    })
  })

  describe('NEW_ROUND', () => {
    it('resets hands and bet, keeps chips, stats, and shoe', () => {
      const remainingDeck = [{ rank: '2' as const, suit: 'hearts' as const }, { rank: '3' as const, suit: 'clubs' as const }]
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'game_over',
        chips: 1200,
        bet: 100,
        playerHand: [{ rank: 'K', suit: 'hearts' }],
        dealerHand: [{ rank: '5', suit: 'clubs' }],
        deck: remainingDeck,
        result: 'win',
        dealerRevealed: true,
        stats: { wins: 5, losses: 3, pushes: 1 },
        shoeSize: 312,
        cutCardReached: false,
      }

      const next = gameReducer(state, { type: ACTIONS.NEW_ROUND })
      expect(next.phase).toBe(GAME_STATES.BETTING)
      expect(next.chips).toBe(1200) // preserved
      expect(next.stats).toEqual({ wins: 5, losses: 3, pushes: 1 }) // preserved
      expect(next.deck).toEqual(remainingDeck) // shoe preserved between rounds
      expect(next.shoeSize).toBe(312) // shoe size preserved
      expect(next.bet).toBe(0)
      expect(next.playerHand).toEqual([])
      expect(next.dealerHand).toEqual([])
      expect(next.result).toBeNull()
      expect(next.dealerRevealed).toBe(false)
      expect(next.splitHands).toEqual([])
      expect(next.isSplit).toBe(false)
      expect(next.activeHandIndex).toBe(0)
      expect(next.insuranceBet).toBe(0)
    })
  })

  describe('RESET', () => {
    it('resets to initial state with provided bankroll', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'game_over',
        chips: 200,
        stats: { wins: 10, losses: 8, pushes: 2 },
      }

      const next = gameReducer(state, {
        type: ACTIONS.RESET,
        payload: { startingBankroll: 1000 },
      })
      expect(next.chips).toBe(1000)
      expect(next.stats).toEqual({ wins: 0, losses: 0, pushes: 0 })
      expect(next.phase).toBe(GAME_STATES.BETTING)
    })

    it('uses current chips if no bankroll provided', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'game_over',
        chips: 500,
      }

      const next = gameReducer(state, { type: ACTIONS.RESET })
      expect(next.chips).toBe(500)
    })
  })
})

describe('gameReducer — illegal actions', () => {
  it('ignores HIT during BETTING phase', () => {
    const state = createInitialState(1000)
    const next = gameReducer(state, { type: ACTIONS.HIT, payload: { playerHand: [], deck: [] } })
    expect(next).toBe(state) // same reference — no change
  })

  it('ignores DEAL during PLAYER_TURN', () => {
    const state: GameState = { ...createInitialState(1000), phase: 'player_turn' }
    const next = gameReducer(state, { type: ACTIONS.DEAL, payload: { deck: [], playerHand: [], dealerHand: [] } })
    expect(next).toBe(state)
  })

  it('ignores PLACE_BET during DEALER_TURN', () => {
    const state: GameState = { ...createInitialState(1000), phase: 'dealer_turn' }
    const next = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 50 } })
    expect(next).toBe(state)
  })

  it('ignores STAND during GAME_OVER', () => {
    const state: GameState = { ...createInitialState(1000), phase: 'game_over' }
    const next = gameReducer(state, { type: ACTIONS.STAND })
    expect(next).toBe(state)
  })

  it('ignores SPLIT_HIT outside SPLITTING phase', () => {
    const state: GameState = { ...createInitialState(1000), phase: 'player_turn' }
    const next = gameReducer(state, { type: ACTIONS.SPLIT_HIT, payload: { hand: [], deck: [] } })
    expect(next).toBe(state)
  })

  it('returns state for unknown action type', () => {
    const state = createInitialState(1000)
    const next = gameReducer(state, { type: 'UNKNOWN_ACTION' as never, payload: {} } as unknown as GameAction)
    expect(next).toBe(state)
  })
})

describe('VALID_ACTIONS mapping', () => {
  it('allows PLACE_BET in IDLE and BETTING', () => {
    expect(VALID_ACTIONS[GAME_STATES.IDLE]).toContain(ACTIONS.PLACE_BET)
    expect(VALID_ACTIONS[GAME_STATES.BETTING]).toContain(ACTIONS.PLACE_BET)
  })

  it('allows HIT and STAND in PLAYER_TURN', () => {
    expect(VALID_ACTIONS[GAME_STATES.PLAYER_TURN]).toContain(ACTIONS.HIT)
    expect(VALID_ACTIONS[GAME_STATES.PLAYER_TURN]).toContain(ACTIONS.STAND)
  })

  it('allows DEALER_DRAW and RESOLVE in DEALER_TURN', () => {
    expect(VALID_ACTIONS[GAME_STATES.DEALER_TURN]).toContain(ACTIONS.DEALER_DRAW)
    expect(VALID_ACTIONS[GAME_STATES.DEALER_TURN]).toContain(ACTIONS.RESOLVE)
  })

  it('allows NEW_ROUND and RESET in GAME_OVER', () => {
    expect(VALID_ACTIONS[GAME_STATES.GAME_OVER]).toContain(ACTIONS.NEW_ROUND)
    expect(VALID_ACTIONS[GAME_STATES.GAME_OVER]).toContain(ACTIONS.RESET)
  })

  it('allows DOUBLE, SPLIT, and SURRENDER in PLAYER_TURN', () => {
    expect(VALID_ACTIONS[GAME_STATES.PLAYER_TURN]).toContain(ACTIONS.DOUBLE)
    expect(VALID_ACTIONS[GAME_STATES.PLAYER_TURN]).toContain(ACTIONS.SPLIT)
    expect(VALID_ACTIONS[GAME_STATES.PLAYER_TURN]).toContain(ACTIONS.SURRENDER)
  })

  it('allows INSURE and RESOLVE in INSURANCE_OFFER', () => {
    expect(VALID_ACTIONS[GAME_STATES.INSURANCE_OFFER]).toContain(ACTIONS.INSURE)
    expect(VALID_ACTIONS[GAME_STATES.INSURANCE_OFFER]).toContain(ACTIONS.RESOLVE)
  })

  it('allows SPLIT_HIT, SPLIT_STAND, and SPLIT_RESOLVE in SPLITTING', () => {
    expect(VALID_ACTIONS[GAME_STATES.SPLITTING]).toContain(ACTIONS.SPLIT_HIT)
    expect(VALID_ACTIONS[GAME_STATES.SPLITTING]).toContain(ACTIONS.SPLIT_STAND)
    expect(VALID_ACTIONS[GAME_STATES.SPLITTING]).toContain(ACTIONS.SPLIT_RESOLVE)
  })

  it('covers all game states', () => {
    for (const gs of Object.values(GAME_STATES)) {
      expect(VALID_ACTIONS).toHaveProperty(gs)
    }
  })
})
