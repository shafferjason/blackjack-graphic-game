// ── Per-Skin Unique Face Card Character System ──
// Each skin gets distinct J/Q/K character silhouettes, body shapes,
// and thematic motifs that go beyond color/accessory overlays.
// Characters are built from reusable structural layers (head, torso, features)
// but assembled into unique compositions per skin theme.

import type { Suit } from '../types'

interface CharacterProps {
  suit: Suit
  isRed: boolean
  /** Pattern ID prefix for texture refs */
  pid: string
  /** Skin-specific palette colors */
  gold: string
  goldDk: string
  goldLt: string
  ink: string
  clothing: string
  clothingMid: string
  clothingHi: string
  skin: string
  skinShade: string
  skinHi: string
  hair: string
  hairHi: string
  accent: string
}

export type CharacterTheme =
  | 'european'     // Classic — traditional court
  | 'cyberpunk'    // Neon Nights — android/visor
  | 'baroque'      // Royal Gold — opulent aristocrat
  | 'samurai'      // Sakura Bloom — Japanese warrior
  | 'pharaonic'    // Solar Pharaoh — Egyptian deity
  | 'glacial'      // Arctic Frost — ice elemental
  | 'infernal'     // Crimson Flame — fire demon
  | 'wraith'       // Shadow Dynasty — spectral lord
  | 'ophidian'     // Gilded Serpent — snake hybrid
  | 'astral'       // Celestial — star being
  | 'vampiric'     // Blood Moon — vampire noble
  | 'arcane'       // Midnight Purple — mystic wizard
  | 'sylvan'       // Emerald Fortune — nature fae
  | 'noir'         // Velvet Noir — detective
  | 'crystalline'  // Diamond Dynasty — gem construct
  | 'draconic'     // Dragon's Hoard — dragon hybrid

const SKIN_TO_CHARACTER: Record<string, CharacterTheme> = {
  'classic': 'european',
  'neon-nights': 'cyberpunk',
  'royal-gold': 'baroque',
  'sakura-bloom': 'samurai',
  'solar-pharaoh': 'pharaonic',
  'arctic-frost': 'glacial',
  'crimson-flame': 'infernal',
  'shadow-dynasty': 'wraith',
  'gilded-serpent': 'ophidian',
  'celestial': 'astral',
  'blood-moon': 'vampiric',
  'midnight-purple': 'arcane',
  'emerald-fortune': 'sylvan',
  'velvet-noir': 'noir',
  'diamond-dynasty': 'crystalline',
  'dragons-hoard': 'draconic',
}

export function getCharacterTheme(skinId: string): CharacterTheme {
  return SKIN_TO_CHARACTER[skinId] || 'european'
}

// ── Jack Character Silhouette Modifications ──
// Each theme replaces the standard head/hat shape with a unique silhouette
// visible at gameplay scale. Returns SVG group that replaces cap/headwear.
export function JackCharacterHead({ theme, p }: { theme: CharacterTheme; p: CharacterProps }) {
  switch (theme) {
    case 'cyberpunk':
      return (
        <g>
          {/* Angular helmet with visor slit — distinct sharp silhouette */}
          <path d="M27,22 L30,8 L40,5 L50,8 L53,22" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          <path d="M29,20 L31,10 L40,7 L49,10 L51,20" fill={p.clothingMid} opacity="0.5" />
          {/* Visor slit — glowing */}
          <rect x="30" y="16" width="20" height="3" rx="1" fill={p.accent} opacity="0.7" />
          <rect x="31" y="16.5" width="18" height="2" rx="0.8" fill={p.accent} opacity="0.3" />
          {/* Antenna nubs */}
          <line x1="33" y1="8" x2="31" y2="3" stroke={p.accent} strokeWidth="0.6" opacity="0.5" />
          <line x1="47" y1="8" x2="49" y2="3" stroke={p.accent} strokeWidth="0.6" opacity="0.5" />
          <circle cx="31" cy="3" r="0.8" fill={p.accent} opacity="0.6" />
          <circle cx="49" cy="3" r="0.8" fill={p.accent} opacity="0.6" />
          {/* Circuit traces on helmet */}
          <path d="M33,12 L36,12 L38,14" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.35" />
          <path d="M47,12 L44,12 L42,14" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.35" />
        </g>
      )
    case 'baroque':
      return (
        <g>
          {/* Elaborate powdered wig — tall rounded silhouette */}
          <ellipse cx="40" cy="18" rx="16" ry="14" fill={p.hair} stroke={p.ink} strokeWidth="0.45" />
          <ellipse cx="40" cy="16" rx="14" ry="12" fill={p.hairHi} opacity="0.15" />
          {/* Wig curls — distinctively ornate */}
          <path d="M25,22 Q23,18 25,14 Q27,18 25,22" fill={p.hair} stroke={p.ink} strokeWidth="0.2" />
          <path d="M55,22 Q57,18 55,14 Q53,18 55,22" fill={p.hair} stroke={p.ink} strokeWidth="0.2" />
          <path d="M28,24 Q26,20 28,16 Q30,20 28,24" fill={p.hair} stroke={p.ink} strokeWidth="0.15" opacity="0.6" />
          <path d="M52,24 Q54,20 52,16 Q50,20 52,24" fill={p.hair} stroke={p.ink} strokeWidth="0.15" opacity="0.6" />
          {/* Top curl flourish */}
          <path d="M36,6 Q38,3 40,4 Q42,3 44,6" fill={p.hair} stroke={p.ink} strokeWidth="0.2" />
          {/* Ribbon bow */}
          <path d="M36,20 Q33,18 34,16 L40,18 L46,16 Q47,18 44,20" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" opacity="0.7" />
        </g>
      )
    case 'samurai':
      return (
        <g>
          {/* Samurai topknot — tied hair with headband */}
          <path d="M28,22 Q26,16 30,10 Q35,5 40,4 Q45,5 50,10 Q54,16 52,22" fill={p.hair} stroke={p.ink} strokeWidth="0.5" />
          {/* Topknot */}
          <path d="M37,6 Q38,1 40,0 Q42,1 43,6" fill={p.hair} stroke={p.ink} strokeWidth="0.4" />
          <rect x="38" y="4" width="4" height="2" rx="0.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" />
          {/* Hachimaki headband */}
          <rect x="26" y="17" width="28" height="3" rx="1" fill="#f0f0f0" stroke={p.ink} strokeWidth="0.3" />
          <circle cx="40" cy="18.5" r="2" fill={p.isRed ? '#c42020' : p.clothing} stroke={p.ink} strokeWidth="0.2" />
          {/* Headband tails */}
          <path d="M54,18 Q58,16 60,20 Q58,22 56,18" fill="#f0f0f0" stroke={p.ink} strokeWidth="0.2" opacity="0.7" />
        </g>
      )
    case 'pharaonic':
      return (
        <g>
          {/* Nemes headdress — wide trapezoidal silhouette */}
          <path d="M22,38 L24,10 Q32,4 40,2 Q48,4 56,10 L58,38" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          {/* Horizontal stripes */}
          {[8, 12, 16, 20, 24, 28, 32].map((y, i) => (
            <line key={i} x1="25" y1={y} x2="55" y2={y} stroke={p.ink} strokeWidth="0.25" opacity="0.12" />
          ))}
          {/* Uraeus cobra — distinctive crest */}
          <path d="M40,2 Q38,0 38,-4 Q39,-6 40,-5 Q41,-6 42,-4 Q42,0 40,2" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <circle cx="40" cy="-4" r="0.8" fill={p.ink} opacity="0.5" />
          {/* Blue and gold striped inlay */}
          <rect x="34" y="6" width="12" height="4" rx="1" fill={p.isRed ? '#1880c0' : '#c02020'} opacity="0.4" />
        </g>
      )
    case 'glacial':
      return (
        <g>
          {/* Ice crystal crown — jagged spiky silhouette */}
          <path d="M28,22 L30,14 L33,18 L36,8 L38,16 L40,2 L42,16 L44,8 L47,18 L50,14 L52,22" fill="#c8e8ff" stroke="#88ccee" strokeWidth="0.5" opacity="0.7" />
          <path d="M30,22 L32,15 L36,10 L40,4 L44,10 L48,15 L50,22" fill="#e0f4ff" opacity="0.3" />
          {/* Frost patterns */}
          <path d="M34,14 L33,10 M34,14 L36,12 M34,14 L32,13" fill="none" stroke="#bbddff" strokeWidth="0.25" opacity="0.4" />
          <path d="M46,14 L47,10 M46,14 L44,12 M46,14 L48,13" fill="none" stroke="#bbddff" strokeWidth="0.25" opacity="0.4" />
          {/* Ice shard hair */}
          <path d="M26,24 Q24,20 26,16" fill="none" stroke="#a0d0f0" strokeWidth="1.5" opacity="0.4" />
          <path d="M54,24 Q56,20 54,16" fill="none" stroke="#a0d0f0" strokeWidth="1.5" opacity="0.4" />
        </g>
      )
    case 'infernal':
      return (
        <g>
          {/* Horned demon helm — aggressive silhouette */}
          <path d="M28,22 Q26,14 30,8 L40,6 L50,8 Q54,14 52,22" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          {/* Swept-back horns — main distinguishing feature */}
          <path d="M30,12 Q26,6 22,0 Q20,-2 18,-1" fill={p.isRed ? '#880808' : '#444'} stroke={p.ink} strokeWidth="0.6" strokeLinecap="round" />
          <path d="M50,12 Q54,6 58,0 Q60,-2 62,-1" fill={p.isRed ? '#880808' : '#444'} stroke={p.ink} strokeWidth="0.6" strokeLinecap="round" />
          {/* Horn ridges */}
          <path d="M28,8 Q26,5 24,2" fill="none" stroke={p.ink} strokeWidth="0.2" opacity="0.3" />
          <path d="M52,8 Q54,5 56,2" fill="none" stroke={p.ink} strokeWidth="0.2" opacity="0.3" />
          {/* Flame wisps from helm */}
          <path d="M36,6 Q34,2 36,0" fill="none" stroke="#f0a020" strokeWidth="0.5" opacity="0.4" />
          <path d="M44,6 Q46,2 44,0" fill="none" stroke="#f08020" strokeWidth="0.4" opacity="0.35" />
          <path d="M40,5 Q40,1 41,-1" fill="none" stroke="#f0c040" strokeWidth="0.3" opacity="0.3" />
        </g>
      )
    case 'wraith':
      return (
        <g>
          {/* Deep cowl/hood — shadowy undefined silhouette */}
          <path d="M24,40 Q22,28 24,16 Q28,6 40,2 Q52,6 56,16 Q58,28 56,40" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          <path d="M26,38 Q24,28 26,18 Q30,8 40,4 Q50,8 54,18 Q56,28 54,38" fill={p.clothingMid} opacity="0.3" />
          {/* Interior shadow — face emerges from darkness */}
          <ellipse cx="40" cy="28" rx="10" ry="12" fill={p.ink} opacity="0.2" />
          {/* Ghostly wisps from hood edges */}
          <path d="M24,32 Q20,28 22,24" fill="none" stroke={p.clothing} strokeWidth="0.4" opacity="0.25" />
          <path d="M56,32 Q60,28 58,24" fill="none" stroke={p.clothing} strokeWidth="0.4" opacity="0.25" />
          {/* Hood peak */}
          <path d="M40,2 L40,-2" fill="none" stroke={p.clothing} strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />
        </g>
      )
    case 'ophidian':
      return (
        <g>
          {/* Cobra hood — flared sides silhouette */}
          <path d="M20,22 Q18,14 24,8 Q32,2 40,0 Q48,2 56,8 Q62,14 60,22" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          <path d="M22,20 Q20,14 26,8 Q34,3 40,2 Q46,3 54,8 Q60,14 58,20" fill={p.clothingHi} opacity="0.12" />
          {/* Scale pattern on hood */}
          {[8, 12, 16].map((y, i) => (
            <path key={i} d={`M${30 + i * 2},${y} Q40,${y - 3} ${50 - i * 2},${y}`} fill="none" stroke={p.gold} strokeWidth="0.3" opacity="0.25" />
          ))}
          {/* Third eye gem */}
          <circle cx="40" cy="8" r="2" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <circle cx="40" cy="8" r="0.8" fill={p.accent} opacity="0.6" />
          {/* Fangs hint at bottom */}
          <path d="M36,22 L37,25" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.3" />
          <path d="M44,22 L43,25" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.3" />
        </g>
      )
    case 'astral':
      return (
        <g>
          {/* Cosmic halo — radiating light silhouette */}
          <circle cx="40" cy="16" r="16" fill="none" stroke={p.gold} strokeWidth="0.6" opacity="0.2" />
          <circle cx="40" cy="16" r="12" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.15" />
          {/* Star points emerging from head */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line key={i} x1="40" y1="16" x2={40 + Math.cos(angle * Math.PI / 180) * 18} y2={16 + Math.sin(angle * Math.PI / 180) * 18} stroke={p.gold} strokeWidth="0.3" opacity={0.15 + (i % 2) * 0.1} />
          ))}
          {/* Ethereal flowing hair — wispy */}
          <path d="M28,18 Q24,12 26,4 Q28,0 32,2" fill="none" stroke={p.hair} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
          <path d="M52,18 Q56,12 54,4 Q52,0 48,2" fill="none" stroke={p.hair} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
          <path d="M30,20 Q26,14 28,6" fill="none" stroke={p.hairHi} strokeWidth="0.6" opacity="0.25" strokeLinecap="round" />
          <path d="M50,20 Q54,14 52,6" fill="none" stroke={p.hairHi} strokeWidth="0.6" opacity="0.25" strokeLinecap="round" />
          {/* Constellation dots */}
          {[[30, 6], [50, 8], [34, 2], [46, 4]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.6" fill={p.gold} opacity={0.3 + (i % 2) * 0.2} />
          ))}
        </g>
      )
    case 'vampiric':
      return (
        <g>
          {/* High-collared vampire — pointed hair silhouette */}
          <path d="M26,22 Q24,14 28,6 Q32,0 36,2 L40,0 L44,2 Q48,0 52,6 Q56,14 54,22" fill={p.hair} stroke={p.ink} strokeWidth="0.5" />
          {/* Widow's peak */}
          <path d="M34,12 L40,6 L46,12" fill={p.hair} stroke={p.ink} strokeWidth="0.3" />
          {/* Slicked-back hair — angular */}
          <path d="M28,16 Q26,10 30,6" fill="none" stroke={p.hairHi} strokeWidth="0.4" opacity="0.2" />
          <path d="M52,16 Q54,10 50,6" fill="none" stroke={p.hairHi} strokeWidth="0.4" opacity="0.2" />
          {/* Bat-wing hair tips */}
          <path d="M24,20 Q22,16 20,18 Q22,14 26,16" fill={p.hair} stroke={p.ink} strokeWidth="0.2" opacity="0.5" />
          <path d="M56,20 Q58,16 60,18 Q58,14 54,16" fill={p.hair} stroke={p.ink} strokeWidth="0.2" opacity="0.5" />
        </g>
      )
    case 'arcane':
      return (
        <g>
          {/* Wizard's pointed hat — tall conical silhouette */}
          <path d="M28,22 L30,14 Q32,6 40,-4 Q48,6 50,14 L52,22" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          <path d="M30,20 L32,14 Q34,8 40,-2 Q46,8 48,14 L50,20" fill={p.clothingMid} opacity="0.3" />
          {/* Hat brim */}
          <ellipse cx="40" cy="21" rx="16" ry="3" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Mystical runes on hat */}
          <circle cx="38" cy="10" r="1.2" fill={p.accent} opacity="0.3" />
          <circle cx="42" cy="6" r="1" fill={p.accent} opacity="0.25" />
          <path d="M39,13 L40,11 L41,13" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.35" />
          {/* Star on hat tip */}
          <circle cx="40" cy="-4" r="1.5" fill={p.accent} opacity="0.4" />
          {/* Flowing beard from sides */}
          <path d="M26,24 Q22,30 24,38" fill="none" stroke={p.hair} strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
          <path d="M54,24 Q58,30 56,38" fill="none" stroke={p.hair} strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
        </g>
      )
    case 'sylvan':
      return (
        <g>
          {/* Leaf crown — organic flowing silhouette */}
          <path d="M28,20 Q26,14 30,8 Q35,3 40,2 Q45,3 50,8 Q54,14 52,20" fill={p.hair} stroke={p.ink} strokeWidth="0.4" />
          {/* Leaf wreath crown */}
          {[-30, -10, 10, 30].map((angle, i) => (
            <g key={i} transform={`rotate(${angle},40,14)`}>
              <path d="M40,4 Q37,7 38,12 Q40,10 42,12 Q43,7 40,4" fill={p.clothing} stroke={p.ink} strokeWidth="0.2" opacity="0.7" />
              <line x1="40" y1="5" x2="40" y2="11" stroke={p.clothingHi} strokeWidth="0.15" opacity="0.3" />
            </g>
          ))}
          {/* Vine tendrils */}
          <path d="M26,18 Q22,14 24,8 Q26,12 28,10" fill="none" stroke={p.clothing} strokeWidth="0.5" opacity="0.4" strokeLinecap="round" />
          <path d="M54,18 Q58,14 56,8 Q54,12 52,10" fill="none" stroke={p.clothing} strokeWidth="0.5" opacity="0.4" strokeLinecap="round" />
          {/* Small mushroom/flower accents */}
          <circle cx="28" cy="12" r="1.5" fill={p.accent} opacity="0.3" />
          <circle cx="52" cy="10" r="1.2" fill={p.accent} opacity="0.25" />
        </g>
      )
    case 'noir':
      return (
        <g>
          {/* Fedora hat — classic detective silhouette */}
          <path d="M24,22 L26,14 Q30,8 40,6 Q50,8 54,14 L56,22" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          <path d="M28,20 L29,14 Q33,9 40,7.5 Q47,9 51,14 L52,20" fill={p.clothingMid} opacity="0.3" />
          {/* Wide brim */}
          <ellipse cx="40" cy="21" rx="18" ry="3" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Hat band */}
          <rect x="27" y="19" width="26" height="2.5" rx="0.8" fill={p.ink} stroke={p.ink} strokeWidth="0.2" opacity="0.3" />
          {/* Brim shadow over eyes */}
          <ellipse cx="40" cy="28" rx="12" ry="3" fill={p.ink} opacity="0.1" />
          {/* Pinch at crown */}
          <path d="M34,10 Q37,8 40,9 Q43,8 46,10" fill="none" stroke={p.ink} strokeWidth="0.2" opacity="0.2" />
        </g>
      )
    case 'crystalline':
      return (
        <g>
          {/* Faceted crystal crown — geometric sharp silhouette */}
          <path d="M28,22 L30,14 L34,6 L38,10 L40,0 L42,10 L46,6 L50,14 L52,22" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          <path d="M30,20 L32,14 L36,8 L40,2 L44,8 L48,14 L50,20" fill={p.goldLt} opacity="0.2" />
          {/* Facet lines — geometric */}
          <line x1="34" y1="6" x2="40" y2="22" stroke={p.goldDk} strokeWidth="0.2" opacity="0.15" />
          <line x1="46" y1="6" x2="40" y2="22" stroke={p.goldDk} strokeWidth="0.2" opacity="0.15" />
          <line x1="40" y1="0" x2="40" y2="22" stroke={p.goldDk} strokeWidth="0.15" opacity="0.12" />
          {/* Diamond sparkles */}
          {[[34, 8], [46, 8], [40, 4]].map(([x, y], i) => (
            <g key={i}>
              <line x1={x! - 1} y1={y} x2={x! + 1} y2={y} stroke={p.goldLt} strokeWidth="0.3" opacity="0.5" />
              <line x1={x} y1={y! - 1} x2={x} y2={y! + 1} stroke={p.goldLt} strokeWidth="0.3" opacity="0.5" />
            </g>
          ))}
          {/* Platinum hair visible at sides */}
          <path d="M26,22 Q24,18 26,14" fill="none" stroke={p.hair} strokeWidth="1.5" opacity="0.3" />
          <path d="M54,22 Q56,18 54,14" fill="none" stroke={p.hair} strokeWidth="1.5" opacity="0.3" />
        </g>
      )
    case 'draconic':
      return (
        <g>
          {/* Dragon horned helm — powerful sweeping silhouette */}
          <path d="M28,22 Q26,14 30,8 L40,4 L50,8 Q54,14 52,22" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          <path d="M30,20 Q28,14 32,10 L40,6 L48,10 Q52,14 50,20" fill={p.clothingMid} opacity="0.3" />
          {/* Massive sweeping horns — main silhouette feature */}
          <path d="M30,14 Q24,6 18,0 Q16,-2 14,0" fill="none" stroke={p.gold} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M50,14 Q56,6 62,0 Q64,-2 66,0" fill="none" stroke={p.gold} strokeWidth="1.4" strokeLinecap="round" />
          {/* Horn ridges */}
          <path d="M28,10 Q24,4 20,0" fill="none" stroke={p.goldDk} strokeWidth="0.3" opacity="0.3" />
          <path d="M52,10 Q56,4 60,0" fill="none" stroke={p.goldDk} strokeWidth="0.3" opacity="0.3" />
          {/* Dragon scale band */}
          <rect x="30" y="18" width="20" height="3" rx="1" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          {[32, 35, 38, 41, 44, 47].map((x, i) => (
            <path key={i} d={`M${x},18 L${x + 1.5},16.5 L${x + 3},18`} fill={p.goldLt} stroke={p.goldDk} strokeWidth="0.15" opacity="0.4" />
          ))}
          {/* Ruby center eye */}
          <circle cx="40" cy="19.5" r="1.5" fill="#ef4444" opacity="0.7" />
        </g>
      )
    default: // european — no custom head, uses base
      return null
  }
}

