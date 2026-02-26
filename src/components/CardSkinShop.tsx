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
  ACHIEVEMENT_SKIN_REWARDS,
  type CardSkinState,
  type CardSkin,
} from '../utils/cardSkinShop'

interface CardSkinShopProps {
  chips: number
  onDeductChips: (amount: number) => void
}

const TIER_LABELS: Record<string, { label: string; className: string }> = {
  common: { label: 'Common', className: 'tier-common' },
  rare: { label: 'Rare', className: 'tier-rare' },
  epic: { label: 'Epic', className: 'tier-epic' },
  legendary: { label: 'Legendary', className: 'tier-legendary' },
}

function SkinPreview({ skin, isActive }: { skin: CardSkin; isActive: boolean }) {
  return (
    <div className="skin-preview-card" style={{ background: skin.previewGradient }}>
      {/* Mini card mockup with environment color bar */}
      <div
        className="skin-preview-mini-card"
        style={{
          borderColor: skin.borderColor !== 'transparent' ? skin.borderColor : 'rgba(170,160,140,0.5)',
          boxShadow: skin.glowColor !== 'transparent' ? `0 0 12px ${skin.glowColor}` : 'none',
          filter: skin.faceFilter !== 'none' ? skin.faceFilter : undefined,
        }}
      >
        <span className="skin-preview-rank" style={{ color: skin.previewAccent }}>K</span>
        <span className="skin-preview-suit" style={{ color: skin.previewAccent }}>{'\u2660'}</span>
      </div>
      {/* Environment swatch */}
      <div className="skin-env-swatch" style={{ background: `linear-gradient(135deg, ${skin.environment.feltDark}, ${skin.environment.feltLight})` }} title="Table theme" />
      {isActive && <span className="skin-active-badge">Active</span>}
    </div>
  )
}

function getAchievementRewardForSkin(skinId: string) {
  return ACHIEVEMENT_SKIN_REWARDS.find(r => r.skinId === skinId)
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

  // Re-read skin state whenever the shop opens (picks up achievement grants)
  useEffect(() => {
    if (open) setSkinState(loadCardSkinState())
  }, [open])

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
                {CARD_SKINS.map(skin => {
                  const tier = skin.tier ? TIER_LABELS[skin.tier] : null
                  const achievementReward = getAchievementRewardForSkin(skin.id)
                  const owned = isOwned(skin.id)
                  const active = isActive(skin.id)

                  return (
                    <div
                      key={skin.id}
                      className={`shop-skin-item ${active ? 'shop-skin-active' : ''} ${owned ? 'shop-skin-owned' : ''} ${tier ? tier.className : ''}`}
                      role="listitem"
                    >
                      <SkinPreview skin={skin} isActive={active} />
                      <div className="shop-skin-info">
                        <div className="shop-skin-name-row">
                          <span className="shop-skin-name">{skin.name}</span>
                          {tier && <span className={`shop-tier-badge ${tier.className}`}>{tier.label}</span>}
                        </div>
                        <span className="shop-skin-desc">{skin.description}</span>
                        {skin.shopNote && !owned && (
                          <span className="shop-skin-note">{skin.shopNote}</span>
                        )}
                        {achievementReward && !owned && (
                          <span className="shop-achievement-hint">
                            {'\uD83C\uDFC6'} {achievementReward.description}
                          </span>
                        )}
                        {achievementReward && owned && (
                          <span className="shop-achievement-unlocked">
                            {'\u2705'} Achievement unlocked!
                          </span>
                        )}
                      </div>
                      <div className="shop-skin-action">
                        {skin.price === 0 ? (
                          <button
                            className={`setting-chip ${active ? 'setting-chip-active' : ''}`}
                            onClick={() => handleSelect(skin.id)}
                            aria-pressed={active}
                          >
                            {active ? 'Equipped' : 'Equip'}
                          </button>
                        ) : owned ? (
                          <button
                            className={`setting-chip ${active ? 'setting-chip-active' : ''}`}
                            onClick={() => handleSelect(skin.id)}
                            aria-pressed={active}
                          >
                            {active ? 'Equipped' : 'Equip'}
                          </button>
                        ) : (
                          <button
                            className="shop-buy-btn"
                            onClick={() => handlePurchase(skin)}
                            disabled={chips < skin.price}
                            aria-label={`Buy ${skin.name} for $${skin.price.toLocaleString()}`}
                          >
                            <span className="chip-coin">$</span>{skin.price.toLocaleString()}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
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
