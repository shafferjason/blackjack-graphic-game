import { useReducer, useCallback, useEffect, useRef } from 'react'
import type { Card } from '../types'
import { createDeck } from '../utils/deck'
import { evaluateHand, compareHands } from '../utils/pokerHands'
import type { PokerHandResult } from '../utils/pokerHands'

// ── Types ──

export type HoldemPhase =
  | 'idle'
  | 'pre_flop'
  | 'flop'
  | 'turn'
  | 'river'
  | 'showdown'
  | 'round_over'

export interface HoldemPlayer {
  id: number
  name: string
  hand: Card[]
  chips: number
  currentBet: number
  totalBetThisRound: number
  folded: boolean
  isAllIn: boolean
  isHuman: boolean
  handResult?: PokerHandResult
  isDealer: boolean
  lastAction?: string
}

export interface HoldemState {
  phase: HoldemPhase
  deck: Card[]
  communityCards: Card[]
  players: HoldemPlayer[]
  pot: number
  currentPlayerIndex: number
  dealerIndex: number
  smallBlind: number
  bigBlind: number
  minRaise: number
  message: string
  winner: string | null
  lastRaiseAmount: number
  bettingRoundStartIndex: number
  actionsThisRound: number
}

type HoldemAction =
  | { type: 'START_ROUND' }
  | { type: 'FOLD' }
  | { type: 'CHECK' }
  | { type: 'CALL' }
  | { type: 'RAISE'; amount: number }
  | { type: 'ALL_IN' }
  | { type: 'AI_ACT' }
  | { type: 'DEAL_COMMUNITY' }
  | { type: 'SHOWDOWN' }
  | { type: 'NEW_ROUND' }
  | { type: 'SYNC_CHIPS'; chips: number }

const NUM_AI_PLAYERS = 3
const DEFAULT_SMALL_BLIND = 5
const DEFAULT_BIG_BLIND = 10

function createPlayers(humanChips: number): HoldemPlayer[] {
  const players: HoldemPlayer[] = [
    { id: 0, name: 'You', hand: [], chips: humanChips, currentBet: 0, totalBetThisRound: 0, folded: false, isAllIn: false, isHuman: true, isDealer: false },
  ]
  const aiNames = ['Alex', 'Sam', 'Jordan']
  for (let i = 0; i < NUM_AI_PLAYERS; i++) {
    players.push({
      id: i + 1,
      name: aiNames[i],
      hand: [],
      chips: 1000,
      currentBet: 0,
      totalBetThisRound: 0,
      folded: false,
      isAllIn: false,
      isHuman: false,
      isDealer: false,
    })
  }
  return players
}

function getActivePlayers(players: HoldemPlayer[]): HoldemPlayer[] {
  return players.filter(p => !p.folded && p.chips >= 0)
}

function nextActiveIndex(players: HoldemPlayer[], fromIndex: number): number {
  let idx = (fromIndex + 1) % players.length
  let attempts = 0
  while ((players[idx].folded || players[idx].isAllIn) && attempts < players.length) {
    idx = (idx + 1) % players.length
    attempts++
  }
  return idx
}

function getMaxBet(players: HoldemPlayer[]): number {
  return Math.max(...players.map(p => p.currentBet))
}

function isBettingComplete(state: HoldemState): boolean {
  const activePlayers = state.players.filter(p => !p.folded && !p.isAllIn)
  if (activePlayers.length <= 1) return true

  const maxBet = getMaxBet(state.players)
  const allMatched = activePlayers.every(p => p.currentBet === maxBet)

  // Everyone has acted and all bets match
  return allMatched && state.actionsThisRound >= activePlayers.length
}

function collectPot(players: HoldemPlayer[]): { pot: number; players: HoldemPlayer[] } {
  let pot = 0
  const updated = players.map(p => {
    pot += p.currentBet
    return { ...p, currentBet: 0 }
  })
  return { pot, players: updated }
}