// ── Jack Character Torso/Body Modifications ──
export function JackCharacterBody({ theme, p }: { theme: CharacterTheme; p: CharacterProps }) {
  switch (theme) {
    case 'cyberpunk':
      return (
        <g>
          {/* Tech armor vest with glowing seams */}
          <path d="M25,49 L21,60 L59,60 L55,49 Q40,55 25,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          <path d="M30,50 L40,54 L50,50" fill="none" stroke={p.accent} strokeWidth="0.5" opacity="0.3" />
          {/* Circuit traces on torso */}
          <line x1="35" y1="52" x2="35" y2="58" stroke={p.accent} strokeWidth="0.3" opacity="0.25" />
          <line x1="45" y1="52" x2="45" y2="58" stroke={p.accent} strokeWidth="0.3" opacity="0.25" />
          <line x1="33" y1="55" x2="37" y2="55" stroke={p.accent} strokeWidth="0.2" opacity="0.2" />
          <line x1="43" y1="55" x2="47" y2="55" stroke={p.accent} strokeWidth="0.2" opacity="0.2" />
          {/* Chest LED */}
          <circle cx="40" cy="52" r="1.5" fill={p.accent} opacity="0.35" />
          <circle cx="40" cy="52" r="0.7" fill={p.accent} opacity="0.5" />
        </g>
      )
    case 'samurai':
      return (
        <g>
          {/* Layered armor plates (do) */}
          <path d="M25,48 L21,60 L59,60 L55,48 Q40,54 25,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Horizontal armor lace bands */}
          {[50, 53, 56].map((y, i) => (
            <rect key={i} x="24" y={y} width="32" height="1.8" rx="0.4" fill={p.clothingHi} stroke={p.ink} strokeWidth="0.15" opacity={0.5 - i * 0.1} />
          ))}
          {/* Center tie cords */}
          <path d="M38,48 L40,60" fill="none" stroke={p.gold} strokeWidth="0.6" opacity="0.4" />
          <path d="M42,48 L40,60" fill="none" stroke={p.gold} strokeWidth="0.6" opacity="0.4" />
          {/* Mon (family crest) */}
          <circle cx="40" cy="51" r="2" fill={p.gold} opacity="0.25" stroke={p.goldDk} strokeWidth="0.2" />
        </g>
      )
    case 'wraith':
      return (
        <g>
          {/* Tattered robes — ragged bottom edge */}
          <path d="M24,49 L20,60 L26,57 L32,60 L38,56 L40,60 L42,56 L48,60 L54,57 L60,60 L56,49 Q40,55 24,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          <path d="M28,50 Q34,54 40,52 Q46,54 52,50" fill={p.clothingMid} opacity="0.15" />
          {/* Wisps of shadow */}
          <path d="M30,55 Q28,52 26,55" fill="none" stroke={p.ink} strokeWidth="0.3" opacity="0.2" />
          <path d="M50,55 Q52,52 54,55" fill="none" stroke={p.ink} strokeWidth="0.3" opacity="0.2" />
        </g>
      )
    case 'ophidian':
      return (
        <g>
          {/* Scaled armor torso */}
          <path d="M25,49 L21,60 L59,60 L55,49 Q40,55 25,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Snake scale pattern on torso */}
          {[50, 53, 56].map((y, i) => (
            <path key={i} d={`M${26 + i},${y} Q33,${y - 1.5} 40,${y} Q47,${y - 1.5} ${54 - i},${y}`} fill="none" stroke={p.gold} strokeWidth="0.3" opacity="0.2" />
          ))}
          {/* Serpent belt */}
          <path d="M28,49 Q34,51 40,49 Q46,51 52,49" fill="none" stroke={p.gold} strokeWidth="0.8" opacity="0.4" />
          <circle cx="40" cy="49.5" r="1.2" fill={p.accent} opacity="0.3" />
        </g>
      )
    case 'vampiric':
      return (
        <g>
          {/* High-collared cape */}
          <path d="M24,44 L20,60 L60,60 L56,44" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Cape collar wings */}
          <path d="M28,44 L24,38 L28,42" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          <path d="M52,44 L56,38 L52,42" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          {/* Vest underneath */}
          <path d="M34,46 L32,60 L48,60 L46,46" fill={p.isRed ? '#880808' : '#282828'} stroke={p.ink} strokeWidth="0.2" opacity="0.5" />
          {/* Center buttons */}
          <circle cx="40" cy="50" r="0.6" fill={p.gold} opacity="0.3" />
          <circle cx="40" cy="53" r="0.6" fill={p.gold} opacity="0.3" />
          <circle cx="40" cy="56" r="0.6" fill={p.gold} opacity="0.3" />
          {/* Cravat */}
          <path d="M37,45 L40,48 L43,45" fill={p.isRed ? '#c02020' : '#d02020'} stroke={p.ink} strokeWidth="0.2" opacity="0.6" />
        </g>
      )
    case 'sylvan':
      return (
        <g>
          {/* Bark-textured tunic */}
          <path d="M25,49 L21,60 L59,60 L55,49 Q40,55 25,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Vine/root patterns */}
          <path d="M30,50 Q34,56 32,60" fill="none" stroke={p.clothingHi} strokeWidth="0.4" opacity="0.3" />
          <path d="M50,50 Q46,56 48,60" fill="none" stroke={p.clothingHi} strokeWidth="0.4" opacity="0.3" />
          {/* Leaf belt */}
          {[32, 36, 40, 44, 48].map((x, i) => (
            <path key={i} d={`M${x},49 Q${x - 1},47 ${x},46 Q${x + 1},47 ${x},49`} fill={p.clothingHi} stroke={p.ink} strokeWidth="0.15" opacity="0.5" />
          ))}
          {/* Small flower accent */}
          <circle cx="35" cy="53" r="1" fill={p.accent} opacity="0.2" />
        </g>
      )
    case 'noir':
      return (
        <g>
          {/* Trench coat */}
          <path d="M24,49 L20,60 L60,60 L56,49 Q40,55 24,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Lapels */}
          <path d="M35,48 L40,55 L34,60" fill={p.clothingMid} stroke={p.ink} strokeWidth="0.2" opacity="0.5" />
          <path d="M45,48 L40,55 L46,60" fill={p.clothingMid} stroke={p.ink} strokeWidth="0.2" opacity="0.5" />
          {/* Tie */}
          <path d="M39,47 L40,57 L41,47" fill={p.isRed ? '#881010' : '#202020'} stroke={p.ink} strokeWidth="0.15" opacity="0.5" />
          {/* Coat button */}
          <circle cx="40" cy="55" r="0.6" fill={p.ink} opacity="0.2" />
        </g>
      )
    case 'arcane':
      return (
        <g>
          {/* Wizard's robe with mystic sigils */}
          <path d="M24,49 L20,60 L60,60 L56,49 Q40,55 24,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Rune belt */}
          <rect x="28" y="48" width="24" height="2.5" rx="0.8" fill={p.gold} opacity="0.25" stroke={p.goldDk} strokeWidth="0.2" />
          {/* Glowing sigils on robe */}
          <circle cx="34" cy="54" r="1.5" fill={p.accent} opacity="0.15" />
          <circle cx="46" cy="54" r="1.5" fill={p.accent} opacity="0.15" />
          <path d="M33,54 L35,54 M34,53 L34,55" fill="none" stroke={p.accent} strokeWidth="0.25" opacity="0.25" />
          <path d="M45,54 L47,54 M46,53 L46,55" fill="none" stroke={p.accent} strokeWidth="0.25" opacity="0.25" />
        </g>
      )
    case 'baroque':
      return (
        <g>
          {/* Embroidered doublet with slashed sleeves */}
          <path d="M25,49 L21,60 L59,60 L55,49 Q40,55 25,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Vertical brocade stripes */}
          {[30, 35, 40, 45, 50].map((x, i) => (
            <line key={i} x1={x} y1="49" x2={x - 1} y2="60" stroke={p.gold} strokeWidth="0.3" opacity="0.15" />
          ))}
          {/* Wide lace collar */}
          <path d="M28,48 Q34,44 40,46 Q46,44 52,48" fill="#f0f0f0" stroke={p.ink} strokeWidth="0.2" opacity="0.35" />
          {/* Gold chain with pendant */}
          <path d="M32,48 Q36,52 40,50 Q44,52 48,48" fill="none" stroke={p.gold} strokeWidth="0.5" opacity="0.3" />
          <circle cx="40" cy="51" r="1.2" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.5" />
        </g>
      )
    case 'pharaonic':
      return (
        <g>
          {/* Broad pectoral collar (wesekh) */}
          <path d="M25,48 L21,60 L59,60 L55,48 Q40,54 25,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Beaded collar bands */}
          {[48, 51, 54].map((y, i) => (
            <path key={i} d={`M${26 + i * 2},${y} Q40,${y + 2} ${54 - i * 2},${y}`} fill="none" stroke={p.gold} strokeWidth="0.6" opacity={0.35 - i * 0.08} />
          ))}
          {/* Winged scarab center */}
          <ellipse cx="40" cy="50" rx="2.5" ry="1.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.4" />
          <path d="M37.5,50 Q34,48 30,49 M42.5,50 Q46,48 50,49" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.25" />
        </g>
      )
    case 'glacial':
      return (
        <g>
          {/* Frost-plated armor tunic */}
          <path d="M25,49 L21,60 L59,60 L55,49 Q40,55 25,49 Z" fill="#c8e0f0" stroke="#88ccee" strokeWidth="0.4" opacity="0.7" />
          {/* Ice plate edges */}
          <path d="M30,50 L28,54 L32,58 L36,54 L34,50" fill="none" stroke="#a0d0f0" strokeWidth="0.3" opacity="0.3" />
          <path d="M46,50 L48,54 L44,58 L40,54 L42,50" fill="none" stroke="#a0d0f0" strokeWidth="0.3" opacity="0.3" />
          {/* Snowflake clasp */}
          <circle cx="40" cy="50" r="2" fill="none" stroke="#bbddff" strokeWidth="0.4" opacity="0.4" />
          {[0, 60, 120, 180, 240, 300].map((a, i) => (
            <line key={i} x1="40" y1="48" x2="40" y2="47" stroke="#bbddff" strokeWidth="0.3" opacity="0.3" transform={`rotate(${a},40,50)`} />
          ))}
        </g>
      )
    case 'infernal':
      return (
        <g>
          {/* Charred plate armor with magma cracks */}
          <path d="M25,49 L21,60 L59,60 L55,49 Q40,55 25,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Lava crack lines */}
          <path d="M32,50 L30,55 L34,58 L32,60" fill="none" stroke="#f0a020" strokeWidth="0.4" opacity="0.3" />
          <path d="M48,50 L50,55 L46,58 L48,60" fill="none" stroke="#f08020" strokeWidth="0.4" opacity="0.25" />
          {/* Ember glow center */}
          <path d="M38,51 L40,56 L42,51" fill="#f0a020" opacity="0.2" />
          {/* Shoulder spikes */}
          <path d="M26,49 L23,45 L28,48" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          <path d="M54,49 L57,45 L52,48" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
        </g>
      )
    case 'astral':
      return (
        <g>
          {/* Celestial robes with constellation pattern */}
          <path d="M25,49 L21,60 L59,60 L55,49 Q40,55 25,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Constellation dots and lines on torso */}
          {[[32, 52], [36, 55], [40, 51], [44, 54], [48, 52]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.5" fill={p.gold} opacity={0.3 + (i % 2) * 0.15} />
          ))}
          <path d="M32,52 L36,55 L40,51 L44,54 L48,52" fill="none" stroke={p.gold} strokeWidth="0.25" opacity="0.2" />
          {/* Glowing sash */}
          <path d="M30,49 Q40,52 50,49" fill="none" stroke={p.gold} strokeWidth="0.8" opacity="0.2" />
        </g>
      )
    case 'crystalline':
      return (
        <g>
          {/* Gem-encrusted breastplate */}
          <path d="M25,49 L21,60 L59,60 L55,49 Q40,55 25,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Faceted plate lines */}
          <path d="M30,49 L35,54 L40,49 L45,54 L50,49" fill="none" stroke={p.goldDk} strokeWidth="0.3" opacity="0.2" />
          <path d="M35,54 L40,60 L45,54" fill="none" stroke={p.goldDk} strokeWidth="0.25" opacity="0.15" />
          {/* Diamond center gem */}
          <path d="M38,51 L40,49 L42,51 L40,53 Z" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.5" />
          <circle cx="40" cy="51" r="0.6" fill={p.goldLt} opacity="0.4" />
        </g>
      )
    case 'draconic':
      return (
        <g>
          {/* Dragon scale mail torso */}
          <path d="M25,49 L21,60 L59,60 L55,49 Q40,55 25,49 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Overlapping scale rows */}
          {[50, 53, 56].map((y, i) => (
            <g key={i}>
              {[28, 32, 36, 40, 44, 48].map((x, j) => (
                <path key={j} d={`M${x},${y} Q${x + 2},${y - 1.5} ${x + 4},${y}`} fill="none" stroke={p.gold} strokeWidth="0.25" opacity={0.25 - i * 0.05} />
              ))}
            </g>
          ))}
          {/* Dragon eye buckle */}
          <ellipse cx="40" cy="50" rx="2" ry="1.2" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <ellipse cx="40" cy="50" rx="0.5" ry="1" fill="#ef4444" opacity="0.5" />
        </g>
      )
    default:
      return null
  }
}

