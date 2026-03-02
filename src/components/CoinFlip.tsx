import { useState, useCallback } from 'react'
import { useCoinFlip, COIN_SKINS, loadCoinSkinState, saveCoinSkinState, getCoinSkinById } from '../hooks/useCoinFlip'
import type { CoinSide, CoinSkin, CoinSkinState } from '../hooks/useCoinFlip'

interface CoinFlipProps {
  chips: number
  onChipsChange: (newChips: number) => void
}

export default function CoinFlip({ chips, onChipsChange }: CoinFlipProps) {
  const { state, setChoice, setBetInput, validateBet, flip, newRound } = useCoinFlip(chips, onChipsChange)

  // Coin skin state
  const [skinState, setSkinState] = useState<CoinSkinState>(loadCoinSkinState)
  const [showSkinShop, setShowSkinShop] = useState(false)
  const [shopMessage, setShopMessage] = useState('')

  const activeSkin = getCoinSkinById(skinState.activeSkinId) ?? COIN_SKINS[0]

  const isIdle = state.phase === 'idle'
  const isFlipping = state.phase === 'flipping'
  const isResult = state.phase === 'result'
  const isWin = isResult && state.winAmount > 0

  const betError = isIdle ? validateBet() : null
  const canFlip = isIdle && !betError

  // ── Skin shop actions ──

  const handlePurchaseSkin = useCallback((skin: CoinSkin) => {
    if (skinState.ownedSkinIds.includes(skin.id)) return
    if (chips < skin.price) {
      setShopMessage(`Not enough chips! Need $${skin.price}.`)
      return
    }
    onChipsChange(chips - skin.price)
    const newState: CoinSkinState = {
      ...skinState,
      ownedSkinIds: [...skinState.ownedSkinIds, skin.id],
    }
    saveCoinSkinState(newState)
    setSkinState(newState)
    setShopMessage(`Purchased ${skin.name}!`)
  }, [skinState, chips, onChipsChange])

  const handleSelectSkin = useCallback((skinId: string) => {
    const newState: CoinSkinState = { ...skinState, activeSkinId: skinId }
    saveCoinSkinState(newState)
    setSkinState(newState)
    setShopMessage('')
  }, [skinState])

  // ── Quick bet buttons ──
  const quickBets = [10, 25, 50, 100]

  return (
    <div className="coinflip">
      {/* Coin Skin Shop Modal */}
      {showSkinShop && (
        <div className="coinflip-shop-overlay" onClick={() => setShowSkinShop(false)}>
          <div className="coinflip-shop" onClick={e => e.stopPropagation()} role="dialog" aria-label="Coin Skin Shop">
            <div className="coinflip-shop__header">
              <h3>Coin Skin Shop</h3>
              <button className="coinflip-shop__close" onClick={() => setShowSkinShop(false)} aria-label="Close shop">&times;</button>
            </div>
            {shopMessage && <div className="coinflip-shop__message">{shopMessage}</div>}
            <div className="coinflip-shop__grid">
              {COIN_SKINS.map(skin => {
                const owned = skinState.ownedSkinIds.includes(skin.id)
                const active = skinState.activeSkinId === skin.id
                const canAfford = chips >= skin.price
                return (
                  <div key={skin.id} className={`coinflip-shop__card ${active ? 'coinflip-shop__card--active' : ''}`}>
                    <div
                      className="coinflip-shop__coin-preview"
                      style={{ background: `linear-gradient(135deg, ${skin.headsColor}, ${skin.tailsColor})`, borderColor: skin.edgeColor }}
                    >
                      <span>{skin.headsEmoji}</span>
                    </div>
                    <div className="coinflip-shop__info">
                      <span className="coinflip-shop__name">{skin.name}</span>
                      <span className="coinflip-shop__desc">{skin.description}</span>
                    </div>
                    {owned ? (
                      active ? (
                        <button className="coinflip-shop__btn coinflip-shop__btn--equipped" disabled>Equipped</button>
                      ) : (
                        <button className="coinflip-shop__btn coinflip-shop__btn--select" onClick={() => handleSelectSkin(skin.id)}>Select</button>
                      )
                    ) : (
                      <button
                        className={`coinflip-shop__btn coinflip-shop__btn--buy ${!canAfford ? 'coinflip-shop__btn--disabled' : ''}`}
                        onClick={() => handlePurchaseSkin(skin)}
                        disabled={!canAfford}
                      >
                        ${skin.price}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Title bar */}
      <div className="coinflip__header">
        <h2 className="coinflip__title">Coin Flip</h2>
        <button className="coinflip__skin-btn" onClick={() => setShowSkinShop(true)} title="Coin Skins">
          <span className="coinflip__skin-btn-icon">{activeSkin.headsEmoji}</span>
          Skins
        </button>
      </div>

      {/* The coin */}
      <div className={`coinflip__coin-area ${isFlipping ? 'coinflip__coin-area--flipping' : ''} ${isResult ? 'coinflip__coin-area--result' : ''}`}>
        <div
          className={`coinflip__coin ${isFlipping ? 'coinflip__coin--flipping' : ''} ${isResult && state.result === 'tails' ? 'coinflip__coin--tails' : ''}`}
        >
          <div
            className="coinflip__coin-face coinflip__coin-face--heads"
            style={{ background: `radial-gradient(circle at 35% 35%, ${activeSkin.headsColor}, ${activeSkin.edgeColor})` }}
          >
            <span className="coinflip__coin-emoji">{activeSkin.headsEmoji}</span>
            <span className="coinflip__coin-label">{activeSkin.headsLabel}</span>
          </div>
          <div
            className="coinflip__coin-face coinflip__coin-face--tails"
            style={{ background: `radial-gradient(circle at 35% 35%, ${activeSkin.tailsColor}, ${activeSkin.edgeColor})` }}
          >
            <span className="coinflip__coin-emoji">{activeSkin.tailsEmoji}</span>
            <span className="coinflip__coin-label">{activeSkin.tailsLabel}</span>
          </div>
        </div>
      </div>

      {/* Result message */}
      <div className={`coinflip__message ${isWin ? 'coinflip__message--win' : ''} ${isResult && !isWin ? 'coinflip__message--lose' : ''}`}>
        {state.message}
      </div>

      {/* Controls */}
      <div className="coinflip__controls">
        {/* Choice selector */}
        {(isIdle || isResult) && (
          <div className="coinflip__choice">
            <span className="coinflip__choice-label">Pick a side:</span>
            <div className="coinflip__choice-btns">
              <button
                className={`coinflip__choice-btn ${state.choice === 'heads' ? 'coinflip__choice-btn--active' : ''}`}
                onClick={() => setChoice('heads')}
                style={state.choice === 'heads' ? { borderColor: activeSkin.headsColor, color: activeSkin.headsColor } : undefined}
              >
                {activeSkin.headsEmoji} Heads
              </button>
              <button
                className={`coinflip__choice-btn ${state.choice === 'tails' ? 'coinflip__choice-btn--active' : ''}`}
                onClick={() => setChoice('tails')}
                style={state.choice === 'tails' ? { borderColor: activeSkin.tailsColor, color: activeSkin.tailsColor } : undefined}
              >
                {activeSkin.tailsEmoji} Tails
              </button>
            </div>
          </div>
        )}

        {/* Bet input */}
        {(isIdle || isResult) && (
          <div className="coinflip__bet-area">
            <label className="coinflip__bet-label" htmlFor="coinflip-bet">Wager:</label>
            <div className="coinflip__bet-row">
              <span className="coinflip__bet-dollar">$</span>
              <input
                id="coinflip-bet"
                className="coinflip__bet-input"
                type="number"
                min="1"
                max={chips}
                value={state.betInput}
                onChange={e => setBetInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && canFlip) flip() }}
                disabled={isFlipping}
              />
            </div>
            <div className="coinflip__quick-bets">
              {quickBets.filter(a => a <= chips).map(amount => (
                <button
                  key={amount}
                  className={`coinflip__quick-btn ${state.betInput === String(amount) ? 'coinflip__quick-btn--active' : ''}`}
                  onClick={() => setBetInput(String(amount))}
                >
                  ${amount}
                </button>
              ))}
              <button
                className={`coinflip__quick-btn ${state.betInput === String(chips) ? 'coinflip__quick-btn--active' : ''}`}
                onClick={() => setBetInput(String(chips))}
              >
                All In
              </button>
            </div>
            {betError && state.choice && state.betInput.trim() !== '' && (
              <div className="coinflip__bet-error">{betError}</div>
            )}
          </div>
        )}

        {/* Flip / Again buttons */}
        <div className="coinflip__action">
          {isIdle && (
            <button
              className="coinflip__flip-btn"
              onClick={flip}
              disabled={!canFlip}
            >
              Flip — ${parseInt(state.betInput, 10) || 0}
            </button>
          )}
          {isResult && (
            <button
              className="coinflip__flip-btn"
              onClick={() => { newRound(); }}
            >
              Play Again
            </button>
          )}
          {isFlipping && (
            <div className="coinflip__flipping-text">Flipping...</div>
          )}
        </div>
      </div>

      {/* History */}
      {state.history.length > 0 && (
        <div className="coinflip__history">
          <span className="coinflip__history-label">Recent Flips</span>
          <div className="coinflip__history-list">
            {state.history.map((entry, i) => (
              <div key={i} className={`coinflip__history-entry ${entry.won ? 'coinflip__history-entry--win' : 'coinflip__history-entry--lose'}`}>
                <span className="coinflip__history-result">{entry.result === 'heads' ? activeSkin.headsEmoji : activeSkin.tailsEmoji}</span>
                <span className="coinflip__history-amount">{entry.won ? '+' : '-'}${entry.bet}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
