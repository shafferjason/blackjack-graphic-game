import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useGameEngine } from './hooks/useGameEngine'
import { useGameSettings } from './config/GameSettingsContext'
import type { TableFeltTheme } from './types'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { getOptimalAction, actionLabel } from './utils/basicStrategy'
import type { ResolvedAction } from './utils/basicStrategy'
import { getHiLoValue, calculateTrueCount, getDecksRemaining } from './utils/counting'
import { evaluatePerfectPairs, evaluateTwentyOnePlusThree, calculateSideBetPayout } from './utils/sideBets'
import type { PerfectPairsResult, TwentyOnePlusThreeResult } from './utils/sideBets'
import type { Card } from './types'
import Scoreboard from './components/Scoreboard'
import DealerHand from './components/DealerHand'
import GameBanner from './components/GameBanner'
import PlayerHand from './components/PlayerHand'
import SplitHandsDisplay from './components/SplitHandsDisplay'
import BettingControls from './components/BettingControls'
import ActionControls from './components/ActionControls'
import ShoeIndicator from './components/ShoeIndicator'
import SettingsPanel from './components/SettingsPanel'
import StatsDashboard from './components/StatsDashboard'
import HandHistory from './components/HandHistory'
import AchievementToast from './components/AchievementToast'
import ChipAnimation from './components/ChipAnimation'
import CelebrationEffects from './components/CelebrationEffects'
import TutorialOverlay from './components/TutorialOverlay'
import StrategyOverlay from './components/StrategyOverlay'
import CountingOverlay from './components/CountingOverlay'
import SideBets from './components/SideBets'
import MultiplayerSetup from './components/MultiplayerSetup'
import type { PlayerConfig } from './components/MultiplayerSetup'
import MultiplayerBar from './components/MultiplayerBar'
import type { MultiplayerState } from './components/MultiplayerBar'
import './App.css'