function resolveShowdown(state: HoldemState): HoldemState {
  const activePlayers = state.players.filter(p => !p.folded)

  // Evaluate hands
  const evaluated = state.players.map(p => {
    if (p.folded) return p
    const allCards = [...p.hand, ...state.communityCards]
    const result = evaluateHand(allCards)
    return { ...p, handResult: result }
  })

  // Find winner(s) among non-folded
  const activeEvaluated = evaluated.filter(p => !p.folded && p.handResult)
  let bestScore = -1
  let winners: HoldemPlayer[] = []

  for (const p of activeEvaluated) {
    if (!p.handResult) continue
    if (p.handResult.score > bestScore) {
      bestScore = p.handResult.score
      winners = [p]
    } else if (p.handResult.score === bestScore) {
      winners.push(p)
    }
  }

  // Distribute pot
  const totalPot = state.pot
  const share = Math.floor(totalPot / winners.length)
  const remainder = totalPot - share * winners.length

  const finalPlayers = evaluated.map(p => {
    const isWinner = winners.some(w => w.id === p.id)
    if (isWinner) {
      const extra = p.id === winners[0].id ? remainder : 0
      return { ...p, chips: p.chips + share + extra }
    }
    return p
  })

  const winnerNames = winners.map(w => w.name).join(' & ')
  const winHand = winners[0]?.handResult?.label || ''
  const msg = winners.length === 1
    ? `${winnerNames} wins $${totalPot} with ${winHand}!`
    : `Split pot! ${winnerNames} tie with ${winHand} ($${share} each)`

  return {
    ...state,
    players: finalPlayers,
    phase: 'round_over',
    message: msg,
    winner: winnerNames,
    pot: 0,
  }
}

function aiDecision(player: HoldemPlayer, state: HoldemState): HoldemAction {
  const maxBet = getMaxBet(state.players)
  const toCall = maxBet - player.currentBet
  const allCards = [...player.hand, ...state.communityCards]
  const handResult = state.communityCards.length >= 3 ? evaluateHand(allCards) : null

  // Simple AI strategy based on hand strength and pot odds
  const handStrength = handResult ? handResult.score : 0
  const hasGoodHand = handStrength >= 1_000_000 // at least a pair
  const hasGreatHand = handStrength >= 3_000_000 // three of a kind+
  const highCards = player.hand.filter(c => ['A', 'K', 'Q', 'J'].includes(c.rank)).length
  const hasPocketPair = player.hand.length === 2 && player.hand[0].rank === player.hand[1].rank
  const suitedCards = player.hand.length === 2 && player.hand[0].suit === player.hand[1].suit

  // Pre-flop logic
  if (state.communityCards.length === 0) {
    if (hasPocketPair || highCards >= 2) {
      if (toCall === 0) {
        // Raise with strong pre-flop hands
        const raiseAmt = Math.min(state.bigBlind * 3, player.chips)
        if (raiseAmt > state.minRaise) return { type: 'RAISE', amount: raiseAmt }
        return { type: 'CHECK' }
      }
      if (toCall <= state.bigBlind * 4) return { type: 'CALL' }
      if (hasPocketPair && ['A', 'K', 'Q'].includes(player.hand[0].rank)) return { type: 'CALL' }
      return { type: 'FOLD' }
    }
    if (highCards === 1 || suitedCards) {
      if (toCall === 0) return { type: 'CHECK' }
      if (toCall <= state.bigBlind * 2) return { type: 'CALL' }
      return Math.random() > 0.6 ? { type: 'CALL' } : { type: 'FOLD' }
    }
    // Weak hand
    if (toCall === 0) return { type: 'CHECK' }
    if (toCall <= state.bigBlind) return Math.random() > 0.5 ? { type: 'CALL' } : { type: 'FOLD' }
    return { type: 'FOLD' }
  }

  // Post-flop logic
  if (hasGreatHand) {
    // Raise with strong hands
    const raiseAmt = Math.min(Math.floor(state.pot * 0.6), player.chips)
    if (raiseAmt > state.minRaise && toCall === 0) return { type: 'RAISE', amount: raiseAmt }
    if (toCall > 0) {
      if (raiseAmt > state.minRaise && Math.random() > 0.4) return { type: 'RAISE', amount: raiseAmt }
      return { type: 'CALL' }
    }
    return { type: 'RAISE', amount: Math.max(raiseAmt, state.minRaise) }
  }

  if (hasGoodHand) {
    if (toCall === 0) {
      // Sometimes bet, sometimes check
      if (Math.random() > 0.5) {
        const betAmt = Math.min(Math.floor(state.pot * 0.4), player.chips)
        if (betAmt >= state.minRaise) return { type: 'RAISE', amount: betAmt }
      }
      return { type: 'CHECK' }
    }
    if (toCall <= state.pot * 0.5) return { type: 'CALL' }
    return Math.random() > 0.4 ? { type: 'CALL' } : { type: 'FOLD' }
  }

  // Weak hand post-flop
  if (toCall === 0) {
    // Occasional bluff
    if (Math.random() > 0.85) {
      const bluffAmt = Math.min(Math.floor(state.pot * 0.3), player.chips)
      if (bluffAmt >= state.minRaise) return { type: 'RAISE', amount: bluffAmt }
    }
    return { type: 'CHECK' }
  }
  if (toCall <= state.bigBlind) return Math.random() > 0.4 ? { type: 'CALL' } : { type: 'FOLD' }
  return { type: 'FOLD' }
}

