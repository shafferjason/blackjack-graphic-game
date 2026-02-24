import { describe, it, expect } from 'vitest'
import { gameReducer, createInitialState, ACTIONS, VALID_ACTIONS } from './gameReducer'
import { GAME_STATES } from '../constants'
import type { GameState, GameAction } from '../types'

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
  })

  describe('CLEAR_BET', () => {
    it('resets bet to 0', () => {
      let state = createInitialState(1000)
      state = gameReducer(state, { type: ACTIONS.PLACE_BET, payload: { amount: 100 } })
      state = gameReducer(state, { type: ACTIONS.CLEAR_BET })
      expect(state.bet).toBe(0)
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
    it('resets hands and bet, keeps chips and stats', () => {
      const state: GameState = {
        ...createInitialState(1000),
        phase: 'game_over',
        chips: 1200,
        bet: 100,
        playerHand: [{ rank: 'K', suit: 'hearts' }],
        dealerHand: [{ rank: '5', suit: 'clubs' }],
        result: 'win',
        dealerRevealed: true,
        stats: { wins: 5, losses: 3, pushes: 1 },
      }

      const next = gameReducer(state, { type: ACTIONS.NEW_ROUND })
      expect(next.phase).toBe(GAME_STATES.BETTING)
      expect(next.chips).toBe(1200) // preserved
      expect(next.stats).toEqual({ wins: 5, losses: 3, pushes: 1 }) // preserved
      expect(next.bet).toBe(0)
      expect(next.playerHand).toEqual([])
      expect(next.dealerHand).toEqual([])
      expect(next.result).toBeNull()
      expect(next.dealerRevealed).toBe(false)
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

  it('allows DOUBLE and SURRENDER in PLAYER_TURN', () => {
    expect(VALID_ACTIONS[GAME_STATES.PLAYER_TURN]).toContain(ACTIONS.DOUBLE)
    expect(VALID_ACTIONS[GAME_STATES.PLAYER_TURN]).toContain(ACTIONS.SURRENDER)
  })

  it('covers all game states', () => {
    for (const gs of Object.values(GAME_STATES)) {
      expect(VALID_ACTIONS).toHaveProperty(gs)
    }
  })
})
