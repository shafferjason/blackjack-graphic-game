import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useGameEngine } from './hooks/useGameEngine'
import { useGameSettings } from './config/GameSettingsContext'
import type { TableFeltTheme } from './types'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
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
import './App.css'

function App() {
  const { GAME_STATES, NUM_DECKS, DEALER_HITS_SOFT_17, BLACKJACK_PAYOUT_RATIO, TABLE_FELT_THEME, CHIP_DENOMINATIONS } = useGameSettings()

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
      onHit: actions.hit,
      onStand: actions.stand,
      onDoubleDown: actions.doubleDown,
      onSplit: actions.splitPairs,
      onSurrender: actions.surrender,
      onAcceptInsurance: actions.acceptInsurance,
      onDeclineInsurance: actions.declineInsurance,
      onNewRound: actions.newRound,
      onDeal: actions.dealCards,
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

  const payoutLabel = BLACKJACK_PAYOUT_RATIO === 1.5 ? '3:2' : '6:5'
  const soft17Label = DEALER_HITS_SOFT_17 ? 'Dealer hits soft 17' : 'Dealer stands on 17'
  const deckLabel = NUM_DECKS === 1 ? 'Single deck' : `${NUM_DECKS}-deck shoe`

  return (
    <div className="app">
      <header className="header">
        <h1>
          <span className="suit-icon">&#9824;</span> Blackjack <span className="suit-icon red">&#9829;</span>
        </h1>
        <Scoreboard stats={state.stats} />
        <div className="header-actions">
          <HandHistory history={state.handHistory} />
          <StatsDashboard stats={state.stats} detailedStats={state.detailedStats} chips={state.chips} achievements={state.achievements} />
          <SettingsPanel isPlaying={isPlaying} onResetEverything={actions.resetEverything} />
          <button
            className="sound-toggle"
            onClick={toggleMute}
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? '\u{1F507}' : '\u{1F50A}'}
          </button>
        </div>
      </header>

      <main className="table" style={feltStyle}>
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

        <div className="controls-area">
          {(state.gameState === GAME_STATES.BETTING || state.gameState === GAME_STATES.IDLE) ? (
            <BettingControls
              chips={state.chips}
              bet={state.bet}
              onPlaceBet={handlePlaceBet}
              onClearBet={actions.clearBet}
              onDeal={actions.dealCards}
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
              onHit={actions.hit}
              onStand={actions.stand}
              onDoubleDown={actions.doubleDown}
              onSplit={actions.splitPairs}
              onSurrender={actions.surrender}
              onAcceptInsurance={actions.acceptInsurance}
              onDeclineInsurance={actions.declineInsurance}
              onNewRound={actions.newRound}
              onReset={actions.resetGame}
              onButtonClick={playButtonClick}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <span>Blackjack pays {payoutLabel} &middot; {soft17Label} &middot; {deckLabel}</span>
      </footer>

      <AchievementToast achievements={state.achievements} />
    </div>
  )
}

export default App
