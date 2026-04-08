import { createContext, useContext, useEffect, useRef, useState } from 'react'
import './Card.css'
import type { Card as CardType, Suit, Rank } from '../types'
import { loadCardSkinState, getSkinById, CARD_SKINS, type CardSkin, type CardBackDesign } from '../utils/cardSkinShop'
import { getEffectiveFilterCaps } from '../config/designTokens'
import type { FaceRank } from './canvasCharacterArt'

/** Map suit names to single-letter codes used by cardsJS SVG filenames */
const SUIT_TO_CODE: Record<Suit, string> = {
  clubs: 'C', diamonds: 'D', hearts: 'H', spades: 'S',
}

/** Map rank to cardsJS filename prefix */
const RANK_TO_FILENAME: Record<Rank, string> = {
  'A': 'A', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
  '7': '7', '8': '8', '9': '9', '10': 'T',
  'J': 'J', 'Q': 'Q', 'K': 'K',
}

/** Get the public SVG asset URL for a given card */
function getCardAssetUrl(card: CardType): string {
  const rank = RANK_TO_FILENAME[card.rank]
  const suit = SUIT_TO_CODE[card.suit]
  return `/cards/${rank}${suit}.svg`
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
}

const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
}

/* All card rendering uses cardsJS SVG assets as base, with Canvas 2D art overlays for premium skins */


/** Context for overriding the active skin (used by audit/preview pages) */
const SkinOverrideContext = createContext<CardSkin | null>(null)

/** Wrap cards in this provider to force a specific skin without localStorage */
export function SkinOverrideProvider({ skin, children }: { skin: CardSkin; children: React.ReactNode }) {
  return <SkinOverrideContext.Provider value={skin}>{children}</SkinOverrideContext.Provider>
}

function getActiveSkin(): CardSkin {
  const state = loadCardSkinState()
  return getSkinById(state.activeSkinId) ?? CARD_SKINS[0]
}

function useActiveSkin(): CardSkin {
  const override = useContext(SkinOverrideContext)
  if (override) return override
  return getActiveSkin()
}

/* ── Canvas Overlay and Canvas Art removed — all cards now use cardsJS SVG assets ── */

/* ── Canvas Frame dispatcher — routes to skin-specific frame ── */
function CanvasFrame({ skinId }: { skinId: string }) {
  switch (skinId) {
    case 'classic': return <ClassicFrame />
    case 'neon-nights': return <NeonFrame />
    case 'velvet-noir': return <VelvetNoirFrame />
    case 'sakura-bloom': return <SakuraBloomFrame />
    case 'blood-moon': return <BloodMoonFrame />
    case 'gilded-serpent': return <GildedSerpentFrame />
    case 'shadow-dynasty': return <ShadowDynastyFrame />
    case 'solar-pharaoh': return <SolarPharaohFrame />
    case 'celestial': return <CelestialFrame />
    case 'dragons-hoard': return <DragonsHoardFrame />
    case 'diamond-dynasty': return <DiamondDynastyFrame />
    case 'royal-gold': return <RoyalGoldFrame />
    case 'midnight-purple': return <MidnightPurpleFrame />
    case 'arctic-frost': return <ArcticFrostFrame />
    case 'emerald-fortune': return <EmeraldFortuneFrame />
    case 'crimson-flame': return <CrimsonFlameFrame />
    default: return null
  }
}

/* ── Velvet Noir overlay — venetian blind shadows, film grain ── */
function VelvetNoirOverlay() {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      <g className="vn-blinds">
        {[0, 60, 120, 180, 240, 300, 360].map((y, i) => (
          <rect key={i} x="0" y={y} width="300" height="25" fill="rgba(255,240,200,0.04)" />
        ))}
      </g>
      <path d="M250,380 Q260,340 245,300 Q255,260 240,220" stroke="#D4D4D4" strokeWidth="1" fill="none" opacity="0.06" className="vn-smoke" />
    </svg>
  )
}

function VelvetNoirFrame() {
  return (
    <>
      <rect x="6" y="6" width="288" height="408" rx="8" fill="none" stroke="#D4D4D4" strokeWidth="1" opacity="0.15" />
      <rect x="10" y="10" width="280" height="400" rx="6" fill="none" stroke="#9B111E" strokeWidth="0.5" opacity="0.1" />
    </>
  )
}

/* ── Sakura Bloom overlay — falling petals, steam, water ripple ── */
function SakuraBloomOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      {[
        { cx: 40, cy: 60, r: 3, d: '0s' }, { cx: 120, cy: 100, r: 2.5, d: '1.5s' },
        { cx: 200, cy: 40, r: 3, d: '0.8s' }, { cx: 260, cy: 80, r: 2, d: '2.2s' },
        { cx: 80, cy: 200, r: 2.5, d: '3s' }, { cx: 230, cy: 160, r: 3, d: '1s' },
      ].map((p, i) => (
        <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.r} ry={p.r * 0.5}
          fill="#FFB7C5" opacity="0.5" className="sb-petal"
          style={{ animationDelay: p.d }} transform={`rotate(${i * 30}, ${p.cx}, ${p.cy})`} />
      ))}
      {rank === 'Q' && (
        <>
          <path d="M145,280 Q142,260 146,240" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.1" className="sb-steam" />
          <path d="M155,280 Q158,255 153,235" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.08" className="sb-steam" style={{ animationDelay: '1s' }} />
        </>
      )}
      {rank === 'J' && (
        <ellipse cx="150" cy="370" rx="40" ry="5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" className="sb-ripple" />
      )}
    </svg>
  )
}

function SakuraBloomFrame() {
  return (
    <>
      <rect x="6" y="6" width="288" height="408" rx="8" fill="none" stroke="#FFB7C5" strokeWidth="1" opacity="0.2" />
      <rect x="10" y="10" width="280" height="400" rx="6" fill="none" stroke="#FFD700" strokeWidth="0.5" opacity="0.12" />
    </>
  )
}

