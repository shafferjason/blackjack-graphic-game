import { useGameSettings } from '../config/GameSettingsContext'
import type { GameResult, GamePhase } from '../types'

interface GameBannerProps {
  message: string
  result: GameResult | null
  gameState: GamePhase
}

export default function GameBanner({ message, result, gameState }: GameBannerProps) {
  const { GAME_STATES } = useGameSettings()
  return (
    <div className={`banner ${result || ''} ${(gameState === GAME_STATES.DEALER_TURN || gameState === GAME_STATES.DEALING) ? 'dealing' : ''}`}>
      <p>{message}</p>
    </div>
  )
}
