import React, { useState, useMemo, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import { CARD_SKINS, type CardSkin } from '../../src/utils/cardSkinShop'
import '../../src/components/Card.css'
import './audit.css'

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
type Rank = 'A' | 'J' | 'Q' | 'K'

const ALL_SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const FACE_RANKS: Rank[] = ['J', 'Q', 'K', 'A']
const RANK_LABELS: Record<Rank, string> = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' }
const SUIT_SYMBOLS: Record<Suit, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }

const TIER_COLORS: Record<string, string> = {
  common: '#888',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

/* ── Force a specific skin into localStorage so Card.tsx reads it ── */
function setActiveSkin(skinId: string) {
  localStorage.setItem('blackjack-card-skins', JSON.stringify({
    unlockedSkins: CARD_SKINS.map(s => s.id),
    activeSkinId: skinId,
  }))
}

/* ── Lazily import Card component (which reads getActiveSkin internally) ── */
/* We dynamically import to ensure each render picks up the fresh localStorage */
let CardModule: { default: React.FC<{ card: { rank: string; suit: string }; skinId?: string }> } | null = null
const cardModulePromise = import('../../src/components/Card')

/* ── Inline face card renderer ──
   Since Card.tsx's face card SVGs read from getActiveSkin() (localStorage),
   we set localStorage before each render group. React renders synchronously
   within a single commit, so this works reliably. */

function FaceCardCell({ skinId, rank, suit }: { skinId: string; rank: Rank; suit: Suit }) {
  /* Set skin before render — getActiveSkin reads it synchronously */
  setActiveSkin(skinId)

  if (!CardModule) return <div className="card-placeholder">Loading…</div>

  const CardComponent = CardModule.default
  const card = { rank, suit, faceUp: true }

  return (
    <div className="audit-card-cell">
      <CardComponent card={card as any} />
    </div>
  )
}

/* ── Skin row: shows J Q K for selected suits ── */
function SkinRow({ skin, suits, onToggleCompare, isComparing }: {
  skin: CardSkin
  suits: Suit[]
  onToggleCompare: (id: string) => void
  isComparing: boolean
}) {
  return (
    <div className={`skin-row ${isComparing ? 'comparing' : ''}`} id={`skin-${skin.id}`}>
      <div className="skin-header">
        <div className="skin-name-row">
          <span className="skin-tier-badge" style={{ background: TIER_COLORS[skin.tier] }}>
            {skin.tier}
          </span>
          <h3 className="skin-name">{skin.name}</h3>
          <button
            className={`compare-btn ${isComparing ? 'active' : ''}`}
            onClick={() => onToggleCompare(skin.id)}
            title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
          >
            {isComparing ? '★' : '☆'}
          </button>
        </div>
        <p className="skin-id">{skin.id}</p>
      </div>
      <div className="skin-cards-grid">
        {FACE_RANKS.map(rank => (
          <div key={rank} className="rank-group">
            <div className="rank-label">{RANK_LABELS[rank]}</div>
            <div className="suit-cards">
              {suits.map(suit => (
                <div key={suit} className="suit-card-wrapper">
                  <div className="suit-indicator" style={{ color: suit === 'hearts' || suit === 'diamonds' ? '#bf1b35' : '#18182e' }}>
                    {SUIT_SYMBOLS[suit]}
                  </div>
                  <FaceCardCell skinId={skin.id} rank={rank} suit={suit} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Compare panel ── */
function ComparePanel({ compareIds, suits, onClear }: {
  compareIds: string[]
  suits: Suit[]
  onClear: () => void
}) {
  if (compareIds.length < 2) return null

  const skins = compareIds.map(id => CARD_SKINS.find(s => s.id === id)!).filter(Boolean)

  return (
    <div className="compare-panel">
      <div className="compare-header">
        <h2>Compare Mode ({skins.length} skins)</h2>
        <button className="compare-clear" onClick={onClear}>Clear</button>
      </div>
      {FACE_RANKS.map(rank => (
        <div key={rank} className="compare-rank-section">
          <h3 className="compare-rank-title">{RANK_LABELS[rank]}</h3>
          <div className="compare-grid">
            {skins.map(skin => (
              <div key={skin.id} className="compare-skin-col">
                <div className="compare-skin-label">
                  <span className="skin-tier-badge small" style={{ background: TIER_COLORS[skin.tier] }}>
                    {skin.tier}
                  </span>
                  {skin.name}
                </div>
                <div className="compare-cards">
                  {suits.map(suit => (
                    <div key={suit} className="suit-card-wrapper">
                      <div className="suit-indicator" style={{ color: suit === 'hearts' || suit === 'diamonds' ? '#bf1b35' : '#18182e' }}>
                        {SUIT_SYMBOLS[suit]}
                      </div>
                      <FaceCardCell skinId={skin.id} rank={rank} suit={suit} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main App ── */
function AuditApp() {
  const [loaded, setLoaded] = useState(!!CardModule)
  const [activeSuits, setActiveSuits] = useState<Suit[]>(['hearts', 'spades'])
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [filterTier, setFilterTier] = useState<string>('all')
  const [showCompare, setShowCompare] = useState(false)

  /* Load Card component */
  React.useEffect(() => {
    cardModulePromise.then(mod => {
      CardModule = mod as any
      setLoaded(true)
    })
  }, [])

  const toggleSuit = useCallback((suit: Suit) => {
    setActiveSuits(prev => {
      if (prev.includes(suit)) {
        return prev.length > 1 ? prev.filter(s => s !== suit) : prev
      }
      return [...prev, suit]
    })
  }, [])

  const showAllSuits = useCallback(() => setActiveSuits([...ALL_SUITS]), [])

  const toggleCompare = useCallback((id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])

  const filteredSkins = useMemo(() => {
    if (filterTier === 'all') return CARD_SKINS
    return CARD_SKINS.filter(s => s.tier === filterTier)
  }, [filterTier])

  if (!loaded) {
    return <div className="loading">Loading face card components…</div>
  }

  return (
    <div className="audit-app">
      <header className="audit-header">
        <h1>Face Card Audit</h1>
        <p className="subtitle">{CARD_SKINS.length} skins — J Q K A review</p>
      </header>

      <div className="controls">
        <div className="control-group">
          <label>Suits:</label>
          <div className="suit-toggles">
            {ALL_SUITS.map(suit => (
              <button
                key={suit}
                className={`suit-toggle ${activeSuits.includes(suit) ? 'active' : ''}`}
                onClick={() => toggleSuit(suit)}
                style={{ color: suit === 'hearts' || suit === 'diamonds' ? '#bf1b35' : '#18182e' }}
              >
                {SUIT_SYMBOLS[suit]}
              </button>
            ))}
            <button className="suit-toggle all-btn" onClick={showAllSuits}>All</button>
          </div>
        </div>

        <div className="control-group">
          <label>Tier:</label>
          <div className="tier-filters">
            <button className={`tier-btn ${filterTier === 'all' ? 'active' : ''}`} onClick={() => setFilterTier('all')}>All</button>
            {['common', 'rare', 'epic', 'legendary'].map(tier => (
              <button
                key={tier}
                className={`tier-btn ${filterTier === tier ? 'active' : ''}`}
                style={filterTier === tier ? { background: TIER_COLORS[tier], color: '#fff' } : {}}
                onClick={() => setFilterTier(tier)}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label>Compare:</label>
          <button
            className={`compare-toggle ${showCompare && compareIds.length >= 2 ? 'active' : ''}`}
            onClick={() => setShowCompare(!showCompare)}
            disabled={compareIds.length < 2}
          >
            {compareIds.length >= 2 ? `Compare ${compareIds.length} skins` : 'Select 2+ skins with ☆'}
          </button>
        </div>
      </div>

      {showCompare && compareIds.length >= 2 && (
        <ComparePanel
          compareIds={compareIds}
          suits={activeSuits}
          onClear={() => { setCompareIds([]); setShowCompare(false) }}
        />
      )}

      <div className="skin-list">
        {filteredSkins.map(skin => (
          <SkinRow
            key={skin.id}
            skin={skin}
            suits={activeSuits}
            onToggleCompare={toggleCompare}
            isComparing={compareIds.includes(skin.id)}
          />
        ))}
      </div>

      <footer className="audit-footer">
        <p>Generated from source — {CARD_SKINS.length} skins, {FACE_RANKS.length} card ranks (J Q K A), {ALL_SUITS.length} suits</p>
      </footer>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<AuditApp />)