// ── Jack Character Prop Modifications ──
export function JackCharacterProp({ theme, p }: { theme: CharacterTheme; p: CharacterProps }) {
  switch (theme) {
    case 'cyberpunk':
      return (
        <g>
          {/* Plasma pistol */}
          <path d="M58,30 L64,30 L65,32 L62,33 L62,42 L59,42 L59,33 L58,32 Z" fill={p.clothingMid} stroke={p.ink} strokeWidth="0.3" />
          <rect x="59.5" y="31" width="3" height="1" rx="0.3" fill={p.accent} opacity="0.4" />
          <circle cx="64.5" cy="31" r="0.8" fill={p.accent} opacity="0.5" />
        </g>
      )
    case 'baroque':
      return (
        <g>
          {/* Rapier — thin elegant weapon */}
          <line x1="60" y1="22" x2="63" y2="56" stroke="#a0a0a8" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="60" y1="22" x2="63" y2="56" stroke="#d0d0d8" strokeWidth="0.2" opacity="0.3" />
          {/* Ornate hand guard — swept S-curve */}
          <ellipse cx="60.5" cy="28" rx="3" ry="1.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <path d="M58,28 Q60.5,32 63,28" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.5" />
          {/* Pommel jewel */}
          <circle cx="63" cy="56" r="1.2" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" />
        </g>
      )
    case 'pharaonic':
      return (
        <g>
          {/* Was-scepter (jackal-headed staff) */}
          <line x1="62" y1="28" x2="63" y2="56" stroke={p.gold} strokeWidth="1.2" strokeLinecap="round" />
          {/* Jackal head top */}
          <path d="M60,28 Q58,24 59,20 Q61,22 62,20 Q63,22 65,20 Q66,24 64,28 Z" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <circle cx="60.5" cy="23" r="0.5" fill={p.ink} opacity="0.5" />
          {/* Forked bottom */}
          <path d="M62,54 L61,58 M64,54 L65,58" fill="none" stroke={p.gold} strokeWidth="0.6" strokeLinecap="round" />
        </g>
      )
    case 'glacial':
      return (
        <g>
          {/* Ice lance */}
          <line x1="60" y1="18" x2="62" y2="56" stroke="#90c8e8" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M59,18 L60,10 L61,18" fill="#c8e8ff" stroke="#88ccee" strokeWidth="0.3" opacity="0.7" />
          {/* Frost on shaft */}
          <path d="M59,30 L57,28 M61,35 L63,33" fill="none" stroke="#bbddff" strokeWidth="0.3" opacity="0.3" />
        </g>
      )
    case 'infernal':
      return (
        <g>
          {/* Flame whip */}
          <path d="M60,28 Q64,34 58,40 Q62,46 60,52" fill="none" stroke="#f0a020" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <path d="M60,28 Q63,33 59,38 Q62,44 60,50" fill="none" stroke="#f06020" strokeWidth="0.5" opacity="0.4" />
          {/* Flame handle */}
          <rect x="58" y="24" width="4" height="6" rx="1" fill={p.clothingMid} stroke={p.ink} strokeWidth="0.3" />
        </g>
      )
    case 'wraith':
      return (
        <g>
          {/* Ghostly scythe */}
          <line x1="60" y1="22" x2="62" y2="56" stroke={p.gold} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
          <path d="M56,22 Q60,18 64,22 Q62,20 60,22" fill={p.gold} opacity="0.4" stroke={p.goldDk} strokeWidth="0.3" />
          <path d="M64,22 Q68,26 64,32" fill="none" stroke={p.gold} strokeWidth="0.8" opacity="0.3" />
        </g>
      )
    case 'ophidian':
      return (
        <g>
          {/* Snake-wrapped staff */}
          <line x1="61" y1="22" x2="62" y2="56" stroke={p.goldDk} strokeWidth="1.2" strokeLinecap="round" />
          {/* Coiling snake */}
          <path d="M59,26 Q63,30 59,34 Q63,38 59,42" fill="none" stroke={p.gold} strokeWidth="0.7" opacity="0.5" />
          {/* Snake head at top */}
          <circle cx="59" cy="24" r="1.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <circle cx="58.5" cy="23.5" r="0.4" fill={p.ink} />
        </g>
      )
    case 'astral':
      return (
        <g>
          {/* Constellation wand */}
          <line x1="60" y1="24" x2="62" y2="54" stroke={p.gold} strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
          {/* Star tip */}
          <circle cx="60" cy="22" r="3" fill={p.gold} opacity="0.3" />
          <path d="M60,19 L61,21 L63,21 L61.5,22.5 L62,25 L60,23.5 L58,25 L58.5,22.5 L57,21 L59,21 Z" fill={p.gold} opacity="0.5" />
          {/* Trailing stardust */}
          {[30, 36, 42, 48].map((y, i) => (
            <circle key={i} cx={61 + (i % 2)} cy={y} r="0.4" fill={p.gold} opacity={0.3 - i * 0.05} />
          ))}
        </g>
      )
    case 'vampiric':
      return (
        <g>
          {/* Wine goblet */}
          <path d="M58,30 Q56,34 58,38 L59,38 L58.5,42 L56,42 L57,42.5 L63,42.5 L64,42 L61.5,42 L61,38 L62,38 Q64,34 62,30 Z" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" opacity="0.6" />
          {/* Blood-red wine */}
          <ellipse cx="60" cy="32" rx="1.8" ry="0.8" fill="#880808" opacity="0.5" />
        </g>
      )
    case 'arcane':
      return (
        <g>
          {/* Spell scroll */}
          <rect x="58" y="28" width="8" height="18" rx="1.5" fill="#f0e8d0" stroke={p.ink} strokeWidth="0.3" opacity="0.6" />
          <rect x="57.5" y="27" width="9" height="3" rx="1" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.5" />
          <rect x="57.5" y="44" width="9" height="3" rx="1" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.5" />
          {/* Glowing text lines */}
          {[33, 36, 39, 42].map((y, i) => (
            <line key={i} x1="60" y1={y} x2={64 - i * 0.5} y2={y} stroke={p.accent} strokeWidth="0.3" opacity={0.25 - i * 0.03} />
          ))}
        </g>
      )
    case 'sylvan':
      return (
        <g>
          {/* Living wood staff */}
          <path d="M60,20 Q61,38 62,56" fill="none" stroke="#5a3818" strokeWidth="1.5" strokeLinecap="round" />
          {/* Sprouting leaves */}
          <path d="M60,24 Q57,22 58,20 Q59,22 60,24" fill={p.clothing} opacity="0.6" />
          <path d="M61,30 Q64,28 63,26 Q62,28 61,30" fill={p.clothing} opacity="0.5" />
          {/* Glowing nature orb at top */}
          <circle cx="60" cy="18" r="2.5" fill={p.accent} opacity="0.2" />
          <circle cx="60" cy="18" r="1.2" fill={p.accent} opacity="0.3" />
        </g>
      )
    case 'noir':
      return (
        <g>
          {/* Revolver */}
          <path d="M58,34 L64,34 L65,35.5 L64,37 L62,37 L62,40 L59,40 L59,37 L58,37 L57,35.5 Z" fill="#404040" stroke={p.ink} strokeWidth="0.3" opacity="0.5" />
          {/* Barrel */}
          <rect x="64" y="34.5" width="4" height="1.5" rx="0.3" fill="#505050" stroke={p.ink} strokeWidth="0.2" opacity="0.4" />
          {/* Cigarette smoke wisps */}
          <path d="M66,32 Q68,28 66,24" fill="none" stroke={p.ink} strokeWidth="0.3" opacity="0.15" />
        </g>
      )
    case 'crystalline':
      return (
        <g>
          {/* Diamond scepter */}
          <line x1="60" y1="26" x2="62" y2="54" stroke={p.goldDk} strokeWidth="1" strokeLinecap="round" />
          {/* Diamond tip */}
          <path d="M57,26 L60,18 L63,26 L60,24 Z" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <path d="M58.5,24 L60,20 L61.5,24" fill={p.goldLt} opacity="0.3" />
          {/* Sparkle */}
          <circle cx="60" cy="20" r="0.5" fill="#fff" opacity="0.4" />
        </g>
      )
    case 'draconic':
      return (
        <g>
          {/* Flamberge — wavy-bladed greatsword */}
          <line x1="60" y1="20" x2="63" y2="56" stroke={p.goldDk} strokeWidth="1.2" strokeLinecap="round" />
          {/* Wavy blade edges */}
          <path d="M59,22 Q58,26 59,30 Q58,34 59,38 Q58,42 59,46" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.4" />
          <path d="M61,22 Q62,26 61,30 Q62,34 61,38 Q62,42 61,46" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.4" />
          {/* Dragon wing crossguard */}
          <path d="M56,26 Q58,22 60,26 Q62,22 64,26" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          {/* Dragon eye pommel */}
          <circle cx="63" cy="56" r="1.2" fill="#ef4444" opacity="0.5" />
        </g>
      )
    default:
      return null
  }
}

