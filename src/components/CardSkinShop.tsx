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
  getSkinsByTier,
  getCollectionStats,
  ACHIEVEMENT_SKIN_REWARDS,
  type CardSkinState,
  type CardSkin,
  type SkinTier,
} from '../utils/cardSkinShop'

interface CardSkinShopProps {
  chips: number
  onDeductChips: (amount: number) => void
}

const TIER_CONFIG: Record<SkinTier, { label: string; className: string; icon: string }> = {
  common: { label: 'Common', className: 'tier-common', icon: '\u25CF' },
  rare: { label: 'Rare', className: 'tier-rare', icon: '\u25C6' },
  epic: { label: 'Epic', className: 'tier-epic', icon: '\u2726' },
  legendary: { label: 'Legendary', className: 'tier-legendary', icon: '\u2605' },
}

function SkinPreview({ skin, isActive, isOwned }: { skin: CardSkin; isActive: boolean; isOwned: boolean }) {
  const tierGlowMap: Record<SkinTier, string | undefined> = {
    common: undefined,
    rare: `0 0 12px ${skin.glowColor !== 'transparent' ? skin.glowColor : 'rgba(96,165,250,0.2)'}`,
    epic: `0 0 14px ${skin.glowColor !== 'transparent' ? skin.glowColor : 'rgba(192,132,252,0.3)'}`,
    legendary: `0 0 18px ${skin.glowColor !== 'transparent' ? skin.glowColor : 'rgba(251,191,36,0.4)'}`,
  }

  return (
    <div className="skin-preview-card" style={{ background: skin.previewGradient }}>
      <div
        className={`skin-preview-mini-card ${!isOwned ? 'skin-preview-locked' : ''}`}
        style={{
          borderColor: skin.borderColor !== 'transparent' ? skin.borderColor : 'rgba(170,160,140,0.5)',
          boxShadow: isOwned ? tierGlowMap[skin.tier] : undefined,
          filter: skin.faceFilter !== 'none' ? skin.faceFilter : undefined,
        }}
      >
        <span className="skin-preview-rank" style={{ color: skin.previewAccent }}>K</span>
        <span className="skin-preview-suit" style={{ color: skin.previewAccent }}>{'\u2660'}</span>
      </div>
      <div className="skin-env-swatch" style={{ background: `linear-gradient(135deg, ${skin.environment.feltDark}, ${skin.environment.feltLight})` }} title="Table theme" />
      {isActive && <span className="skin-active-badge">Active</span>}
      {!isOwned && <div className="skin-lock-overlay"><span className="skin-lock-icon">{'\uD83D\uDD12'}</span></div>}
    </div>
  )
}