/* ── Blood Moon overlay — dust motes, moonlight shift ── */
function BloodMoonOverlay() {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      {[
        { cx: 160, cy: 120, r: 1 }, { cx: 200, cy: 180, r: 0.8 },
        { cx: 140, cy: 250, r: 1.2 }, { cx: 180, cy: 80, r: 0.7 },
        { cx: 220, cy: 300, r: 1 }, { cx: 130, cy: 350, r: 0.9 },
      ].map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#BDBDBD" opacity="0.12"
          className="bm-dust" style={{ animationDelay: `${i * 0.8}s` }} />
      ))}
      <rect x="100" y="0" width="120" height="420" fill="#8B0000" opacity="0.03" className="bm-moonshift" />
    </svg>
  )
}

function BloodMoonFrame() {
  return (
    <>
      <rect x="6" y="6" width="288" height="408" rx="8" fill="none" stroke="#424242" strokeWidth="1" opacity="0.2" />
      <rect x="10" y="10" width="280" height="400" rx="6" fill="none" stroke="#8B0000" strokeWidth="0.5" opacity="0.1" />
    </>
  )
}

/* ── Gilded Serpent overlay — cobra breathing, eye glow, living border ── */
function GildedSerpentOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      <defs>
        <filter id="gs-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {rank === 'Q' && (
        <>
          <circle cx="142" cy="137" r="4" fill="#046A38" opacity="0.3" filter="url(#gs-glow)" className="gs-eye-glow" />
          <circle cx="158" cy="137" r="4" fill="#046A38" opacity="0.3" filter="url(#gs-glow)" className="gs-eye-glow" style={{ animationDelay: '0.3s' }} />
        </>
      )}
      {rank === 'J' && (
        <ellipse cx="92" cy="115" rx="10" ry="13" fill="none" stroke="#D4A017" strokeWidth="0.5" opacity="0.2" className="gs-hood-breathe" />
      )}
      {rank === 'K' && (
        <>
          <path d="M75,200 Q65,240 75,280" stroke="#D4A017" strokeWidth="1" fill="none" opacity="0.15" className="gs-serpent-shift" />
          <path d="M225,200 Q235,240 225,280" stroke="#D4A017" strokeWidth="1" fill="none" opacity="0.15" className="gs-serpent-shift" style={{ animationDelay: '2s' }} />
        </>
      )}
      <rect x="4" y="4" width="292" height="412" rx="8" fill="none"
        stroke="#D4A017" strokeWidth="2" opacity="0.3" className="gs-living-border"
        strokeDasharray="8 4" />
    </svg>
  )
}

function GildedSerpentFrame() {
  return (
    <>
      <rect x="6" y="6" width="288" height="408" rx="8" fill="none" stroke="#D4A017" strokeWidth="1.5" opacity="0.25" />
      <rect x="10" y="10" width="280" height="400" rx="6" fill="none" stroke="#046A38" strokeWidth="0.5" opacity="0.15" />
    </>
  )
}

/* ── Classic frame — thin engraved border ── */
function ClassicFrame() {
  return (
    <>
      <rect x="6" y="6" width="288" height="408" rx="8"
        fill="none" stroke="#8B7355" strokeWidth="1.5" opacity="0.3" />
      <rect x="10" y="10" width="280" height="400" rx="6"
        fill="none" stroke="#D4C5A0" strokeWidth="0.5" opacity="0.2" />
    </>
  )
}

/* ── Neon Nights frame — inner neon border with glow ── */
function NeonFrame() {
  return (
    <>
      <defs>
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="6" y="6" width="288" height="408" rx="8"
        fill="none" stroke="#00E5FF" strokeWidth="1.5"
        className="neon-border-flicker"
        filter="url(#neon-glow)" />
    </>
  )
}

/* ── Neon Nights SVG Overlay — rain, data fragments, eye glow ── */
function NeonNightsOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      <defs>
        <filter id="nn-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Rain lines */}
      <g className="nn-rain">
        <line x1="42" y1="0" x2="42" y2="420" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.12" />
        <line x1="98" y1="30" x2="98" y2="450" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.08" />
        <line x1="155" y1="15" x2="155" y2="435" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.10" />
        <line x1="210" y1="45" x2="210" y2="465" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.06" />
        <line x1="248" y1="20" x2="248" y2="440" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.09" />
        <line x1="275" y1="35" x2="275" y2="455" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.07" />
      </g>
      {/* Rank-specific overlays */}
      {rank === 'Q' && (
        <>
          {/* Cybernetic eye — layered glow for stronger read */}
          <circle cx="192" cy="118" r="8" fill="#00E5FF" opacity="0.08"
            filter="url(#nn-glow)" />
          <circle cx="192" cy="118" r="5" fill="#00E5FF" opacity="0.4"
            filter="url(#nn-glow)" className="nn-eye-glow" />
          <circle cx="192" cy="118" r="2" fill="#00E5FF" opacity="0.6" />
          {/* Data text fragments streaming from cyber eye */}
          <text x="210" y="115" fill="#00E5FF" fontSize="6" opacity="0.4" className="nn-data-drift">0xF4</text>
          <text x="220" y="105" fill="#00E5FF" fontSize="5" opacity="0.3" className="nn-data-drift" style={{ animationDelay: '1s' }}>SYNC</text>
          <text x="205" y="128" fill="#00E5FF" fontSize="5" opacity="0.35" className="nn-data-drift" style={{ animationDelay: '2s' }}>//OK</text>
          <text x="225" y="122" fill="#00E5FF" fontSize="4" opacity="0.25" className="nn-data-drift" style={{ animationDelay: '0.5s' }}>AUTH</text>
          {/* Visor scan-line across forehead area */}
          <line x1="130" y1="92" x2="175" y2="92" stroke="#00E5FF" strokeWidth="1" opacity="0.15" />
          {/* Tablet ambient glow — soft uplighting from held tablet */}
          <ellipse cx="240" cy="220" rx="30" ry="20" fill="#00E5FF" opacity="0.06" />
        </>
      )}
      {rank === 'K' && (
        <>
          {/* Wireframe building flicker over hologram area */}
          <rect x="195" y="155" width="12" height="25" fill="none"
            stroke="#00E5FF" strokeWidth="0.5" opacity="0.3" className="nn-holo-flicker" />
          <rect x="210" y="160" width="8" height="20" fill="none"
            stroke="#00E5FF" strokeWidth="0.5" opacity="0.25" className="nn-holo-flicker"
            style={{ animationDelay: '0.5s' }} />
          <rect x="220" y="152" width="14" height="28" fill="none"
            stroke="#00E5FF" strokeWidth="0.5" opacity="0.35" className="nn-holo-flicker"
            style={{ animationDelay: '1s' }} />
        </>
      )}
    </svg>
  )
}