// ── Queen Character Head Modifications ──
export function QueenCharacterHead({ theme, p }: { theme: CharacterTheme; p: CharacterProps }) {
  switch (theme) {
    case 'cyberpunk':
      return (
        <g>
          {/* Holographic tiara with data streams */}
          <path d="M28,20 L30,12 L34,16 L37,8 L40,14 L43,8 L46,16 L50,12 L52,20" fill="none" stroke={p.accent} strokeWidth="0.8" opacity="0.6" />
          {/* Holographic hair — geometric bobs */}
          <path d="M26,22 Q24,28 26,34 L30,34 L28,22" fill={p.hair} stroke={p.ink} strokeWidth="0.3" />
          <path d="M54,22 Q56,28 54,34 L50,34 L52,22" fill={p.hair} stroke={p.ink} strokeWidth="0.3" />
          {/* LED strips in hair */}
          <line x1="27" y1="26" x2="29" y2="26" stroke={p.accent} strokeWidth="0.4" opacity="0.4" />
          <line x1="27" y1="30" x2="29" y2="30" stroke={p.accent} strokeWidth="0.4" opacity="0.3" />
          <line x1="51" y1="26" x2="53" y2="26" stroke={p.accent} strokeWidth="0.4" opacity="0.4" />
          <line x1="51" y1="30" x2="53" y2="30" stroke={p.accent} strokeWidth="0.4" opacity="0.3" />
          {/* Glow nodes on crown points */}
          {[37, 40, 43].map((x, i) => (
            <circle key={i} cx={x} cy={8 + i * 0.3} r="1" fill={p.accent} opacity="0.4" />
          ))}
        </g>
      )
    case 'baroque':
      return (
        <g>
          {/* Towering Marie Antoinette style — very tall powdered wig */}
          <path d="M26,22 Q24,10 28,0 Q32,-6 40,-8 Q48,-6 52,0 Q56,10 54,22" fill={p.hair} stroke={p.ink} strokeWidth="0.4" />
          <path d="M28,20 Q26,10 30,2 Q34,-4 40,-6 Q46,-4 50,2 Q54,10 52,20" fill={p.hairHi} opacity="0.12" />
          {/* Decorative curls */}
          <path d="M30,8 Q28,6 30,4 Q32,6 30,8" fill={p.hair} stroke={p.ink} strokeWidth="0.15" opacity="0.5" />
          <path d="M50,8 Q52,6 50,4 Q48,6 50,8" fill={p.hair} stroke={p.ink} strokeWidth="0.15" opacity="0.5" />
          {/* Hair ornaments */}
          <circle cx="40" cy="-4" r="2" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <circle cx="35" cy="0" r="1.2" fill={p.isRed ? '#ff6688' : p.gold} opacity="0.5" />
          <circle cx="45" cy="0" r="1.2" fill={p.isRed ? '#ff6688' : p.gold} opacity="0.5" />
          {/* Feather */}
          <path d="M44,-2 Q48,-8 46,-12" fill="none" stroke={p.gold} strokeWidth="0.5" opacity="0.4" strokeLinecap="round" />
        </g>
      )
    case 'samurai':
      return (
        <g>
          {/* Elaborate updo with kanzashi — Japanese queen */}
          <path d="M28,22 Q26,14 30,8 Q35,3 40,2 Q45,3 50,8 Q54,14 52,22" fill={p.hair} stroke={p.ink} strokeWidth="0.4" />
          {/* Ornate bun on top */}
          <ellipse cx="40" cy="6" rx="6" ry="5" fill={p.hair} stroke={p.ink} strokeWidth="0.3" />
          {/* Multiple kanzashi hairpins */}
          <line x1="46" y1="6" x2="52" y2="0" stroke={p.gold} strokeWidth="0.6" strokeLinecap="round" />
          <circle cx="52" cy="-1" r="2" fill="#f472b6" opacity="0.6" />
          {[0, 72, 144, 216, 288].map((a, i) => (
            <path key={i} d={`M52,-1 Q50.5,-3 52,-4.5 Q53.5,-3 52,-1`} fill="#f9a8d4" opacity="0.4" transform={`rotate(${a},52,-1)`} />
          ))}
          <line x1="34" y1="4" x2="28" y2="-2" stroke={p.gold} strokeWidth="0.5" strokeLinecap="round" />
          <circle cx="28" cy="-2.5" r="1.5" fill={p.gold} opacity="0.5" />
          {/* Dangling ornaments */}
          <line x1="53" y1="1" x2="54" y2="6" stroke={p.gold} strokeWidth="0.25" />
          <circle cx="54" cy="6.5" r="0.6" fill={p.gold} opacity="0.4" />
        </g>
      )
    case 'pharaonic':
      return (
        <g>
          {/* Hathor crown — sun disk between cow horns */}
          <path d="M24,36 L26,12 Q32,4 40,2 Q48,4 54,12 L56,36" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          {/* Stripes */}
          {[8, 12, 16, 20, 24, 28].map((y, i) => (
            <line key={i} x1="27" y1={y} x2="53" y2={y} stroke={p.ink} strokeWidth="0.2" opacity="0.1" />
          ))}
          {/* Horns with sun disk */}
          <path d="M30,8 Q26,-2 28,-8" fill="none" stroke={p.gold} strokeWidth="1" strokeLinecap="round" />
          <path d="M50,8 Q54,-2 52,-8" fill="none" stroke={p.gold} strokeWidth="1" strokeLinecap="round" />
          <circle cx="40" cy="-2" r="5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" />
          <circle cx="40" cy="-2" r="2.5" fill={p.goldLt} opacity="0.3" />
        </g>
      )
    case 'glacial':
      return (
        <g>
          {/* Ice queen crown — taller, more elaborate than Jack's */}
          <path d="M26,22 L28,12 L32,18 L35,4 L38,14 L40,-2 L42,14 L45,4 L48,18 L52,12 L54,22" fill="#c8e8ff" stroke="#88ccee" strokeWidth="0.5" opacity="0.7" />
          <path d="M28,20 L30,14 L35,6 L40,0 L45,6 L50,14 L52,20" fill="#e8f4ff" opacity="0.25" />
          {/* Frozen hair — flowing icicle strands */}
          <path d="M24,22 Q20,30 22,40 Q21,44 19,48" fill="none" stroke="#b0d8f0" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
          <path d="M56,22 Q60,30 58,40 Q59,44 61,48" fill="none" stroke="#b0d8f0" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
          {/* Snowflake accent */}
          <circle cx="40" cy="0" r="2" fill="#fff" opacity="0.3" />
        </g>
      )
    case 'infernal':
      return (
        <g>
          {/* Flame queen — wild fire hair silhouette */}
          <path d="M26,22 Q24,14 28,6 Q32,0 36,4 L40,-2 L44,4 Q48,0 52,6 Q56,14 54,22" fill={p.hair} stroke={p.ink} strokeWidth="0.4" />
          {/* Flame hair tendrils */}
          <path d="M28,8 Q24,0 26,-6 Q28,-2 30,-4 Q28,2 30,6" fill="#f0a020" opacity="0.3" />
          <path d="M52,8 Q56,0 54,-6 Q52,-2 50,-4 Q52,2 50,6" fill="#f0a020" opacity="0.3" />
          <path d="M38,0 Q36,-6 38,-10" fill="none" stroke="#f08020" strokeWidth="0.5" opacity="0.35" />
          <path d="M42,0 Q44,-6 42,-10" fill="none" stroke="#f0a020" strokeWidth="0.4" opacity="0.3" />
          {/* Ember crown */}
          <path d="M32,16 L34,10 L37,14 L40,6 L43,14 L46,10 L48,16" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" opacity="0.6" />
          <circle cx="40" cy="8" r="1.5" fill="#ef4444" opacity="0.5" />
        </g>
      )
    case 'wraith':
      return (
        <g>
          {/* Spectral veil — flowing ghostly silhouette */}
          <path d="M22,40 Q20,28 24,16 Q28,6 40,0 Q52,6 56,16 Q60,28 58,40" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" opacity="0.7" />
          {/* Ghostly veil over face — translucent */}
          <ellipse cx="40" cy="30" rx="14" ry="16" fill={p.clothing} opacity="0.08" />
          {/* Phantom crown outline */}
          <path d="M32,14 L34,8 L37,12 L40,4 L43,12 L46,8 L48,14" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.2" />
          {/* Wisps */}
          <path d="M22,30 Q18,24 20,18" fill="none" stroke={p.clothing} strokeWidth="0.5" opacity="0.2" />
          <path d="M58,30 Q62,24 60,18" fill="none" stroke={p.clothing} strokeWidth="0.5" opacity="0.2" />
        </g>
      )
    case 'ophidian':
      return (
        <g>
          {/* Medusa-inspired — snake hair silhouette */}
          <path d="M28,22 Q26,14 30,8 Q35,3 40,2 Q45,3 50,8 Q54,14 52,22" fill={p.hair} stroke={p.ink} strokeWidth="0.4" />
          {/* Snake hair tendrils */}
          <path d="M26,20 Q22,14 24,6 Q26,2 28,4" fill="none" stroke={p.hair} strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
          <path d="M54,20 Q58,14 56,6 Q54,2 52,4" fill="none" stroke={p.hair} strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
          <path d="M28,18 Q24,12 26,4 Q28,0 30,2" fill="none" stroke={p.hair} strokeWidth="0.8" opacity="0.35" strokeLinecap="round" />
          <path d="M52,18 Q56,12 54,4 Q52,0 50,2" fill="none" stroke={p.hair} strokeWidth="0.8" opacity="0.35" strokeLinecap="round" />
          {/* Tiny snake eyes at tips */}
          <circle cx="28" cy="4" r="0.5" fill={p.accent} opacity="0.4" />
          <circle cx="52" cy="4" r="0.5" fill={p.accent} opacity="0.4" />
          {/* Snake crown */}
          <path d="M36,6 Q38,2 40,0 Q42,2 44,6" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" opacity="0.5" />
          <circle cx="40" cy="2" r="1.2" fill={p.accent} opacity="0.4" />
        </g>
      )
    case 'astral':
      return (
        <g>
          {/* Star halo — radiating celestial light */}
          <circle cx="40" cy="18" r="18" fill="none" stroke={p.gold} strokeWidth="0.5" opacity="0.15" />
          <circle cx="40" cy="18" r="14" fill="none" stroke={p.gold} strokeWidth="0.35" opacity="0.12" />
          {/* Star rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <line key={i} x1={40 + Math.cos(angle * Math.PI / 180) * 10} y1={18 + Math.sin(angle * Math.PI / 180) * 10} x2={40 + Math.cos(angle * Math.PI / 180) * 20} y2={18 + Math.sin(angle * Math.PI / 180) * 20} stroke={p.gold} strokeWidth="0.25" opacity={i % 2 === 0 ? 0.15 : 0.08} />
          ))}
          {/* Flowing cosmic hair */}
          <path d="M26,22 Q22,16 24,6 Q26,0 30,2" fill="none" stroke={p.hair} strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
          <path d="M54,22 Q58,16 56,6 Q54,0 50,2" fill="none" stroke={p.hair} strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
          {/* Starlight crown */}
          <path d="M34,10 L36,4 L40,0 L44,4 L46,10" fill="none" stroke={p.gold} strokeWidth="0.6" opacity="0.3" />
          <circle cx="40" cy="0" r="1.5" fill={p.gold} opacity="0.4" />
        </g>
      )
    case 'vampiric':
      return (
        <g>
          {/* Vampiress — swept up dark hair with bat motifs */}
          <path d="M26,22 Q24,14 28,6 Q32,0 36,4 L40,2 L44,4 Q48,0 52,6 Q56,14 54,22" fill={p.hair} stroke={p.ink} strokeWidth="0.4" />
          {/* Dark tiara with bat wings */}
          <path d="M32,14 Q28,8 24,10 L30,14" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" opacity="0.5" />
          <path d="M48,14 Q52,8 56,10 L50,14" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" opacity="0.5" />
          {/* Blood drop ruby */}
          <path d="M40,8 Q38,12 40,14 Q42,12 40,8" fill="#880808" stroke={p.goldDk} strokeWidth="0.3" opacity="0.6" />
          {/* Widow's peak */}
          <path d="M36,16 L40,10 L44,16" fill={p.hair} stroke={p.ink} strokeWidth="0.2" />
        </g>
      )
    case 'arcane':
      return (
        <g>
          {/* Sorceress hood with mystical symbols */}
          <path d="M24,38 Q22,28 24,16 Q28,6 40,0 Q52,6 56,16 Q58,28 56,38" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          <path d="M26,36 Q24,28 26,18 Q30,8 40,2 Q50,8 54,18 Q56,28 54,36" fill={p.clothingMid} opacity="0.2" />
          {/* Moon symbol on hood */}
          <path d="M42,8 Q36,6 38,0 Q44,4 42,8" fill={p.accent} opacity="0.3" />
          {/* Mystical hair flowing from hood */}
          <path d="M26,30 Q22,36 24,44" fill="none" stroke={p.hair} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
          <path d="M54,30 Q58,36 56,44" fill="none" stroke={p.hair} strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
        </g>
      )
    case 'sylvan':
      return (
        <g>
          {/* Flower crown — organic beauty */}
          <path d="M28,20 Q26,14 30,8 Q35,3 40,2 Q45,3 50,8 Q54,14 52,20" fill={p.hair} stroke={p.ink} strokeWidth="0.4" />
          {/* Flower wreath */}
          {[[-20, 12], [-5, 6], [5, 6], [20, 12]].map(([angle, y], i) => (
            <g key={i} transform={`rotate(${angle},40,14)`}>
              {[0, 72, 144, 216, 288].map((a, j) => (
                <path key={j} d={`M40,${y} Q38.5,${y! - 2} 40,${y! - 3} Q41.5,${y! - 2} 40,${y}`} fill={i % 2 === 0 ? '#f472b6' : '#fbbf24'} opacity="0.4" transform={`rotate(${a},40,${y})`} />
              ))}
              <circle cx="40" cy={y} r="0.6" fill={p.gold} opacity="0.4" />
            </g>
          ))}
          {/* Vine-entwined hair */}
          <path d="M24,22 Q20,30 22,40 Q21,44 20,48" fill="none" stroke={p.hair} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
          <path d="M56,22 Q60,30 58,40 Q59,44 60,48" fill="none" stroke={p.hair} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
          {/* Leaf accents in hair */}
          <path d="M22,32 Q20,30 22,28 Q22,30 24,30" fill={p.clothing} opacity="0.4" />
          <path d="M58,32 Q60,30 58,28 Q58,30 56,30" fill={p.clothing} opacity="0.4" />
        </g>
      )
    case 'noir':
      return (
        <g>
          {/* Film noir femme fatale — finger waves */}
          <path d="M28,22 Q26,14 30,8 Q35,3 40,4 Q45,3 50,8 Q54,14 52,22" fill={p.hair} stroke={p.ink} strokeWidth="0.4" />
          {/* Marcel waves — distinctive S-curves */}
          <path d="M30,10 Q32,8 34,10 Q36,12 38,10" fill="none" stroke={p.hairHi} strokeWidth="0.3" opacity="0.2" />
          <path d="M42,10 Q44,8 46,10 Q48,12 50,10" fill="none" stroke={p.hairHi} strokeWidth="0.3" opacity="0.2" />
          {/* Side-swept bob */}
          <path d="M24,22 Q22,30 24,38 Q25,42 24,46" fill="none" stroke={p.hair} strokeWidth="2.5" opacity="0.5" strokeLinecap="round" />
          <path d="M56,22 Q58,28 56,34" fill="none" stroke={p.hair} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
          {/* Hair clip — small sparkle */}
          <circle cx="48" cy="10" r="1" fill={p.isRed ? '#881010' : p.gold} opacity="0.4" />
        </g>
      )
    case 'crystalline':
      return (
        <g>
          {/* Crystal tiara — geometric sparkle */}
          <path d="M28,20 L30,12 L34,16 L37,6 L40,14 L43,6 L46,16 L50,12 L52,20" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          <path d="M30,18 L32,14 L37,8 L40,16 L43,8 L48,14 L50,18" fill={p.goldLt} opacity="0.2" />
          {/* Facet lines */}
          <line x1="37" y1="6" x2="40" y2="20" stroke={p.goldDk} strokeWidth="0.15" opacity="0.15" />
          <line x1="43" y1="6" x2="40" y2="20" stroke={p.goldDk} strokeWidth="0.15" opacity="0.15" />
          {/* Diamond sparkles at crown points */}
          {[[37, 6], [40, 14], [43, 6]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.2" fill={p.goldLt} opacity={0.3 + i * 0.05} />
          ))}
          {/* Platinum hair */}
          <path d="M24,22 Q20,30 22,40 Q21,44 20,48" fill="none" stroke={p.hair} strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
          <path d="M56,22 Q60,30 58,40 Q59,44 60,48" fill="none" stroke={p.hair} strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
        </g>
      )
    case 'draconic':
      return (
        <g>
          {/* Dragon queen crown with swept horns */}
          <path d="M28,20 L30,12 L34,16 L37,8 L40,14 L43,8 L46,16 L50,12 L52,20" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          {/* Graceful horns — curving upward */}
          <path d="M32,14 Q28,6 26,0 Q24,-2 22,0" fill="none" stroke={p.gold} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M48,14 Q52,6 54,0 Q56,-2 58,0" fill="none" stroke={p.gold} strokeWidth="1.2" strokeLinecap="round" />
          {/* Central dragon eye jewel */}
          <circle cx="40" cy="10" r="2" fill="#ef4444" opacity="0.6" />
          <circle cx="40" cy="10" r="0.8" fill="#fbbf24" opacity="0.4" />
          {/* Flame wisps from crown */}
          <path d="M37,10 Q35,6 37,4" fill="none" stroke="#f59e0b" strokeWidth="0.35" opacity="0.3" />
          <path d="M43,10 Q45,6 43,4" fill="none" stroke="#f59e0b" strokeWidth="0.35" opacity="0.3" />
        </g>
      )
    default:
      return null
  }
}