function App() {
  const { GAME_STATES, NUM_DECKS, DEALER_HITS_SOFT_17, BLACKJACK_PAYOUT_RATIO, TABLE_FELT_THEME, CHIP_DENOMINATIONS, STRATEGY_TRAINER_ENABLED, CARD_COUNTING_ENABLED, SIDE_BETS_ENABLED, MULTIPLAYER_ENABLED, ALLOW_SURRENDER, updateSetting } = useGameSettings()

  const FELT_COLORS: Record<TableFeltTheme, { felt: string; feltDark: string; feltLight: string }> = {
    'classic-green': { felt: '#0b6623', feltDark: '#084a1a', feltLight: '#0d7a2b' },
    'navy-blue':     { felt: '#1a3a6b', feltDark: '#0f2548', feltLight: '#245090' },
    'casino-red':    { felt: '#6b1a1a', feltDark: '#4a1212', feltLight: '#8a2424' },
    'royal-purple':  { felt: '#4a1a6b', feltDark: '#331248', feltLight: '#5e2490' },
  }

  const feltStyle = useMemo(() => {
    const colors = FELT_COLORS[TABLE_FELT_THEME] ?? FELT_COLORS['classic-green']
    return {
      '--felt': colors.felt,
      '--felt-dark': colors.feltDark,
      '--felt-light': colors.feltLight,
    } as React.CSSProperties
  }, [TABLE_FELT_THEME])
  const { state, actions } = useGameEngine()

  // ── Strategy Trainer state ──
  const [strategyAccuracy, setStrategyAccuracy] = useState({ correct: 0, total: 0 })
  const [strategyFeedback, setStrategyFeedback] = useState<{ action: string; correct: boolean } | null>(null)
  const strategyFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Compute optimal action for current hand
  const optimalAction: ResolvedAction | null = useMemo(() => {
    if (!STRATEGY_TRAINER_ENABLED) return null
    const phase = state.gameState
    if (phase !== GAME_STATES.PLAYER_TURN && phase !== GAME_STATES.SPLITTING) return null

    const isSplitPhase = phase === GAME_STATES.SPLITTING
    const hand = isSplitPhase
      ? state.splitHands[state.activeHandIndex]?.cards ?? []
      : state.playerHand

    if (hand.length < 2 || state.dealerHand.length === 0) return null

    const dealerUpcard = state.dealerHand[0]
    const result = getOptimalAction(hand, dealerUpcard, {
      canDouble: isSplitPhase ? state.canDoubleAfterSplit : state.canDouble,
      canSplit: !isSplitPhase && state.canSplit,
      canSurrender: !isSplitPhase && state.canSurrender,
    })
    return result.optimalAction
  }, [
    STRATEGY_TRAINER_ENABLED, state.gameState, state.playerHand, state.dealerHand,
    state.splitHands, state.activeHandIndex, state.canDouble, state.canSplit,
    state.canSurrender, state.canDoubleAfterSplit, GAME_STATES,
  ])

  // Strategy feedback helper
  const checkStrategy = useCallback((playerAction: ResolvedAction) => {
    if (!STRATEGY_TRAINER_ENABLED || !optimalAction) return
    const correct = playerAction === optimalAction
    setStrategyAccuracy(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
    setStrategyFeedback({ action: actionLabel(optimalAction), correct })
    if (strategyFeedbackTimer.current) clearTimeout(strategyFeedbackTimer.current)
    strategyFeedbackTimer.current = setTimeout(() => setStrategyFeedback(null), 2000)
  }, [STRATEGY_TRAINER_ENABLED, optimalAction])

  // Wrap player actions to track strategy accuracy
  const strategyHit = useCallback(() => {
    checkStrategy('hit')
    actions.hit()
  }, [checkStrategy, actions])

  const strategyStand = useCallback(() => {
    checkStrategy('stand')
    actions.stand()
  }, [checkStrategy, actions])

  const strategyDoubleDown = useCallback(() => {
    checkStrategy('double')
    actions.doubleDown()
  }, [checkStrategy, actions])

  const strategySplit = useCallback(() => {
    checkStrategy('split')
    actions.splitPairs()
  }, [checkStrategy, actions])

  const strategySurrender = useCallback(() => {
    checkStrategy('surrender')
    actions.surrender()
  }, [checkStrategy, actions])

  // ── Card Counting Practice state ──
  const [countingAccuracy, setCountingAccuracy] = useState({ correct: 0, total: 0 })
  const [selfTestMode, setSelfTestMode] = useState(false)
  const [showCountInput, setShowCountInput] = useState(false)
  const [runningCount, setRunningCount] = useState(0)
  const [lastDealtCard, setLastDealtCard] = useState<Card | null>(null)
  const prevAllCardsRef = useRef<number>(0)

  // Track cards as they're revealed and update running count
  useEffect(() => {
    if (!CARD_COUNTING_ENABLED) return

    const playerCards = state.playerHand
    const dealerCards = state.dealerRevealed ? state.dealerHand : state.dealerHand.slice(0, 1)
    const splitCards = state.splitHands.flatMap(h => h.cards)
    const allVisible = [...playerCards, ...dealerCards, ...splitCards]
    const totalVisible = allVisible.length

    if (totalVisible > prevAllCardsRef.current && totalVisible > 0) {
      const newCard = allVisible[totalVisible - 1]
      setLastDealtCard(newCard)
      // Recalculate from all visible cards to stay accurate
      let count = 0
      for (const card of allVisible) {
        count += getHiLoValue(card)
      }
      setRunningCount(count)
    }

    prevAllCardsRef.current = totalVisible
  }, [CARD_COUNTING_ENABLED, state.playerHand, state.dealerHand, state.dealerRevealed, state.splitHands])

  // Reset count on shoe reshuffle
  useEffect(() => {
    if (state.cutCardReached) {
      setRunningCount(0)
      prevAllCardsRef.current = 0
      setLastDealtCard(null)
    }
  }, [state.cutCardReached])

  // Show count input prompt at end of each hand in self-test mode
  useEffect(() => {
    if (!CARD_COUNTING_ENABLED || !selfTestMode) return
    if (state.gameState === GAME_STATES.GAME_OVER) {
      setShowCountInput(true)
    }
  }, [CARD_COUNTING_ENABLED, selfTestMode, state.gameState, GAME_STATES])

  const handleToggleSelfTest = useCallback(() => {
    setSelfTestMode(prev => !prev)
    setShowCountInput(false)
  }, [])

  const handleSubmitCount = useCallback((guess: number) => {
    const correct = guess === runningCount
    setCountingAccuracy(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
    setShowCountInput(false)
  }, [runningCount])

  // ── Side Bets state ──
  const [perfectPairsBet, setPerfectPairsBet] = useState(0)
  const [twentyOnePlusThreeBet, setTwentyOnePlusThreeBet] = useState(0)
  const [sideBetResult, setSideBetResult] = useState<{
    perfectPairs: PerfectPairsResult | null
    twentyOnePlusThree: TwentyOnePlusThreeResult | null
  } | null>(null)
  const [showSideBetResults, setShowSideBetResults] = useState(false)
  const sideBetsEvaluatedRef = useRef(false)

  const handlePlacePerfectPairs = useCallback((amount: number) => {
    setPerfectPairsBet(amount)
  }, [])

  const handlePlaceTwentyOnePlusThree = useCallback((amount: number) => {
    setTwentyOnePlusThreeBet(amount)
  }, [])

  const handleClearSideBets = useCallback(() => {
    setPerfectPairsBet(0)
    setTwentyOnePlusThreeBet(0)
  }, [])

  // Evaluate side bets when cards are dealt and we enter player_turn or insurance_offer
  useEffect(() => {
    if (!SIDE_BETS_ENABLED) return
    if (perfectPairsBet === 0 && twentyOnePlusThreeBet === 0) return

    const phase = state.gameState
    const justDealt = (phase === GAME_STATES.PLAYER_TURN || phase === GAME_STATES.INSURANCE_OFFER || phase === GAME_STATES.GAME_OVER)
      && state.playerHand.length >= 2
      && state.dealerHand.length >= 1
      && !sideBetsEvaluatedRef.current

    if (!justDealt) return

    sideBetsEvaluatedRef.current = true

    const ppResult = perfectPairsBet > 0
      ? evaluatePerfectPairs(state.playerHand[0], state.playerHand[1])
      : null

    const tptResult = twentyOnePlusThreeBet > 0
      ? evaluateTwentyOnePlusThree(state.playerHand[0], state.playerHand[1], state.dealerHand[0])
      : null

    setSideBetResult({ perfectPairs: ppResult, twentyOnePlusThree: tptResult })
    setShowSideBetResults(true)

    // Calculate side bet payouts and add/deduct from chips via a side-effect
    // Side bets are deducted when placed (during deal) and winnings added back
    let sideBetPayout = 0
    if (ppResult && ppResult.payout > 0) {
      sideBetPayout += calculateSideBetPayout(perfectPairsBet, ppResult.payout)
    }
    if (tptResult && tptResult.payout > 0) {
      sideBetPayout += calculateSideBetPayout(twentyOnePlusThreeBet, tptResult.payout)
    }

    // Use the game engine's side bet handler
    if (sideBetPayout > 0) {
      actions.adjustChips(sideBetPayout)
    }
  }, [SIDE_BETS_ENABLED, state.gameState, state.playerHand, state.dealerHand, perfectPairsBet, twentyOnePlusThreeBet, GAME_STATES, actions])

  // Reset side bet evaluation flag and results on new round
  useEffect(() => {
    if (state.gameState === GAME_STATES.BETTING || state.gameState === GAME_STATES.IDLE) {
      sideBetsEvaluatedRef.current = false
      setShowSideBetResults(false)
      setSideBetResult(null)
    }
  }, [state.gameState, GAME_STATES])

  // Deduct side bets from chips when deal happens
  const originalDealCards = actions.dealCards
  const dealCardsWithSideBets = useCallback(() => {
    const totalSideBets = (SIDE_BETS_ENABLED ? perfectPairsBet + twentyOnePlusThreeBet : 0)
    if (totalSideBets > 0) {
      actions.adjustChips(-totalSideBets)
    }
    originalDealCards()
  }, [originalDealCards, SIDE_BETS_ENABLED, perfectPairsBet, twentyOnePlusThreeBet, actions])

  // ── Multiplayer (Local Hot-Seat) state ──
  const [mpShowSetup, setMpShowSetup] = useState(false)
  const [mpPlayers, setMpPlayers] = useState<MultiplayerState[]>([])
  const [mpActiveIndex, setMpActiveIndex] = useState(0)
  const [mpPhase, setMpPhase] = useState<'betting' | 'playing' | 'results'>('betting')
  const mpActive = MULTIPLAYER_ENABLED && mpPlayers.length >= 2
  const prevMpGameStateRef = useRef(state.gameState)

  // When multiplayer is enabled but no players set up, show setup
  useEffect(() => {
    if (MULTIPLAYER_ENABLED && mpPlayers.length === 0 && !mpShowSetup) {
      setMpShowSetup(true)
    }
    if (!MULTIPLAYER_ENABLED && mpPlayers.length > 0) {
      setMpPlayers([])
      setMpActiveIndex(0)
    }
  }, [MULTIPLAYER_ENABLED, mpPlayers.length, mpShowSetup])

  const handleMpStart = useCallback((configs: PlayerConfig[]) => {
    const players: MultiplayerState[] = configs.map(c => ({
      name: c.name,
      bankroll: c.bankroll,
      bet: 0,
      result: null,
      isActive: false,
      wins: 0,
      losses: 0,
    }))
    setMpPlayers(players)
    setMpActiveIndex(0)
    setMpPhase('betting')
    setMpShowSetup(false)
    // Set the game engine to the first player's bankroll
    actions.adjustChips(players[0].bankroll - state.chips)
  }, [actions, state.chips])

  const handleMpCancel = useCallback(() => {
    setMpShowSetup(false)
    setMpPlayers([])
    updateSetting('MULTIPLAYER_ENABLED', false)
  }, [updateSetting])

  // Track player results and advance turns in multiplayer
  useEffect(() => {
    if (!mpActive) return

    const wasPlaying = prevMpGameStateRef.current !== GAME_STATES.GAME_OVER
      && prevMpGameStateRef.current !== GAME_STATES.BETTING
    const isNowDone = state.gameState === GAME_STATES.GAME_OVER

    if (wasPlaying && isNowDone) {
      // Record result for current player
      setMpPlayers(prev => prev.map((p, i) => {
        if (i !== mpActiveIndex) return p
        const result = state.result || 'lose'
        return {
          ...p,
          bankroll: state.chips,
          bet: 0,
          result,
          wins: p.wins + (result === 'win' || result === 'blackjack' ? 1 : 0),
          losses: p.losses + (result === 'lose' ? 1 : 0),
        }
      }))
      setMpPhase('results')
    }

    prevMpGameStateRef.current = state.gameState
  }, [mpActive, state.gameState, state.result, state.chips, mpActiveIndex, GAME_STATES])

  // Advance to next player when current player starts a new round
  const mpNewRound = useCallback(() => {
    if (!mpActive) {
      actions.newRound()
      return
    }

    // Save current player's bankroll
    const currentBankroll = state.chips
    setMpPlayers(prev => prev.map((p, i) =>
      i === mpActiveIndex ? { ...p, bankroll: currentBankroll, result: null } : p
    ))

    const nextIndex = (mpActiveIndex + 1) % mpPlayers.length
    setMpActiveIndex(nextIndex)
    setMpPhase('betting')

    // Reset the round and set to next player's bankroll
    actions.newRound()
    // Use setTimeout to ensure the new round state is applied first
    setTimeout(() => {
      actions.adjustChips(mpPlayers[nextIndex].bankroll - currentBankroll)
    }, 50)
  }, [mpActive, mpActiveIndex, mpPlayers, state.chips, actions])

  const { muted, toggleMute, playButtonClick } = useSoundEffects({
    gameState: state.gameState,
    result: state.result,
    bet: state.bet,
    chips: state.chips,
    playerHandLength: state.playerHand.length,
    dealerHandLength: state.dealerHand.length,
    cutCardReached: state.cutCardReached,
  })

  // ── Chip animation triggers ──
  const betSeqRef = useRef(0)
  const winSeqRef = useRef(0)
  const [betTrigger, setBetTrigger] = useState({ amount: 0, seq: 0 })
  const [winTrigger, setWinTrigger] = useState({ amount: 0, seq: 0 })
  const prevChipsRef = useRef(state.chips)
  const prevGameStateRef = useRef(state.gameState)

  const handlePlaceBet = useCallback((amount: number) => {
    betSeqRef.current += 1
    setBetTrigger({ amount, seq: betSeqRef.current })
    actions.placeBet(amount)
  }, [actions])

  // ── Keyboard shortcuts ──
  const isBetting = state.gameState === GAME_STATES.BETTING || state.gameState === GAME_STATES.IDLE
  const isGameOver = state.gameState === GAME_STATES.GAME_OVER || state.gameState === GAME_STATES.RESOLVING

  useKeyboardShortcuts(
    {
      onHit: strategyHit,
      onStand: strategyStand,
      onDoubleDown: strategyDoubleDown,
      onSplit: strategySplit,
      onSurrender: strategySurrender,
      onAcceptInsurance: actions.acceptInsurance,
      onDeclineInsurance: actions.declineInsurance,
      onNewRound: mpActive ? mpNewRound : actions.newRound,
      onDeal: dealCardsWithSideBets,
      onPlaceBet: handlePlaceBet,
      onClearBet: actions.clearBet,
      onButtonClick: playButtonClick,
    },
    {
      gameState: state.gameState,
      chips: state.chips,
      bet: state.bet,
      canDouble: state.canDouble,
      canSplit: state.canSplit,
      canSurrender: state.canSurrender,
      canDoubleAfterSplit: state.canDoubleAfterSplit,
      maxInsuranceBet: state.maxInsuranceBet,
      chipDenominations: CHIP_DENOMINATIONS,
      isBetting,
      isGameOver,
    },
    GAME_STATES,
  )

  // Detect win payouts: when transitioning to GAME_OVER and chips increased
  useEffect(() => {
    const wasPlaying = prevGameStateRef.current !== GAME_STATES.GAME_OVER
      && prevGameStateRef.current !== GAME_STATES.BETTING
      && prevGameStateRef.current !== GAME_STATES.IDLE
    const isNowGameOver = state.gameState === GAME_STATES.GAME_OVER
    const chipsIncreased = state.chips > prevChipsRef.current

    if (wasPlaying && isNowGameOver && chipsIncreased) {
      const winAmount = state.chips - prevChipsRef.current
      winSeqRef.current += 1
      setWinTrigger({ amount: winAmount, seq: winSeqRef.current })
    }

    prevChipsRef.current = state.chips
    prevGameStateRef.current = state.gameState
  }, [state.gameState, state.chips, GAME_STATES])

  const isSplitActive = state.isSplit && state.splitHands.length > 0

  const isPlaying = state.gameState !== GAME_STATES.BETTING
    && state.gameState !== GAME_STATES.IDLE
    && state.gameState !== GAME_STATES.GAME_OVER
    && state.gameState !== GAME_STATES.RESOLVING

  // ── Screen reader announcements for card deals ──
  const [srAnnouncement, setSrAnnouncement] = useState('')
  const prevPlayerCountRef = useRef(state.playerHand.length)
  const prevDealerCountRef = useRef(state.dealerHand.length)

  useEffect(() => {
    const playerCount = state.playerHand.length
    const dealerCount = state.dealerHand.length
    const suitNames: Record<string, string> = { hearts: 'Hearts', diamonds: 'Diamonds', clubs: 'Clubs', spades: 'Spades' }
    const rankNames: Record<string, string> = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' }

    if (playerCount > prevPlayerCountRef.current && playerCount > 0) {
      const newCard = state.playerHand[playerCount - 1]
      const rank = rankNames[newCard.rank] || newCard.rank
      const suit = suitNames[newCard.suit]
      setSrAnnouncement(`You received ${rank} of ${suit}. Your score: ${state.playerScore}`)
    }

    if (dealerCount > prevDealerCountRef.current && dealerCount > 0 && state.dealerRevealed) {
      const newCard = state.dealerHand[dealerCount - 1]
      const rank = rankNames[newCard.rank] || newCard.rank
      const suit = suitNames[newCard.suit]
      setSrAnnouncement(`Dealer received ${rank} of ${suit}. Dealer score: ${state.dealerVisibleScore}`)
    }

    prevPlayerCountRef.current = playerCount
    prevDealerCountRef.current = dealerCount
  }, [state.playerHand, state.dealerHand, state.playerScore, state.dealerVisibleScore, state.dealerRevealed])

  const payoutLabel = BLACKJACK_PAYOUT_RATIO === 1.5 ? '3:2' : '6:5'
  const soft17Label = DEALER_HITS_SOFT_17 ? 'Dealer hits soft 17' : 'Dealer stands on 17'
  const deckLabel = NUM_DECKS === 1 ? 'Single deck' : `${NUM_DECKS}-deck shoe`

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="suit-icon" aria-hidden="true">&#9824;</span> Blackjack <span className="suit-icon red" aria-hidden="true">&#9829;</span>
        </h1>
        <Scoreboard stats={state.stats} />
        <nav className="header-actions" aria-label="Game tools">
          <HandHistory history={state.handHistory} />
          <StatsDashboard stats={state.stats} detailedStats={state.detailedStats} chips={state.chips} achievements={state.achievements} />
          <TutorialOverlay />
          <SettingsPanel isPlaying={isPlaying} onResetEverything={actions.resetEverything} />
          <button
            className="sound-toggle"
            onClick={toggleMute}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            aria-pressed={!muted}
          >
            {muted ? '\u{1F507}' : '\u{1F50A}'}
          </button>
        </nav>
      </header>

      {mpActive && (
        <MultiplayerBar
          players={mpPlayers}
          activeIndex={mpActiveIndex}
          phase={mpPhase}
        />
      )}

      <main className="table" style={feltStyle} aria-label="Blackjack table">
        <ChipAnimation
          betTrigger={betTrigger}
          winTrigger={winTrigger}
        />

        <CelebrationEffects
          result={state.result}
          gameState={state.gameState}
          winAmount={winTrigger.amount}
          bet={state.bet}
        />

        <ShoeIndicator
          cardsRemaining={state.cardsRemaining}
          shoeSize={state.shoeSize}
          cutCardReached={state.cutCardReached}
        />

        {mpActive && (
          <div className="mp-turn-banner" aria-live="polite">
            {mpPlayers[mpActiveIndex]?.name}&apos;s Turn
          </div>
        )}

        <DealerHand
          hand={state.dealerHand}
          dealerRevealed={state.dealerRevealed}
          dealerVisibleScore={state.dealerVisibleScore}
        />

        <GameBanner
          message={state.message}
          result={state.result}
          gameState={state.gameState}
        />

        {isSplitActive ? (
          <SplitHandsDisplay
            splitHands={state.splitHands}
            activeHandIndex={state.activeHandIndex}
            isPlaying={state.gameState === GAME_STATES.SPLITTING}
          />
        ) : (
          <PlayerHand
            hand={state.playerHand}
            playerScore={state.playerScore}
          />
        )}

        {STRATEGY_TRAINER_ENABLED && (
          <StrategyOverlay
            optimalAction={optimalAction}
            lastFeedback={strategyFeedback}
            accuracy={strategyAccuracy}
          />
        )}

        {CARD_COUNTING_ENABLED && (
          <CountingOverlay
            runningCount={runningCount}
            cardsRemaining={state.cardsRemaining}
            lastDealtCard={lastDealtCard}
            accuracy={countingAccuracy}
            selfTestMode={selfTestMode}
            onToggleSelfTest={handleToggleSelfTest}
            onSubmitCount={handleSubmitCount}
            showCountInput={showCountInput}
          />
        )}

        {SIDE_BETS_ENABLED && isBetting && (
          <SideBets
            chips={state.chips}
            mainBet={state.bet}
            perfectPairsBet={perfectPairsBet}
            twentyOnePlusThreeBet={twentyOnePlusThreeBet}
            onPlacePerfectPairs={handlePlacePerfectPairs}
            onPlaceTwentyOnePlusThree={handlePlaceTwentyOnePlusThree}
            onClearSideBets={handleClearSideBets}
            sideBetResult={null}
            showResults={false}
          />
        )}

        {SIDE_BETS_ENABLED && showSideBetResults && sideBetResult && !isBetting && (
          <SideBets
            chips={state.chips}
            mainBet={state.bet}
            perfectPairsBet={perfectPairsBet}
            twentyOnePlusThreeBet={twentyOnePlusThreeBet}
            onPlacePerfectPairs={handlePlacePerfectPairs}
            onPlaceTwentyOnePlusThree={handlePlaceTwentyOnePlusThree}
            onClearSideBets={handleClearSideBets}
            sideBetResult={sideBetResult}
            showResults={true}
          />
        )}

        <div className="controls-area">
          {(state.gameState === GAME_STATES.BETTING || state.gameState === GAME_STATES.IDLE) ? (
            <BettingControls
              chips={state.chips}
              bet={state.bet}
              onPlaceBet={handlePlaceBet}
              onClearBet={actions.clearBet}
              onDeal={dealCardsWithSideBets}
              onButtonClick={playButtonClick}
            />
          ) : (
            <ActionControls
              gameState={state.gameState}
              chips={state.chips}
              bet={state.bet}
              canDouble={state.canDouble}
              canSplit={state.canSplit}
              canSurrender={state.canSurrender}
              canDoubleAfterSplit={state.canDoubleAfterSplit}
              maxInsuranceBet={state.maxInsuranceBet}
              onHit={strategyHit}
              onStand={strategyStand}
              onDoubleDown={strategyDoubleDown}
              onSplit={strategySplit}
              onSurrender={strategySurrender}
              onAcceptInsurance={actions.acceptInsurance}
              onDeclineInsurance={actions.declineInsurance}
              onNewRound={mpActive ? mpNewRound : actions.newRound}
              onReset={actions.resetGame}
              onButtonClick={playButtonClick}
              optimalAction={optimalAction}
              strategyTrainerEnabled={STRATEGY_TRAINER_ENABLED}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <span>Blackjack pays {payoutLabel} &middot; {soft17Label} &middot; {deckLabel}</span>
        <span className="build-version">v{__BUILD_VERSION__}</span>
      </footer>

      <AchievementToast achievements={state.achievements} />

      {/* Screen reader card deal announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="log">
        {srAnnouncement}
      </div>

      {mpShowSetup && (
        <MultiplayerSetup
          onStart={handleMpStart}
          onCancel={handleMpCancel}
        />
      )}
    </div>
  )
}

export default App
