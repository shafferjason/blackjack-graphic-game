import { useReducer, useCallback, useRef } from 'react'
import { createShoe } from '../utils/deck'
import { cardValue, calculateScore, isBlackjack } from '../utils/scoring'
import { getBlackjackPayout, getWinPayout, getPushPayout } from '../utils/payout'
import { useGameSettings } from '../config/GameSettingsContext'
import { gameReducer, createInitialState, ACTIONS } from '../state/gameReducer'
import type { Card, Hand, Deck, GameStats, GameResult, GamePhase, SplitHand } from '../types'

export function useGameEngine() {
  const {
    GAME_STATES,
    STARTING_BANKROLL,
    DEALER_STAND_THRESHOLD,
    DEALER_PLAY_INITIAL_DELAY,
    DEALER_DRAW_DELAY,
    MAX_SPLIT_HANDS,
    NUM_DECKS,
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

    // Use existing shoe, or create a new one if empty / cut card was reached last round
    let currentDeck: Deck = (state.deck.length > 0 && !state.cutCardReached)
      ? [...state.deck]
      : createShoe(NUM_DECKS)

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
    } else if (dHand[0].rank === 'A') {
      // Dealer shows Ace — offer insurance before player acts
      dispatch({
        type: ACTIONS.RESOLVE,
        payload: {
          message: 'Dealer shows Ace — Insurance?',
          result: null,
          phase: GAME_STATES.INSURANCE_OFFER as GamePhase,
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
  }, [state.bet, state.chips, state.stats, state.deck, state.cutCardReached, drawCard, GAME_STATES, NUM_DECKS])

  const resolveGame = useCallback((pHand: Hand, dHand: Hand, dDeck: Deck, currentBet: number, currentChips: number, currentStats: GameStats, currentInsuranceBet: number) => {
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
        const dealerHasBlackjack = isBlackjack(dh)
        const insurancePayout = (dealerHasBlackjack && currentInsuranceBet > 0)
          ? currentInsuranceBet * 3 // return original bet + 2:1 winnings
          : 0

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

        if (insurancePayout > 0) {
          message += ' Insurance pays 2:1!'
        } else if (currentInsuranceBet > 0) {
          message += ' Insurance lost.'
        }

        dispatch({
          type: ACTIONS.RESOLVE,
          payload: {
            message,
            result,
            chips: currentChips + chipDelta + insurancePayout,
            dealerRevealed: true,
            stats: { ...currentStats, [statKey]: currentStats[statKey] + 1 },
          },
        })
      }
    }
    setTimeout(() => dealerPlay(dHand, dDeck), DEALER_PLAY_INITIAL_DELAY)
  }, [drawCard, DEALER_STAND_THRESHOLD, DEALER_DRAW_DELAY, DEALER_PLAY_INITIAL_DELAY])

  // ── Resolve all split hands against dealer ──
  const resolveSplitGame = useCallback((hands: SplitHand[], dHand: Hand, dDeck: Deck, currentChips: number, currentStats: GameStats, currentInsuranceBet: number = 0) => {
    const dealerPlay = (dh: Hand, dd: Deck) => {
      const dealerScore = calculateScore(dh)

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
        const dealerHasBlackjack = isBlackjack(dh)
        const insurancePayout = (dealerHasBlackjack && currentInsuranceBet > 0)
          ? currentInsuranceBet * 3
          : 0

        let totalChips = currentChips
        const updatedStats = { ...currentStats }
        const resolvedHands: SplitHand[] = []
        const results: string[] = []

        for (let i = 0; i < hands.length; i++) {
          const hand = hands[i]
          const playerScore = calculateScore(hand.cards)
          let result: GameResult

          if (playerScore > 21) {
            result = 'lose'
            updatedStats.losses++
            results.push(`Hand ${i + 1}: Bust`)
          } else if (dealerScore > 21) {
            result = 'win'
            totalChips += getWinPayout(hand.bet)
            updatedStats.wins++
            results.push(`Hand ${i + 1}: Win`)
          } else if (playerScore > dealerScore) {
            result = 'win'
            totalChips += getWinPayout(hand.bet)
            updatedStats.wins++
            results.push(`Hand ${i + 1}: Win`)
          } else if (dealerScore > playerScore) {
            result = 'lose'
            updatedStats.losses++
            results.push(`Hand ${i + 1}: Lose`)
          } else {
            result = 'push'
            totalChips += getPushPayout(hand.bet)
            updatedStats.pushes++
            results.push(`Hand ${i + 1}: Push`)
          }
          resolvedHands.push({ ...hand, result })
        }

        let message = results.join(' | ')
        if (insurancePayout > 0) {
          message += ' Insurance pays 2:1!'
        } else if (currentInsuranceBet > 0) {
          message += ' Insurance lost.'
        }

        dispatch({
          type: ACTIONS.SPLIT_RESOLVE,
          payload: {
            splitHands: resolvedHands,
            chips: totalChips + insurancePayout,
            stats: updatedStats,
            message,
          },
        })
      }
    }
    setTimeout(() => dealerPlay(dHand, dDeck), DEALER_PLAY_INITIAL_DELAY)
  }, [drawCard, DEALER_STAND_THRESHOLD, DEALER_DRAW_DELAY, DEALER_PLAY_INITIAL_DELAY])

  const hit = useCallback(() => {
    // ── Split hit ──
    if (state.isSplit && state.phase === GAME_STATES.SPLITTING) {
      const activeHand = state.splitHands[state.activeHandIndex]
      const { card, newDeck } = drawCard(state.deck)
      card.id = ++cardIdRef.current
      const newCards = [...activeHand.cards, card]
      const score = calculateScore(newCards)

      dispatch({
        type: ACTIONS.SPLIT_HIT,
        payload: { hand: newCards, deck: newDeck },
      })

      if (score >= 21) {
        // Auto-stand on 21 or bust
        const updatedHands = state.splitHands.map((h, i) =>
          i === state.activeHandIndex ? { ...h, cards: newCards, stood: true } : h
        )
        const nextIndex = state.activeHandIndex + 1
        if (nextIndex < updatedHands.length) {
          // Advance to next hand via stand
          dispatch({ type: ACTIONS.SPLIT_STAND })
        } else {
          // All hands done — go to dealer
          dispatch({ type: ACTIONS.SPLIT_STAND })
          resolveSplitGame(updatedHands, state.dealerHand, newDeck, state.chips, state.stats, state.insuranceBet)
        }
      }
      return
    }

    // ── Normal hit ──
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
      resolveGame(newHand, state.dealerHand, newDeck, state.bet, state.chips, state.stats, state.insuranceBet)
    } else {
      dispatch({
        type: ACTIONS.HIT,
        payload: { playerHand: newHand, deck: newDeck, phase: GAME_STATES.PLAYER_TURN as GamePhase },
      })
    }
  }, [state.phase, state.isSplit, state.splitHands, state.activeHandIndex, state.deck, state.playerHand, state.dealerHand, state.bet, state.chips, state.stats, drawCard, resolveGame, resolveSplitGame, GAME_STATES])

  const stand = useCallback(() => {
    // ── Split stand ──
    if (state.isSplit && state.phase === GAME_STATES.SPLITTING) {
      const updatedHands = state.splitHands.map((h, i) =>
        i === state.activeHandIndex ? { ...h, stood: true } : h
      )
      dispatch({ type: ACTIONS.SPLIT_STAND })

      const nextIndex = state.activeHandIndex + 1
      if (nextIndex >= updatedHands.length) {
        // All hands done — resolve against dealer
        resolveSplitGame(updatedHands, state.dealerHand, state.deck, state.chips, state.stats, state.insuranceBet)
      }
      return
    }

    // ── Normal stand ──
    dispatch({ type: ACTIONS.STAND })
    resolveGame(state.playerHand, state.dealerHand, state.deck, state.bet, state.chips, state.stats, state.insuranceBet)
  }, [state.phase, state.isSplit, state.splitHands, state.activeHandIndex, state.playerHand, state.dealerHand, state.deck, state.bet, state.chips, state.stats, state.insuranceBet, resolveGame, resolveSplitGame, GAME_STATES])

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
      resolveGame(newHand, state.dealerHand, newDeck, doubledBet, chipsAfterDouble, state.stats, state.insuranceBet)
    }
  }, [state.phase, state.chips, state.bet, state.deck, state.playerHand, state.dealerHand, state.stats, state.insuranceBet, drawCard, resolveGame, GAME_STATES])

  // ── Split pairs ──
  const splitPairs = useCallback(() => {
    if (state.phase !== GAME_STATES.PLAYER_TURN) return
    if (state.playerHand.length !== 2) return
    if (state.chips < state.bet) return // can't afford split bet

    const [card1, card2] = state.playerHand
    // Cards must share same rank (or both be 10-value for split)
    if (card1.rank !== card2.rank) return

    // Re-split limit: check if already at max hands
    if (state.splitHands.length >= MAX_SPLIT_HANDS) return

    let currentDeck = state.deck
    const isAces = card1.rank === 'A'

    // Draw one card for each split hand
    const draw1 = drawCard(currentDeck)
    draw1.card.id = ++cardIdRef.current
    currentDeck = draw1.newDeck

    const draw2 = drawCard(currentDeck)
    draw2.card.id = ++cardIdRef.current
    currentDeck = draw2.newDeck

    const hand1: SplitHand = {
      cards: [card1, draw1.card],
      bet: state.bet,
      result: null,
      stood: isAces, // Aces get one card only, auto-stand
    }
    const hand2: SplitHand = {
      cards: [card2, draw2.card],
      bet: state.bet,
      result: null,
      stood: isAces,
    }

    dispatch({
      type: ACTIONS.SPLIT,
      payload: { splitHands: [hand1, hand2], deck: currentDeck },
    })

    if (isAces) {
      // Aces split: one card each, then resolve against dealer
      resolveSplitGame([hand1, hand2], state.dealerHand, currentDeck, state.chips - state.bet, state.stats, state.insuranceBet)
    }
  }, [state.phase, state.playerHand, state.chips, state.bet, state.deck, state.dealerHand, state.splitHands, state.stats, drawCard, resolveSplitGame, GAME_STATES, MAX_SPLIT_HANDS])

  // ── Surrender ──
  const surrender = useCallback(() => {
    if (state.phase !== GAME_STATES.PLAYER_TURN) return
    if (state.playerHand.length !== 2) return // only before any action
    if (state.isSplit) return // not available after split

    dispatch({ type: ACTIONS.SURRENDER })
    dispatch({
      type: ACTIONS.RESOLVE,
      payload: {
        message: 'Surrendered — half bet returned.',
        result: 'lose',
        dealerRevealed: true,
        stats: { ...state.stats, losses: state.stats.losses + 1 },
      },
    })
  }, [state.phase, state.playerHand, state.isSplit, state.stats, GAME_STATES])

  // ── Insurance ──
  const maxInsuranceBet = Math.floor(state.bet / 2)

  const acceptInsurance = useCallback((amount: number) => {
    if (state.phase !== GAME_STATES.INSURANCE_OFFER) return
    const clamped = Math.min(amount, maxInsuranceBet, state.chips)
    if (clamped <= 0) return
    dispatch({ type: ACTIONS.INSURE, payload: { amount: clamped } })
  }, [state.phase, state.chips, maxInsuranceBet, GAME_STATES])

  const declineInsurance = useCallback(() => {
    if (state.phase !== GAME_STATES.INSURANCE_OFFER) return
    dispatch({ type: ACTIONS.INSURE, payload: { amount: 0 } })
  }, [state.phase, GAME_STATES])

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

  const canSplit = state.phase === GAME_STATES.PLAYER_TURN
    && state.playerHand.length === 2
    && state.playerHand[0].rank === state.playerHand[1].rank
    && state.chips >= state.bet
    && state.splitHands.length < MAX_SPLIT_HANDS

  const canSurrender = state.phase === GAME_STATES.PLAYER_TURN
    && state.playerHand.length === 2
    && !state.isSplit

  const cardsRemaining = state.deck.length
  const shoeSize = state.shoeSize

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
      canSplit,
      canSurrender,
      splitHands: state.splitHands,
      activeHandIndex: state.activeHandIndex,
      isSplit: state.isSplit,
      insuranceBet: state.insuranceBet,
      maxInsuranceBet,
      cardsRemaining,
      shoeSize,
      cutCardReached: state.cutCardReached,
    },
    actions: {
      placeBet,
      clearBet,
      dealCards,
      hit,
      stand,
      doubleDown,
      splitPairs,
      surrender,
      acceptInsurance,
      declineInsurance,
      newRound,
      resetGame,
    },
  }
}