// ── Queen Character Body Modifications ──
export function QueenCharacterBody({ theme, p }: { theme: CharacterTheme; p: CharacterProps }) {
  switch (theme) {
    case 'cyberpunk':
      return (
        <g>
          {/* Neon-trimmed bodysuit with tech panels */}
          <path d="M26,48 L22,60 L58,60 L54,48 Q40,54 26,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Glowing circuit seams */}
          <path d="M34,50 L34,58" fill="none" stroke={p.accent} strokeWidth="0.4" opacity="0.3" />
          <path d="M46,50 L46,58" fill="none" stroke={p.accent} strokeWidth="0.4" opacity="0.3" />
          {/* Chest data port */}
          <rect x="37" y="50" width="6" height="3" rx="1" fill={p.accent} opacity="0.2" stroke={p.accent} strokeWidth="0.3" />
        </g>
      )
    case 'baroque':
      return (
        <g>
          {/* Corseted gown with panniers (wide hips) */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Corset lacing */}
          {[50, 53, 56].map((y, i) => (
            <g key={i}>
              <path d={`M38,${y} L40,${y + 1} L42,${y}`} fill="none" stroke={p.gold} strokeWidth="0.3" opacity="0.3" />
            </g>
          ))}
          {/* Lace trim at neckline */}
          <path d="M30,48 Q35,44 40,46 Q45,44 50,48" fill="#f0f0f0" stroke={p.ink} strokeWidth="0.15" opacity="0.3" />
          {/* Brooch at center */}
          <circle cx="40" cy="49" r="1.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.25" opacity="0.5" />
        </g>
      )
    case 'samurai':
      return (
        <g>
          {/* Layered kimono (junihitoe-inspired) */}
          <path d="M24,48 L20,60 L60,60 L56,48 Q40,54 24,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Visible kimono layers at collar */}
          <path d="M34,48 L40,52 L46,48" fill="none" stroke={p.clothingHi} strokeWidth="0.8" opacity="0.4" />
          <path d="M36,48 L40,50 L44,48" fill="none" stroke={p.isRed ? '#e08080' : '#8080a0'} strokeWidth="0.5" opacity="0.3" />
          {/* Obi sash */}
          <rect x="28" y="52" width="24" height="3.5" rx="0.8" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.4" />
          {/* Obi knot */}
          <circle cx="40" cy="53.5" r="1.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.35" />
        </g>
      )
    case 'pharaonic':
      return (
        <g>
          {/* Egyptian queen sheath dress with broad collar */}
          <path d="M26,48 L22,60 L58,60 L54,48 Q40,54 26,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Wesekh collar — beaded semicircular */}
          {[48, 50, 52].map((y, i) => (
            <path key={i} d={`M${28 + i * 2},${y} Q40,${y + 2.5} ${52 - i * 2},${y}`} fill="none" stroke={p.gold} strokeWidth="0.5" opacity={0.35 - i * 0.08} />
          ))}
          {/* Winged Isis center motif */}
          <path d="M38,50 Q36,48 32,49 M42,50 Q44,48 48,49" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.25" />
          <circle cx="40" cy="50" r="1" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.4" />
        </g>
      )
    case 'glacial':
      return (
        <g>
          {/* Flowing ice gown — trailing crystalline hem */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill="#c8e0f0" stroke="#88ccee" strokeWidth="0.4" opacity="0.65" />
          {/* Frost pattern on bodice */}
          <path d="M34,50 Q32,54 34,58" fill="none" stroke="#bbddff" strokeWidth="0.3" opacity="0.3" />
          <path d="M46,50 Q48,54 46,58" fill="none" stroke="#bbddff" strokeWidth="0.3" opacity="0.3" />
          {/* Crystal clasp */}
          <path d="M38,49 L40,47 L42,49 L40,51 Z" fill="#e0f4ff" stroke="#88ccee" strokeWidth="0.3" opacity="0.5" />
        </g>
      )
    case 'infernal':
      return (
        <g>
          {/* Ember-edged gown with smoke hem */}
          <path d="M24,48 L20,60 L26,58 L32,60 L38,57 L44,60 L50,58 L56,60 L60,60 L56,48 Q40,54 24,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          {/* Lava glow at edges */}
          <path d="M24,56 L30,58 L36,55" fill="none" stroke="#f0a020" strokeWidth="0.4" opacity="0.25" />
          <path d="M44,55 L50,58 L56,56" fill="none" stroke="#f08020" strokeWidth="0.4" opacity="0.2" />
          {/* Flame pendant */}
          <path d="M39,50 Q40,48 41,50 Q40,52 39,50" fill="#f0a020" opacity="0.35" />
        </g>
      )
    case 'wraith':
      return (
        <g>
          {/* Flowing spectral robes — ethereal tattered */}
          <path d="M22,48 L18,60 L24,57 L30,60 L36,56 L42,60 L48,56 L54,60 L60,57 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" opacity="0.7" />
          {/* Ghost wisps from dress hem */}
          <path d="M28,55 Q26,52 24,56" fill="none" stroke={p.clothing} strokeWidth="0.3" opacity="0.2" />
          <path d="M52,55 Q54,52 56,56" fill="none" stroke={p.clothing} strokeWidth="0.3" opacity="0.2" />
        </g>
      )
    case 'ophidian':
      return (
        <g>
          {/* Snakeskin gown — scaled and fitted */}
          <path d="M24,48 L20,60 L60,60 L56,48 Q40,54 24,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Scale pattern */}
          {[50, 53, 56].map((y, i) => (
            <path key={i} d={`M${26 + i},${y} Q33,${y - 1.5} 40,${y} Q47,${y - 1.5} ${54 - i},${y}`} fill="none" stroke={p.gold} strokeWidth="0.25" opacity="0.2" />
          ))}
          {/* Snake armlet accent */}
          <path d="M28,49 Q34,51 40,49 Q46,51 52,49" fill="none" stroke={p.gold} strokeWidth="0.6" opacity="0.3" />
        </g>
      )
    case 'astral':
      return (
        <g>
          {/* Nebula robes — cosmic flowing */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Star scatter on gown */}
          {[[30, 53], [36, 56], [44, 55], [50, 52], [40, 50]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.4" fill={p.gold} opacity={0.25 + (i % 2) * 0.15} />
          ))}
          {/* Constellation line */}
          <path d="M30,53 L36,56 L40,50 L44,55 L50,52" fill="none" stroke={p.gold} strokeWidth="0.2" opacity="0.15" />
        </g>
      )
    case 'vampiric':
      return (
        <g>
          {/* Elegant Victorian corset dress */}
          <path d="M24,48 L20,60 L60,60 L56,48 Q40,54 24,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Corset boning lines */}
          {[34, 37, 40, 43, 46].map((x, i) => (
            <line key={i} x1={x} y1="49" x2={x} y2="58" stroke={p.ink} strokeWidth="0.15" opacity="0.12" />
          ))}
          {/* Lace décolletage */}
          <path d="M32,48 Q36,44 40,46 Q44,44 48,48" fill="none" stroke={p.ink} strokeWidth="0.2" opacity="0.15" />
          {/* Ruby pendant */}
          <path d="M39,48 L40,46 L41,48 L40,49 Z" fill="#880808" opacity="0.45" stroke={p.goldDk} strokeWidth="0.2" />
        </g>
      )
    case 'arcane':
      return (
        <g>
          {/* Enchantress robes with mystic trim */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Arcane sigil band at waist */}
          <rect x="28" y="50" width="24" height="2" rx="0.5" fill={p.gold} opacity="0.2" stroke={p.goldDk} strokeWidth="0.2" />
          {/* Glowing runes on bodice */}
          <circle cx="36" cy="54" r="1" fill={p.accent} opacity="0.12" />
          <circle cx="44" cy="54" r="1" fill={p.accent} opacity="0.12" />
        </g>
      )
    case 'sylvan':
      return (
        <g>
          {/* Petal-layered gown — organic flowing */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Overlapping petal layers */}
          {[52, 55, 58].map((y, i) => (
            <path key={i} d={`M${24 + i * 2},${y} Q32,${y - 2} 40,${y} Q48,${y - 2} ${56 - i * 2},${y}`} fill={p.clothingHi} stroke={p.ink} strokeWidth="0.15" opacity={0.3 - i * 0.06} />
          ))}
          {/* Flower brooch */}
          <circle cx="40" cy="49.5" r="1.5" fill={p.accent} opacity="0.25" />
          {[0, 72, 144, 216, 288].map((a, j) => (
            <path key={j} d="M40,49.5 Q38.5,47.5 40,46.5 Q41.5,47.5 40,49.5" fill={p.accent} opacity="0.2" transform={`rotate(${a},40,49.5)`} />
          ))}
        </g>
      )
    case 'noir':
      return (
        <g>
          {/* Slinky evening gown */}
          <path d="M26,48 L22,60 L58,60 L54,48 Q40,54 26,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Diagonal drape fold */}
          <path d="M30,48 Q38,54 36,60" fill="none" stroke={p.clothingMid} strokeWidth="0.3" opacity="0.2" />
          {/* Fur stole at shoulders */}
          <path d="M28,48 Q34,46 40,48 Q46,46 52,48" fill={p.clothingMid} stroke={p.ink} strokeWidth="0.2" opacity="0.3" />
          {/* Pearl necklace hint */}
          <path d="M34,48 Q37,46 40,47 Q43,46 46,48" fill="none" stroke={p.gold} strokeWidth="0.5" opacity="0.2" />
        </g>
      )
    case 'crystalline':
      return (
        <g>
          {/* Faceted crystal gown */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Geometric facet lines */}
          <path d="M30,48 L35,54 L30,60" fill="none" stroke={p.goldDk} strokeWidth="0.2" opacity="0.15" />
          <path d="M50,48 L45,54 L50,60" fill="none" stroke={p.goldDk} strokeWidth="0.2" opacity="0.15" />
          <path d="M35,54 L40,48 L45,54" fill="none" stroke={p.goldDk} strokeWidth="0.2" opacity="0.15" />
          {/* Diamond necklace */}
          <path d="M34,48 Q37,46 40,47 Q43,46 46,48" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.3" />
          <circle cx="40" cy="47.5" r="0.8" fill={p.goldLt} opacity="0.4" />
        </g>
      )
    case 'draconic':
      return (
        <g>
          {/* Dragon queen scaled gown */}
          <path d="M24,48 L20,60 L60,60 L56,48 Q40,54 24,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Scale overlay */}
          {[50, 53, 56].map((y, i) => (
            <g key={i}>
              {[28, 33, 38, 43, 48].map((x, j) => (
                <path key={j} d={`M${x},${y} Q${x + 2.5},${y - 1.5} ${x + 5},${y}`} fill="none" stroke={p.gold} strokeWidth="0.2" opacity={0.2 - i * 0.04} />
              ))}
            </g>
          ))}
          {/* Flame gem pendant */}
          <circle cx="40" cy="49" r="1.5" fill="#ef4444" opacity="0.4" stroke={p.goldDk} strokeWidth="0.3" />
        </g>
      )
    default:
      return null
  }
}

// ── Queen Character Prop Modifications ──
export function QueenCharacterProp({ theme, p }: { theme: CharacterTheme; p: CharacterProps }) {
  switch (theme) {
    case 'cyberpunk':
      return (
        <g>
          {/* Holographic data fan */}
          <g transform="translate(62,38)">
            <path d="M-3,0 Q0,-6 3,0" fill={p.accent} opacity="0.2" stroke={p.accent} strokeWidth="0.4" />
            <path d="M-2,-1 Q0,-4 2,-1" fill={p.accent} opacity="0.15" />
            <line x1="0" y1="0" x2="0" y2="8" stroke={p.accent} strokeWidth="0.6" opacity="0.4" />
          </g>
        </g>
      )
    case 'baroque':
      return (
        <g>
          {/* Ornate hand mirror */}
          <g transform="translate(62,36)">
            <ellipse cx="0" cy="-3" rx="3" ry="4" fill="#c8d0d8" opacity="0.3" stroke={p.gold} strokeWidth="0.5" />
            <ellipse cx="0" cy="-3" rx="2" ry="3" fill={p.goldLt} opacity="0.1" />
            <line x1="0" y1="1" x2="0" y2="10" stroke={p.gold} strokeWidth="0.8" strokeLinecap="round" />
            <circle cx="0" cy="10" r="1" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" />
          </g>
        </g>
      )
    case 'samurai':
      return (
        <g>
          {/* Folding fan (sensu) */}
          <g transform="translate(62,38)">
            {[0, -15, -30, 15, 30].map((angle, i) => (
              <path key={i} d={`M0,5 L${Math.sin(angle * Math.PI / 180) * 8},${5 - Math.cos(angle * Math.PI / 180) * 8}`} fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.3" transform={`rotate(0)`} />
            ))}
            <path d="M-4,-2 Q0,-8 4,-2" fill={p.isRed ? '#e08080' : '#8080c0'} opacity="0.25" stroke={p.gold} strokeWidth="0.3" />
            <circle cx="0" cy="5" r="0.8" fill={p.gold} opacity="0.4" />
          </g>
        </g>
      )
    case 'pharaonic':
      return (
        <g>
          {/* Sistrum (sacred rattle) */}
          <g transform="translate(62,36)">
            <path d="M-2,-6 Q-3,-10 0,-12 Q3,-10 2,-6" fill="none" stroke={p.gold} strokeWidth="0.8" />
            {[-8, -10].map((y, i) => (
              <line key={i} x1="-1.5" y1={y} x2="1.5" y2={y} stroke={p.gold} strokeWidth="0.4" opacity="0.5" />
            ))}
            <line x1="0" y1="-6" x2="0" y2="8" stroke={p.gold} strokeWidth="0.8" strokeLinecap="round" />
          </g>
        </g>
      )
    case 'glacial':
      return (
        <g>
          {/* Ice crystal scepter */}
          <g transform="translate(62,36)">
            <line x1="0" y1="-2" x2="0" y2="12" stroke="#90c8e8" strokeWidth="0.8" strokeLinecap="round" />
            {/* Crystal head */}
            <path d="M-2,-2 L0,-8 L2,-2" fill="#c8e8ff" stroke="#88ccee" strokeWidth="0.3" opacity="0.6" />
            <path d="M-1,-4 L0,-7 L1,-4" fill="#e0f4ff" opacity="0.3" />
          </g>
        </g>
      )
    case 'infernal':
      return (
        <g>
          {/* Flame orb */}
          <g transform="translate(62,38)">
            <circle cx="0" cy="0" r="3.5" fill="#f0a020" opacity="0.2" />
            <circle cx="0" cy="0" r="2" fill="#f06020" opacity="0.25" />
            <circle cx="0" cy="0" r="1" fill="#f0c040" opacity="0.3" />
            {/* Flame wisps */}
            <path d="M-1,-3 Q0,-5 1,-3" fill="none" stroke="#f0a020" strokeWidth="0.4" opacity="0.35" />
          </g>
        </g>
      )
    case 'wraith':
      return (
        <g>
          {/* Phantom lantern */}
          <g transform="translate(62,36)">
            <path d="M-2,0 L-2,-6 L2,-6 L2,0 Z" fill="none" stroke={p.gold} strokeWidth="0.5" opacity="0.3" />
            <circle cx="0" cy="-3" r="1.2" fill={p.accent} opacity="0.2" />
            <line x1="0" y1="-6" x2="0" y2="-8" stroke={p.gold} strokeWidth="0.3" opacity="0.3" />
            <path d="M-1,-8 Q0,-9 1,-8" fill="none" stroke={p.gold} strokeWidth="0.3" opacity="0.25" />
          </g>
        </g>
      )
    case 'ophidian':
      return (
        <g>
          {/* Serpent scepter */}
          <g transform="translate(62,36)">
            <line x1="0" y1="0" x2="0" y2="10" stroke={p.goldDk} strokeWidth="0.8" strokeLinecap="round" />
            <path d="M-1,0 Q-2,-4 0,-6 Q2,-4 1,0" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
            <circle cx="0" cy="-5" r="0.5" fill={p.accent} opacity="0.4" />
          </g>
        </g>
      )
    case 'astral':
      return (
        <g>
          {/* Star orb */}
          <g transform="translate(62,38)">
            <circle cx="0" cy="0" r="3" fill={p.gold} opacity="0.15" />
            <circle cx="0" cy="0" r="1.5" fill={p.gold} opacity="0.25" />
            {[0, 60, 120, 180, 240, 300].map((a, i) => (
              <line key={i} x1="0" y1="-2" x2="0" y2="-4" stroke={p.gold} strokeWidth="0.3" opacity="0.3" transform={`rotate(${a},0,0)`} />
            ))}
          </g>
        </g>
      )
    case 'vampiric':
      return (
        <g>
          {/* Blood rose */}
          <g transform="translate(62,38)">
            {[0, 72, 144, 216, 288].map((a, i) => (
              <path key={i} d="M0,0 Q-1.5,-2 0,-3 Q1.5,-2 0,0" fill="#880808" opacity="0.4" transform={`rotate(${a},0,0)`} />
            ))}
            <circle cx="0" cy="0" r="0.8" fill={p.gold} opacity="0.3" />
            <line x1="0" y1="2" x2="0" y2="10" stroke="#2a4020" strokeWidth="0.6" strokeLinecap="round" />
          </g>
        </g>
      )
    case 'arcane':
      return (
        <g>
          {/* Crystal ball */}
          <g transform="translate(62,38)">
            <circle cx="0" cy="0" r="3.5" fill={p.accent} opacity="0.12" stroke={p.accent} strokeWidth="0.4" />
            <circle cx="0" cy="0" r="2" fill={p.accent} opacity="0.08" />
            {/* Inner glow */}
            <circle cx="-0.5" cy="-0.5" r="0.8" fill={p.accent} opacity="0.2" />
          </g>
        </g>
      )
    case 'sylvan':
      return (
        <g>
          {/* Flowering branch */}
          <g transform="translate(62,36)">
            <path d="M0,0 Q-1,6 0,12" fill="none" stroke="#5a3818" strokeWidth="0.7" strokeLinecap="round" />
            <path d="M0,2 Q-3,0 -2,-2 Q-1,0 0,2" fill={p.clothing} opacity="0.5" />
            <path d="M0,6 Q3,4 2,2 Q1,4 0,6" fill={p.clothing} opacity="0.4" />
            <circle cx="-2" cy="-1" r="0.6" fill={p.accent} opacity="0.3" />
          </g>
        </g>
      )
    case 'noir':
      return (
        <g>
          {/* Cigarette holder */}
          <g transform="translate(62,38)">
            <line x1="0" y1="0" x2="6" y2="-1" stroke="#303030" strokeWidth="0.5" opacity="0.4" />
            <rect x="5" y="-2" width="3" height="1.5" rx="0.3" fill="#f0e0c0" opacity="0.3" />
            {/* Smoke wisp */}
            <path d="M8,-2 Q9,-5 8,-8" fill="none" stroke={p.ink} strokeWidth="0.3" opacity="0.12" />
          </g>
        </g>
      )
    case 'crystalline':
      return (
        <g>
          {/* Diamond scepter */}
          <g transform="translate(62,36)">
            <line x1="0" y1="0" x2="0" y2="10" stroke={p.goldDk} strokeWidth="0.8" strokeLinecap="round" />
            <path d="M-2,0 L0,-5 L2,0 L0,-1 Z" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" />
            <circle cx="0" cy="-3" r="0.5" fill="#fff" opacity="0.3" />
          </g>
        </g>
      )
    case 'draconic':
      return (
        <g>
          {/* Dragon egg */}
          <g transform="translate(62,38)">
            <ellipse cx="0" cy="0" rx="3" ry="4.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" />
            {[-2, 0, 2].map((y, i) => (
              <path key={i} d={`M-2,${y} Q0,${y - 1.5} 2,${y}`} fill="none" stroke={p.goldDk} strokeWidth="0.2" opacity="0.3" />
            ))}
            <ellipse cx="0" cy="-0.5" rx="1.2" ry="1.8" fill="#ef4444" opacity="0.2" />
          </g>
        </g>
      )
    default:
      return null
  }
}