/* ── Shadow Dynasty overlays — strings, backlight flicker ── */
function ShadowDynastyOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      {/* Puppet strings swaying */}
      <line x1="100" y1="0" x2="100" y2="150" stroke="#000" strokeWidth="0.8" opacity="0.3" className="sd-string-sway" />
      <line x1="150" y1="0" x2="150" y2="120" stroke="#000" strokeWidth="0.8" opacity="0.25" className="sd-string-sway" style={{ animationDelay: '0.5s' }} />
      <line x1="200" y1="0" x2="200" y2="140" stroke="#000" strokeWidth="0.8" opacity="0.2" className="sd-string-sway" style={{ animationDelay: '1s' }} />
      {/* Backlight flicker */}
      <rect x="0" y="0" width="300" height="420" fill="#F5A623" opacity="0.03" className="sd-backlight-flicker" />
      {rank === 'K' && (
        /* Puppeteer hands grasping from above */
        <g className="sd-hands-grasp" opacity="0.15">
          <path d="M75,0 L65,40 L60,50 L65,45 L70,55 L75,42 L80,0" fill="#1A0A00" />
          <path d="M225,0 L230,40 L235,50 L232,45 L228,55 L223,42 L218,0" fill="#1A0A00" />
        </g>
      )}
    </svg>
  )
}

function ShadowDynastyFrame() {
  return (
    <rect x="4" y="4" width="292" height="412" rx="8"
      fill="none" stroke="#1A0A00" strokeWidth="3" opacity="0.3" />
  )
}

/* ── Solar Pharaoh overlays — sun rays, dust motes ── */
function SolarPharaohOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      <defs>
        <filter id="sp-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Dust motes */}
      {[80, 150, 220, 260].map((cx, i) => (
        <circle key={i} cx={cx} cy={350 - i * 40} r="1" fill="#FFD700" opacity="0.3"
          className="sp-dust-mote" style={{ animationDelay: `${i * 0.8}s` }} />
      ))}
      {rank === 'K' && (
        /* Sunburst rotation behind King */
        <g className="sp-sunburst-rotate" opacity="0.08">
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            return (
              <line key={i} x1={150 + Math.cos(angle) * 30} y1={115 + Math.sin(angle) * 30}
                x2={150 + Math.cos(angle) * 120} y2={115 + Math.sin(angle) * 120}
                stroke="#FFD700" strokeWidth="2" />
            )
          })}
        </g>
      )}
      {rank === 'Q' && (
        /* Sun disk glow pulse on Queen's crown */
        <circle cx="150" cy="80" r="8" fill="#FFD700" opacity="0.3"
          filter="url(#sp-glow)" className="sp-disk-glow" />
      )}
      {rank === 'J' && (
        /* Light beam sweep on Jack's ankh */
        <line x1="90" y1="30" x2="230" y2="190" stroke="#FFD700" strokeWidth="1.5"
          opacity="0.1" className="sp-beam-sweep" />
      )}
    </svg>
  )
}

function SolarPharaohFrame() {
  return (
    <>
      <rect x="5" y="5" width="290" height="410" rx="8"
        fill="none" stroke="#D4A017" strokeWidth="2" opacity="0.25" />
      <rect x="9" y="9" width="282" height="402" rx="6"
        fill="none" stroke="#D4A574" strokeWidth="0.5" opacity="0.15" />
    </>
  )
}

/* ── Celestial overlays — star twinkle, constellation lines, shooting star ── */
function CelestialOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      <defs>
        <filter id="cel-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Star twinkle — independent opacity */}
      {[[40, 60], [120, 30], [250, 50], [60, 200], [230, 180], [170, 350], [50, 380]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.2" fill="#FFD700" opacity="0.4"
          filter="url(#cel-glow)" className="cel-star-twinkle"
          style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
      {rank === 'K' && (
        /* Galaxy rotation in King's body */
        <circle cx="150" cy="220" r="30" fill="none" stroke="#CE93D8" strokeWidth="0.5"
          opacity="0.1" className="cel-galaxy-rotate" />
      )}
      {rank === 'Q' && (
        /* Star cape trail */
        <g className="cel-star-twinkle" style={{ animationDelay: '0.5s' }}>
          <circle cx="90" cy="200" r="1.5" fill="#FFD700" opacity="0.3" />
          <circle cx="70" cy="240" r="1" fill="#FFD700" opacity="0.25" />
          <circle cx="60" cy="280" r="1.5" fill="#FFD700" opacity="0.2" />
        </g>
      )}
    </svg>
  )
}

function CelestialFrame() {
  return (
    <rect x="6" y="6" width="288" height="408" rx="8"
      fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.15"
      strokeDasharray="4 8" className="cel-constellation-connect" />
  )
}

/* ── Dragon's Hoard overlays — smoke, treasure sparkle, egg glow ── */
function DragonsHoardOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      {/* Smoke wisps */}
      <path d="M140,380 Q135,360 140,340 Q145,320 138,300" fill="none"
        stroke="rgba(200,200,200,0.12)" strokeWidth="1.5" className="dh-smoke-drift" />
      <path d="M160,390 Q155,370 162,350 Q168,330 158,310" fill="none"
        stroke="rgba(200,200,200,0.08)" strokeWidth="1" className="dh-smoke-drift"
        style={{ animationDelay: '1.5s' }} />
      {/* Treasure sparkles */}
      {[[60, 370], [240, 380], [100, 390], [200, 400]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1" fill="#FFD700" opacity="0.3"
          className="dh-treasure-sparkle" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
      {rank === 'Q' && (
        /* Egg heartbeat glow */
        <circle cx="185" cy="260" r="10" fill="#FF6D00" opacity="0.15"
          className="dh-egg-heartbeat" />
      )}
      {rank === 'K' && (
        /* Nostril smoke + treasure sparkle */
        <path d="M145,130 Q138,120 140,108" fill="none" stroke="rgba(200,200,200,0.15)"
          strokeWidth="1" className="dh-smoke-drift" />
      )}
    </svg>
  )
}

function DragonsHoardFrame() {
  return (
    <rect x="5" y="5" width="290" height="410" rx="8"
      fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.2"
      className="dh-scale-border" />
  )
}

