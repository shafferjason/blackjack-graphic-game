import { useReducer, useCallback, useRef } from 'react'
import { createDeck } from '../utils/deck'
import { cardValue, calculateScore, isBlackjack } from '../utils/scoring'
import { getBlackjackPayout, getWinPayout, getPushPayout } from '../utils/payout'
import { useGameSettings } from '../config/GameSettingsContext'
import { gameReducer, createInitialState, ACTIONS } from '../state/gameReducer'
import type { Card, Hand, Deck, GameStats, GameResult, GamePhase } from '../types'

export function useGameEngine() {
  const {
    GAME_STATES,
    STARTING_BANKROLL,
    DEALER_STAND_THRESHOLD,
    DEALER_PLAY_INITIAL_DELAY,
    DEALER_DRAW_DELAY,
  } = useGameSettings()

  const [state, dispatch] = useReducer(gameReducer, STARTING_BANKROLL, createInitialState)
  const cardIdRef = useRef(0)

  const drawCard = useCallback((currentDeck: Deck): { card: Card; newDeck: Deck } => {
    const newDeck = [...currentDeck]
    const card = newDeck.pop()!
    return { card, newDeck }
  }, [])

  const placeBet = useCallback((amount: number) => {
    dispatch({ type: ACTIONS.PLACE_BET, payload: { amount } })
  }, [])

  const clearBet = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_BET })
  }, [])

  const dealCards = useCallback(() => {
    if (state.bet === 0) return

    let currentDeck = createDeck()
    const pHand: Hand = []
    const dHand: Hand = []

    for (let i = 0; i < 2; i++) {
      let res = drawCard(currentDeck)
      res.card.id = ++cardIdRef.current
      pHand.push(res.card)
      currentDeck = res.newDeck

      res = drawCard(currentDeck)
      res.card.id = ++cardIdRef.current
      dHand.push(res.card)
      currentDeck = res.newDeck
    }

    // Transition to DEALING
    dispatch({
      type: ACTIONS.DEAL,
      payload: { deck: currentDeck, playerHand: pHand, dealerHand: dHand },
    })

    // Immediately check for blackjacks and resolve
    const currentBet = state.bet
    const currentChips = state.chips - currentBet

    if (isBlackjack(pHand) && isBlackjack(dHand)) {
      dispatch({
        type: ACTIONS.RESOLVE,
        payload: {
          message: "Both have Blackjack — it's a push!",
          result: 'push',
          chips: currentChips + getPushPayout(currentBet),
          dealerRevealed: true,
          stats: { ...state.stats, pushes: state.stats.pushes + 1 },
        },
      })
    } else if (isBlackjack(pHand)) {
      dispatch({
        type: ACTIONS.RESOLVE,
        payload: {
          message: 'Blackjack! You win 3:2!',
          result: 'blackjack',
          chips: currentChips + getBlackjackPayout(currentBet),
          dealerRevealed: true,
          stats: { ...state.stats, wins: state.stats.wins + 1 },
        },
      })
    } else {
      // Normal play — transition DEALING → PLAYER_TURN
      dispatch({
        type: ACTIONS.RESOLVE,
        payload: {
          message: 'Hit or Stand?',
          result: null,
          phase: GAME_STATES.PLAYER_TURN as GamePhase,
        },
      })
    }
  }, [state.bet, state.chips, state.stats, drawCard, GAME_STATES])

  const resolveGame = useCallback((pHand: Hand, dHand: Hand, dDeck: Deck, currentBet: number, currentChips: number, currentStats: GameStats) => {
    const dealerPlay = (dh: Hand, dd: Deck) => {
      const dealerScore = calculateScore(dh)
      const playerScore = calculateScore(pHand)

      if (dealerScore < DEALER_STAND_THRESHOLD) {
        const { card, newDeck } = drawCard(dd)
        card.id = ++cardIdRef.current
        const newDh = [...dh, card]
        dispatch({
          type: ACTIONS.DEALER_DRAW,
          payload: { dealerHand: [...newDh], deck: newDeck },
        })
        setTimeout(() => dealerPlay(newDh, newDeck), DEALER_DRAW_DELAY)
      } else {
        let message: string, result: GameResult, chipDelta: number, statKey: keyof GameStats
        if (dealerScore > 21) {
          message = `Dealer busts with ${dealerScore}! You win!`
          result = 'win'
          chipDelta = getWinPayout(currentBet)
          statKey = 'wins'
        } else if (playerScore > dealerScore) {
          message = `You win! ${playerScore} beats ${dealerScore}.`
          result = 'win'
          chipDelta = getWinPayout(currentBet)
          statKey = 'wins'
        } else if (dealerScore > playerScore) {
          message = `Dealer wins. ${dealerScore} beats ${playerScore}.`
          result = 'lose'
          chipDelta = 0
          statKey = 'losses'
        } else {
          message = `Push! Both have ${playerScore}.`
          result = 'push'
          chipDelta = getPushPayout(currentBet)
          statKey = 'pushes'
        }

        dispatch({
          type: ACTIONS.RESOLVE,
          payload: {
            message,
            result,
            chips: currentChips + chipDelta,
            dealerRevealed: true,
            stats: { ...currentStats, [statKey]: currentStats[statKey] + 1 },
          },
        })
      }
    }
    setTimeout(() => dealerPlay(dHand, dDeck), DEALER_PLAY_INITIAL_DELAY)
  }, [drawCard, DEALER_STAND_THRESHOLD, DEALER_DRAW_DELAY, DEALER_PLAY_INITIAL_DELAY])

  const hit = useCallback(() => {
    if (state.phase !== GAME_STATES.PLAYER_TURN) return
    const { card, newDeck } = drawCard(state.deck)
    card.id = ++cardIdRef.current

    const newHand = [...state.playerHand, card]
    const score = calculateScore(newHand)

    if (score > 21) {
      // Bust: HIT to update hand, then RESOLVE
      dispatch({
        type: ACTIONS.HIT,
        payload: { playerHand: newHand, deck: newDeck, phase: GAME_STATES.PLAYER_TURN as GamePhase },
      })
      dispatch({
        type: ACTIONS.STAND, // transition to DEALER_TURN so RESOLVE is valid
      })
      dispatch({
        type: ACTIONS.RESOLVE,
        payload: {
          message: `Bust! You went over 21 with ${score}.`,
          result: 'lose',
          dealerRevealed: true,
          stats: { ...state.stats, losses: state.stats.losses + 1 },
        },
      })
    } else if (score === 21) {
      // Auto-stand on 21
      dispatch({
        type: ACTIONS.HIT,
        payload: { playerHand: newHand, deck: newDeck, phase: GAME_STATES.PLAYER_TURN as GamePhase },
      })
      dispatch({ type: ACTIONS.STAND })
      resolveGame(newHand, state.dealerHand, newDeck, state.bet, state.chips, state.stats)
    } else {
      dispatch({
        type: ACTIONS.HIT,
        payload: { playerHand: newHand, deck: newDeck, phase: GAME_STATES.PLAYER_TURN as GamePhase },
      })
    }
  }, [state.phase, state.deck, state.playerHand, state.dealerHand, state.bet, state.stats, drawCard, resolveGame, GAME_STATES])

  const stand = useCallback(() => {
    dispatch({ type: ACTIONS.STAND })
    resolveGame(state.playerHand, state.dealerHand, state.deck, state.bet, state.chips, state.stats)
  }, [state.playerHand, state.dealerHand, state.deck, state.bet, state.chips, state.stats, resolveGame])

  const doubleDown = useCallback(() => {
    if (state.phase !== GAME_STATES.PLAYER_TURN) return
    if (state.chips < state.bet) return // can't afford to double

    const { card, newDeck } = drawCard(state.deck)
    card.id = ++cardIdRef.current
    const newHand = [...state.playerHand, card]
    const doubledBet = state.bet * 2
    const chipsAfterDouble = state.chips - state.bet // deduct the additional bet

    dispatch({
      type: ACTIONS.DOUBLE,
      payload: { playerHand: newHand, deck: newDeck },
    })

    const score = calculateScore(newHand)
    if (score > 21) {
      // Bust after double
      dispatch({
        type: ACTIONS.RESOLVE,
        payload: {
          message: `Bust! You went over 21 with ${score}.`,
          result: 'lose',
          dealerRevealed: true,
          stats: { ...state.stats, losses: state.stats.losses + 1 },
        },
      })
    } else {
      // Resolve against dealer with doubled bet
      resolveGame(newHand, state.dealerHand, newDeck, doubledBet, chipsAfterDouble, state.stats)
    }
  }, [state.phase, state.chips, state.bet, state.deck, state.playerHand, state.dealerHand, state.stats, drawCard, resolveGame, GAME_STATES])

  const newRound = useCallback(() => {
    dispatch({ type: ACTIONS.NEW_ROUND })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: ACTIONS.RESET, payload: { startingBankroll: STARTING_BANKROLL } })
  }, [STARTING_BANKROLL])

  const playerScore = calculateScore(state.playerHand)
  const dealerVisibleScore = state.dealerRevealed
    ? calculateScore(state.dealerHand)
    : state.dealerHand.length > 0
    ? cardValue(state.dealerHand[0])
    : 0

  const displayMessage = (state.chips <= 0 && state.phase === GAME_STATES.BETTING)
    ? "You're out of chips! Reset to play again."
    : state.message

  // Map phase to gameState for backward-compatible component API
  const gameState = state.phase

  const canDouble = state.phase === GAME_STATES.PLAYER_TURN
    && state.playerHand.length === 2
    && state.chips >= state.bet

  return {
    state: {
      playerHand: state.playerHand,
      dealerHand: state.dealerHand,
      gameState,
      message: displayMessage,
      chips: state.chips,
      bet: state.bet,
      result: state.result,
      dealerRevealed: state.dealerRevealed,
      stats: state.stats,
      playerScore,
      dealerVisibleScore,
      canDouble,
    },
    actions: {
      placeBet,
      clearBet,
      dealCards,
      hit,
      stand,
      doubleDown,
      newRound,
      resetGame,
    },
  }
}