// ── King Character Head Modifications ──
export function KingCharacterHead({ theme, p }: { theme: CharacterTheme; p: CharacterProps }) {
  switch (theme) {
    case 'cyberpunk':
      return (
        <g>
          {/* Heavy mech crown — industrial */}
          <path d="M24,24 L26,10 L30,16 L34,4 L38,14 L40,0 L42,14 L46,4 L50,16 L54,10 L56,24" fill="none" stroke={p.accent} strokeWidth="0.8" opacity="0.5" />
          <rect x="24" y="22" width="32" height="4" rx="1" fill={p.clothingMid} stroke={p.accent} strokeWidth="0.4" opacity="0.4" />
          {/* Tech antennae on crown */}
          <line x1="34" y1="4" x2="32" y2="-2" stroke={p.accent} strokeWidth="0.5" opacity="0.4" />
          <line x1="46" y1="4" x2="48" y2="-2" stroke={p.accent} strokeWidth="0.5" opacity="0.4" />
          <circle cx="32" cy="-2" r="1" fill={p.accent} opacity="0.5" />
          <circle cx="48" cy="-2" r="1" fill={p.accent} opacity="0.5" />
          {/* Crown pulse indicators */}
          {[28, 32, 36, 44, 48, 52].map((x, i) => (
            <circle key={i} cx={x} cy="24" r="0.5" fill={p.accent} opacity={0.3 + (i % 2) * 0.2} />
          ))}
        </g>
      )
    case 'baroque':
      return (
        <g>
          {/* Massive elaborate wig — the tallest/grandest */}
          <path d="M22,24 Q20,10 26,0 Q32,-8 40,-10 Q48,-8 54,0 Q60,10 58,24" fill={p.hair} stroke={p.ink} strokeWidth="0.45" />
          <path d="M24,22 Q22,10 28,2 Q34,-6 40,-8 Q46,-6 52,2 Q58,10 56,22" fill={p.hairHi} opacity="0.1" />
          {/* Elaborate side curls */}
          {[8, 14, 20].map((y, i) => (
            <g key={i}>
              <path d={`M${24 + i},${y} Q${22 + i},${y - 2} ${24 + i},${y - 4}`} fill="none" stroke={p.hair} strokeWidth="0.6" opacity="0.3" />
              <path d={`M${56 - i},${y} Q${58 - i},${y - 2} ${56 - i},${y - 4}`} fill="none" stroke={p.hair} strokeWidth="0.6" opacity="0.3" />
            </g>
          ))}
          {/* Grand crown on top of wig */}
          <path d="M32,0 L30,-6 L35,-2 L38,-8 L40,-4 L42,-8 L45,-2 L50,-6 L48,0" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" />
          <rect x="31" y="-1" width="18" height="2.5" rx="0.8" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
        </g>
      )
    case 'samurai':
      return (
        <g>
          {/* Kabuto helmet — distinctive crest */}
          <path d="M24,24 Q22,16 26,8 Q32,2 40,0 Q48,2 54,8 Q58,16 56,24" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          {/* Maedate (front crest) — tall vertical element */}
          <path d="M38,4 L40,-6 L42,4" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" />
          <circle cx="40" cy="-6" r="1" fill={p.gold} opacity="0.6" />
          {/* Shikoro (neck guard) side flaps */}
          <path d="M24,24 L20,28 L22,30 L26,26" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          <path d="M56,24 L60,28 L58,30 L54,26" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          {/* Fukigaeshi (horn-like turn-backs) */}
          <path d="M28,12 Q24,8 22,10" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" opacity="0.6" />
          <path d="M52,12 Q56,8 58,10" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" opacity="0.6" />
          {/* Horizontal visor */}
          <rect x="28" y="22" width="24" height="2" rx="0.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
        </g>
      )
    case 'pharaonic':
      return (
        <g>
          {/* Pschent double crown — the most elaborate */}
          <path d="M22,38 L24,12 Q30,4 40,0 Q50,4 56,12 L58,38" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          {/* White crown (upper) */}
          <path d="M34,8 L34,0 Q37,-4 40,-6 Q43,-4 46,0 L46,8" fill="#f0f0f0" opacity="0.2" />
          {/* Red crown flaring */}
          <path d="M30,8 Q26,4 24,8" fill={p.isRed ? '#c02020' : '#202080'} opacity="0.3" stroke={p.goldDk} strokeWidth="0.3" />
          {/* Uraeus on crown */}
          <path d="M40,-6 Q38,-8 39,-12 Q40,-10 41,-12 Q42,-8 40,-6" fill={p.gold} stroke={p.goldDk} strokeWidth="0.25" />
          <circle cx="40" cy="-11" r="0.7" fill={p.ink} opacity="0.4" />
          {/* Horizontal stripes */}
          {[10, 14, 18, 22, 26, 30].map((y, i) => (
            <line key={i} x1="25" y1={y} x2="55" y2={y} stroke={p.ink} strokeWidth="0.2" opacity="0.1" />
          ))}
        </g>
      )
    case 'glacial':
      return (
        <g>
          {/* Massive ice king crown — the grandest frozen form */}
          <path d="M24,24 L26,14 L30,20 L33,6 L36,16 L38,0 L40,-6 L42,0 L44,16 L47,6 L50,20 L54,14 L56,24" fill="#b8e0f8" stroke="#88ccee" strokeWidth="0.5" opacity="0.7" />
          <path d="M26,22 L28,16 L33,8 L40,-4 L47,8 L52,16 L54,22" fill="#e0f4ff" opacity="0.2" />
          {/* Massive center icicle */}
          <path d="M38,0 L40,-10 L42,0" fill="#c8e8ff" stroke="#88ccee" strokeWidth="0.3" opacity="0.5" />
          {/* Frost crystals */}
          {[[33, 8], [47, 8], [40, -4]].map(([x, y], i) => (
            <g key={i}>
              <line x1={x! - 1.5} y1={y} x2={x! + 1.5} y2={y} stroke="#bbddff" strokeWidth="0.25" opacity="0.4" />
              <line x1={x} y1={y! - 1.5} x2={x} y2={y! + 1.5} stroke="#bbddff" strokeWidth="0.25" opacity="0.4" />
            </g>
          ))}
        </g>
      )
    case 'infernal':
      return (
        <g>
          {/* Demon king crown — massive horns + flame */}
          <path d="M26,24 Q24,14 28,6 L40,2 L52,6 Q56,14 54,24" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          {/* Enormous sweeping horns */}
          <path d="M28,12 Q22,2 16,-6 Q14,-10 12,-8" fill="none" stroke={p.isRed ? '#880808' : '#444'} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M52,12 Q58,2 64,-6 Q66,-10 68,-8" fill="none" stroke={p.isRed ? '#880808' : '#444'} strokeWidth="1.6" strokeLinecap="round" />
          {/* Fire crown base */}
          <path d="M30,18 L32,10 L36,14 L40,4 L44,14 L48,10 L50,18" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" opacity="0.6" />
          {/* Central inferno */}
          <path d="M38,4 Q36,-2 38,-6 Q40,0 42,-6 Q44,-2 42,4" fill="#f0a020" opacity="0.35" />
          <path d="M39,2 Q39,-2 40,-4 Q41,-2 41,2" fill="#f06020" opacity="0.25" />
        </g>
      )
    case 'wraith':
      return (
        <g>
          {/* Death king — massive hooded cloak */}
          <path d="M20,42 Q18,30 20,16 Q24,4 40,-2 Q56,4 60,16 Q62,30 60,42" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          <path d="M22,40 Q20,30 22,18 Q26,6 40,0 Q54,6 58,18 Q60,30 58,40" fill={p.clothingMid} opacity="0.25" />
          {/* Phantom crown barely visible */}
          <path d="M30,10 L32,4 L36,8 L40,0 L44,8 L48,4 L50,10" fill="none" stroke={p.gold} strokeWidth="0.5" opacity="0.15" />
          {/* Eye glow from deep within hood */}
          <ellipse cx="36" cy="32" rx="2" ry="0.8" fill={p.accent} opacity="0.15" />
          <ellipse cx="44" cy="32" rx="2" ry="0.8" fill={p.accent} opacity="0.15" />
        </g>
      )
    case 'ophidian':
      return (
        <g>
          {/* Serpent king — cobra hood expanded fully */}
          <path d="M16,24 Q14,14 20,6 Q28,0 40,-2 Q52,0 60,6 Q66,14 64,24" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          <path d="M18,22 Q16,14 22,7 Q30,1 40,0 Q50,1 58,7 Q64,14 62,22" fill={p.clothingHi} opacity="0.1" />
          {/* Scale patterns on hood */}
          {[6, 10, 14, 18].map((y, i) => (
            <path key={i} d={`M${26 + i * 2},${y} Q40,${y - 4} ${54 - i * 2},${y}`} fill="none" stroke={p.gold} strokeWidth="0.3" opacity="0.2" />
          ))}
          {/* Third eye — large */}
          <circle cx="40" cy="4" r="3" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" />
          <circle cx="40" cy="4" r="1.5" fill={p.accent} opacity="0.6" />
          <ellipse cx="40" cy="4" rx="0.6" ry="1.5" fill={p.ink} opacity="0.5" />
        </g>
      )
    case 'astral':
      return (
        <g>
          {/* Cosmic emperor — massive halo with constellation */}
          <circle cx="40" cy="18" r="22" fill="none" stroke={p.gold} strokeWidth="0.5" opacity="0.12" />
          <circle cx="40" cy="18" r="18" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.1" />
          <circle cx="40" cy="18" r="14" fill="none" stroke={p.gold} strokeWidth="0.3" opacity="0.08" />
          {/* Star crown */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
            const r = i % 3 === 0 ? 20 : 16
            return (
              <line key={i} x1={40 + Math.cos(angle * Math.PI / 180) * 10} y1={18 + Math.sin(angle * Math.PI / 180) * 10} x2={40 + Math.cos(angle * Math.PI / 180) * r} y2={18 + Math.sin(angle * Math.PI / 180) * r} stroke={p.gold} strokeWidth={i % 3 === 0 ? "0.4" : "0.2"} opacity={i % 3 === 0 ? 0.2 : 0.1} />
            )
          })}
          {/* Distinguished hair */}
          <path d="M26,24 Q22,16 26,6 Q30,0 34,2" fill="none" stroke={p.hair} strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
          <path d="M54,24 Q58,16 54,6 Q50,0 46,2" fill="none" stroke={p.hair} strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
          {/* Crown constellation */}
          <path d="M32,6 L36,2 L40,-2 L44,2 L48,6" fill="none" stroke={p.gold} strokeWidth="0.5" opacity="0.25" />
          {[[32, 6], [36, 2], [40, -2], [44, 2], [48, 6]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.8" fill={p.gold} opacity={0.3 + (i === 2 ? 0.2 : 0)} />
          ))}
        </g>
      )
    case 'vampiric':
      return (
        <g>
          {/* Vampire lord — slicked hair with high collar */}
          <path d="M26,24 Q24,14 28,6 Q32,0 36,2 L40,-2 L44,2 Q48,0 52,6 Q56,14 54,24" fill={p.hair} stroke={p.ink} strokeWidth="0.5" />
          {/* Sharp widow's peak — very pronounced */}
          <path d="M32,14 L40,4 L48,14" fill={p.hair} stroke={p.ink} strokeWidth="0.3" />
          {/* Dark crown with bat motif */}
          <path d="M30,10 L28,4 L34,8 L40,0 L46,8 L52,4 L50,10" fill={p.gold} stroke={p.goldDk} strokeWidth="0.4" opacity="0.4" />
          {/* Bat wing extensions */}
          <path d="M28,4 Q24,0 22,4 Q24,2 28,4" fill={p.gold} opacity="0.3" />
          <path d="M52,4 Q56,0 58,4 Q56,2 52,4" fill={p.gold} opacity="0.3" />
          {/* Blood ruby */}
          <circle cx="40" cy="2" r="1.5" fill="#880808" stroke={p.goldDk} strokeWidth="0.3" opacity="0.6" />
        </g>
      )
    case 'arcane':
      return (
        <g>
          {/* Archmage great hat — tallest pointed hat */}
          <path d="M24,24 L28,14 Q30,6 40,-10 Q50,6 52,14 L56,24" fill={p.clothing} stroke={p.ink} strokeWidth="0.5" />
          <path d="M26,22 L30,14 Q32,8 40,-8 Q48,8 50,14 L54,22" fill={p.clothingMid} opacity="0.25" />
          {/* Wide brim */}
          <ellipse cx="40" cy="23" rx="18" ry="3.5" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Many runes on hat */}
          {[[36, 8], [44, 4], [40, -2], [38, 12]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1 + i * 0.1} fill={p.accent} opacity={0.25 - i * 0.03} />
          ))}
          {/* Great star on tip */}
          <circle cx="40" cy="-10" r="2.5" fill={p.accent} opacity="0.4" />
          <circle cx="40" cy="-10" r="1.2" fill={p.accent} opacity="0.3" />
          {/* Long flowing beard */}
          <path d="M32,40 Q30,48 32,56" fill="none" stroke={p.hair} strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
          <path d="M36,42 Q34,50 36,58" fill="none" stroke={p.hair} strokeWidth="1" opacity="0.25" strokeLinecap="round" />
          <path d="M40,44 Q40,52 40,60" fill="none" stroke={p.hair} strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />
        </g>
      )
    case 'sylvan':
      return (
        <g>
          {/* Forest king — antler crown silhouette */}
          <path d="M28,22 Q26,14 30,8 Q35,3 40,2 Q45,3 50,8 Q54,14 52,22" fill={p.hair} stroke={p.ink} strokeWidth="0.45" />
          {/* Antlers — the defining silhouette */}
          <path d="M32,10 Q28,4 24,-2 Q22,-4 20,-2" fill="none" stroke="#5a3818" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M26,0 Q24,-4 22,-2" fill="none" stroke="#5a3818" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
          <path d="M28,4 Q26,0 24,2" fill="none" stroke="#5a3818" strokeWidth="0.7" opacity="0.5" strokeLinecap="round" />
          <path d="M48,10 Q52,4 56,-2 Q58,-4 60,-2" fill="none" stroke="#5a3818" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M54,0 Q56,-4 58,-2" fill="none" stroke="#5a3818" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
          <path d="M52,4 Q54,0 56,2" fill="none" stroke="#5a3818" strokeWidth="0.7" opacity="0.5" strokeLinecap="round" />
          {/* Leaf band crown */}
          <rect x="28" y="20" width="24" height="3" rx="1" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" opacity="0.6" />
          {[30, 34, 38, 42, 46].map((x, i) => (
            <path key={i} d={`M${x},20 Q${x - 1},18 ${x},17 Q${x + 1},18 ${x},20`} fill={p.clothingHi} opacity="0.5" />
          ))}
        </g>
      )
    case 'noir':
      return (
        <g>
          {/* Mob boss — slicked hair with crown-like authority */}
          <path d="M28,24 Q26,16 30,10 Q35,4 40,3 Q45,4 50,10 Q54,16 52,24" fill={p.hair} stroke={p.ink} strokeWidth="0.45" />
          {/* Slicked-back shine lines */}
          <path d="M32,10 Q36,6 40,5 Q44,6 48,10" fill="none" stroke={p.hairHi} strokeWidth="0.3" opacity="0.15" />
          <path d="M34,12 Q37,8 40,7 Q43,8 46,12" fill="none" stroke={p.hairHi} strokeWidth="0.2" opacity="0.1" />
          {/* Subtle signet ring on head (hat-less king) */}
          {/* Distinguished gray temples */}
          <path d="M28,16 Q26,20 28,24" fill="none" stroke="#888" strokeWidth="0.8" opacity="0.2" />
          <path d="M52,16 Q54,20 52,24" fill="none" stroke="#888" strokeWidth="0.8" opacity="0.2" />
        </g>
      )
    case 'crystalline':
      return (
        <g>
          {/* Grand crystal crown — the most elaborate geometric piece */}
          <path d="M24,24 L26,14 L30,18 L33,4 L36,14 L38,6 L40,-4 L42,6 L44,14 L47,4 L50,18 L54,14 L56,24" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          <path d="M26,22 L28,16 L33,6 L40,-2 L47,6 L52,16 L54,22" fill={p.goldLt} opacity="0.15" />
          {/* Central great diamond */}
          <path d="M37,-2 L40,-8 L43,-2 L40,0 Z" fill={p.goldLt} stroke={p.goldDk} strokeWidth="0.3" />
          <circle cx="40" cy="-4" r="1" fill="#fff" opacity="0.3" />
          {/* Facet lines */}
          {[[33, 4], [47, 4], [38, 6], [42, 6]].map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2="40" y2="24" stroke={p.goldDk} strokeWidth="0.15" opacity="0.1" />
          ))}
          {/* Sparkle points */}
          {[[33, 6], [47, 6], [40, -6]].map(([x, y], i) => (
            <g key={i}>
              <line x1={x! - 1.5} y1={y} x2={x! + 1.5} y2={y} stroke="#fff" strokeWidth="0.3" opacity="0.4" />
              <line x1={x} y1={y! - 1.5} x2={x} y2={y! + 1.5} stroke="#fff" strokeWidth="0.3" opacity="0.4" />
            </g>
          ))}
        </g>
      )
    case 'draconic':
      return (
        <g>
          {/* Dragon king grand crown — the most imposing */}
          <path d="M24,24 Q22,14 28,6 L40,0 L52,6 Q58,14 56,24" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          {/* Massive horns — sweeping wide */}
          <path d="M28,14 Q20,4 14,-4 Q10,-8 8,-6" fill="none" stroke={p.gold} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M52,14 Q60,4 66,-4 Q70,-8 72,-6" fill="none" stroke={p.gold} strokeWidth="1.6" strokeLinecap="round" />
          {/* Horn ridges */}
          <path d="M24,8 Q18,0 14,-4" fill="none" stroke={p.goldDk} strokeWidth="0.4" opacity="0.3" />
          <path d="M56,8 Q62,0 66,-4" fill="none" stroke={p.goldDk} strokeWidth="0.4" opacity="0.3" />
          {/* Central dragon eye — great jewel */}
          <circle cx="40" cy="10" r="3.5" fill="#ef4444" stroke={p.goldDk} strokeWidth="0.5" />
          <circle cx="40" cy="10" r="1.5" fill="#fbbf24" opacity="0.6" />
          <ellipse cx="40" cy="10" rx="0.6" ry="1.5" fill={p.ink} opacity="0.5" />
          {/* Crown scales */}
          <rect x="28" y="20" width="24" height="3.5" rx="1" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          {[30, 34, 38, 42, 46, 50].map((x, i) => (
            <path key={i} d={`M${x},20 L${x + 2},18 L${x + 4},20`} fill={p.goldLt} stroke={p.goldDk} strokeWidth="0.15" opacity="0.35" />
          ))}
        </g>
      )
    default:
      return null
  }
}