/* ── Diamond Dynasty overlays — prismatic sweep, facet highlights ── */
function DiamondDynastyOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      {/* Facet catch-light polygons */}
      {[[100, 150, 20], [200, 250, 15], [80, 300, 18]].map(([cx, cy, s], i) => (
        <polygon key={i}
          points={`${cx},${cy - s} ${cx + s * 0.6},${cy} ${cx},${cy + s * 0.3} ${cx - s * 0.6},${cy}`}
          fill="#FFFFFF" opacity="0.08"
          className="dd-facet-catch" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      {rank === 'K' && (
        /* Inclusion crossfade in King */
        <circle cx="145" cy="200" r="20" fill="#F57F17" opacity="0.05"
          className="dd-inclusion-shift" />
      )}
      {rank === 'J' && (
        /* Prismatic light through body */
        <rect x="100" y="100" width="100" height="250" fill="none"
          className="dd-prismatic-sweep" opacity="0.05" />
      )}
    </svg>
  )
}

function DiamondDynastyFrame() {
  return (
    <rect x="5" y="5" width="290" height="410" rx="8"
      fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.2"
      className="dd-rainbow-border" />
  )
}

/* ── Royal Gold overlay — geometric pattern, gold shimmer ── */
function RoyalGoldOverlay() {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      <defs>
        <pattern id="rg-geo" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M10,0 L20,10 L10,20 L0,10 Z" fill="none" stroke="#D4A017" strokeWidth="0.3" opacity="0.15" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="300" height="420" fill="url(#rg-geo)" className="rg-pattern" />
      <rect x="0" y="0" width="300" height="420" fill="none" className="rg-shimmer" />
    </svg>
  )
}
function RoyalGoldFrame() {
  return (
    <>
      <rect x="5" y="5" width="290" height="410" rx="8" fill="none" stroke="#D4A017" strokeWidth="2" opacity="0.25" />
      <rect x="9" y="9" width="282" height="402" rx="6" fill="none" stroke="#046A38" strokeWidth="0.5" opacity="0.15" />
    </>
  )
}

/* ── Midnight Purple overlay — smoke, spotlight ── */
function MidnightPurpleOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      <path d="M250,380 Q260,340 245,300 Q255,260 240,220" stroke="#A855F7" strokeWidth="1.5" fill="none" opacity="0.06" className="mp-smoke" />
      <path d="M230,390 Q240,350 225,310 Q235,270 220,230" stroke="#A855F7" strokeWidth="1" fill="none" opacity="0.04" className="mp-smoke" style={{ animationDelay: '2s' }} />
      <polygon points="140,0 160,0 200,420 100,420" fill="rgba(107,33,168,0.03)" className="mp-spotlight" />
      {rank === 'Q' && (
        <>
          <circle cx="150" cy="200" r="30" fill="none" stroke="#A855F7" strokeWidth="0.5" opacity="0.1" className="mp-radiate" />
          <circle cx="150" cy="200" r="50" fill="none" stroke="#A855F7" strokeWidth="0.3" opacity="0.06" className="mp-radiate" style={{ animationDelay: '0.5s' }} />
        </>
      )}
    </svg>
  )
}
function MidnightPurpleFrame() {
  return (
    <>
      <rect x="5" y="5" width="290" height="410" rx="8" fill="none" stroke="#6B21A8" strokeWidth="1.5" opacity="0.2" />
      <rect x="9" y="9" width="282" height="402" rx="6" fill="none" stroke="#FFD700" strokeWidth="0.5" opacity="0.08" />
    </>
  )
}

/* ── Arctic Frost overlay — aurora, snowflakes, ice cracks ── */
function ArcticFrostOverlay() {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      <defs>
        <linearGradient id="af-aurora" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A8E6CF" />
          <stop offset="50%" stopColor="#81D4FA" />
          <stop offset="100%" stopColor="#CE93D8" />
        </linearGradient>
      </defs>
      <rect x="0" y="10" width="300" height="30" fill="url(#af-aurora)" opacity="0.08" className="af-aurora-shift" />
      {[
        { cx: 30, cy: 50, r: 1.5, d: '0s' }, { cx: 90, cy: 120, r: 1, d: '1s' },
        { cx: 180, cy: 80, r: 1.8, d: '2s' }, { cx: 250, cy: 150, r: 1.2, d: '0.5s' },
        { cx: 60, cy: 250, r: 1, d: '3s' }, { cx: 220, cy: 300, r: 1.5, d: '1.5s' },
      ].map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#FFFFFF" opacity="0.3" className="af-snow" style={{ animationDelay: s.d }} />
      ))}
      <path d="M0,200 L50,210 L80,195" stroke="#FFFFFF" strokeWidth="0.5" fill="none" opacity="0.1" />
      <path d="M220,350 L260,340 L300,355" stroke="#FFFFFF" strokeWidth="0.5" fill="none" opacity="0.08" />
    </svg>
  )
}
function ArcticFrostFrame() {
  return (
    <>
      <rect x="5" y="5" width="290" height="410" rx="8" fill="none" stroke="#81D4FA" strokeWidth="1.5" opacity="0.2" />
      <rect x="9" y="9" width="282" height="402" rx="6" fill="none" stroke="#A8E6CF" strokeWidth="0.5" opacity="0.1" />
    </>
  )
}

