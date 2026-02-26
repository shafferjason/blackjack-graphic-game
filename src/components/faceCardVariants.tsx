// ── Face Card Skin Variants ──
// Skin-specific accessory overlays for J/Q/K face cards.
// Each variant modifies headwear, clothing accents, and held props
// while sharing the base face structure for visual consistency.

import type { Suit } from '../types'

interface VariantProps {
  suit: Suit
  isRed: boolean
  gold: string
  goldDk: string
  goldLt: string
  ink: string
  clothing: string
  clothingHi: string
  accent: string
}

type FaceCardRole = 'jack' | 'queen' | 'king'

// ── Variant types ──
// 'neon' = Neon Nights cyberpunk
// 'royal' = Royal Gold baroque
// 'sakura' = Sakura Bloom Japanese
// 'pharaoh' = Solar Pharaoh Egyptian
// 'frost' = Arctic Frost ice
// 'flame' = Crimson Flame fire
// 'shadow' = Shadow Dynasty dark
// 'serpent' = Gilded Serpent mythic
export type SkinVariant = 'classic' | 'neon' | 'royal' | 'sakura' | 'pharaoh' | 'frost' | 'flame' | 'shadow' | 'serpent' | 'celestial' | 'blood-moon' | 'midnight' | 'emerald' | 'velvet' | 'diamond'

const SKIN_TO_VARIANT: Record<string, SkinVariant> = {
  'classic': 'classic',
  'neon-nights': 'neon',
  'royal-gold': 'royal',
  'sakura-bloom': 'sakura',
  'solar-pharaoh': 'pharaoh',
  'arctic-frost': 'frost',
  'crimson-flame': 'flame',
  'shadow-dynasty': 'shadow',
  'gilded-serpent': 'serpent',
  'celestial': 'celestial',
  'blood-moon': 'blood-moon',
  'midnight-purple': 'midnight',
  'emerald-fortune': 'emerald',
  'velvet-noir': 'velvet',
  'diamond-dynasty': 'diamond',
}

export function getSkinVariant(skinId: string): SkinVariant {
  return SKIN_TO_VARIANT[skinId] || 'classic'
}

// ── Jack Headwear Variants ──
export function JackHeadwearVariant({ variant, p }: { variant: SkinVariant; p: VariantProps }) {
  switch (variant) {
    case 'neon':
      return (
        <g opacity="0.9">
          {/* Cyberpunk visor */}
          <rect x="30" y="28.5" width="20" height="3.5" rx="1.5" fill={p.accent} opacity="0.7" />
          <rect x="31" y="29" width="18" height="2.5" rx="1" fill={p.accent} opacity="0.3" />
          <line x1="31" y1="30.2" x2="49" y2="30.2" stroke={p.accent} strokeWidth="0.3" opacity="0.5" />
          {/* LED trim */}
          {[33, 36, 39, 42, 45, 48].map((x, i) => (
            <circle key={i} cx={x} cy="30.2" r="0.35" fill={p.accent} opacity={0.4 + (i % 2) * 0.3} />
          ))}
        </g>
      )
    case 'sakura':
      return (
        <g opacity="0.85">
          {/* Samurai-inspired headband */}
          <rect x="27" y="18" width="26" height="2.8" rx="1" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          <circle cx="40" cy="19.4" r="2.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <path d="M39,18.5 L40,17 L41,18.5" fill={p.goldLt} opacity="0.4" />
          {/* Small cherry blossom on headband */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <path key={i} d="M40,19.4 Q39,17.5 40,16 Q41,17.5 40,19.4" fill="#f7a8c0" stroke="#e88aaa" strokeWidth="0.15" transform={`rotate(${angle},40,19.4)`} opacity="0.6" />
          ))}
        </g>
      )
    case 'pharaoh':
      return (
        <g opacity="0.85">
          {/* Nemes headdress stripes */}
          <path d="M26,22 L26,38 Q33,42 40,38 Q47,42 54,38 L54,22" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" />
          {[24, 26, 28, 30, 32].map((y, i) => (
            <line key={i} x1="27" y1={y} x2="53" y2={y} stroke={p.ink} strokeWidth="0.3" opacity="0.15" />
          ))}
          {/* Uraeus (cobra) */}
          <path d="M40,8 Q38,12 39,16" fill="none" stroke={p.gold} strokeWidth="0.8" />
          <circle cx="40" cy="7" r="1.5" fill={p.gold} />
          <circle cx="40" cy="7" r="0.5" fill={p.ink} />
        </g>
      )
    case 'frost':
      return (
        <g opacity="0.8">
          {/* Ice crown accent */}
          <path d="M30,18 L33,12 L36,17 L40,10 L44,17 L47,12 L50,18" fill="none" stroke="#88ccee" strokeWidth="0.6" opacity="0.5" />
          <path d="M33,18 L36,14 L40,12 L44,14 L47,18" fill="none" stroke="#aaddff" strokeWidth="0.3" opacity="0.3" />
          {/* Frost crystals */}
          {[34, 40, 46].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={12 + i} x2={x} y2={9 + i} stroke="#bbddff" strokeWidth="0.3" opacity="0.4" />
              <line x1={x - 1.5} y1={11 + i} x2={x + 1.5} y2={11 + i} stroke="#bbddff" strokeWidth="0.2" opacity="0.3" />
            </g>
          ))}
        </g>
      )
    case 'flame':
      return (
        <g opacity="0.8">
          {/* Fire crown effect */}
          <path d="M28,20 Q30,12 33,16 Q35,10 38,15 Q40,6 42,15 Q45,10 47,16 Q50,12 52,20" fill="none" stroke="#f0a020" strokeWidth="0.6" opacity="0.4" />
          <path d="M32,18 Q34,13 37,16 Q39,10 41,16 Q43,13 45,18" fill="none" stroke="#f08020" strokeWidth="0.3" opacity="0.3" />
        </g>
      )
    default:
      return null
  }
}