function CollectionProgress({ owned, total, byTier }: ReturnType<typeof getCollectionStats>) {
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0
  return (
    <div className="shop-collection">
      <div className="shop-collection-header">
        <span className="shop-collection-label">Collection</span>
        <span className="shop-collection-count">{owned}/{total}</span>
      </div>
      <div className="shop-collection-bar">
        <div className="shop-collection-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="shop-collection-tiers">
        {(['common', 'rare', 'epic', 'legendary'] as const).map(tier => {
          const t = byTier[tier]
          const cfg = TIER_CONFIG[tier]
          return (
            <span key={tier} className={`shop-collection-tier ${cfg.className}`}>
              {cfg.icon} {t.owned}/{t.total}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function PriceProgressBar({ price, chips }: { price: number; chips: number }) {
  if (chips >= price) return null
  const pct = Math.min(100, Math.round((chips / price) * 100))
  return (
    <div className="shop-price-progress" title={`${pct}% saved — need $${(price - chips).toLocaleString()} more`}>
      <div className="shop-price-progress-fill" style={{ width: `${pct}%` }} />
      <span className="shop-price-progress-text">{pct}%</span>
    </div>
  )
}

function getAchievementRewardForSkin(skinId: string) {
  return ACHIEVEMENT_SKIN_REWARDS.find(r => r.skinId === skinId)
}

/** Mini face card gallery strip showing J/Q/K themed preview */
function FaceCardGallery({ skin }: { skin: CardSkin }) {
  const palette = skin.faceCardPalette.red
  const ranks = ['J', 'Q', 'K'] as const
  return (
    <div className="shop-face-gallery">
      {ranks.map(rank => (
        <div
          key={rank}
          className="shop-face-mini"
          style={{
            borderColor: skin.borderColor !== 'transparent' ? skin.borderColor : 'rgba(170,160,140,0.5)',
            background: `linear-gradient(155deg, #fffef8, #f0ece2)`,
          }}
        >
          <span className="shop-face-mini-rank" style={{ color: palette.ink }}>{rank}</span>
          <div className="shop-face-mini-swatch" style={{ background: palette.clothing }} />
          <div className="shop-face-mini-accent" style={{ background: palette.gold }} />
        </div>
      ))}
      <span className="shop-face-gallery-label">Face cards</span>
    </div>
  )
}

export default function CardSkinShop({ chips, onDeductChips }: CardSkinShopProps) {
  const [open, setOpen] = useState(false)
  const [skinState, setSkinState] = useState<CardSkinState>(loadCardSkinState)
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Clean up timers
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
      if (unlockTimer.current) clearTimeout(unlockTimer.current)
    }
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
    setJustUnlocked(skin.id)
    if (unlockTimer.current) clearTimeout(unlockTimer.current)
    unlockTimer.current = setTimeout(() => setJustUnlocked(null), 2000)
    showFeedback(`Unlocked ${skin.name}! ${skin.flavorText}`, 'success')
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

  const skinsByTier = getSkinsByTier()
  const collectionStats = getCollectionStats(skinState.unlockedSkins)

  const renderTierSection = (tier: SkinTier, skins: CardSkin[]) => {
    if (skins.length === 0) return null
    const cfg = TIER_CONFIG[tier]
    return (
      <div key={tier} className={`shop-tier-section ${cfg.className}`}>
        <div className="shop-tier-header">
          <span className={`shop-tier-icon ${cfg.className}`}>{cfg.icon}</span>
          <span className="shop-tier-title">{cfg.label}</span>
          <span className="shop-tier-count">{collectionStats.byTier[tier].owned}/{collectionStats.byTier[tier].total}</span>
        </div>
        <div className="shop-tier-items" role="list">
          {skins.map(skin => {
            const achievementReward = getAchievementRewardForSkin(skin.id)
            const owned = isOwned(skin.id)
            const active = isActive(skin.id)
            const wasJustUnlocked = justUnlocked === skin.id

            return (
              <div
                key={skin.id}
                className={`shop-skin-item ${active ? 'shop-skin-active' : ''} ${owned ? 'shop-skin-owned' : 'shop-skin-locked'} ${cfg.className} ${wasJustUnlocked ? 'shop-skin-just-unlocked' : ''}`}
                role="listitem"
              >
                <SkinPreview skin={skin} isActive={active} isOwned={owned} />
                <div className="shop-skin-info">
                  <div className="shop-skin-name-row">
                    <span className="shop-skin-name">{skin.name}</span>
                    <span className={`shop-tier-badge ${cfg.className}`}>{cfg.label}</span>
                  </div>
                  <span className="shop-skin-desc">{skin.description}</span>
                  {!owned && skin.flavorText && (
                    <span className="shop-skin-flavor">&ldquo;{skin.flavorText}&rdquo;</span>
                  )}
                  {skin.shopNote && !owned && (
                    <span className="shop-skin-note">{skin.shopNote}</span>
                  )}
                  {skin.unlockHint && !owned && !achievementReward && (
                    <span className="shop-unlock-hint">{'\uD83C\uDFAF'} {skin.unlockHint}</span>
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
                  {!owned && skin.price > 0 && (
                    <PriceProgressBar price={skin.price} chips={chips} />
                  )}
                  {owned && <FaceCardGallery skin={skin} />}
                </div>
                <div className="shop-skin-action">
                  {skin.price === 0 || owned ? (
                    <button
                      className={`setting-chip ${active ? 'setting-chip-active' : ''}`}
                      onClick={() => handleSelect(skin.id)}
                      aria-pressed={active}
                    >
                      {active ? 'Equipped' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      className={`shop-buy-btn ${tier === 'legendary' ? 'shop-buy-btn-legendary' : tier === 'epic' ? 'shop-buy-btn-epic' : ''}`}
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
    )
  }

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
              <CollectionProgress {...collectionStats} />

              {(['common', 'rare', 'epic', 'legendary'] as const).map(tier =>
                renderTierSection(tier, skinsByTier[tier])
              )}
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