/* ── Emerald Fortune overlay — equations, sparkles, monocle ── */
function EmeraldFortuneOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      {rank === 'J' && (
        <>
          <text x="90" y="90" fill="#D4A017" fontSize="5" opacity="0.15" className="ef-equation">P(21)=0.048</text>
          <text x="180" y="100" fill="#D4A017" fontSize="4" opacity="0.12" className="ef-equation" style={{ animationDelay: '1s' }}>EV=+1.2%</text>
          <text x="70" y="110" fill="#D4A017" fontSize="5" opacity="0.1" className="ef-equation" style={{ animationDelay: '2s' }}>TC=+3</text>
        </>
      )}
      {rank === 'Q' && [0, 1, 2, 3, 4].map(i => (
        <circle key={i} cx={195 + Math.cos((i / 5) * Math.PI * 2) * 8} cy={250 + Math.sin((i / 5) * Math.PI * 2) * 3}
          r="1" fill="#FFFFFF" opacity="0.3" className="ef-sparkle" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
      {rank === 'K' && <circle cx="165" cy="140" r="2" fill="#FFFFFF" opacity="0.2" className="ef-monocle-glint" />}
      <rect x="0" y="0" width="300" height="420" fill="none" className="ef-deco-shimmer" />
    </svg>
  )
}
function EmeraldFortuneFrame() {
  return (
    <>
      <rect x="5" y="5" width="290" height="410" rx="8" fill="none" stroke="#D4A017" strokeWidth="1.5" opacity="0.2" />
      <rect x="9" y="9" width="282" height="402" rx="6" fill="none" stroke="#046A38" strokeWidth="1" opacity="0.15" />
    </>
  )
}

/* ── Crimson Flame overlay — ember particles, chart pulses, clock hand tick, throne break ── */
function CrimsonFlameOverlay({ rank }: { rank: FaceRank }) {
  return (
    <svg className="card__overlay" viewBox="0 0 300 420">
      <defs>
        <filter id="cf-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Ember particles rising — shared across all ranks */}
      {[
        { cx: 60, cy: 360, d: '0s' }, { cx: 140, cy: 380, d: '1.2s' },
        { cx: 210, cy: 350, d: '0.6s' }, { cx: 260, cy: 370, d: '2s' },
        { cx: 100, cy: 390, d: '1.8s' }, { cx: 180, cy: 340, d: '0.3s' },
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={1 + (i % 3) * 0.5}
          fill={i % 2 === 0 ? '#FF6B35' : '#FFF8E1'} opacity="0.4"
          className="cf-ember-rise"
          style={{ animationDelay: p.d }} />
      ))}
      {/* Jack: chart line pulse */}
      {rank === 'J' && (
        <line x1="40" y1="345" x2="260" y2="330" stroke="#FFF8E1" strokeWidth="0.8"
          opacity="0.2" className="cf-chart-pulse" />
      )}
      {/* Queen: clock hand tick */}
      {rank === 'Q' && (
        <line x1="150" y1="175" x2="135" y2="130" stroke="#FFD700" strokeWidth="1"
          opacity="0.3" className="cf-clock-tick" filter="url(#cf-glow)" />
      )}
      {/* King: throne edge particle break */}
      {rank === 'K' && (
        <>
          <circle cx="90" cy="180" r="1.5" fill="#FF6B35" opacity="0.5" className="cf-throne-break" />
          <circle cx="210" cy="190" r="1.5" fill="#FFF8E1" opacity="0.4" className="cf-throne-break" style={{ animationDelay: '0.5s' }} />
          <circle cx="88" cy="280" r="1" fill="#FFD700" opacity="0.5" className="cf-throne-break" style={{ animationDelay: '1s' }} />
          <circle cx="212" cy="270" r="1" fill="#FF6B35" opacity="0.4" className="cf-throne-break" style={{ animationDelay: '1.5s' }} />
        </>
      )}
      {/* Ace: core pulse glow */}
      {rank === 'A' && (
        <circle cx="150" cy="210" r="15" fill="#FFF8E1" opacity="0.15"
          filter="url(#cf-glow)" className="cf-core-pulse" />
      )}
    </svg>
  )
}

function CrimsonFlameFrame() {
  return (
    <>
      <defs>
        <filter id="cf-frame-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="6" y="6" width="288" height="408" rx="8"
        fill="none" stroke="#8B0000" strokeWidth="1.5" opacity="0.25" />
      <rect x="10" y="10" width="280" height="400" rx="6"
        fill="none" stroke="#FF6B35" strokeWidth="0.5" opacity="0.15"
        filter="url(#cf-frame-glow)" />
    </>
  )
}

/** Asset-based card face — renders the full card as a public domain SVG image */
function AssetCardFace({ card }: { card: CardType }) {
  const assetUrl = getCardAssetUrl(card)
  return (
    <div className="card card-face asset-card-face" aria-label={`${card.rank} of ${card.suit}`}>
      <img
        className="asset-card-img"
        src={assetUrl}
        alt={`${card.rank} of ${card.suit}`}
        draggable={false}
      />
    </div>
  )
}

/**
 * Themed Asset Card Face — uses Standard deck SVGs as base art with
 * skin-specific CSS filter treatment and SVG overlays on top.
 * This gives themed skins the same line quality and illustration detail
 * as the Standard deck while preserving each skin's unique identity.
 */
function ThemedAssetCardFace({ card }: { card: CardType }) {
  const assetUrl = getCardAssetUrl(card)
  const skin = useActiveSkin()
  const skinId = skin.id

  return (
    <div className={`card card-face themed-asset-card skin--${skinId}`} aria-label={`${card.rank} of ${card.suit}`}>
      {/* z-1: Standard SVG card art with CSS filter color treatment */}
      <img
        className="themed-asset-img"
        src={assetUrl}
        alt={`${card.rank} of ${card.suit}`}
        draggable={false}
      />
      {/* z-2: Color tint overlay for atmosphere */}
      <div className="themed-asset-tint" />
      {/* z-3: Card frame (skin-specific border) */}
      <svg className="card__frame" viewBox="0 0 300 420">
        <CanvasFrame skinId={skinId} />
      </svg>
      {/* z-5: Animation FX layer */}
      <div className="card__fx" />
    </div>
  )
}

function CardFace({ card }: { card: CardType }) {
  const skin = useActiveSkin()

  // Standard skin: render cardsJS SVG assets directly
  if (skin.id === 'standard') {
    return <AssetCardFace card={card} />
  }

  // All themed skins use cardsJS SVG base with skin-specific CSS treatment
  return <ThemedAssetCardFace card={card} />
}

