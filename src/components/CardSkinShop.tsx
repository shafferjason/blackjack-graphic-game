import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useModalStack } from '../hooks/useModalStack'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import {
  CARD_SKINS,
  loadCardSkinState,
  saveCardSkinState,
  purchaseSkin,
  getSkinById,
  type CardSkinState,
  type CardSkin,
} from '../utils/cardSkinShop'

interface CardSkinShopProps {
  chips: number
  onDeductChips: (amount: number) => void
}

function SkinPreview({ skin, isActive }: { skin: CardSkin; isActive: boolean }) {
  return (
    <div className="skin-preview-card" style={{ background: skin.previewGradient }}>
      {/* Mini card mockup */}
      <div
        className="skin-preview-mini-card"
        style={{
          borderColor: skin.borderColor !== 'transparent' ? skin.borderColor : 'rgba(170,160,140,0.5)',
          boxShadow: skin.glowColor !== 'transparent' ? `0 0 12px ${skin.glowColor}` : 'none',
          filter: skin.faceFilter !== 'none' ? skin.faceFilter : undefined,
        }}
      >
        <span className="skin-preview-rank" style={{ color: skin.previewAccent }}>A</span>
        <span className="skin-preview-suit" style={{ color: skin.previewAccent }}>{'\u2660'}</span>
      </div>
      {isActive && <span className="skin-active-badge">Active</span>}
    </div>
  )
}

export default function CardSkinShop({ chips, onDeductChips }: CardSkinShopProps) {
  const [open, setOpen] = useState(false)
  const [skinState, setSkinState] = useState<CardSkinState>(loadCardSkinState)
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClose = useCallback(() => { setOpen(false); setFeedback(null) }, [])
  const focusTrapRef = useFocusTrap(open)
  useModalStack(open, handleClose)
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
  }, [open])

  // Clean up feedback timer
  useEffect(() => {
    return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }
  }, [])

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type })
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3000)
  }

  const handlePurchase = (skin: CardSkin) => {
    const result = purchaseSkin(skin.id, chips, skinState)
    if (!result.success) {
      showFeedback(result.error!, 'error')
      return
    }
    // Deduct chips from game state
    onDeductChips(skin.price)
    // Unlock skin and auto-select it
    const newState: CardSkinState = {
      unlockedSkins: [...skinState.unlockedSkins, skin.id],
      activeSkinId: skin.id,
    }
    setSkinState(newState)
    saveCardSkinState(newState)
    showFeedback(`Unlocked ${skin.name}!`, 'success')
  }

  const handleSelect = (skinId: string) => {
    const newState: CardSkinState = {
      ...skinState,
      activeSkinId: skinId,
    }
    setSkinState(newState)
    saveCardSkinState(newState)
  }

  const isOwned = (skinId: string) => skinState.unlockedSkins.includes(skinId)
  const isActive = (skinId: string) => skinState.activeSkinId === skinId

  return (
    <>
      <button
        className="settings-toggle shop-toggle"
        onClick={() => setOpen(!open)}
        title="Card Skin Shop"
        aria-label={open ? 'Close card skin shop' : 'Open card skin shop'}
        aria-expanded={open}
      >
        {'\uD83C\uDFA8'}
      </button>

      {open && createPortal(
        <div
          ref={focusTrapRef}
          className="settings-overlay"
          onClick={() => { setOpen(false); setFeedback(null) }}
          role="dialog"
          aria-modal="true"
          aria-label="Card Skin Shop"
        >
          <div className="settings-panel shop-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-header">
              <h2>Card Skins</h2>
              <div className="shop-bankroll">
                <span className="chip-coin">$</span>{chips.toLocaleString()}
              </div>
              <button
                ref={closeButtonRef}
                className="settings-close"
                onClick={() => { setOpen(false); setFeedback(null) }}
                aria-label="Close shop"
              >
                &times;
              </button>
            </div>

            {feedback && (
              <div className={`shop-feedback shop-feedback-${feedback.type}`} role="alert">
                {feedback.message}
              </div>
            )}

            <div className="settings-body">
              <div className="shop-grid" role="list">
                {CARD_SKINS.map(skin => (
                  <div
                    key={skin.id}
                    className={`shop-skin-item ${isActive(skin.id) ? 'shop-skin-active' : ''} ${isOwned(skin.id) ? 'shop-skin-owned' : ''}`}
                    role="listitem"
                  >
                    <SkinPreview skin={skin} isActive={isActive(skin.id)} />
                    <div className="shop-skin-info">
                      <span className="shop-skin-name">{skin.name}</span>
                      <span className="shop-skin-desc">{skin.description}</span>
                    </div>
                    <div className="shop-skin-action">
                      {skin.price === 0 ? (
                        <button
                          className={`setting-chip ${isActive(skin.id) ? 'setting-chip-active' : ''}`}
                          onClick={() => handleSelect(skin.id)}
                          aria-pressed={isActive(skin.id)}
                        >
                          {isActive(skin.id) ? 'Equipped' : 'Equip'}
                        </button>
                      ) : isOwned(skin.id) ? (
                        <button
                          className={`setting-chip ${isActive(skin.id) ? 'setting-chip-active' : ''}`}
                          onClick={() => handleSelect(skin.id)}
                          aria-pressed={isActive(skin.id)}
                        >
                          {isActive(skin.id) ? 'Equipped' : 'Equip'}
                        </button>
                      ) : (
                        <button
                          className="shop-buy-btn"
                          onClick={() => handlePurchase(skin)}
                          disabled={chips < skin.price}
                          aria-label={`Buy ${skin.name} for $${skin.price}`}
                        >
                          <span className="chip-coin">$</span>{skin.price}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

/** Hook to get the currently active skin for rendering */
export function useActiveCardSkin(): CardSkin {
  const [skinState] = useState<CardSkinState>(loadCardSkinState)
  // Re-read on each render to stay in sync with shop purchases
  const state = loadCardSkinState()
  return getSkinById(state.activeSkinId) ?? CARD_SKINS[0]
}