function holdemReducer(state: HoldemState, action: HoldemAction): HoldemState {
  switch (action.type) {
    case 'SYNC_CHIPS': {
      const players = state.players.map(p =>
        p.isHuman ? { ...p, chips: action.chips } : p
      )
      return { ...state, players }
    }

    case 'START_ROUND': {
      const deck = createDeck()
      const dealerIdx = state.dealerIndex
      const sbIdx = (dealerIdx + 1) % state.players.length
      const bbIdx = (dealerIdx + 2) % state.players.length

      // Deal 2 cards to each player
      let deckCopy = [...deck]
      const players = state.players.map((p, i) => {
        const hand = [deckCopy.pop()!, deckCopy.pop()!]
        const isDealer = i === dealerIdx
        return {
          ...p,
          hand,
          folded: false,
          isAllIn: false,
          currentBet: 0,
          totalBetThisRound: 0,
          handResult: undefined,
          isDealer,
          lastAction: undefined,
        }
      })

      // Post blinds
      const sbAmount = Math.min(state.smallBlind, players[sbIdx].chips)
      players[sbIdx] = { ...players[sbIdx], chips: players[sbIdx].chips - sbAmount, currentBet: sbAmount, totalBetThisRound: sbAmount }
      const bbAmount = Math.min(state.bigBlind, players[bbIdx].chips)
      players[bbIdx] = { ...players[bbIdx], chips: players[bbIdx].chips - bbAmount, currentBet: bbAmount, totalBetThisRound: bbAmount }

      const pot = sbAmount + bbAmount

      // Action starts after big blind (UTG)
      const firstToAct = nextActiveIndex(players, bbIdx)

      return {
        ...state,
        deck: deckCopy,
        communityCards: [],
        players,
        pot,
        phase: 'pre_flop',
        currentPlayerIndex: firstToAct,
        minRaise: state.bigBlind,
        message: `Blinds posted: $${sbAmount}/$${bbAmount}`,
        winner: null,
        lastRaiseAmount: state.bigBlind,
        bettingRoundStartIndex: firstToAct,
        actionsThisRound: 0,
      }
    }

    case 'FOLD': {
      const idx = state.currentPlayerIndex
      const players = state.players.map((p, i) =>
        i === idx ? { ...p, folded: true, lastAction: 'Fold' } : p
      )
      const active = players.filter(p => !p.folded)

      // If only one player left, they win
      if (active.length === 1) {
        const winnerId = active[0].id
        const totalPot = state.pot + players.reduce((s, p) => s + p.currentBet, 0)
        const finalPlayers = players.map(p => ({
          ...p,
          chips: p.id === winnerId ? p.chips + totalPot + p.currentBet : p.chips,
          currentBet: 0,
        }))
        return {
          ...state,
          players: finalPlayers,
          pot: 0,
          phase: 'round_over',
          message: `${active[0].name} wins $${totalPot} — everyone else folded!`,
          winner: active[0].name,
        }
      }

      const newState = { ...state, players, actionsThisRound: state.actionsThisRound + 1 }
      const nextIdx = nextActiveIndex(players, idx)
      newState.currentPlayerIndex = nextIdx

      if (isBettingComplete(newState)) {
        return advancePhase(newState)
      }

      return newState
    }

    case 'CHECK': {
      const idx = state.currentPlayerIndex
      const players = state.players.map((p, i) =>
        i === idx ? { ...p, lastAction: 'Check' } : p
      )
      const newState = {
        ...state,
        players,
        actionsThisRound: state.actionsThisRound + 1,
        currentPlayerIndex: nextActiveIndex(players, idx),
      }

      if (isBettingComplete(newState)) {
        return advancePhase(newState)
      }
      return newState
    }

    case 'CALL': {
      const idx = state.currentPlayerIndex
      const maxBet = getMaxBet(state.players)
      const player = state.players[idx]
      const toCall = Math.min(maxBet - player.currentBet, player.chips)
      const players = state.players.map((p, i) =>
        i === idx ? {
          ...p,
          chips: p.chips - toCall,
          currentBet: p.currentBet + toCall,
          totalBetThisRound: p.totalBetThisRound + toCall,
          isAllIn: p.chips - toCall === 0,
          lastAction: `Call $${toCall}`,
        } : p
      )

      const newState = {
        ...state,
        players,
        actionsThisRound: state.actionsThisRound + 1,
        currentPlayerIndex: nextActiveIndex(players, idx),
      }

      if (isBettingComplete(newState)) {
        return advancePhase(newState)
      }
      return newState
    }

    case 'RAISE': {
      const idx = state.currentPlayerIndex
      const player = state.players[idx]
      const raiseAmount = Math.min(action.amount, player.chips)
      const maxBet = getMaxBet(state.players)
      const totalBet = maxBet + raiseAmount
      const toAdd = totalBet - player.currentBet

      const players = state.players.map((p, i) =>
        i === idx ? {
          ...p,
          chips: p.chips - Math.min(toAdd, p.chips),
          currentBet: totalBet,
          totalBetThisRound: p.totalBetThisRound + Math.min(toAdd, p.chips),
          isAllIn: p.chips - Math.min(toAdd, p.chips) === 0,
          lastAction: `Raise $${raiseAmount}`,
        } : p
      )

      return {
        ...state,
        players,
        minRaise: raiseAmount,
        lastRaiseAmount: raiseAmount,
        actionsThisRound: 1, // Reset — new raise starts new round of action
        currentPlayerIndex: nextActiveIndex(players, idx),
        bettingRoundStartIndex: idx,
      }
    }

    case 'ALL_IN': {
      const idx = state.currentPlayerIndex
      const player = state.players[idx]
      const allInAmount = player.chips
      const newBet = player.currentBet + allInAmount
      const maxBet = getMaxBet(state.players)
      const isRaise = newBet > maxBet

      const players = state.players.map((p, i) =>
        i === idx ? {
          ...p,
          chips: 0,
          currentBet: newBet,
          totalBetThisRound: p.totalBetThisRound + allInAmount,
          isAllIn: true,
          lastAction: `All In $${allInAmount}`,
        } : p
      )

      const newState = {
        ...state,
        players,
        actionsThisRound: isRaise ? 1 : state.actionsThisRound + 1,
        currentPlayerIndex: nextActiveIndex(players, idx),
        ...(isRaise ? { minRaise: newBet - maxBet, lastRaiseAmount: newBet - maxBet, bettingRoundStartIndex: idx } : {}),
      }

      if (isBettingComplete(newState)) {
        return advancePhase(newState)
      }
      return newState
    }

    case 'AI_ACT': {
      const currentPlayer = state.players[state.currentPlayerIndex]
      if (!currentPlayer || currentPlayer.isHuman || currentPlayer.folded || currentPlayer.isAllIn) {
        return state
      }
      const decision = aiDecision(currentPlayer, state)
      return holdemReducer(state, decision)
    }

    case 'NEW_ROUND': {
      const newDealerIdx = (state.dealerIndex + 1) % state.players.length
      const players = state.players.map(p => ({
        ...p,
        hand: [],
        folded: false,
        isAllIn: false,
        currentBet: 0,
        totalBetThisRound: 0,
        handResult: undefined,
        isDealer: false,
        lastAction: undefined,
      }))
      // Remove players with 0 chips (except human) and reset AI chips
      const activePlayers = players.map(p => {
        if (!p.isHuman && p.chips <= 0) {
          return { ...p, chips: 500 } // AI rebuys
        }
        return p
      })
      return {
        ...state,
        players: activePlayers,
        phase: 'idle',
        communityCards: [],
        pot: 0,
        message: 'Place your bets! Press Deal to start.',
        winner: null,
        dealerIndex: newDealerIdx,
        actionsThisRound: 0,
      }
    }

    default:
      return state
  }
}

