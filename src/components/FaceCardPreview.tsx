import { useState } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useModalStack } from '../hooks/useModalStack'
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

type ViewMode = 'current' | 'verify'

export default function FaceCardPreview({ onClose }: { onClose: () => void }) {
  const [activeSuit, setActiveSuit] = useState<Suit>('spades')
  const [viewMode, setViewMode] = useState<ViewMode>('current')
  const focusTrapRef = useFocusTrap(true)
  useModalStack(true, onClose)

  return (
    <div ref={focusTrapRef} className="fc-preview-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Face Card Preview Mode">
      <div onClick={e => e.stopPropagation()}>
      <div className="fc-preview-banner">
        PREVIEW MODE — French Portrait Face Cards — Review Build
      </div>

      <div className="fc-preview-panel">
        <div className="fc-preview-header">
          <h2>Face Card Rendering Preview</h2>
          <p>French portrait compositions at gameplay target sizes</p>
          <button className="fc-preview-close" onClick={onClose} aria-label="Close preview">
            ✕ Close Preview
          </button>
        </div>

        <div className="fc-preview-mode-selector">
          <button
            className={`fc-mode-btn ${viewMode === 'current' ? 'active' : ''}`}
            onClick={() => setViewMode('current')}
          >
            Current Cards
          </button>
          <button
            className={`fc-mode-btn ${viewMode === 'verify' ? 'active' : ''}`}
            onClick={() => setViewMode('verify')}
          >
            Verification Grid
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

        {viewMode === 'current' ? (
          <>
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
          </>
        ) : (
          <div className="fc-verify-grid">
            <h3 className="fc-size-label">All Face Cards — Verification at Gameplay Scale</h3>
            <p className="fc-verify-desc">
              All 12 face cards rendered at gameplay default size. Check that painterly texture,
              contrast, and French portrait composition are consistent across all suits.
            </p>
            {SUITS.map(suit => (
              <div key={suit} className="fc-verify-suit-row">
                <span className="fc-verify-suit-label">
                  {suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : suit === 'clubs' ? '♣' : '♠'}
                  {' '}{suit}
                </span>
                <div className="fc-cards-row">
                  {FACE_RANKS.map((rank, idx) => (
                    <div
                      key={`${rank}-${suit}`}
                      className="fc-preview-card-slot fc-verify-slot"
                      style={{ width: '90px', height: '130px' }}
                    >
                      <Card
                        card={{ suit, rank, id: idx + 200 }}
                        animationType="none"
                        index={idx}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="fc-verify-checks">
              <h4>Verification Checklist</h4>
              <ul>
                <li>Skin tones show visible paint texture variation (not flat fills)</li>
                <li>Hair regions have directional brushstroke pattern</li>
                <li>Garment fabric reads as painted cloth (not vector gradients)</li>
                <li>Canvas grain visible across card background</li>
                <li>Gold ornaments, frame borders, and rank/suit remain crisp SVG</li>
                <li>Shadow depth sufficient to model facial features at 90px width</li>
                <li>Cheek warmth and jaw contour visible without zooming</li>
                <li>Red vs black suit differentiation clear in all elements</li>
                <li>Overall impression: hand-painted French portrait, not cartoon</li>
              </ul>
            </div>
          </div>
        )}

        <div className="fc-preview-notes">
          <h3>Implementation Notes</h3>
          <ul>
            <li>Frame, rank indices, suit pips, gold ornaments: crisp resolution-independent SVG</li>
            <li>Portrait region (face, hair, garments): clip-masked painted raster textures via SVG pattern fills</li>
            <li>Textures: 5 procedurally-generated PNG layers (canvas grain, skin paint, fabric paint, hair paint, brush overlay)</li>
            <li>Region clip paths constrain textures to body zones (matching approved v4 composition)</li>
            <li>Size-aware contrast tuning via CSS media queries (stronger at small sizes)</li>
            <li>All assets 100% original — legally safe, no third-party imagery</li>
            <li>GPU-cached pattern decode — no per-frame re-rasterization</li>
          </ul>
        </div>
      </div>
      </div>
    </div>
  )
}
