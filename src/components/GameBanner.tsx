import { useGameSettings } from '../config/GameSettingsContext'
import type { GameResult, GamePhase } from '../types'

interface GameBannerProps {
  message: string
  result: GameResult | null
  gameState: GamePhase
}

export default function GameBanner({ message, result, gameState }: GameBannerProps) {
  const { GAME_STATES } = useGameSettings()
  const isResult = gameState === GAME_STATES.GAME_OVER || gameState === GAME_STATES.RESOLVING
  return (
    <div
      className={`banner ${result || ''} ${(gameState === GAME_STATES.DEALER_TURN || gameState === GAME_STATES.DEALING) ? 'dealing' : ''}`}
      role="status"
      aria-live={isResult ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <p>{message}</p>
    </div>
  )
}
