import { useState, useCallback, useEffect, useRef } from 'react'
import Card from './components/Card'
import './App.css'

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function cardValue(card) {
  if (['J', 'Q', 'K'].includes(card.rank)) return 10
  if (card.rank === 'A') return 11
  return parseInt(card.rank)
}

function calculateScore(hand) {
  let score = hand.reduce((sum, card) => sum + cardValue(card), 0)
  let aces = hand.filter(c => c.rank === 'A').length
  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }
  return score
}

function isBlackjack(hand) {
  return hand.length === 2 && calculateScore(hand) === 21
}

const GAME_STATES = {
  BETTING: 'betting',
  PLAYING: 'playing',
  DEALER_TURN: 'dealer_turn',
  GAME_OVER: 'game_over',
}

function App() {
  const [deck, setDeck] = useState([])
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [gameState, setGameState] = useState(GAME_STATES.BETTING)
  const [message, setMessage] = useState('Place your bet to start!')
  const [chips, setChips] = useState(1000)
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
      setChips(prev => prev + bet)
      setStats(prev => ({ ...prev, pushes: prev.pushes + 1 }))
    } else if (isBlackjack(pHand)) {
      setDealerRevealed(true)
      setGameState(GAME_STATES.GAME_OVER)
      setMessage('Blackjack! You win 3:2!')
      setResult('blackjack')
      setChips(prev => prev + bet + Math.floor(bet * 1.5))
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }))
    } else {
      setMessage('Hit or Stand?')
    }
  }, [bet, drawCard])

  const resolveGame = useCallback((pHand, dHand, dDeck, currentBet) => {
    const dealerPlay = (dh, dd) => {
      let dealerScore = calculateScore(dh)
      const playerScore = calculateScore(pHand)

      if (dealerScore < 17) {
        const { card, newDeck } = drawCard(dd)
        card.id = ++cardIdRef.current
        const newDh = [...dh, card]
        setDealerHand([...newDh])
        setDeck(newDeck)
        setTimeout(() => dealerPlay(newDh, newDeck), 600)
      } else {
        setGameState(GAME_STATES.GAME_OVER)
        if (dealerScore > 21) {
          setMessage(`Dealer busts with ${dealerScore}! You win!`)
          setResult('win')
          setChips(prev => prev + currentBet * 2)
          setStats(prev => ({ ...prev, wins: prev.wins + 1 }))
        } else if (playerScore > dealerScore) {
          setMessage(`You win! ${playerScore} beats ${dealerScore}.`)
          setResult('win')
          setChips(prev => prev + currentBet * 2)
          setStats(prev => ({ ...prev, wins: prev.wins + 1 }))
        } else if (dealerScore > playerScore) {
          setMessage(`Dealer wins. ${dealerScore} beats ${playerScore}.`)
          setResult('lose')
          setStats(prev => ({ ...prev, losses: prev.losses + 1 }))
        } else {
          setMessage(`Push! Both have ${playerScore}.`)
          setResult('push')
          setChips(prev => prev + currentBet)
          setStats(prev => ({ ...prev, pushes: prev.pushes + 1 }))
        }
      }
    }
    setTimeout(() => dealerPlay(dHand, dDeck), 400)
  }, [drawCard])

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
  }, [gameState, deck, playerHand, dealerHand, drawCard, resolveGame, bet])

  const stand = useCallback(() => {
    setDealerRevealed(true)
    setGameState(GAME_STATES.DEALER_TURN)
    setMessage('Dealer is playing...')
    resolveGame(playerHand, dealerHand, deck, bet)
  }, [playerHand, dealerHand, deck, resolveGame, bet])

  const newRound = useCallback(() => {
    setPlayerHand([])
    setDealerHand([])
    setDeck([])
    setBet(0)
    setResult(null)
    setDealerRevealed(false)
    setMessage('Place your bet to start!')
    setGameState(GAME_STATES.BETTING)
  }, [])

  const resetGame = useCallback(() => {
    setChips(1000)
    setStats({ wins: 0, losses: 0, pushes: 0 })
    newRound()
  }, [newRound])

  useEffect(() => {
    if (chips <= 0 && gameState === GAME_STATES.BETTING) {
      setMessage("You're out of chips! Reset to play again.")
    }
  }, [chips, gameState])

  const playerScore = calculateScore(playerHand)
  const dealerVisibleScore = dealerRevealed
    ? calculateScore(dealerHand)
    : dealerHand.length > 0
    ? cardValue(dealerHand[0])
    : 0

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="suit-icon">&#9824;</span> Blackjack <span className="suit-icon red">&#9829;</span>
        </h1>
        <div className="stats-bar">
          <span className="stat win-stat">W {stats.wins}</span>
          <span className="stat loss-stat">L {stats.losses}</span>
          <span className="stat push-stat">D {stats.pushes}</span>
        </div>
      </header>

      <main className="table">
        {/* Dealer Area */}
        <section className="hand-area">
          <div className="hand-header">
            <span className="hand-title">Dealer</span>
            {dealerHand.length > 0 && (
              <span className="score-pill">
                {dealerRevealed ? dealerVisibleScore : `${cardValue(dealerHand[0])} + ?`}
              </span>
            )}
          </div>
          <div className="cards-row">
            {dealerHand.map((card, i) => (
              <Card
                key={card.id}
                card={card}
                hidden={i === 1 && !dealerRevealed}
                index={i}
              />
            ))}
            {dealerHand.length === 0 && (
              <>
                <div className="card-slot" />
                <div className="card-slot" />
              </>
            )}
          </div>
        </section>

        {/* Result Banner */}
        <div className={`banner ${result || ''} ${gameState === GAME_STATES.DEALER_TURN ? 'dealing' : ''}`}>
          <p>{message}</p>
        </div>

        {/* Player Area */}
        <section className="hand-area">
          <div className="hand-header">
            <span className="hand-title">You</span>
            {playerHand.length > 0 && (
              <span className={`score-pill ${playerScore > 21 ? 'bust' : ''}`}>{playerScore}</span>
            )}
          </div>
          <div className="cards-row">
            {playerHand.map((card, i) => (
              <Card
                key={card.id}
                card={card}
                index={i}
              />
            ))}
            {playerHand.length === 0 && (
              <>
                <div className="card-slot" />
                <div className="card-slot" />
              </>
            )}
          </div>
        </section>

        {/* Controls */}
        <div className="controls-area">
          {gameState === GAME_STATES.BETTING && (
            <div className="betting-panel">
              <div className="chip-stack">
                <div className="chip-total">
                  <span className="chip-coin">$</span>
                  <span>{chips}</span>
                </div>
                {bet > 0 && <div className="bet-display">Bet: <strong>${bet}</strong></div>}
              </div>
              <div className="chip-row">
                {[10, 25, 50, 100].map(amount => (
                  <button
                    key={amount}
                    className={`chip chip-${amount}`}
                    onClick={() => placeBet(amount)}
                    disabled={chips < amount || (chips - bet) < amount}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <div className="bet-actions">
                <button className="btn btn-outline" onClick={clearBet} disabled={bet === 0}>Clear</button>
                <button className="btn btn-primary" onClick={dealCards} disabled={bet === 0}>Deal</button>
              </div>
            </div>
          )}

          {gameState === GAME_STATES.PLAYING && (
            <div className="play-panel">
              <div className="chip-info">
                <span className="chip-coin">$</span>{chips}
                <span className="bet-tag">Bet: ${bet}</span>
              </div>
              <div className="play-buttons">
                <button className="btn btn-hit" onClick={hit}>Hit</button>
                <button className="btn btn-stand" onClick={stand}>Stand</button>
              </div>
            </div>
          )}

          {gameState === GAME_STATES.DEALER_TURN && (
            <div className="play-panel">
              <div className="chip-info">
                <span className="chip-coin">$</span>{chips}
              </div>
              <div className="dealer-playing">Dealer is drawing...</div>
            </div>
          )}

          {gameState === GAME_STATES.GAME_OVER && (
            <div className="result-panel">
              <div className="chip-info">
                <span className="chip-coin">$</span>{chips}
              </div>
              <div className="result-buttons">
                <button className="btn btn-primary" onClick={newRound} disabled={chips <= 0}>
                  New Round
                </button>
                <button className="btn btn-outline" onClick={resetGame}>
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <span>Blackjack pays 3:2 &middot; Dealer stands on 17</span>
      </footer>
    </div>
  )
}

export default App