function advancePhase(state: HoldemState): HoldemState {
  // Collect bets into pot
  let totalBets = 0
  const players = state.players.map(p => {
    totalBets += p.currentBet
    return { ...p, currentBet: 0 }
  })
  const pot = state.pot + totalBets

  const activePlayers = players.filter(p => !p.folded)
  const canAct = activePlayers.filter(p => !p.isAllIn)

  // If only one active or all-in, run remaining community cards
  if (canAct.length <= 1) {
    let deck = [...state.deck]
    let community = [...state.communityCards]
    while (community.length < 5) {
      community.push(deck.pop()!)
    }
    return resolveShowdown({ ...state, players, pot, deck, communityCards: community })
  }

  let deck = [...state.deck]
  let communityCards = [...state.communityCards]
  let nextPhase: HoldemPhase = state.phase

  switch (state.phase) {
    case 'pre_flop':
      communityCards = [deck.pop()!, deck.pop()!, deck.pop()!]
      nextPhase = 'flop'
      break
    case 'flop':
      communityCards.push(deck.pop()!)
      nextPhase = 'turn'
      break
    case 'turn':
      communityCards.push(deck.pop()!)
      nextPhase = 'river'
      break
    case 'river':
      return resolveShowdown({ ...state, players, pot, deck, communityCards })
  }

  const firstToAct = nextActiveIndex(players, state.dealerIndex)

  return {
    ...state,
    players,
    pot,
    deck,
    communityCards,
    phase: nextPhase,
    currentPlayerIndex: firstToAct,
    actionsThisRound: 0,
    bettingRoundStartIndex: firstToAct,
    minRaise: state.bigBlind,
    message: `${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1).replace('_', ' ')} dealt`,
  }
}

