import { useGameEngine } from './hooks/useGameEngine'
import { useGameSettings } from './config/GameSettingsContext'
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
import './App.css'

function App() {
  const { GAME_STATES, NUM_DECKS, DEALER_HITS_SOFT_17, BLACKJACK_PAYOUT_RATIO } = useGameSettings()
  const { state, actions } = useGameEngine()

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
          <StatsDashboard stats={state.stats} detailedStats={state.detailedStats} chips={state.chips} />
          <SettingsPanel isPlaying={isPlaying} onResetEverything={actions.resetEverything} />
        </div>
      </header>

      <main className="table">
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
              onPlaceBet={actions.placeBet}
              onClearBet={actions.clearBet}
              onDeal={actions.dealCards}
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
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <span>Blackjack pays {payoutLabel} &middot; {soft17Label} &middot; {deckLabel}</span>
      </footer>
    </div>
  )
}

export default App