// ── Jack Prop Variants (replaces halberd) ──
export function JackPropVariant({ variant, p }: { variant: SkinVariant; p: VariantProps }) {
  switch (variant) {
    case 'neon':
      return (
        <g>
          {/* Data card / holographic tablet */}
          <rect x="58" y="30" width="8" height="12" rx="1" fill={p.accent} opacity="0.3" stroke={p.accent} strokeWidth="0.4" />
          <line x1="59.5" y1="33" x2="64.5" y2="33" stroke={p.accent} strokeWidth="0.3" opacity="0.5" />
          <line x1="59.5" y1="35" x2="63" y2="35" stroke={p.accent} strokeWidth="0.2" opacity="0.4" />
          <line x1="59.5" y1="37" x2="64" y2="37" stroke={p.accent} strokeWidth="0.2" opacity="0.35" />
          <rect x="59.5" y="39" width="3" height="1.5" rx="0.5" fill={p.accent} opacity="0.25" />
        </g>
      )
    case 'sakura':
      return (
        <g>
          {/* Katana */}
          <line x1="60" y1="22" x2="63" y2="56" stroke="#707878" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="60" y1="22" x2="63" y2="56" stroke="#c0c8c8" strokeWidth="0.3" opacity="0.3" strokeLinecap="round" />
          <rect x="58.5" y="26" width="4" height="1.5" rx="0.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" />
          {/* Falling petal */}
          <path d="M56,34 Q54,32 55,30 Q57,31 56,34" fill="#f7a8c0" opacity="0.5" />
        </g>
      )
    case 'pharaoh':
      return (
        <g>
          {/* Ankh */}
          <g transform="translate(61,30)">
            <ellipse cx="0" cy="-4" rx="2.5" ry="3" fill="none" stroke={p.gold} strokeWidth="1" />
            <line x1="0" y1="-1" x2="0" y2="12" stroke={p.gold} strokeWidth="1" />
            <line x1="-3" y1="3" x2="3" y2="3" stroke={p.gold} strokeWidth="0.8" />
          </g>
        </g>
      )
    default:
      return null
  }
}

