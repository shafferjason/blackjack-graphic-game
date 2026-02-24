import { useState, useCallback, useRef } from 'react'
import { createDeck } from '../utils/deck'
import { cardValue, calculateScore, isBlackjack } from '../utils/scoring'
import { getBlackjackPayout, getWinPayout, getPushPayout } from '../utils/payout'
import { useGameSettings } from '../config/GameSettingsContext'

export function useGameEngine() {
  const {
    GAME_STATES,
    STARTING_BANKROLL,
    DEALER_STAND_THRESHOLD,
    DEALER_PLAY_INITIAL_DELAY,
    DEALER_DRAW_DELAY,
  } = useGameSettings()
  const [deck, setDeck] = useState([])
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [gameState, setGameState] = useState(GAME_STATES.BETTING)
  const [message, setMessage] = useState('Place your bet to start!')
  const [chips, setChips] = useState(STARTING_BANKROLL)
  const [bet, setBet] = useState(0)
  const [result, setResult] = useState(null)
  const [dealerRevealed, setDealerRevealed] = useState(false)
  const [stats, setStats] = useState({ wins: 0, losses: 0, pushes: 0 })
  const cardIdRef = useRef(0)

  const drawCard = useCallback((currentDeck) => {
    const newDeck = [...currentDeck]
    const card = newDeck.pop()
    return { card, newDeck }
  }, [])

  const placeBet = useCallback((amount) => {
    if (chips < amount) return
    setBet(prev => prev + amount)
  }, [chips])

  const clearBet = useCallback(() => {
    setBet(0)
  }, [])

  const dealCards = useCallback(() => {
    if (bet === 0) return
    setChips(prev => prev - bet)
    setResult(null)
    setDealerRevealed(false)

    let currentDeck = createDeck()
    const pHand = []
    const dHand = []

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

    setDeck(currentDeck)
    setPlayerHand(pHand)
    setDealerHand(dHand)
    setGameState(GAME_STATES.PLAYING)

    if (isBlackjack(pHand) && isBlackjack(dHand)) {
      setDealerRevealed(true)
      setGameState(GAME_STATES.GAME_OVER)
      setMessage("Both have Blackjack — it's a push!")
      setResult('push')
      setChips(prev => prev + getPushPayout(bet))
      setStats(prev => ({ ...prev, pushes: prev.pushes + 1 }))
    } else if (isBlackjack(pHand)) {
      setDealerRevealed(true)
      setGameState(GAME_STATES.GAME_OVER)
      setMessage('Blackjack! You win 3:2!')
      setResult('blackjack')
      setChips(prev => prev + getBlackjackPayout(bet))
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }))
    } else {
      setMessage('Hit or Stand?')
    }
  }, [bet, drawCard, GAME_STATES])

  const resolveGame = useCallback((pHand, dHand, dDeck, currentBet) => {
    const dealerPlay = (dh, dd) => {
      let dealerScore = calculateScore(dh)
      const playerScore = calculateScore(pHand)

      if (dealerScore < DEALER_STAND_THRESHOLD) {
        const { card, newDeck } = drawCard(dd)
        card.id = ++cardIdRef.current
        const newDh = [...dh, card]
        setDealerHand([...newDh])
        setDeck(newDeck)
        setTimeout(() => dealerPlay(newDh, newDeck), DEALER_DRAW_DELAY)
      } else {
        setGameState(GAME_STATES.GAME_OVER)
        if (dealerScore > 21) {
          setMessage(`Dealer busts with ${dealerScore}! You win!`)
          setResult('win')
          setChips(prev => prev + getWinPayout(currentBet))
          setStats(prev => ({ ...prev, wins: prev.wins + 1 }))
        } else if (playerScore > dealerScore) {
          setMessage(`You win! ${playerScore} beats ${dealerScore}.`)
          setResult('win')
          setChips(prev => prev + getWinPayout(currentBet))
          setStats(prev => ({ ...prev, wins: prev.wins + 1 }))
        } else if (dealerScore > playerScore) {
          setMessage(`Dealer wins. ${dealerScore} beats ${playerScore}.`)
          setResult('lose')
          setStats(prev => ({ ...prev, losses: prev.losses + 1 }))
        } else {
          setMessage(`Push! Both have ${playerScore}.`)
          setResult('push')
          setChips(prev => prev + getPushPayout(currentBet))
          setStats(prev => ({ ...prev, pushes: prev.pushes + 1 }))
        }
      }
    }
    setTimeout(() => dealerPlay(dHand, dDeck), DEALER_PLAY_INITIAL_DELAY)
  }, [drawCard, DEALER_STAND_THRESHOLD, DEALER_DRAW_DELAY, DEALER_PLAY_INITIAL_DELAY, GAME_STATES])

  const hit = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYING) return
    const { card, newDeck } = drawCard(deck)
    card.id = ++cardIdRef.current

    const newHand = [...playerHand, card]
    setPlayerHand(newHand)
    setDeck(newDeck)

    const score = calculateScore(newHand)
    if (score > 21) {
      setDealerRevealed(true)
      setGameState(GAME_STATES.GAME_OVER)
      setMessage(`Bust! You went over 21 with ${score}.`)
      setResult('lose')
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }))
    } else if (score === 21) {
      setDealerRevealed(true)
      setGameState(GAME_STATES.DEALER_TURN)
      setMessage('Dealer is playing...')
      resolveGame(newHand, dealerHand, newDeck, bet)
    }
  }, [gameState, deck, playerHand, dealerHand, drawCard, resolveGame, bet, GAME_STATES])

  const stand = useCallback(() => {
    setDealerRevealed(true)
    setGameState(GAME_STATES.DEALER_TURN)
    setMessage('Dealer is playing...')
    resolveGame(playerHand, dealerHand, deck, bet)
  }, [playerHand, dealerHand, deck, resolveGame, bet, GAME_STATES])

  const newRound = useCallback(() => {
    setPlayerHand([])
    setDealerHand([])
    setDeck([])
    setBet(0)
    setResult(null)
    setDealerRevealed(false)
    setMessage('Place your bet to start!')
    setGameState(GAME_STATES.BETTING)
  }, [GAME_STATES])

  const resetGame = useCallback(() => {
    setChips(STARTING_BANKROLL)
    setStats({ wins: 0, losses: 0, pushes: 0 })
    newRound()
  }, [newRound, STARTING_BANKROLL])

  const playerScore = calculateScore(playerHand)
  const dealerVisibleScore = dealerRevealed
    ? calculateScore(dealerHand)
    : dealerHand.length > 0
    ? cardValue(dealerHand[0])
    : 0

  const displayMessage = (chips <= 0 && gameState === GAME_STATES.BETTING)
    ? "You're out of chips! Reset to play again."
    : message

  return {
    state: {
      playerHand,
      dealerHand,
      gameState,
      message: displayMessage,
      chips,
      bet,
      result,
      dealerRevealed,
      stats,
      playerScore,
      dealerVisibleScore,
    },
    actions: {
      placeBet,
      clearBet,
      dealCards,
      hit,
      stand,
      newRound,
      resetGame,
    },
  }
}
