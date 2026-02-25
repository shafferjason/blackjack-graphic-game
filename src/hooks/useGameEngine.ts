import { useReducer, useCallback, useRef, useEffect, useState } from 'react'
import { createShoe } from '../utils/deck'
import { cardValue, calculateScore, isBlackjack, isSoft17 } from '../utils/scoring'
import { getBlackjackPayout, getWinPayout, getPushPayout } from '../utils/payout'
import { useGameSettings } from '../config/GameSettingsContext'
import { gameReducer, createInitialState, createInitialDetailedStats, ACTIONS } from '../state/gameReducer'
import { saveGameState, loadGameState, clearAllStorage, saveHandHistory, loadHandHistory, saveAchievements, loadAchievements } from '../utils/storage'
import { createInitialAchievements, checkAchievements, getAchievementDefs } from '../utils/achievements'
import type { Card, Hand, Deck, GameState, GameStats, GameResult, GamePhase, SplitHand, DetailedStats, HandAction, HandHistoryEntry, HandHistoryStep, Achievement } from '../types'

const MAX_HISTORY_LENGTH = 50

function updateDetailedStatsForResult(
  ds: DetailedStats,
  result: GameResult,
  betAmount: number,
  payoutAmount: number,
  chipsAfter: number,
  extra?: { isBlackjack?: boolean; isDouble?: boolean; isSplit?: boolean; isSurrender?: boolean; insuranceTaken?: boolean; insuranceWon?: boolean }
): DetailedStats {
  const updated = { ...ds }
  updated.totalHandsPlayed += 1
  updated.totalBetAmount += betAmount
  updated.totalPayoutAmount += payoutAmount

  if (extra?.isBlackjack) updated.blackjackCount += 1
  if (extra?.isDouble) updated.doubleCount += 1
  if (extra?.isSplit) updated.splitCount += 1
  if (extra?.isSurrender) updated.surrenderCount += 1
  if (extra?.insuranceTaken) updated.insuranceTaken += 1
  if (extra?.insuranceWon) updated.insuranceWon += 1

  // Streak tracking
  if (result === 'win' || result === 'blackjack') {
    updated.currentWinStreak += 1
    updated.currentLossStreak = 0
    if (updated.currentWinStreak > updated.biggestWinStreak) {
      updated.biggestWinStreak = updated.currentWinStreak
    }
  } else if (result === 'lose') {
    updated.currentLossStreak += 1
    updated.currentWinStreak = 0
    if (updated.currentLossStreak > updated.biggestLossStreak) {
      updated.biggestLossStreak = updated.currentLossStreak
    }
  } else {
    // push resets both streaks
    updated.currentWinStreak = 0
    updated.currentLossStreak = 0
  }

  // History (keep last N)
  updated.chipHistory = [...ds.chipHistory, chipsAfter].slice(-MAX_HISTORY_LENGTH)
  updated.resultHistory = [...ds.resultHistory, result].slice(-MAX_HISTORY_LENGTH)

  return updated
}