// ── Queen Crown Variants ──
export function QueenCrownVariant({ variant, p }: { variant: SkinVariant; p: VariantProps }) {
  switch (variant) {
    case 'neon':
      return (
        <g opacity="0.85">
          {/* Holographic crown */}
          <path d="M30,20 L28,10 L33,14 L36,6 L40,12 L44,6 L47,14 L52,10 L50,20 Z" fill="none" stroke={p.accent} strokeWidth="0.8" opacity="0.6" />
          {/* Glow dots on crown points */}
          {[36, 40, 44].map((x, i) => (
            <circle key={i} cx={x} cy={6 + i * 0.5} r="1.2" fill={p.accent} opacity="0.4" />
          ))}
        </g>
      )
    case 'sakura':
      return (
        <g opacity="0.85">
          {/* Kanzashi hairpin */}
          <line x1="52" y1="22" x2="58" y2="14" stroke={p.gold} strokeWidth="0.8" />
          <circle cx="58" cy="13" r="2.5" fill="#f472b6" opacity="0.7" />
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <path key={i} d="M58,13 Q56.5,11 58,9.5 Q59.5,11 58,13" fill="#f9a8d4" opacity="0.5" transform={`rotate(${angle},58,13)`} />
          ))}
          <circle cx="58" cy="13" r="1" fill={p.gold} opacity="0.5" />
          {/* Dangling ornaments */}
          <line x1="57" y1="15" x2="56" y2="20" stroke={p.gold} strokeWidth="0.3" />
          <circle cx="56" cy="20.5" r="0.8" fill={p.gold} opacity="0.5" />
        </g>
      )
    case 'pharaoh':
      return (
        <g opacity="0.85">
          {/* Hathor crown — sun disk between horns */}
          <path d="M32,18 Q30,8 35,4 L40,8 L45,4 Q50,8 48,18" fill="none" stroke={p.gold} strokeWidth="0.8" />
          <circle cx="40" cy="6" r="4" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" />
          <circle cx="40" cy="6" r="2" fill={p.goldLt} opacity="0.3" />
        </g>
      )
    default:
      return null
  }
}

// ── Queen Prop Variants (replaces rose) ──
export function QueenPropVariant({ variant, p }: { variant: SkinVariant; p: VariantProps }) {
  switch (variant) {
    case 'neon':
      return (
        <g transform="translate(62,38)">
          {/* Floating data rose / holographic flower */}
          <circle r="3" fill={p.accent} opacity="0.25" />
          <circle r="2" fill={p.accent} opacity="0.15" />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <line key={i} x1="0" y1="-1.5" x2="0" y2="-3.5" stroke={p.accent} strokeWidth="0.4" opacity="0.5" transform={`rotate(${angle})`} />
          ))}
          <circle r="0.8" fill={p.accent} opacity="0.5" />
        </g>
      )
    case 'sakura':
      return (
        <g transform="translate(62,38)">
          {/* Cherry blossom branch */}
          <line x1="0" y1="0" x2="-2" y2="14" stroke="#5a3818" strokeWidth="0.7" strokeLinecap="round" />
          <line x1="-1" y1="5" x2="-4" y2="3" stroke="#5a3818" strokeWidth="0.4" strokeLinecap="round" />
          {/* Blossoms */}
          {[[0, -1], [-3.5, 3], [-1.5, 8]].map(([bx, by], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((angle, j) => (
                <path key={j} d={`M${bx},${by} Q${bx! - 1.5},${by! - 2} ${bx},${by! - 3} Q${bx! + 1.5},${by! - 2} ${bx},${by}`} fill="#f9a8d4" opacity="0.5" transform={`rotate(${angle},${bx},${by})`} />
              ))}
              <circle cx={bx} cy={by} r="0.6" fill={p.gold} opacity="0.4" />
            </g>
          ))}
        </g>
      )
    case 'pharaoh':
      return (
        <g transform="translate(62,38)">
          {/* Lotus flower */}
          <path d="M0,6 Q-3,2 -4,-2 Q-2,0 0,-1" fill="#e0a040" opacity="0.6" />
          <path d="M0,6 Q3,2 4,-2 Q2,0 0,-1" fill="#e0a040" opacity="0.6" />
          <path d="M0,6 Q-1,2 -1,-3 Q0,-1 1,-3 Q1,2 0,6" fill="#f0c060" opacity="0.5" />
          <line x1="0" y1="6" x2="0" y2="14" stroke="#2a5222" strokeWidth="0.7" strokeLinecap="round" />
        </g>
      )
    default:
      return null
  }
}

