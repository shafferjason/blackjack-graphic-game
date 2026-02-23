import { GAME_STATES } from '../constants'

export default function GameBanner({ message, result, gameState }) {
  return (
    <div className={`banner ${result || ''} ${gameState === GAME_STATES.DEALER_TURN ? 'dealing' : ''}`}>
      <p>{message}</p>
    </div>
  )
}
