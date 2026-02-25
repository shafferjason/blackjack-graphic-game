import { useEffect, useRef, useState, useCallback } from 'react'
import {
  isMuted,
  toggleMute,
  playCardDeal,
  playChipPlace,
  playChipCollect,
  playWinFanfare,
  playLossThud,
  playBlackjackCelebration,
  playShuffle,
  playButtonClick,
  playPush,
  playStand,
  playBust,
} from '../utils/sound'
import type { GamePhase, GameResult } from '../types'

interface SoundEffectsInput {
  gameState: GamePhase
  result: GameResult | null
  bet: number
  chips: number
  playerHandLength: number
  dealerHandLength: number
  cutCardReached: boolean
}

export function useSoundEffects({
  gameState,
  result,
  bet,
  chips,
  playerHandLength,
  dealerHandLength,
  cutCardReached,
}: SoundEffectsInput) {
  const [muted, setMutedState] = useState(isMuted)
  const prevPhaseRef = useRef<GamePhase>(gameState)
  const prevResultRef = useRef<GameResult | null>(result)
  const prevPlayerCardsRef = useRef(playerHandLength)
  const prevDealerCardsRef = useRef(dealerHandLength)
  const prevBetRef = useRef(bet)
  const prevCutCardRef = useRef(cutCardReached)

  const handleToggleMute = useCallback(() => {
    const newMuted = toggleMute()
    setMutedState(newMuted)
  }, [])

  useEffect(() => {
    const prevPhase = prevPhaseRef.current
    const prevResult = prevResultRef.current
    const prevPlayerCards = prevPlayerCardsRef.current
    const prevDealerCards = prevDealerCardsRef.current
    const prevBet = prevBetRef.current
    const prevCutCard = prevCutCardRef.current

    // Update refs
    prevPhaseRef.current = gameState
    prevResultRef.current = result
    prevPlayerCardsRef.current = playerHandLength
    prevDealerCardsRef.current = dealerHandLength
    prevBetRef.current = bet
    prevCutCardRef.current = cutCardReached

    // Shuffle sound when cut card is reached (new shoe created)
    if (prevCutCard && !cutCardReached && gameState === 'dealing') {
      playShuffle()
    }

    // Card deal sounds — when dealing phase starts, play deal sounds
    if (prevPhase === 'betting' && gameState === 'dealing') {
      // Stagger 4 card deal sounds with slight timing variation
      playCardDeal()
      setTimeout(() => playCardDeal(), 90)
      setTimeout(() => playCardDeal(), 175)
      setTimeout(() => playCardDeal(), 260)
      return
    }

    // Player stand — transition from player_turn to dealer_turn
    if (prevPhase === 'player_turn' && gameState === 'dealer_turn') {
      playStand()
    }

    // Player hit — new player card
    if (playerHandLength > prevPlayerCards && prevPlayerCards > 0) {
      playCardDeal()
    }

    // Dealer draw — new dealer card
    if (dealerHandLength > prevDealerCards && prevDealerCards > 0 && gameState === 'dealer_turn') {
      playCardDeal()
    }

    // Chip placed — bet increased
    if (gameState === 'betting' && bet > prevBet && bet > 0) {
      playChipPlace()
    }

    // Result sounds
    if (result !== prevResult && result !== null) {
      if (result === 'blackjack') {
        // Small delay so deal sounds finish
        setTimeout(() => playBlackjackCelebration(), 300)
      } else if (result === 'win') {
        setTimeout(() => {
          playWinFanfare()
          setTimeout(() => playChipCollect(), 350)
        }, 200)
      } else if (result === 'lose') {
        // Bust (lost during player turn) gets a distinct bust sound
        const wasBust = prevPhase === 'player_turn'
        setTimeout(() => {
          if (wasBust) {
            playBust()
          } else {
            playLossThud()
          }
        }, 200)
      } else if (result === 'push') {
        setTimeout(() => playPush(), 200)
      }
    }
  }, [gameState, result, bet, chips, playerHandLength, dealerHandLength, cutCardReached])

  return {
    muted,
    toggleMute: handleToggleMute,
    playButtonClick,
  }
}