// ── King Crown Variants ──
export function KingCrownVariant({ variant, p }: { variant: SkinVariant; p: VariantProps }) {
  switch (variant) {
    case 'neon':
      return (
        <g opacity="0.85">
          {/* Chrome crown with energy lines */}
          <path d="M27,22 L25,10 L31,15 L36,5 L40,14 L44,5 L49,15 L55,10 L53,22 Z" fill="none" stroke={p.accent} strokeWidth="0.8" opacity="0.5" />
          {/* Energy pulses */}
          {[36, 40, 44].map((x, i) => (
            <circle key={i} cx={x} cy={5 + i * 0.5} r="1.5" fill={p.accent} opacity="0.35" />
          ))}
          <rect x="27" y="20" width="26" height="3" rx="1" fill="none" stroke={p.accent} strokeWidth="0.5" opacity="0.4" />
        </g>
      )
    case 'sakura':
      return (
        <g opacity="0.85">
          {/* Kabuto helmet crest */}
          <path d="M40,2 Q35,8 30,18 L50,18 Q45,8 40,2" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" opacity="0.7" />
          <path d="M40,4 Q37,9 34,16" fill="none" stroke={p.goldLt} strokeWidth="0.3" opacity="0.3" />
          <path d="M40,4 Q43,9 46,16" fill="none" stroke={p.goldLt} strokeWidth="0.3" opacity="0.3" />
          {/* Maedate (front crest) */}
          <path d="M38,5 L40,-2 L42,5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
        </g>
      )
    case 'pharaoh':
      return (
        <g opacity="0.85">
          {/* Double crown of Egypt (Pschent) */}
          <path d="M30,22 L28,10 Q34,4 40,2 Q46,4 52,10 L50,22 Z" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          <path d="M34,20 L34,6 Q37,2 40,1 Q43,2 46,6 L46,20" fill="#f0f0f0" opacity="0.2" />
          {/* Uraeus on crown */}
          <path d="M40,-1 Q38,2 39,5" fill="none" stroke={p.gold} strokeWidth="0.6" />
          <circle cx="40" cy="-2" r="1.2" fill={p.gold} />
        </g>
      )
    default:
      return null
  }
}

// ── King Prop Variants (replaces scepter) ──
export function KingPropVariant({ variant, p }: { variant: SkinVariant; p: VariantProps }) {
  switch (variant) {
    case 'neon':
      return (
        <g>
          {/* Energy scepter */}
          <line x1="15" y1="30" x2="13.8" y2="57" stroke={p.accent} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <circle cx="15" cy="28" r="3" fill={p.accent} opacity="0.35" />
          <circle cx="15" cy="28" r="1.5" fill={p.accent} opacity="0.5" />
          {/* Energy rings */}
          <circle cx="15" cy="28" r="4.5" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.3" />
          <circle cx="15" cy="28" r="6" fill="none" stroke={p.accent} strokeWidth="0.2" opacity="0.15" />
        </g>
      )
    case 'sakura':
      return (
        <g>
          {/* War fan (gunbai) */}
          <line x1="14" y1="35" x2="13" y2="57" stroke={p.goldDk} strokeWidth="1" strokeLinecap="round" />
          <ellipse cx="14.5" cy="30" rx="5" ry="6" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" />
          <path d="M10,30 L14.5,24 L19,30" fill="none" stroke={p.goldDk} strokeWidth="0.3" />
          {/* Fan decoration */}
          <circle cx="14.5" cy="30" r="2" fill={p.clothing} opacity="0.3" />
          <path d="M14.5,26 L14.5,34" fill="none" stroke={p.goldDk} strokeWidth="0.2" opacity="0.3" />
        </g>
      )
    case 'pharaoh':
      return (
        <g>
          {/* Crook and flail */}
          <path d="M15,28 Q12,26 10,30 Q8,34 12,34 L15,28" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          <line x1="15" y1="28" x2="14" y2="57" stroke={p.goldDk} strokeWidth="1" strokeLinecap="round" />
          {/* Flail strands */}
          <line x1="12" y1="32" x2="8" y2="38" stroke={p.gold} strokeWidth="0.5" />
          <line x1="12" y1="32" x2="7" y2="36" stroke={p.gold} strokeWidth="0.5" />
          <line x1="12" y1="32" x2="9" y2="40" stroke={p.gold} strokeWidth="0.5" />
        </g>
      )
    default:
      return null
  }
}

// ── Master accessor: get all variant components for a role ──
export function getFaceCardVariantOverlays(role: FaceCardRole, skinId: string, props: VariantProps) {
  const variant = getSkinVariant(skinId)
  if (variant === 'classic') return null

  switch (role) {
    case 'jack':
      return (
        <>
          <JackHeadwearVariant variant={variant} p={props} />
          <JackPropVariant variant={variant} p={props} />
        </>
      )
    case 'queen':
      return (
        <>
          <QueenCrownVariant variant={variant} p={props} />
          <QueenPropVariant variant={variant} p={props} />
        </>
      )
    case 'king':
      return (
        <>
          <KingCrownVariant variant={variant} p={props} />
          <KingPropVariant variant={variant} p={props} />
        </>
      )
  }
}
