import { useGameSettings } from '../config/GameSettingsContext'

export default function GameBanner({ message, result, gameState }) {
  const { GAME_STATES } = useGameSettings()
  return (
    <div className={`banner ${result || ''} ${(gameState === GAME_STATES.DEALER_TURN || gameState === GAME_STATES.DEALING) ? 'dealing' : ''}`}>
      <p>{message}</p>
    </div>
  )
}