export function useGameEngine() {
  const {
    GAME_STATES,
    STARTING_BANKROLL,
    DEALER_STAND_THRESHOLD,
    DEALER_PLAY_INITIAL_DELAY,
    DEALER_DRAW_DELAY,
    MAX_SPLIT_HANDS,
    NUM_DECKS,
    BLACKJACK_PAYOUT_RATIO,
    DEALER_HITS_SOFT_17,
    ALLOW_DOUBLE_AFTER_SPLIT,
    ALLOW_SURRENDER,
    resetSettings,
  } = useGameSettings()

  const [state, dispatch] = useReducer(gameReducer, STARTING_BANKROLL, createInitialState)
  const cardIdRef = useRef(0)
  const restoredRef = useRef(false)

  // Hand history tracking
  const [handHistory, setHandHistory] = useState<HandHistoryEntry[]>([])
  const handHistoryIdRef = useRef(0)
  const currentActionsRef = useRef<HandAction[]>([])
  const currentStepsRef = useRef<HandHistoryStep[]>([])
  const handInProgressRef = useRef(false)

  // Achievements tracking
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = loadAchievements()
    if (saved) {
      // Merge saved with definitions to pick up any new achievements added
      const defs = getAchievementDefs()
      return defs.map(def => {
        const existing = saved.find(a => a.id === def.id)
        return existing || { id: def.id, name: def.name, description: def.description, icon: def.icon, unlockedAt: null }
      })
    }
    return createInitialAchievements()
  })

  const processAchievements = useCallback((
    updatedStats: DetailedStats,
    chipsAfter: number,
    result: GameResult,
    extra?: { isBlackjack?: boolean; isDouble?: boolean; isSplit?: boolean; isSurrender?: boolean; insuranceTaken?: boolean }
  ) => {
    setAchievements(prev => {
      const newlyUnlocked = checkAchievements(prev, {
        detailedStats: updatedStats,
        chips: chipsAfter,
        result,
        extra,
      })
      if (newlyUnlocked.length === 0) return prev
      const now = Date.now()
      const updated = prev.map(a =>
        newlyUnlocked.includes(a.id) ? { ...a, unlockedAt: now } : a
      )
      saveAchievements(updated)
      return updated
    })
  }, [])

  // Load hand history from localStorage
  useEffect(() => {
    const saved = loadHandHistory()
    if (saved.length > 0) {
      setHandHistory(saved)
      const maxId = saved.reduce((max, e) => Math.max(max, e.id), 0)
      handHistoryIdRef.current = maxId
    }
  }, [])

  // Save hand history on change
  useEffect(() => {
    if (handHistory.length > 0) {
      saveHandHistory(handHistory)
    }
  }, [handHistory])

  const recordStep = useCallback((
    action: HandHistoryStep['action'],
    playerHand: Hand,
    dealerHand: Hand,
    dealerRevealed: boolean,
    splitHands?: SplitHand[]
  ) => {
    currentStepsRef.current.push({
      action,
      playerHand: playerHand.map(c => ({ suit: c.suit, rank: c.rank })),
      dealerHand: dealerHand.map(c => ({ suit: c.suit, rank: c.rank })),
      dealerRevealed,
      splitHands: splitHands?.map(h => ({
        cards: h.cards.map(c => ({ suit: c.suit, rank: c.rank })),
        bet: h.bet,
        result: h.result,
        stood: h.stood,
      })),
    })
  }, [])

  const recordHandResult = useCallback((
    playerFinalHand: Hand,
    dealerFinalHand: Hand,
    bet: number,
    insuranceBet: number,
    result: GameResult,
    payout: number,
    isSplit: boolean,
    splitResults?: { cards: Hand; result: GameResult; bet: number }[]
  ) => {
    if (!handInProgressRef.current) return
    handInProgressRef.current = false

    const entry: HandHistoryEntry = {
      id: ++handHistoryIdRef.current,
      timestamp: Date.now(),
      bet,
      insuranceBet,
      playerFinalHand: playerFinalHand.map(c => ({ suit: c.suit, rank: c.rank })),
      dealerFinalHand: dealerFinalHand.map(c => ({ suit: c.suit, rank: c.rank })),
      actions: [...currentActionsRef.current],
      result,
      payout,
      playerScore: calculateScore(playerFinalHand),
      dealerScore: calculateScore(dealerFinalHand),
      isSplit,
      splitResults: splitResults?.map(sr => ({
        cards: sr.cards.map(c => ({ suit: c.suit, rank: c.rank })),
        result: sr.result,
        bet: sr.bet,
      })),
      steps: [...currentStepsRef.current],
    }

    setHandHistory(prev => [...prev, entry].slice(-200))
    currentActionsRef.current = []
    currentStepsRef.current = []
  }, [])

  // Restore state from localStorage on first mount
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true

    const saved = loadGameState()
    if (!saved) return

    // If we were mid-hand (dealing, player turn, dealer turn, etc.), revert to a safe state
    const activePhases = ['dealing', 'player_turn', 'splitting', 'doubling', 'insurance_offer', 'surrendering', 'dealer_turn']
    const wasInActiveHand = activePhases.includes(saved.phase)

    if (wasInActiveHand) {
      // Restore bankroll/stats but start a fresh betting round
      // The bet was already deducted from chips during the hand, so return it
      dispatch({
        type: ACTIONS.RESTORE_STATE,
        payload: {
          chips: saved.chips + saved.bet + saved.insuranceBet,
          stats: saved.stats,
          ...(saved.detailedStats ? { detailedStats: saved.detailedStats } : {}),
          deck: saved.deck,
          shoeSize: saved.shoeSize,
          cutCardReached: saved.cutCardReached,
        } as Partial<GameState>,
      })
    } else {
      // Safe to fully restore (betting, game_over, resolving, idle)
      dispatch({
        type: ACTIONS.RESTORE_STATE,
        payload: {
          chips: saved.chips,
          stats: saved.stats,
          ...(saved.detailedStats ? { detailedStats: saved.detailedStats } : {}),
          bet: saved.bet,
          phase: saved.phase as GamePhase,
          playerHand: saved.playerHand,
          dealerHand: saved.dealerHand,
          deck: saved.deck,
          dealerRevealed: saved.dealerRevealed,
          result: saved.result,
          message: saved.message,
          insuranceBet: saved.insuranceBet,
          splitHands: saved.splitHands,
          activeHandIndex: saved.activeHandIndex,
          isSplit: saved.isSplit,
          shoeSize: saved.shoeSize,
          cutCardReached: saved.cutCardReached,
        } as Partial<GameState>,
      })
    }

    // Sync cardIdRef with restored cards to avoid ID collisions
    const allCards = [
      ...(saved.playerHand || []),
      ...(saved.dealerHand || []),
      ...(saved.deck || []),
      ...(saved.splitHands || []).flatMap(h => h.cards),
    ]
    const maxId = allCards.reduce((max, c) => Math.max(max, c.id ?? 0), 0)
    if (maxId > 0) cardIdRef.current = maxId
  }, [])

  // Persist state to localStorage on every change
  useEffect(() => {
    saveGameState(state)
  }, [state])

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

    // Start tracking a new hand
    currentActionsRef.current = []
    currentStepsRef.current = []
    handInProgressRef.current = true

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

    // Record the deal step
    recordStep('deal', pHand, dHand, false)

    // Transition to DEALING
    dispatch({
      type: ACTIONS.DEAL,
      payload: { deck: currentDeck, playerHand: pHand, dealerHand: dHand },
    })

    // Immediately check for blackjacks and resolve
    const currentBet = state.bet
    const currentChips = state.chips - currentBet

    if (isBlackjack(pHand) && isBlackjack(dHand)) {
      const pushPayout = getPushPayout(currentBet)
      const chipsAfter = currentChips + pushPayout
      dispatch({
        type: ACTIONS.RESOLVE,
        payload: {
          message: "Both have Blackjack — it's a push!",
          result: 'push',
          chips: chipsAfter,
          dealerRevealed: true,
          stats: { ...state.stats, pushes: state.stats.pushes + 1 },
        },
      })
      const pushDetailedStats = updateDetailedStatsForResult(state.detailedStats, 'push', currentBet, pushPayout, chipsAfter, { isBlackjack: true })
      dispatch({
        type: ACTIONS.RESTORE_STATE,
        payload: { detailedStats: pushDetailedStats } as Partial<GameState>,
      })
      processAchievements(pushDetailedStats, chipsAfter, 'push', { isBlackjack: true })
      recordStep('result', pHand, dHand, true)
      recordHandResult(pHand, dHand, currentBet, 0, 'push', pushPayout, false)
    } else if (isBlackjack(pHand)) {
      const payoutLabel = BLACKJACK_PAYOUT_RATIO === 1.5 ? '3:2' : '6:5'
      const payout = getBlackjackPayout(currentBet, BLACKJACK_PAYOUT_RATIO)
      const chipsAfter = currentChips + payout
      dispatch({
        type: ACTIONS.RESOLVE,
        payload: {
          message: `Blackjack! You win ${payoutLabel}!`,
          result: 'blackjack',
          chips: chipsAfter,
          dealerRevealed: true,
          stats: { ...state.stats, wins: state.stats.wins + 1 },
        },
      })
      const bjDetailedStats = updateDetailedStatsForResult(state.detailedStats, 'blackjack', currentBet, payout, chipsAfter, { isBlackjack: true })
      dispatch({
        type: ACTIONS.RESTORE_STATE,
        payload: { detailedStats: bjDetailedStats } as Partial<GameState>,
      })
      processAchievements(bjDetailedStats, chipsAfter, 'blackjack', { isBlackjack: true })
      recordStep('result', pHand, dHand, true)
      recordHandResult(pHand, dHand, currentBet, 0, 'blackjack', payout, false)
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
  }, [state.bet, state.chips, state.stats, state.detailedStats, state.deck, state.cutCardReached, drawCard, GAME_STATES, NUM_DECKS, BLACKJACK_PAYOUT_RATIO, recordStep, recordHandResult, processAchievements])

  const resolveGame = useCallback((pHand: Hand, dHand: Hand, dDeck: Deck, currentBet: number, currentChips: number, currentStats: GameStats, currentInsuranceBet: number, currentDetailedStats?: DetailedStats, extraFlags?: { isDouble?: boolean }) => {
    const dealerPlay = (dh: Hand, dd: Deck) => {
      const dealerScore = calculateScore(dh)
      const playerScore = calculateScore(pHand)
      const dealerMustHit = dealerScore < DEALER_STAND_THRESHOLD || (DEALER_HITS_SOFT_17 && isSoft17(dh))

      if (dealerMustHit) {
        const { card, newDeck } = drawCard(dd)
        card.id = ++cardIdRef.current
        const newDh = [...dh, card]
        dispatch({
          type: ACTIONS.DEALER_DRAW,
          payload: { dealerHand: [...newDh], deck: newDeck },
        })
        recordStep('dealer_draw', pHand, newDh, true)
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

        const chipsAfter = currentChips + chipDelta + insurancePayout

        dispatch({
          type: ACTIONS.RESOLVE,
          payload: {
            message,
            result,
            chips: chipsAfter,
            dealerRevealed: true,
            stats: { ...currentStats, [statKey]: currentStats[statKey] + 1 },
          },
        })

        if (currentDetailedStats) {
          const resolveExtra = {
            isDouble: extraFlags?.isDouble,
            insuranceTaken: currentInsuranceBet > 0,
            insuranceWon: insurancePayout > 0,
          }
          const resolvedDetailedStats = updateDetailedStatsForResult(currentDetailedStats, result, currentBet, chipDelta, chipsAfter, resolveExtra)
          dispatch({
            type: ACTIONS.RESTORE_STATE,
            payload: { detailedStats: resolvedDetailedStats } as Partial<GameState>,
          })
          processAchievements(resolvedDetailedStats, chipsAfter, result, resolveExtra)
        }

        recordStep('result', pHand, dh, true)
        recordHandResult(pHand, dh, currentBet, currentInsuranceBet, result, chipDelta, false)
      }
    }
    setTimeout(() => dealerPlay(dHand, dDeck), DEALER_PLAY_INITIAL_DELAY)
  }, [drawCard, DEALER_STAND_THRESHOLD, DEALER_DRAW_DELAY, DEALER_PLAY_INITIAL_DELAY, DEALER_HITS_SOFT_17, recordStep, recordHandResult, processAchievements])

  // ── Resolve all split hands against dealer ──
  const resolveSplitGame = useCallback((hands: SplitHand[], dHand: Hand, dDeck: Deck, currentChips: number, currentStats: GameStats, currentInsuranceBet: number = 0, currentDetailedStats?: DetailedStats) => {
    const dealerPlay = (dh: Hand, dd: Deck) => {
      const dealerScore = calculateScore(dh)
      const dealerMustHit = dealerScore < DEALER_STAND_THRESHOLD || (DEALER_HITS_SOFT_17 && isSoft17(dh))

      if (dealerMustHit) {
        const { card, newDeck } = drawCard(dd)
        card.id = ++cardIdRef.current
        const newDh = [...dh, card]
        dispatch({
          type: ACTIONS.DEALER_DRAW,
          payload: { dealerHand: [...newDh], deck: newDeck },
        })
        recordStep('dealer_draw', hands[0].cards, newDh, true, hands)
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

        const finalChips = totalChips + insurancePayout

        dispatch({
          type: ACTIONS.SPLIT_RESOLVE,
          payload: {
            splitHands: resolvedHands,
            chips: finalChips,
            stats: updatedStats,
            message,
          },
        })

        // Track detailed stats for each split hand
        if (currentDetailedStats) {
          let ds = currentDetailedStats
          for (let i = 0; i < resolvedHands.length; i++) {
            const hand = resolvedHands[i]
            const handResult = hand.result!
            let handPayout = 0
            if (handResult === 'win') handPayout = getWinPayout(hand.bet)
            else if (handResult === 'push') handPayout = getPushPayout(hand.bet)
            ds = updateDetailedStatsForResult(ds, handResult, hand.bet, handPayout, finalChips, {
              isSplit: true,
              insuranceTaken: i === 0 && currentInsuranceBet > 0,
              insuranceWon: i === 0 && insurancePayout > 0,
            })
          }
          dispatch({
            type: ACTIONS.RESTORE_STATE,
            payload: { detailedStats: ds } as Partial<GameState>,
          })
          // Check achievements using the final split hand result
          const totalBetForAch = resolvedHands.reduce((sum, h) => sum + h.bet, 0)
          const totalPayoutForAch = resolvedHands.reduce((sum, h) => {
            if (h.result === 'win') return sum + getWinPayout(h.bet)
            if (h.result === 'push') return sum + getPushPayout(h.bet)
            return sum
          }, 0)
          const overallAchResult = totalPayoutForAch > totalBetForAch ? 'win' : totalPayoutForAch === totalBetForAch ? 'push' : 'lose'
          processAchievements(ds, finalChips, overallAchResult as GameResult, { isSplit: true })
        }

        // Record hand history for split
        const totalBet = resolvedHands.reduce((sum, h) => sum + h.bet, 0)
        const totalPayout = resolvedHands.reduce((sum, h) => {
          if (h.result === 'win') return sum + getWinPayout(h.bet)
          if (h.result === 'push') return sum + getPushPayout(h.bet)
          return sum
        }, 0)
        const overallResult = totalPayout > totalBet ? 'win' : totalPayout === totalBet ? 'push' : 'lose'
        recordStep('result', resolvedHands[0].cards, dh, true, resolvedHands)
        recordHandResult(
          resolvedHands[0].cards, dh, totalBet, currentInsuranceBet,
          overallResult as GameResult, totalPayout, true,
          resolvedHands.map(h => ({ cards: h.cards, result: h.result!, bet: h.bet }))
        )
      }
    }
    setTimeout(() => dealerPlay(dHand, dDeck), DEALER_PLAY_INITIAL_DELAY)
  }, [drawCard, DEALER_STAND_THRESHOLD, DEALER_DRAW_DELAY, DEALER_PLAY_INITIAL_DELAY, DEALER_HITS_SOFT_17, recordStep, recordHandResult, processAchievements])

  const hit = useCallback(() => {
    // ── Split hit ──
    if (state.isSplit && state.phase === GAME_STATES.SPLITTING) {
      const activeHand = state.splitHands[state.activeHandIndex]
      const { card, newDeck } = drawCard(state.deck)
      card.id = ++cardIdRef.current
      const newCards = [...activeHand.cards, card]
      const score = calculateScore(newCards)

      currentActionsRef.current.push('hit')
      const updatedHands = state.splitHands.map((h, i) =>
        i === state.activeHandIndex ? { ...h, cards: newCards } : h
      )
      recordStep('hit', newCards, state.dealerHand, false, updatedHands)

      dispatch({
        type: ACTIONS.SPLIT_HIT,
        payload: { hand: newCards, deck: newDeck },
      })

      if (score >= 21) {
        // Auto-stand on 21 or bust
        const stoodHands = state.splitHands.map((h, i) =>
          i === state.activeHandIndex ? { ...h, cards: newCards, stood: true } : h
        )
        const nextIndex = state.activeHandIndex + 1
        if (nextIndex < stoodHands.length) {
          // Advance to next hand via stand
          dispatch({ type: ACTIONS.SPLIT_STAND })
        } else {
          // All hands done — go to dealer
          dispatch({ type: ACTIONS.SPLIT_STAND })
          resolveSplitGame(stoodHands, state.dealerHand, newDeck, state.chips, state.stats, state.insuranceBet, state.detailedStats)
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

    currentActionsRef.current.push('hit')
    recordStep('hit', newHand, state.dealerHand, false)

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
      const bustDetailedStats = updateDetailedStatsForResult(state.detailedStats, 'lose', state.bet, 0, state.chips, {})
      dispatch({
        type: ACTIONS.RESTORE_STATE,
        payload: { detailedStats: bustDetailedStats } as Partial<GameState>,
      })
      processAchievements(bustDetailedStats, state.chips, 'lose', {})
      recordStep('result', newHand, state.dealerHand, true)
      recordHandResult(newHand, state.dealerHand, state.bet, state.insuranceBet, 'lose', 0, false)
    } else if (score === 21) {
      // Auto-stand on 21
      dispatch({
        type: ACTIONS.HIT,
        payload: { playerHand: newHand, deck: newDeck, phase: GAME_STATES.PLAYER_TURN as GamePhase },
      })
      dispatch({ type: ACTIONS.STAND })
      resolveGame(newHand, state.dealerHand, newDeck, state.bet, state.chips, state.stats, state.insuranceBet, state.detailedStats)
    } else {
      dispatch({
        type: ACTIONS.HIT,
        payload: { playerHand: newHand, deck: newDeck, phase: GAME_STATES.PLAYER_TURN as GamePhase },
      })
    }
  }, [state.phase, state.isSplit, state.splitHands, state.activeHandIndex, state.deck, state.playerHand, state.dealerHand, state.bet, state.chips, state.stats, state.detailedStats, state.insuranceBet, drawCard, resolveGame, resolveSplitGame, GAME_STATES, recordStep, recordHandResult, processAchievements])

  const stand = useCallback(() => {
    currentActionsRef.current.push('stand')

    // ── Split stand ──
    if (state.isSplit && state.phase === GAME_STATES.SPLITTING) {
      const updatedHands = state.splitHands.map((h, i) =>
        i === state.activeHandIndex ? { ...h, stood: true } : h
      )
      recordStep('stand', state.splitHands[state.activeHandIndex].cards, state.dealerHand, false, updatedHands)
      dispatch({ type: ACTIONS.SPLIT_STAND })

      const nextIndex = state.activeHandIndex + 1
      if (nextIndex >= updatedHands.length) {
        // All hands done — resolve against dealer
        resolveSplitGame(updatedHands, state.dealerHand, state.deck, state.chips, state.stats, state.insuranceBet, state.detailedStats)
      }
      return
    }

    // ── Normal stand ──
    recordStep('stand', state.playerHand, state.dealerHand, false)
    dispatch({ type: ACTIONS.STAND })
    resolveGame(state.playerHand, state.dealerHand, state.deck, state.bet, state.chips, state.stats, state.insuranceBet, state.detailedStats)
  }, [state.phase, state.isSplit, state.splitHands, state.activeHandIndex, state.playerHand, state.dealerHand, state.deck, state.bet, state.chips, state.stats, state.detailedStats, state.insuranceBet, resolveGame, resolveSplitGame, GAME_STATES, recordStep])

  const doubleDown = useCallback(() => {
    currentActionsRef.current.push('double')

    // ── Split double (double after split) ──
    if (state.isSplit && state.phase === GAME_STATES.SPLITTING && ALLOW_DOUBLE_AFTER_SPLIT) {
      const activeHand = state.splitHands[state.activeHandIndex]
      if (activeHand.cards.length !== 2) return // only on first two cards
      if (state.chips < activeHand.bet) return // can't afford

      const { card, newDeck } = drawCard(state.deck)
      card.id = ++cardIdRef.current
      const newCards = [...activeHand.cards, card]
      const doubledBet = activeHand.bet * 2

      const updatedHands = state.splitHands.map((h, i) =>
        i === state.activeHandIndex ? { ...h, cards: newCards, bet: doubledBet, stood: true } : h
      )
      recordStep('double', newCards, state.dealerHand, false, updatedHands)

      dispatch({
        type: ACTIONS.SPLIT_DOUBLE,
        payload: { hand: newCards, deck: newDeck, bet: doubledBet },
      })

      const nextIndex = state.activeHandIndex + 1
      if (nextIndex >= updatedHands.length) {
        resolveSplitGame(updatedHands, state.dealerHand, newDeck, state.chips - activeHand.bet, state.stats, state.insuranceBet, state.detailedStats)
      }
      return
    }

    // ── Normal double ──
    if (state.phase !== GAME_STATES.PLAYER_TURN) return
    if (state.chips < state.bet) return // can't afford to double

    const { card, newDeck } = drawCard(state.deck)
    card.id = ++cardIdRef.current
    const newHand = [...state.playerHand, card]
    const doubledBet = state.bet * 2
    const chipsAfterDouble = state.chips - state.bet // deduct the additional bet

    recordStep('double', newHand, state.dealerHand, false)

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
      const doubleBustStats = updateDetailedStatsForResult(state.detailedStats, 'lose', doubledBet, 0, chipsAfterDouble, { isDouble: true })
      dispatch({
        type: ACTIONS.RESTORE_STATE,
        payload: { detailedStats: doubleBustStats } as Partial<GameState>,
      })
      processAchievements(doubleBustStats, chipsAfterDouble, 'lose', { isDouble: true })
      recordStep('result', newHand, state.dealerHand, true)
      recordHandResult(newHand, state.dealerHand, doubledBet, state.insuranceBet, 'lose', 0, false)
    } else {
      // Resolve against dealer with doubled bet
      resolveGame(newHand, state.dealerHand, newDeck, doubledBet, chipsAfterDouble, state.stats, state.insuranceBet, state.detailedStats, { isDouble: true })
    }
  }, [state.phase, state.isSplit, state.splitHands, state.activeHandIndex, state.chips, state.bet, state.deck, state.playerHand, state.dealerHand, state.stats, state.detailedStats, state.insuranceBet, drawCard, resolveGame, resolveSplitGame, GAME_STATES, ALLOW_DOUBLE_AFTER_SPLIT, recordStep, recordHandResult, processAchievements])

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

    currentActionsRef.current.push('split')

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

    recordStep('split', state.playerHand, state.dealerHand, false, [hand1, hand2])

    dispatch({
      type: ACTIONS.SPLIT,
      payload: { splitHands: [hand1, hand2], deck: currentDeck },
    })

    if (isAces) {
      // Aces split: one card each, then resolve against dealer
      resolveSplitGame([hand1, hand2], state.dealerHand, currentDeck, state.chips - state.bet, state.stats, state.insuranceBet, state.detailedStats)
    }
  }, [state.phase, state.playerHand, state.chips, state.bet, state.deck, state.dealerHand, state.splitHands, state.stats, state.detailedStats, state.insuranceBet, drawCard, resolveSplitGame, GAME_STATES, MAX_SPLIT_HANDS, recordStep])

  // ── Surrender ──
  const surrender = useCallback(() => {
    if (state.phase !== GAME_STATES.PLAYER_TURN) return
    if (state.playerHand.length !== 2) return // only before any action
    if (state.isSplit) return // not available after split

    currentActionsRef.current.push('surrender')
    const halfBet = Math.floor(state.bet / 2)

    recordStep('surrender', state.playerHand, state.dealerHand, true)

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
    const surrenderChips = state.chips + halfBet - state.bet
    const surrenderStats = updateDetailedStatsForResult(state.detailedStats, 'lose', state.bet, halfBet, surrenderChips, { isSurrender: true })
    dispatch({
      type: ACTIONS.RESTORE_STATE,
      payload: { detailedStats: surrenderStats } as Partial<GameState>,
    })
    processAchievements(surrenderStats, surrenderChips, 'lose', { isSurrender: true })

    recordStep('result', state.playerHand, state.dealerHand, true)
    recordHandResult(state.playerHand, state.dealerHand, state.bet, state.insuranceBet, 'lose', halfBet, false)
  }, [state.phase, state.playerHand, state.isSplit, state.stats, state.detailedStats, state.bet, state.chips, state.dealerHand, state.insuranceBet, GAME_STATES, recordStep, recordHandResult, processAchievements])

  // ── Insurance ──
  const maxInsuranceBet = Math.floor(state.bet / 2)

  const acceptInsurance = useCallback((amount: number) => {
    if (state.phase !== GAME_STATES.INSURANCE_OFFER) return
    const clamped = Math.min(amount, maxInsuranceBet, state.chips)
    if (clamped <= 0) return
    currentActionsRef.current.push('insurance')
    recordStep('insurance', state.playerHand, state.dealerHand, false)
    dispatch({ type: ACTIONS.INSURE, payload: { amount: clamped } })
  }, [state.phase, state.chips, state.playerHand, state.dealerHand, maxInsuranceBet, GAME_STATES, recordStep])

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

  const resetEverything = useCallback(() => {
    clearAllStorage()
    resetSettings()
    setHandHistory([])
    setAchievements(createInitialAchievements())
    handHistoryIdRef.current = 0
    dispatch({ type: ACTIONS.RESET, payload: { startingBankroll: STARTING_BANKROLL } })
  }, [STARTING_BANKROLL, resetSettings])

  const adjustChips = useCallback((amount: number) => {
    dispatch({
      type: ACTIONS.RESTORE_STATE,
      payload: { chips: state.chips + amount } as Partial<GameState>,
    })
  }, [state.chips])

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

  const canSurrender = ALLOW_SURRENDER
    && state.phase === GAME_STATES.PLAYER_TURN
    && state.playerHand.length === 2
    && !state.isSplit

  const canDoubleAfterSplit = ALLOW_DOUBLE_AFTER_SPLIT
    && state.isSplit
    && state.phase === GAME_STATES.SPLITTING
    && state.splitHands[state.activeHandIndex]?.cards.length === 2
    && state.chips >= (state.splitHands[state.activeHandIndex]?.bet ?? 0)

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
      detailedStats: state.detailedStats,
      playerScore,
      dealerVisibleScore,
      canDouble,
      canSplit,
      canSurrender,
      canDoubleAfterSplit,
      splitHands: state.splitHands,
      activeHandIndex: state.activeHandIndex,
      isSplit: state.isSplit,
      insuranceBet: state.insuranceBet,
      maxInsuranceBet,
      cardsRemaining,
      shoeSize,
      cutCardReached: state.cutCardReached,
      handHistory,
      achievements,
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
      resetEverything,
      adjustChips,
    },
  }
}