// ── King Character Body Modifications ──
export function KingCharacterBody({ theme, p }: { theme: CharacterTheme; p: CharacterProps }) {
  switch (theme) {
    case 'cyberpunk':
      return (
        <g>
          {/* Heavy mech exosuit torso */}
          <path d="M24,48 L20,60 L60,60 L56,48 Q40,54 24,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Shoulder pauldrons */}
          <path d="M24,48 L20,44 L26,46" fill={p.clothingMid} stroke={p.ink} strokeWidth="0.3" />
          <path d="M56,48 L60,44 L54,46" fill={p.clothingMid} stroke={p.ink} strokeWidth="0.3" />
          {/* Chest reactor */}
          <circle cx="40" cy="52" r="2" fill={p.accent} opacity="0.25" />
          <circle cx="40" cy="52" r="1" fill={p.accent} opacity="0.4" />
          {/* Circuit traces */}
          <line x1="38" y1="52" x2="30" y2="56" stroke={p.accent} strokeWidth="0.3" opacity="0.2" />
          <line x1="42" y1="52" x2="50" y2="56" stroke={p.accent} strokeWidth="0.3" opacity="0.2" />
        </g>
      )
    case 'baroque':
      return (
        <g>
          {/* Grand royal mantle with ermine trim */}
          <path d="M20,48 L16,60 L64,60 L60,48 Q40,54 20,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Ermine trim at shoulders */}
          <path d="M24,48 Q32,46 40,48 Q48,46 56,48" fill="#f0f0f0" stroke={p.ink} strokeWidth="0.2" opacity="0.35" />
          {/* Gold embroidered vest underneath */}
          <path d="M34,48 L32,60 L48,60 L46,48" fill={p.gold} opacity="0.12" />
          {/* Medallion chain */}
          <path d="M32,48 Q36,52 40,50 Q44,52 48,48" fill="none" stroke={p.gold} strokeWidth="0.6" opacity="0.3" />
          <circle cx="40" cy="51" r="1.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" opacity="0.5" />
        </g>
      )
    case 'samurai':
      return (
        <g>
          {/* Full samurai armor (o-yoroi) */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Layered sode (shoulder guards) */}
          <path d="M22,48 L18,44 L24,46" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          <path d="M58,48 L62,44 L56,46" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          {/* Horizontal lame bands */}
          {[50, 53, 56].map((y, i) => (
            <rect key={i} x="22" y={y} width="36" height="1.8" rx="0.4" fill={p.clothingHi} stroke={p.ink} strokeWidth="0.15" opacity={0.4 - i * 0.08} />
          ))}
          {/* Grand mon crest */}
          <circle cx="40" cy="50" r="2.5" fill={p.gold} opacity="0.2" stroke={p.goldDk} strokeWidth="0.3" />
        </g>
      )
    case 'pharaonic':
      return (
        <g>
          {/* Pharaoh's broad wesekh collar and shendyt */}
          <path d="M24,48 L20,60 L60,60 L56,48 Q40,54 24,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Grand wesekh collar — multiple beaded bands */}
          {[48, 50, 52, 54].map((y, i) => (
            <path key={i} d={`M${24 + i * 2},${y} Q40,${y + 3} ${56 - i * 2},${y}`} fill="none" stroke={p.gold} strokeWidth="0.5" opacity={0.4 - i * 0.07} />
          ))}
          {/* Central scarab */}
          <ellipse cx="40" cy="50" rx="2.5" ry="2" fill={p.gold} stroke={p.goldDk} strokeWidth="0.25" opacity="0.4" />
        </g>
      )
    case 'glacial':
      return (
        <g>
          {/* Frost king plate armor — massive ice plates */}
          <path d="M20,48 L16,60 L64,60 L60,48 Q40,54 20,48 Z" fill="#b8d8f0" stroke="#88ccee" strokeWidth="0.4" opacity="0.7" />
          {/* Large ice plate edges */}
          <path d="M28,50 L24,56 L32,60 L36,54 L28,50" fill="none" stroke="#a0d0f0" strokeWidth="0.3" opacity="0.25" />
          <path d="M52,50 L56,56 L48,60 L44,54 L52,50" fill="none" stroke="#a0d0f0" strokeWidth="0.3" opacity="0.25" />
          {/* Grand snowflake buckle */}
          <circle cx="40" cy="50" r="2.5" fill="none" stroke="#bbddff" strokeWidth="0.5" opacity="0.4" />
          {[0, 60, 120, 180, 240, 300].map((a, i) => (
            <line key={i} x1="40" y1="47.5" x2="40" y2="46.5" stroke="#bbddff" strokeWidth="0.4" opacity="0.35" transform={`rotate(${a},40,50)`} />
          ))}
        </g>
      )
    case 'infernal':
      return (
        <g>
          {/* Demon king heavy plate — magma-cracked */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Large shoulder spikes */}
          <path d="M24,48 L18,42 L26,46" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          <path d="M56,48 L62,42 L54,46" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          {/* Lava cracks — larger than Jack's */}
          <path d="M30,50 L28,56 L34,58 L30,60" fill="none" stroke="#f0a020" strokeWidth="0.5" opacity="0.3" />
          <path d="M50,50 L52,56 L46,58 L50,60" fill="none" stroke="#f08020" strokeWidth="0.5" opacity="0.25" />
          {/* Infernal sigil center */}
          <circle cx="40" cy="52" r="2" fill="#f06020" opacity="0.2" />
          <path d="M38,52 L40,50 L42,52 L40,54 Z" fill="#f0a020" opacity="0.25" />
        </g>
      )
    case 'wraith':
      return (
        <g>
          {/* Death king tattered grand cloak */}
          <path d="M20,48 L16,60 L22,57 L28,60 L34,56 L40,60 L46,56 L52,60 L58,57 L64,60 L60,48 Q40,54 20,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          <path d="M26,50 Q34,54 40,52 Q46,54 54,50" fill={p.clothingMid} opacity="0.15" />
          {/* Deeper shadow wisps */}
          <path d="M26,55 Q22,52 20,56" fill="none" stroke={p.ink} strokeWidth="0.4" opacity="0.2" />
          <path d="M54,55 Q58,52 60,56" fill="none" stroke={p.ink} strokeWidth="0.4" opacity="0.2" />
        </g>
      )
    case 'ophidian':
      return (
        <g>
          {/* Serpent king armor — heavy scale plate */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Grand scale rows */}
          {[50, 53, 56].map((y, i) => (
            <path key={i} d={`M${22 + i},${y} Q31,${y - 2} 40,${y} Q49,${y - 2} ${58 - i},${y}`} fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.25" />
          ))}
          {/* Grand serpent belt with gem */}
          <path d="M26,49 Q33,51 40,49 Q47,51 54,49" fill="none" stroke={p.gold} strokeWidth="1" opacity="0.4" />
          <circle cx="40" cy="49.5" r="1.8" fill={p.accent} opacity="0.35" stroke={p.goldDk} strokeWidth="0.3" />
        </g>
      )
    case 'astral':
      return (
        <g>
          {/* Cosmic emperor robes */}
          <path d="M20,48 L16,60 L64,60 L60,48 Q40,54 20,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Grand constellation */}
          {[[28, 52], [34, 56], [40, 51], [46, 55], [52, 52], [40, 58]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.6" fill={p.gold} opacity={0.3 + (i % 2) * 0.15} />
          ))}
          <path d="M28,52 L34,56 L40,51 L46,55 L52,52" fill="none" stroke={p.gold} strokeWidth="0.3" opacity="0.2" />
          <path d="M34,56 L40,58 L46,55" fill="none" stroke={p.gold} strokeWidth="0.2" opacity="0.15" />
          {/* Cosmic sash */}
          <path d="M28,49 Q40,52 52,49" fill="none" stroke={p.gold} strokeWidth="1" opacity="0.2" />
        </g>
      )
    case 'vampiric':
      return (
        <g>
          {/* Vampire lord grand cape */}
          <path d="M20,44 L16,60 L64,60 L60,44" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Massive collar wings */}
          <path d="M26,44 L20,36 L26,40" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          <path d="M54,44 L60,36 L54,40" fill={p.clothing} stroke={p.ink} strokeWidth="0.3" />
          {/* Vest with gold buttons */}
          <path d="M32,46 L30,60 L50,60 L48,46" fill={p.isRed ? '#680808' : '#1a1a1a'} stroke={p.ink} strokeWidth="0.2" opacity="0.4" />
          {[50, 53, 56].map((y, i) => (
            <circle key={i} cx="40" cy={y} r="0.7" fill={p.gold} opacity="0.3" />
          ))}
          {/* Grand cravat */}
          <path d="M36,45 L40,50 L44,45" fill={p.isRed ? '#a02020' : '#c02020'} stroke={p.ink} strokeWidth="0.2" opacity="0.5" />
        </g>
      )
    case 'arcane':
      return (
        <g>
          {/* Archmage's grand robes */}
          <path d="M20,48 L16,60 L64,60 L60,48 Q40,54 20,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Grand rune belt */}
          <rect x="26" y="48" width="28" height="3" rx="1" fill={p.gold} opacity="0.25" stroke={p.goldDk} strokeWidth="0.25" />
          {/* Multiple arcane sigils */}
          {[32, 38, 44, 50].map((x, i) => (
            <circle key={i} cx={x} cy="54" r="1.5" fill={p.accent} opacity="0.12" />
          ))}
          {/* Glowing rune cross */}
          <path d="M39,54 L41,54 M40,53 L40,55" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.2" />
        </g>
      )
    case 'sylvan':
      return (
        <g>
          {/* Forest king bark armor with moss */}
          <path d="M22,48 L18,60 L62,60 L58,48 Q40,54 22,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Root/vine patterns */}
          <path d="M28,50 Q32,56 30,60" fill="none" stroke={p.clothingHi} strokeWidth="0.5" opacity="0.3" />
          <path d="M52,50 Q48,56 50,60" fill="none" stroke={p.clothingHi} strokeWidth="0.5" opacity="0.3" />
          {/* Grand leaf belt */}
          {[30, 34, 38, 42, 46, 50].map((x, i) => (
            <path key={i} d={`M${x},49 Q${x - 1.5},46 ${x},44 Q${x + 1.5},46 ${x},49`} fill={p.clothingHi} stroke={p.ink} strokeWidth="0.15" opacity="0.45" />
          ))}
          {/* Moss patches */}
          <circle cx="34" cy="54" r="1.2" fill={p.clothing} opacity="0.2" />
          <circle cx="46" cy="56" r="1" fill={p.clothing} opacity="0.15" />
        </g>
      )
    case 'noir':
      return (
        <g>
          {/* Mob boss pinstripe suit */}
          <path d="M24,48 L20,60 L60,60 L56,48 Q40,54 24,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Pinstripe lines */}
          {[30, 34, 38, 42, 46, 50].map((x, i) => (
            <line key={i} x1={x} y1="48" x2={x - 1} y2="60" stroke={p.ink} strokeWidth="0.15" opacity="0.08" />
          ))}
          {/* Wide lapels */}
          <path d="M34,48 L40,56 L32,60" fill={p.clothingMid} stroke={p.ink} strokeWidth="0.2" opacity="0.4" />
          <path d="M46,48 L40,56 L48,60" fill={p.clothingMid} stroke={p.ink} strokeWidth="0.2" opacity="0.4" />
          {/* Power tie */}
          <path d="M39,47 L40,58 L41,47" fill={p.isRed ? '#801010' : '#101010'} stroke={p.ink} strokeWidth="0.15" opacity="0.5" />
        </g>
      )
    case 'crystalline':
      return (
        <g>
          {/* Grand crystal armor */}
          <path d="M20,48 L16,60 L64,60 L60,48 Q40,54 20,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Grand faceted plates */}
          <path d="M26,48 L32,54 L26,60" fill="none" stroke={p.goldDk} strokeWidth="0.25" opacity="0.15" />
          <path d="M54,48 L48,54 L54,60" fill="none" stroke={p.goldDk} strokeWidth="0.25" opacity="0.15" />
          <path d="M32,54 L40,48 L48,54 L40,60 Z" fill="none" stroke={p.goldDk} strokeWidth="0.2" opacity="0.12" />
          {/* Central great diamond */}
          <path d="M38,50 L40,48 L42,50 L40,52 Z" fill={p.gold} stroke={p.goldDk} strokeWidth="0.25" opacity="0.5" />
          <circle cx="40" cy="50" r="0.6" fill="#fff" opacity="0.3" />
        </g>
      )
    case 'draconic':
      return (
        <g>
          {/* Dragon king grand scale plate */}
          <path d="M20,48 L16,60 L64,60 L60,48 Q40,54 20,48 Z" fill={p.clothing} stroke={p.ink} strokeWidth="0.4" />
          {/* Grand overlapping scale rows */}
          {[50, 53, 56].map((y, i) => (
            <g key={i}>
              {[22, 27, 32, 37, 42, 47, 52].map((x, j) => (
                <path key={j} d={`M${x},${y} Q${x + 2.5},${y - 2} ${x + 5},${y}`} fill="none" stroke={p.gold} strokeWidth="0.3" opacity={0.25 - i * 0.05} />
              ))}
            </g>
          ))}
          {/* Grand dragon eye buckle */}
          <ellipse cx="40" cy="50" rx="2.5" ry="1.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <ellipse cx="40" cy="50" rx="0.6" ry="1.3" fill="#ef4444" opacity="0.5" />
        </g>
      )
    default:
      return null
  }
}