/* ── Skin-aware card back pattern renderers ── */
function PatternFill({ pid, c }: { pid: string; c: CardBackDesign }) {
  switch (c.patternStyle) {
    case 'circuit':
      return (
        <pattern id={`${pid}-main`} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="transparent" />
          <path d="M0,8 L6,8 L8,4 L10,12 L12,8 L16,8" fill="none" stroke={c.pattern} strokeWidth="0.6" />
          <path d="M8,0 L8,4 M8,12 L8,16" fill="none" stroke={c.patternAlt} strokeWidth="0.4" />
          <circle cx="8" cy="4" r="1" fill={c.accent} opacity="0.25" />
          <circle cx="8" cy="12" r="0.8" fill={c.accent} opacity="0.18" />
        </pattern>
      )
    case 'blossom':
      return (
        <pattern id={`${pid}-main`} width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="transparent" />
          <circle cx="10" cy="10" r="3" fill={c.pattern} />
          <path d="M10,7 Q8,5 10,3 Q12,5 10,7" fill={c.accent} opacity="0.2" />
          <path d="M13,10 Q15,8 17,10 Q15,12 13,10" fill={c.accent} opacity="0.15" />
          <path d="M10,13 Q12,15 10,17 Q8,15 10,13" fill={c.accent} opacity="0.2" />
          <path d="M7,10 Q5,12 3,10 Q5,8 7,10" fill={c.accent} opacity="0.15" />
          <circle cx="10" cy="10" r="1" fill={c.accentLight} opacity="0.3" />
        </pattern>
      )
    case 'damask':
      return (
        <pattern id={`${pid}-main`} width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="transparent" />
          <path d="M9,0 Q13,4.5 9,9 Q5,4.5 9,0" fill="none" stroke={c.pattern} strokeWidth="0.6" />
          <path d="M9,9 Q13,13.5 9,18 Q5,13.5 9,9" fill="none" stroke={c.patternAlt} strokeWidth="0.6" />
          <path d="M0,9 Q4.5,5 9,9 Q4.5,13 0,9" fill="none" stroke={c.pattern} strokeWidth="0.5" />
          <path d="M9,9 Q13.5,5 18,9 Q13.5,13 9,9" fill="none" stroke={c.patternAlt} strokeWidth="0.5" />
          <circle cx="9" cy="9" r="1.2" fill={c.accent} opacity="0.15" />
        </pattern>
      )
    case 'scales':
      return (
        <pattern id={`${pid}-main`} width="14" height="10" patternUnits="userSpaceOnUse">
          <rect width="14" height="10" fill="transparent" />
          <path d="M0,10 Q7,3 14,10" fill="none" stroke={c.pattern} strokeWidth="0.6" />
          <path d="M-7,5 Q0,-2 7,5" fill="none" stroke={c.patternAlt} strokeWidth="0.5" />
          <path d="M7,5 Q14,-2 21,5" fill="none" stroke={c.patternAlt} strokeWidth="0.5" />
        </pattern>
      )
    case 'stars':
      return (
        <pattern id={`${pid}-main`} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="transparent" />
          <path d="M8,2 L9.2,6 L13,6.5 L10,9 L11,13 L8,11 L5,13 L6,9 L3,6.5 L6.8,6 Z" fill="none" stroke={c.pattern} strokeWidth="0.5" />
          <circle cx="8" cy="8" r="1" fill={c.accent} opacity="0.2" />
          <circle cx="2" cy="2" r="0.5" fill={c.accent} opacity="0.12" />
          <circle cx="14" cy="14" r="0.5" fill={c.accent} opacity="0.12" />
        </pattern>
      )
    case 'crosshatch':
      return (
        <pattern id={`${pid}-main`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="transparent" />
          <line x1="0" y1="0" x2="8" y2="8" stroke={c.pattern} strokeWidth="0.7" />
          <line x1="8" y1="0" x2="0" y2="8" stroke={c.patternAlt} strokeWidth="0.7" />
        </pattern>
      )
    default: // 'scroll'
      return (
        <pattern id={`${pid}-main`} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="transparent" />
          <path d="M2,6 Q6,2 10,6 Q6,10 2,6" fill="none" stroke={c.pattern} strokeWidth="0.5" />
          <path d="M6,2 Q10,6 6,10 Q2,6 6,2" fill="none" stroke={c.patternAlt} strokeWidth="0.4" />
          <circle cx="6" cy="6" r="0.8" fill={c.accent} opacity="0.15" />
        </pattern>
      )
  }
}

function CenterLogo({ c, pid }: { c: CardBackDesign; pid: string }) {
  switch (c.centerLogo) {
    case 'flame':
      return (
        <g transform="translate(45,58)">
          <path d="M0,-14 Q-3,-8 -6,-2 Q-8,3 -5,8 Q-3,12 0,14 Q3,12 5,8 Q8,3 6,-2 Q3,-8 0,-14 Z" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.8" />
          <path d="M0,-10 Q-2,-5 -3,0 Q-4,4 -2,7 Q0,10 2,7 Q4,4 3,0 Q2,-5 0,-10 Z" fill={c.accentLight} opacity="0.3" />
          <path d="M0,-5 Q-1,0 0,5 Q1,0 0,-5 Z" fill={c.accentLight} opacity="0.2" />
        </g>
      )
    case 'sakura':
      return (
        <g transform="translate(45,58)">
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <path key={i} d={`M0,0 Q-4,-10 0,-14 Q4,-10 0,0`} fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.5" transform={`rotate(${angle})`} opacity="0.85" />
          ))}
          <circle r="3" fill={c.accentLight} opacity="0.5" />
          <circle r="1.5" fill={c.logoFill} />
        </g>
      )
    case 'eye':
      return (
        <g transform="translate(45,58)">
          <path d="M-14,0 Q-7,-10 0,-10 Q7,-10 14,0 Q7,10 0,10 Q-7,10 -14,0 Z" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.8" />
          <circle r="6" fill={c.bg2} stroke={c.logoStroke} strokeWidth="0.5" />
          <circle r="3.5" fill={c.accent} />
          <circle r="1.5" fill={c.bg2} />
          <circle cx="-1" cy="-1" r="1" fill={c.accentLight} opacity="0.5" />
        </g>
      )
    case 'serpent':
      return (
        <g transform="translate(45,58)">
          <path d="M0,-14 Q-8,-10 -10,-4 Q-12,2 -8,6 Q-4,10 0,8 Q4,10 8,6 Q12,2 10,-4 Q8,-10 0,-14 Z" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.8" />
          <path d="M-4,-6 Q0,-10 4,-6" fill="none" stroke={c.accentLight} strokeWidth="0.8" />
          <circle cx="-3" cy="-3" r="1.5" fill={c.bg2} />
          <circle cx="3" cy="-3" r="1.5" fill={c.bg2} />
          <circle cx="-3" cy="-3" r="0.7" fill={c.accent} />
          <circle cx="3" cy="-3" r="0.7" fill={c.accent} />
          <path d="M-1,4 L0,7 L1,4" fill="none" stroke={c.accentLight} strokeWidth="0.5" />
        </g>
      )
    case 'diamond':
      return (
        <g transform="translate(45,58)">
          <path d="M0,-15 L12,0 L0,15 L-12,0 Z" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.8" />
          <path d="M0,-12 L9,0 L0,12 L-9,0 Z" fill={c.accentLight} opacity="0.15" />
          <path d="M0,-8 L6,0 L0,8 L-6,0 Z" fill={c.accentLight} opacity="0.1" />
          <path d="M-12,0 L0,-6 L12,0" fill="none" stroke={c.accentLight} strokeWidth="0.4" opacity="0.3" />
        </g>
      )
    case 'moon':
      return (
        <g transform="translate(45,58)">
          <circle r="11" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.8" />
          <circle cx="4" r="9" fill={c.bg2} />
          <circle cx="-4" cy="-3" r="1" fill={c.accentLight} opacity="0.3" />
          <circle cx="-6" cy="2" r="0.6" fill={c.accentLight} opacity="0.2" />
          <circle cx="-3" cy="5" r="0.8" fill={c.accentLight} opacity="0.25" />
        </g>
      )
    case 'sun':
      return (
        <g transform="translate(45,58)">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <line key={i} x1="0" y1="-8" x2="0" y2={i % 2 === 0 ? '-14' : '-12'} stroke={c.logoFill} strokeWidth={i % 2 === 0 ? '1.2' : '0.6'} transform={`rotate(${angle})`} />
          ))}
          <circle r="7" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.8" />
          <circle r="5" fill={c.accentLight} opacity="0.2" />
          <circle cx="-1" cy="-1" r="1.5" fill={c.accentLight} opacity="0.15" />
        </g>
      )
    case 'star':
      return (
        <g transform="translate(45,58)">
          <path d="M0,-14 L3.5,-5 L13,-5 L5.5,1.5 L8,11 L0,5.5 L-8,11 L-5.5,1.5 L-13,-5 L-3.5,-5 Z" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.8" />
          <path d="M0,-9 L2,-4 L7,-4 L3,0 L4.5,5.5 L0,2.5 L-4.5,5.5 L-3,0 L-7,-4 L-2,-4 Z" fill={c.accentLight} opacity="0.2" />
        </g>
      )
    default: // 'spade'
      return (
        <g transform="translate(45,58)">
          <path d="M0,-14 C-2,-12 -10,-4 -10,2 C-10,7 -6,10 -2,10 C-0.5,10 0.5,9.5 0,8 C-0.5,9.5 0.5,10 2,10 C6,10 10,7 10,2 C10,-4 2,-12 0,-14 Z" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.8" />
          <path d="M0,-12 C-1.5,-10 -7,-4 -7,1 C-7,3 -6,4 -5,4" fill="none" stroke={c.accentLight} strokeWidth="0.5" opacity="0.3" />
          <rect x="-1.5" y="8" width="3" height="8" rx="1" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.5" />
          <path d="M-6,16 Q-3,12 0,16 Q3,12 6,16" fill="none" stroke={c.logoFill} strokeWidth="0.8" />
          <path d="M-4,17 Q-2,14 0,17 Q2,14 4,17" fill="none" stroke={c.logoFill} strokeWidth="0.4" opacity="0.5" />
        </g>
      )
  }
}

