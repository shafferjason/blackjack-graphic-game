import { useState } from 'react'
import { getSkinById, CARD_SKINS, type CardSkin } from '../utils/cardSkinShop'
import Card, { SkinOverrideProvider } from './Card'
import type { Suit, Rank } from '../types'
import './CanvasArtPreview.css'

const CANVAS_SKINS = ['classic', 'neon-nights', 'crimson-flame', 'royal-gold', 'midnight-purple', 'arctic-frost', 'emerald-fortune'] as const
const RANKS: ('J' | 'Q' | 'K' | 'A')[] = ['J', 'Q', 'K', 'A']
const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']

type ViewSize = 'gameplay' | 'medium' | 'large' | 'full'

const SIZE_CONFIG: Record<ViewSize, { label: string; width: number; height: number }> = {
  gameplay: { label: 'Gameplay (90\u00d7130)', width: 90, height: 130 },
  medium: { label: 'Medium (150\u00d7210)', width: 150, height: 210 },
  large: { label: 'Large (225\u00d7315)', width: 225, height: 315 },
  full: { label: 'Full Canvas (300\u00d7420)', width: 300, height: 420 },
}

function SkinCardGrid({ skinId, viewSize, suit }: { skinId: string; viewSize: ViewSize; suit: Suit }) {
  const skin = getSkinById(skinId) ?? CARD_SKINS[0]
  const { width, height } = SIZE_CONFIG[viewSize]

  return (
    <div className="cap-card-row">
      {RANKS.map((rank, idx) => (
        <div key={`${rank}-${suit}`} className="cap-card-slot" style={{ width, height }}>
          <SkinOverrideProvider skin={skin}>
            <Card
              card={{ suit, rank: rank as Rank, id: idx + 500 }}
              animationType="none"
              index={idx}
            />
          </SkinOverrideProvider>
        </div>
      ))}
    </div>
  )
}

export default function CanvasArtPreview({ onClose }: { onClose: () => void }) {
  const [activeSkin, setActiveSkin] = useState<typeof CANVAS_SKINS[number]>('classic')
  const [viewSize, setViewSize] = useState<ViewSize>('medium')
  const [activeSuit, setActiveSuit] = useState<Suit>('spades')

  return (
    <div className="cap-overlay" onClick={onClose}>
      <div className="cap-panel" onClick={e => e.stopPropagation()}>
        <div className="cap-header">
          <h2>Canvas 2D Character Art Preview</h2>
          <p>Canvas 2D &rarr; WebP character art pipeline — all implemented skins</p>
          <button className="cap-close" onClick={onClose}>&times; Close</button>
        </div>

        {/* Controls */}
        <div className="cap-controls">
          <div className="cap-control-group">
            <label>Skin:</label>
            {CANVAS_SKINS.map(id => (
              <button
                key={id}
                className={`cap-btn ${activeSkin === id ? 'active' : ''}`}
                onClick={() => setActiveSkin(id)}
              >
                {getSkinById(id)?.name ?? id} ({getSkinById(id)?.tier ?? ''})
              </button>
            ))}
          </div>

          <div className="cap-control-group">
            <label>Size:</label>
            {(Object.keys(SIZE_CONFIG) as ViewSize[]).map(size => (
              <button
                key={size}
                className={`cap-btn ${viewSize === size ? 'active' : ''}`}
                onClick={() => setViewSize(size)}
              >
                {SIZE_CONFIG[size].label}
              </button>
            ))}
          </div>

          <div className="cap-control-group">
            <label>Suit:</label>
            {SUITS.map(s => (
              <button
                key={s}
                className={`cap-btn ${activeSuit === s ? 'active' : ''}`}
                onClick={() => setActiveSuit(s)}
              >
                {s === 'hearts' ? '\u2665' : s === 'diamonds' ? '\u2666' : s === 'clubs' ? '\u2663' : '\u2660'} {s}
              </button>
            ))}
          </div>

        </div>

        {/* Card grid */}
        <div className="cap-grid">
          <h3 className="cap-skin-title">
            {getSkinById(activeSkin)?.name ?? activeSkin}
          </h3>

          <SkinCardGrid skinId={activeSkin} viewSize={viewSize} suit={activeSuit} />
        </div>

        {/* All suits at gameplay size */}
        <div className="cap-all-suits">
          <h3>All Suits at Gameplay Size</h3>
          {SUITS.map(suit => (
            <div key={suit} className="cap-suit-section">
              <span className="cap-suit-label">
                {suit === 'hearts' ? '\u2665' : suit === 'diamonds' ? '\u2666' : suit === 'clubs' ? '\u2663' : '\u2660'} {suit}
              </span>
              <SkinCardGrid skinId={activeSkin} viewSize="gameplay" suit={suit} />
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="cap-checklist">
          <h3>CLAUDE.md Quality Checklist</h3>
          <ul>
            <li>Character fills the canvas &mdash; no dead space</li>
            <li>Character has distinct face with expression (eyes, eyebrows, mouth, nose)</li>
            <li>Body type matches rank (Jack=lean/dynamic, Queen=elegant, King=massive)</li>
            <li>Character holds/wears unique prop</li>
            <li>Background has environment, atmosphere, lighting</li>
            <li>Light source consistent with highlights/shadows</li>
            <li>Color palette matches skin specification</li>
            <li>SVG overlays implemented per skin spec (Neon: rain, border flicker, data fragments)</li>
            <li>CSS animations running (deal, idle, win as specified)</li>
            <li>Card reads clearly at 90\u00d7130px gameplay size</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