// ── King Character Prop Modifications ──
export function KingCharacterProp({ theme, p }: { theme: CharacterTheme; p: CharacterProps }) {
  switch (theme) {
    case 'cyberpunk':
      return (
        <g>
          {/* Energy blade scepter */}
          <line x1="15" y1="30" x2="14" y2="56" stroke={p.accent} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          {/* Energy blade at top */}
          <path d="M12,30 L15,18 L18,30" fill={p.accent} opacity="0.25" stroke={p.accent} strokeWidth="0.4" />
          {/* Power cell rings */}
          <circle cx="15" cy="36" r="2" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.3" />
          <circle cx="15" cy="44" r="2" fill="none" stroke={p.accent} strokeWidth="0.3" opacity="0.2" />
        </g>
      )
    case 'baroque':
      return (
        <g>
          {/* Ornate royal scepter with fleur-de-lis */}
          <line x1="15" y1="30" x2="14" y2="56" stroke={p.gold} strokeWidth="1.2" strokeLinecap="round" />
          {/* Fleur-de-lis top */}
          <path d="M15,30 Q13,26 12,22 Q14,24 15,22 Q16,24 18,22 Q17,26 15,30" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          {/* Ornamented shaft bands */}
          <rect x="13.5" y="34" width="3" height="1.5" rx="0.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.4" />
          <rect x="13.5" y="40" width="3" height="1.5" rx="0.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.2" opacity="0.35" />
        </g>
      )
    case 'samurai':
      return (
        <g>
          {/* Tachi (grand sword) */}
          <line x1="15" y1="24" x2="13" y2="56" stroke="#606868" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="15" y1="24" x2="13" y2="56" stroke="#c0c8c8" strokeWidth="0.3" opacity="0.2" />
          {/* Tsuba (guard) */}
          <ellipse cx="14.5" cy="32" rx="3" ry="1.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          {/* Sageo cord */}
          <path d="M12,34 Q10,36 12,38" fill="none" stroke={p.gold} strokeWidth="0.4" opacity="0.3" />
        </g>
      )
    case 'pharaonic':
      return (
        <g>
          {/* Crook (heka) and flail (nekhakha) */}
          <path d="M15,28 Q12,24 10,28 Q8,32 12,32 L15,28" fill={p.gold} stroke={p.goldDk} strokeWidth="0.5" />
          <line x1="15" y1="28" x2="14" y2="56" stroke={p.gold} strokeWidth="1.2" strokeLinecap="round" />
          {/* Flail with beaded strands */}
          <line x1="12" y1="30" x2="7" y2="38" stroke={p.gold} strokeWidth="0.6" />
          <line x1="12" y1="30" x2="6" y2="36" stroke={p.gold} strokeWidth="0.6" />
          <line x1="12" y1="30" x2="8" y2="40" stroke={p.gold} strokeWidth="0.6" />
          {/* Beads */}
          {[[7, 38], [6, 36], [8, 40]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.6" fill={p.gold} opacity="0.4" />
          ))}
        </g>
      )
    case 'glacial':
      return (
        <g>
          {/* Grand ice scepter */}
          <line x1="15" y1="26" x2="14" y2="56" stroke="#90c8e8" strokeWidth="1.4" strokeLinecap="round" />
          {/* Large crystal top */}
          <path d="M12,26 L15,14 L18,26" fill="#c8e8ff" stroke="#88ccee" strokeWidth="0.4" opacity="0.6" />
          <path d="M13,24 L15,16 L17,24" fill="#e0f4ff" opacity="0.25" />
          {/* Frost branches */}
          <path d="M13,34 L10,32 M17,38 L20,36" fill="none" stroke="#bbddff" strokeWidth="0.3" opacity="0.3" />
        </g>
      )
    case 'infernal':
      return (
        <g>
          {/* Demon king inferno staff */}
          <line x1="15" y1="28" x2="14" y2="56" stroke={p.ink} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
          {/* Massive flame head */}
          <path d="M15,28 Q11,20 13,12 Q14,18 15,12 Q16,18 17,12 Q19,20 15,28" fill="#f0a020" opacity="0.35" />
          <path d="M14,24 Q13,18 14,14 Q15,20 16,14 Q17,18 16,24" fill="#f06020" opacity="0.25" />
          {/* Skull knob at base */}
          <circle cx="14" cy="56" r="1.5" fill={p.gold} opacity="0.3" stroke={p.goldDk} strokeWidth="0.2" />
        </g>
      )
    case 'wraith':
      return (
        <g>
          {/* Spectral great scythe */}
          <line x1="15" y1="22" x2="14" y2="56" stroke={p.gold} strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
          {/* Scythe blade — large curved */}
          <path d="M10,22 Q15,16 20,22 Q18,18 15,22" fill={p.gold} opacity="0.3" stroke={p.goldDk} strokeWidth="0.3" />
          <path d="M20,22 Q24,28 20,36" fill="none" stroke={p.gold} strokeWidth="1" opacity="0.25" />
        </g>
      )
    case 'ophidian':
      return (
        <g>
          {/* Grand serpent staff */}
          <line x1="15" y1="22" x2="14" y2="56" stroke={p.goldDk} strokeWidth="1.4" strokeLinecap="round" />
          {/* Double coiling snakes */}
          <path d="M13,26 Q17,30 13,34 Q17,38 13,42" fill="none" stroke={p.gold} strokeWidth="0.8" opacity="0.4" />
          <path d="M17,28 Q13,32 17,36 Q13,40 17,44" fill="none" stroke={p.gold} strokeWidth="0.6" opacity="0.3" />
          {/* Dual snake heads at top */}
          <circle cx="13" cy="24" r="1.5" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <circle cx="17" cy="26" r="1.2" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
        </g>
      )
    case 'astral':
      return (
        <g>
          {/* Cosmic emperor scepter */}
          <line x1="15" y1="26" x2="14" y2="56" stroke={p.gold} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          {/* Grand star tip */}
          <circle cx="15" cy="22" r="4" fill={p.gold} opacity="0.2" />
          <path d="M15,18 L16,20 L18.5,20 L17,21.5 L17.5,24 L15,22.5 L12.5,24 L13,21.5 L11.5,20 L14,20 Z" fill={p.gold} opacity="0.45" />
          {/* Trailing nebula */}
          {[32, 38, 44, 50].map((y, i) => (
            <circle key={i} cx={14.5 + (i % 2) * 0.5} cy={y} r="0.5" fill={p.gold} opacity={0.25 - i * 0.04} />
          ))}
        </g>
      )
    case 'vampiric':
      return (
        <g>
          {/* Blood chalice (grand goblet) */}
          <path d="M10,30 Q8,36 10,40 L11,40 L10.5,46 L8,46 L9,47 L21,47 L22,46 L19.5,46 L19,40 L20,40 Q22,36 20,30 Z" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" opacity="0.5" />
          {/* Blood-red wine — overflowing */}
          <ellipse cx="15" cy="32" rx="3" ry="1" fill="#880808" opacity="0.45" />
          {/* Drip */}
          <path d="M12,34 Q11.5,36 12,38" fill="none" stroke="#880808" strokeWidth="0.3" opacity="0.3" />
        </g>
      )
    case 'arcane':
      return (
        <g>
          {/* Archmage grand staff */}
          <line x1="15" y1="24" x2="14" y2="56" stroke="#5a3818" strokeWidth="1.4" strokeLinecap="round" />
          {/* Grand orb at top */}
          <circle cx="15" cy="20" r="4" fill={p.accent} opacity="0.15" stroke={p.accent} strokeWidth="0.5" />
          <circle cx="15" cy="20" r="2" fill={p.accent} opacity="0.25" />
          {/* Orbiting rune particles */}
          {[0, 120, 240].map((a, i) => (
            <circle key={i} cx={15 + Math.cos(a * Math.PI / 180) * 5} cy={20 + Math.sin(a * Math.PI / 180) * 5} r="0.6" fill={p.accent} opacity="0.3" />
          ))}
        </g>
      )
    case 'sylvan':
      return (
        <g>
          {/* Great living staff with branching canopy */}
          <path d="M15,20 Q14.5,38 14,56" fill="none" stroke="#5a3818" strokeWidth="1.8" strokeLinecap="round" />
          {/* Branching top */}
          <path d="M15,20 Q12,16 10,14" fill="none" stroke="#5a3818" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M15,20 Q18,16 20,14" fill="none" stroke="#5a3818" strokeWidth="0.8" strokeLinecap="round" />
          {/* Leaf canopy */}
          <path d="M10,14 Q8,12 10,10 Q11,12 12,12" fill={p.clothing} opacity="0.5" />
          <path d="M20,14 Q22,12 20,10 Q19,12 18,12" fill={p.clothing} opacity="0.5" />
          <path d="M15,18 Q13,14 15,12 Q17,14 15,18" fill={p.clothing} opacity="0.4" />
          {/* Nature glow */}
          <circle cx="15" cy="16" r="2" fill={p.accent} opacity="0.15" />
        </g>
      )
    case 'noir':
      return (
        <g>
          {/* Tommy gun (silhouette) */}
          <rect x="10" y="36" width="10" height="3" rx="1" fill="#404040" stroke={p.ink} strokeWidth="0.3" opacity="0.4" />
          <rect x="7" y="37" width="4" height="1.5" rx="0.3" fill="#505050" stroke={p.ink} strokeWidth="0.2" opacity="0.35" />
          {/* Magazine */}
          <rect x="14" y="39" width="2.5" height="6" rx="0.5" fill="#404040" stroke={p.ink} strokeWidth="0.2" opacity="0.35" />
          {/* Barrel */}
          <rect x="19" y="36.5" width="5" height="2" rx="0.4" fill="#505050" stroke={p.ink} strokeWidth="0.15" opacity="0.3" />
        </g>
      )
    case 'crystalline':
      return (
        <g>
          {/* Grand diamond scepter */}
          <line x1="15" y1="28" x2="14" y2="56" stroke={p.goldDk} strokeWidth="1.2" strokeLinecap="round" />
          {/* Grand diamond head */}
          <path d="M11,28 L15,16 L19,28 L15,24 Z" fill={p.gold} stroke={p.goldDk} strokeWidth="0.3" />
          <path d="M13,26 L15,18 L17,26" fill={p.goldLt} opacity="0.25" />
          {/* Sparkle at apex */}
          <g>
            <line x1="14" y1="18" x2="16" y2="18" stroke="#fff" strokeWidth="0.4" opacity="0.5" />
            <line x1="15" y1="17" x2="15" y2="19" stroke="#fff" strokeWidth="0.4" opacity="0.5" />
          </g>
        </g>
      )
    case 'draconic':
      return (
        <g>
          {/* Dragon king great flame staff */}
          <line x1="15" y1="28" x2="14" y2="56" stroke={p.goldDk} strokeWidth="1.4" strokeLinecap="round" />
          {/* Grand flame */}
          <path d="M15,28 Q11,20 13,10 Q14,16 15,10 Q16,16 17,10 Q19,20 15,28" fill="#ef4444" opacity="0.35" />
          <path d="M14,24 Q13,18 14.5,12 Q15.5,18 16,24" fill="#fbbf24" opacity="0.3" />
          {/* Dragon coil on shaft */}
          <path d="M13,36 Q11,34 13,32 Q15,34 13,36" fill={p.gold} opacity="0.3" stroke={p.goldDk} strokeWidth="0.3" />
          <path d="M15,42 Q17,40 15,38 Q13,40 15,42" fill={p.gold} opacity="0.25" stroke={p.goldDk} strokeWidth="0.2" />
        </g>
      )
    default:
      return null
  }
}

// ── Master accessor: get character overlay for a face card role ──
// This replaces the headwear/body sections with unique themed characters
export function getCharacterOverlays(
  role: 'jack' | 'queen' | 'king',
  skinId: string,
  props: CharacterProps
) {
  const theme = getCharacterTheme(skinId)
  if (theme === 'european') return null // Classic uses base art

  switch (role) {
    case 'jack':
      return (
        <>
          <JackCharacterHead theme={theme} p={props} />
          <JackCharacterBody theme={theme} p={props} />
          <JackCharacterProp theme={theme} p={props} />
        </>
      )
    case 'queen':
      return (
        <>
          <QueenCharacterHead theme={theme} p={props} />
          <QueenCharacterBody theme={theme} p={props} />
          <QueenCharacterProp theme={theme} p={props} />
        </>
      )
    case 'king':
      return (
        <>
          <KingCharacterHead theme={theme} p={props} />
          <KingCharacterBody theme={theme} p={props} />
          <KingCharacterProp theme={theme} p={props} />
        </>
      )
  }
}
