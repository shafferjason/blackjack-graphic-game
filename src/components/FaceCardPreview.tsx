import { useState } from 'react'
import Card from './Card'
import type { Suit, Rank } from '../types'
import './FaceCardPreview.css'

const FACE_RANKS: Rank[] = ['J', 'Q', 'K']
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']

type PreviewSize = 'small' | 'medium' | 'large'

const SIZE_LABELS: Record<PreviewSize, string> = {
  small: 'Small (gameplay default)',
  medium: 'Medium (1.5×)',
  large: 'Large (2.25×)',
}

const SIZE_SCALES: Record<PreviewSize, number> = {
  small: 1,
  medium: 1.5,
  large: 2.25,
}

export default function FaceCardPreview({ onClose }: { onClose: () => void }) {
  const [activeSuit, setActiveSuit] = useState<Suit>('spades')

  return (
    <div className="fc-preview-overlay" role="dialog" aria-label="Face Card Preview Mode">
      <div className="fc-preview-banner">
        PREVIEW MODE — Painted Portrait Face Cards — Not Production
      </div>

      <div className="fc-preview-panel">
        <div className="fc-preview-header">
          <h2>Face Card Rendering Preview</h2>
          <p>Crisp SVG frame with pre-rendered painted portrait region at gameplay scale</p>
          <button className="fc-preview-close" onClick={onClose} aria-label="Close preview">
            ✕ Close Preview
          </button>
        </div>

        <div className="fc-preview-suit-selector">
          {SUITS.map(suit => (
            <button
              key={suit}
              className={`fc-suit-btn ${activeSuit === suit ? 'active' : ''}`}
              onClick={() => setActiveSuit(suit)}
            >
              {suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : suit === 'clubs' ? '♣' : '♠'}
              {' '}{suit}
            </button>
          ))}
        </div>

        {(['small', 'medium', 'large'] as PreviewSize[]).map(size => (
          <div key={size} className="fc-preview-size-row">
            <h3 className="fc-size-label">{SIZE_LABELS[size]}</h3>
            <div
              className="fc-cards-row"
              style={{
                '--fc-scale': SIZE_SCALES[size],
              } as React.CSSProperties}
            >
              {FACE_RANKS.map((rank, idx) => (
                <div
                  key={`${rank}-${activeSuit}`}
                  className="fc-preview-card-slot"
                  style={{
                    width: `${90 * SIZE_SCALES[size]}px`,
                    height: `${130 * SIZE_SCALES[size]}px`,
                  }}
                >
                  <Card
                    card={{ suit: activeSuit, rank, id: idx + 100 }}
                    animationType="none"
                    index={idx}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="fc-preview-notes">
          <h3>Implementation Notes</h3>
          <ul>
            <li>Frame, rank indices, suit pips, gold ornaments: crisp resolution-independent SVG</li>
            <li>Portrait region (face, hair, garments): pre-rendered painted raster textures via SVG pattern fills</li>
            <li>Textures: 5 procedurally-generated PNG layers (canvas grain, skin paint, fabric paint, hair paint, brush overlay)</li>
            <li>All assets 100% original — legally safe, no third-party imagery</li>
            <li>GPU-cached pattern decode — no per-frame re-rasterization</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