function CardBackSVG({ design }: { design: CardBackDesign }) {
  const c = design
  const pid = `cb-${c.patternStyle}-${c.centerLogo}`
  return (
    <svg viewBox="0 0 90 130" className="card-back-svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`${pid}-linen`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="transparent" />
          <line x1="0" y1="2" x2="4" y2="2" stroke={c.pattern} strokeWidth="0.3" />
          <line x1="2" y1="0" x2="2" y2="4" stroke={c.patternAlt} strokeWidth="0.3" />
        </pattern>
        <PatternFill pid={pid} c={c} />
        <pattern id={`${pid}-diamonds`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M6,0 L12,6 L6,12 L0,6 Z" fill="none" stroke={c.accent} strokeWidth="0.5" opacity="0.35" />
          <circle cx="6" cy="6" r="0.6" fill={c.accent} opacity="0.2" />
        </pattern>
        <radialGradient id={`${pid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.accent} stopOpacity="0.08" />
          <stop offset="70%" stopColor={c.accent} stopOpacity="0.02" />
          <stop offset="100%" stopColor={c.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="90" height="130" rx="12" fill={c.bg1} />
      <rect width="90" height="130" rx="12" fill={c.bg2} opacity="0.4" />
      <rect width="90" height="130" rx="12" fill={`url(#${pid}-linen)`} />
      <rect width="90" height="130" rx="12" fill={`url(#${pid}-main)`} />

      {/* Outer border */}
      <rect x="3" y="3" width="84" height="124" rx="10" fill="none" stroke={c.border} strokeWidth="1.5" />
      <rect x="4.5" y="4.5" width="81" height="121" rx="9" fill="none" stroke={c.border} strokeWidth="0.3" opacity="0.5" />

      {/* Diamond band */}
      <rect x="6" y="6" width="78" height="118" rx="8" fill={`url(#${pid}-diamonds)`} stroke={c.borderInner} strokeWidth="0.5" />

      {/* Inner frame */}
      <rect x="10" y="10" width="70" height="110" rx="6" fill="none" stroke={c.accent} strokeWidth="0.8" opacity="0.45" />
      <rect x="12" y="12" width="66" height="106" rx="5" fill="none" stroke={c.accent} strokeWidth="0.3" opacity="0.25" />

      {/* Corner ornaments */}
      {[[15, 15, ''], [75, 15, 'scale(-1,1) translate(-90,0)'], [15, 115, 'scale(1,-1) translate(0,-130)'], [75, 115, 'scale(-1,-1) translate(-90,-130)']].map(([x, y, t], i) => (
        <g key={i} opacity="0.55" transform={t as string}>
          <path d="M15,15 Q15,24 24,24" fill="none" stroke={c.accentLight} strokeWidth="1" />
          <path d="M15,15 Q15,20 20,20" fill="none" stroke={c.accentLight} strokeWidth="0.6" />
          <path d="M15,15 Q15,17 17,17" fill="none" stroke={c.accentLight} strokeWidth="0.3" />
          <circle cx="15" cy="15" r="1.8" fill={c.accent} />
          <circle cx="15" cy="15" r="0.8" fill={c.accentLight} />
        </g>
      ))}

      {/* Center glow + medallion */}
      <ellipse cx="45" cy="65" rx="26" ry="32" fill={`url(#${pid}-glow)`} />
      <ellipse cx="45" cy="65" rx="22" ry="28" fill={c.bg2} stroke={c.accent} strokeWidth="0.8" opacity="0.55" />
      <ellipse cx="45" cy="65" rx="19" ry="25" fill="none" stroke={c.accentLight} strokeWidth="0.4" opacity="0.35" />

      {/* Center logo */}
      <CenterLogo c={c} pid={pid} />

      {/* Scrollwork */}
      <g opacity="0.45">
        <path d="M28,27 Q36,22 45,27 Q54,22 62,27" fill="none" stroke={c.accentLight} strokeWidth="0.8" />
        <path d="M32,30 Q38,27 45,30 Q52,27 58,30" fill="none" stroke={c.accentLight} strokeWidth="0.5" />
        <path d="M36,32 Q40,30 45,32 Q50,30 54,32" fill="none" stroke={c.accentLight} strokeWidth="0.3" />
      </g>
      <g opacity="0.45">
        <path d="M28,103 Q36,108 45,103 Q54,108 62,103" fill="none" stroke={c.accentLight} strokeWidth="0.8" />
        <path d="M32,100 Q38,103 45,100 Q52,103 58,100" fill="none" stroke={c.accentLight} strokeWidth="0.5" />
        <path d="M36,98 Q40,100 45,98 Q50,100 54,98" fill="none" stroke={c.accentLight} strokeWidth="0.3" />
      </g>

      {/* Corner suit symbols */}
      <text x="18" y="34" fontSize="7" fill={c.accent} opacity="0.4" textAnchor="middle" fontFamily="serif">{'\u2660'}</text>
      <text x="72" y="34" fontSize="7" fill={c.accent} opacity="0.4" textAnchor="middle" fontFamily="serif">{'\u2665'}</text>
      <text x="18" y="104" fontSize="7" fill={c.accent} opacity="0.4" textAnchor="middle" fontFamily="serif">{'\u2666'}</text>
      <text x="72" y="104" fontSize="7" fill={c.accent} opacity="0.4" textAnchor="middle" fontFamily="serif">{'\u2663'}</text>
    </svg>
  )
}

function CardBack() {
  const skin = useActiveSkin()
  const skinStyle: React.CSSProperties = {}
  if (skin.id !== 'classic') {
    if (skin.glowColor !== 'transparent') skinStyle.boxShadow = `0 0 14px ${skin.glowColor}, 0 2px 4px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.16)`
  }
  return (
    <div className="card card-back" style={skinStyle}>
      <CardBackSVG design={skin.cardBackDesign} />
    </div>
  )
}

export interface CardProps {
  card: CardType
  hidden?: boolean
  index?: number
  /** Use 3D flip to reveal (for dealer hole card) */
  flipReveal?: boolean
  /** Animation style: 'deal' for initial deal, 'hit' for subsequent cards, 'none' to skip */
  animationType?: 'deal' | 'hit' | 'none'
}

const SUIT_NAMES: Record<Suit, string> = {
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
  spades: 'Spades',
}

const RANK_NAMES: Record<string, string> = {
  A: 'Ace', '2': '2', '3': '3', '4': '4', '5': '5',
  '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  J: 'Jack', Q: 'Queen', K: 'King',
}

function getCardLabel(card: CardType, hidden?: boolean): string {
  if (hidden) return 'Face-down card'
  return `${RANK_NAMES[card.rank] || card.rank} of ${SUIT_NAMES[card.suit]}`
}

function Card({ card, hidden, index, flipReveal, animationType = 'deal' }: CardProps) {
  const prevHiddenRef = useRef(hidden)
  const [isFlipping, setIsFlipping] = useState(false)

  // Detect transition from hidden -> revealed to trigger flip animation
  useEffect(() => {
    if (prevHiddenRef.current === true && hidden === false && flipReveal) {
      setIsFlipping(true)
      const timer = setTimeout(() => setIsFlipping(false), 700)
      return () => clearTimeout(timer)
    }
    prevHiddenRef.current = hidden
  }, [hidden, flipReveal])

  const animClass =
    animationType === 'deal' ? 'deal-animate' :
    animationType === 'hit' ? 'hit-animate' : ''

  const cardLabel = getCardLabel(card, hidden)
  const activeSkin = useActiveSkin()
  const caps = getEffectiveFilterCaps(activeSkin.tier)
  // Only expose tier for idle glow if device supports it
  const skinTier = caps.allowIdleGlow ? activeSkin.tier : 'common'

  // For the 3D-flip dealer hole card
  if (flipReveal) {
    const innerClass = `card-inner${!hidden ? ' flipped' : ''}${isFlipping ? ' flip-reveal' : ''}`
    return (
      <div
        className={`card-wrapper ${animClass}`}
        style={{ '--deal-i': index } as React.CSSProperties}
        role="listitem"
        aria-label={cardLabel}
        data-tier={skinTier}
      >
        <div className={innerClass}>
          {/* Front face (the actual card) - shown when not flipped */}
          <div className="card-front">
            <CardFace card={card} />
          </div>
          {/* Back face - shown when flipped (hidden) */}
          <div className="card-back-face">
            <CardBack />
          </div>
        </div>
      </div>
    )
  }

  // Standard card (no flip needed)
  if (hidden) {
    return (
      <div
        className={`card-wrapper ${animClass}`}
        style={{ '--deal-i': index } as React.CSSProperties}
        role="listitem"
        aria-label="Face-down card"
        data-tier={skinTier}
      >
        <CardBack />
      </div>
    )
  }

  return (
    <div
      className={`card-wrapper ${animClass}`}
      style={{ '--deal-i': index } as React.CSSProperties}
      role="listitem"
      aria-label={cardLabel}
      data-tier={skinTier}
    >
      <CardFace card={card} />
    </div>
  )
}

export default Card