function createInitialState(humanChips: number): HoldemState {
  return {
    phase: 'idle',
    deck: [],
    communityCards: [],
    players: createPlayers(humanChips),
    pot: 0,
    currentPlayerIndex: 0,
    dealerIndex: 0,
    smallBlind: DEFAULT_SMALL_BLIND,
    bigBlind: DEFAULT_BIG_BLIND,
    minRaise: DEFAULT_BIG_BLIND,
    message: 'Welcome to Texas Hold\'em! Press Deal to start.',
    winner: null,
    lastRaiseAmount: DEFAULT_BIG_BLIND,
    bettingRoundStartIndex: 0,
    actionsThisRound: 0,
  }
}

export function useTexasHoldem(chips: number, onChipsChange: (newChips: number) => void) {
  const [state, dispatch] = useReducer(holdemReducer, chips, createInitialState)
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevHumanChipsRef = useRef(chips)

  // Sync human chips when they change externally
  useEffect(() => {
    if (chips !== prevHumanChipsRef.current && state.phase === 'idle') {
      dispatch({ type: 'SYNC_CHIPS', chips })
      prevHumanChipsRef.current = chips
    }
  }, [chips, state.phase])

  // Report chip changes back to parent when round ends
  useEffect(() => {
    if (state.phase === 'round_over') {
      const humanPlayer = state.players.find(p => p.isHuman)
      if (humanPlayer) {
        prevHumanChipsRef.current = humanPlayer.chips
        onChipsChange(humanPlayer.chips)
      }
    }
  }, [state.phase, state.players, onChipsChange])

  // AI auto-play
  useEffect(() => {
    if (state.phase === 'round_over' || state.phase === 'idle' || state.phase === 'showdown') return

    const current = state.players[state.currentPlayerIndex]
    if (!current || current.isHuman || current.folded || current.isAllIn) return

    aiTimerRef.current = setTimeout(() => {
      dispatch({ type: 'AI_ACT' })
    }, 600 + Math.random() * 400)

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    }
  }, [state.currentPlayerIndex, state.phase, state.players, state.actionsThisRound])

  const startRound = useCallback(() => dispatch({ type: 'START_ROUND' }), [])
  const fold = useCallback(() => dispatch({ type: 'FOLD' }), [])
  const check = useCallback(() => dispatch({ type: 'CHECK' }), [])
  const call = useCallback(() => dispatch({ type: 'CALL' }), [])
  const raise = useCallback((amount: number) => dispatch({ type: 'RAISE', amount }), [])
  const allIn = useCallback(() => dispatch({ type: 'ALL_IN' }), [])
  const newRound = useCallback(() => dispatch({ type: 'NEW_ROUND' }), [])

  const humanPlayer = state.players.find(p => p.isHuman)!
  const isHumanTurn = state.players[state.currentPlayerIndex]?.isHuman && !['idle', 'round_over', 'showdown'].includes(state.phase)
  const maxBet = getMaxBet(state.players)
  const toCall = maxBet - (humanPlayer?.currentBet ?? 0)
  const canCheck = toCall === 0
  const canCall = toCall > 0 && humanPlayer.chips >= toCall
  const canRaise = humanPlayer.chips > toCall

  return {
    state,
    humanPlayer,
    isHumanTurn,
    toCall,
    canCheck,
    canCall,
    canRaise,
    actions: {
      startRound,
      fold,
      check,
      call,
      raise,
      allIn,
      newRound,
    },
  }
}
