import { useEffect, useRef, useState } from 'react'
import './Card.css'
import type { Card as CardType, CardBackTheme, Suit } from '../types'
import { useGameSettings } from '../config/GameSettingsContext'
import { FACE_CARD_TEXTURES } from './faceCardTextures'
import { loadCardSkinState, getSkinById, CARD_SKINS, type CardSkin } from '../utils/cardSkinShop'

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

interface SuitAccent {
  primary: string
  secondary: string
  tertiary: string
}

const SUIT_ACCENTS: Record<Suit, SuitAccent> = {
  hearts: { primary: '#bf1b35', secondary: '#d94060', tertiary: '#f5d0d8' },
  diamonds: { primary: '#bf1b35', secondary: '#d94060', tertiary: '#f5d0d8' },
  clubs: { primary: '#18182e', secondary: '#36365c', tertiary: '#d4d4e6' },
  spades: { primary: '#18182e', secondary: '#36365c', tertiary: '#d4d4e6' },
}

/* ─────────────────────────────────────────────────────────
   Legally Safe Hybrid Painted Face Cards — v4 Original Artwork
   100% original procedural SVG + raster paint textures.
   Not traced or copied from any proprietary deck. Design
   language inspired by the traditional European court card
   pattern (public domain, pre-1900 origin). Reference:
   - me.uk/cards (CC0 Public Domain)
   - Wikimedia Commons English Pattern deck (CC0)
   - OpenGameArt.org playing card assets (CC0)
   Raster textures are procedurally generated mathematical
   noise (Mulberry32 PRNG). See preview/pd-face-cards-v4/
   LICENSE_NOTES.md for full legal notes.
   ───────────────────────────────────────────────────────── */

// Shared rendering helpers for consistent face-card artwork
function FaceCardFrame({ suit, label, children }: { suit: Suit; label: string; children: React.ReactNode }) {
  const c = SUIT_ACCENTS[suit]
  const gold = '#c9a84c'
  const goldDark = '#8b6914'
  const goldBright = '#e0c470'
  const pid = `${label}-${suit}`
  return (
    <svg viewBox="0 0 80 120" className="face-svg" role="img" aria-label={`${label} figure`}>
      <defs>
        <clipPath id={`${pid}-top`}><rect x="0" y="0" width="80" height="60" /></clipPath>
        <clipPath id={`${pid}-bot`}><rect x="0" y="60" width="80" height="60" /></clipPath>
        {/* Region clip paths — constrain textures to body zones (matches approved v4 composition) */}
        <clipPath id={`${pid}-face-clip`}>
          <ellipse cx="40" cy={label === 'king' ? '36' : label === 'queen' ? '34' : '33.5'} rx="11" ry="12" />
        </clipPath>
        <clipPath id={`${pid}-body-clip`}>
          <path d={label === 'king' ? 'M20,57 L17,60 L63,60 L60,57 L55,49 Q40,56 25,49 Z' : label === 'queen' ? 'M23,48 L19,60 L61,60 L57,48 Q40,56 23,48 Z' : 'M24,49 L20,60 L60,60 L56,49 Q40,55 24,49 Z'} />
        </clipPath>
        <clipPath id={`${pid}-hair-clip`}>
          <path d={label === 'king' ? 'M23,24 L23,40 L30,40 L30,24 Z M50,24 L50,40 L57,40 L57,24 Z' : label === 'queen' ? 'M21,22 L21,48 L30,48 L30,22 Z M50,22 L50,48 L59,48 L59,22 Z' : 'M21,20 L21,38 L30,38 L30,20 Z M50,20 L50,38 L59,38 L59,20 Z'} />
        </clipPath>
        {/* Hybrid v4 raster paint textures — decoded once, GPU-cached */}
        <pattern id={`${pid}-tex-canvas`} patternUnits="userSpaceOnUse" width="64" height="64">
          <image href={FACE_CARD_TEXTURES.CANVAS_GRAIN} width="64" height="64" />
        </pattern>
        <pattern id={`${pid}-tex-skin`} patternUnits="userSpaceOnUse" width="80" height="80">
          <image href={FACE_CARD_TEXTURES.SKIN_PAINT} width="80" height="80" />
        </pattern>
        <pattern id={`${pid}-tex-fabric`} patternUnits="userSpaceOnUse" width="80" height="80">
          <image href={FACE_CARD_TEXTURES.FABRIC_PAINT} width="80" height="80" />
        </pattern>
        <pattern id={`${pid}-tex-hair`} patternUnits="userSpaceOnUse" width="48" height="96">
          <image href={FACE_CARD_TEXTURES.HAIR_PAINT} width="48" height="96" />
        </pattern>
        <pattern id={`${pid}-tex-brush`} patternUnits="userSpaceOnUse" width="96" height="96">
          <image href={FACE_CARD_TEXTURES.BRUSH_OVERLAY} width="96" height="96" />
        </pattern>
        {/* Warm radial vignette — deeper to match approved French portrait tone */}
        <radialGradient id={`${pid}-vignette`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fffdf5" stopOpacity="0.18" />
          <stop offset="50%" stopColor="#faf5e8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#d8d0c0" stopOpacity="0.18" />
        </radialGradient>
        {/* Warm inner glow — brighter center for portrait focus */}
        <radialGradient id={`${pid}-glow`} cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#fffdf5" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#faf5e8" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#fffdf5" stopOpacity="0" />
        </radialGradient>
        {/* Gold gradient for premium gilding */}
        <linearGradient id={`${pid}-goldGrad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={goldBright} />
          <stop offset="50%" stopColor={gold} />
          <stop offset="100%" stopColor={goldDark} />
        </linearGradient>
        {/* Aged parchment overlay gradient */}
        <linearGradient id={`${pid}-aged`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8dcc8" stopOpacity="0.06" />
          <stop offset="50%" stopColor="#f0e8d8" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#d8ceb8" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* Background — vignette base + canvas grain texture (stronger for painted card stock) */}
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${pid}-vignette)`} />
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${pid}-tex-canvas)`} opacity="0.65" />
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${pid}-glow)`} />
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${pid}-aged)`} />
      {/* Decorative triple inner border — engraved frame */}
      <rect x="2" y="2" width="76" height="116" rx="3.5" fill="none" stroke={c.primary} strokeWidth="0.45" opacity="0.18" />
      <rect x="3.5" y="3.5" width="73" height="113" rx="3" fill="none" stroke={`url(#${pid}-goldGrad)`} strokeWidth="0.4" opacity="0.28" />
      <rect x="5" y="5" width="70" height="110" rx="2.5" fill="none" stroke={goldBright} strokeWidth="0.18" opacity="0.15" />
      {/* Corner flourishes — refined scroll ornaments */}
      {[[6, 6, ''], [74, 6, 'scale(-1,1) translate(-80,0)'], [6, 114, 'scale(1,-1) translate(0,-120)'], [74, 114, 'scale(-1,-1) translate(-80,-120)']].map(([_x, _y, t], i) => (
        <g key={i} transform={t as string}>
          <path d="M6,6 Q6,14 14,14" fill="none" stroke={gold} strokeWidth="0.35" opacity="0.32" />
          <path d="M6,6 Q6,12 12,12" fill="none" stroke={goldBright} strokeWidth="0.28" opacity="0.24" />
          <path d="M6,6 Q6,9 9,9" fill="none" stroke={goldBright} strokeWidth="0.2" opacity="0.18" />
          <circle cx="6" cy="6" r="0.8" fill={gold} opacity="0.26" />
          <circle cx="6" cy="6" r="0.35" fill={goldBright} opacity="0.18" />
          <path d="M7.5,7.5 Q9,9 10,11" fill="none" stroke={gold} strokeWidth="0.18" opacity="0.15" />
        </g>
      ))}
      {/* Top Half */}
      <g clipPath={`url(#${pid}-top)`}>{children}</g>
      {/* Center divider — ornamental triple rule with rosette */}
      <line x1="5" y1="60" x2="75" y2="60" stroke={c.primary} strokeWidth="0.35" opacity="0.22" />
      <line x1="7" y1="59.3" x2="73" y2="59.3" stroke={goldDark} strokeWidth="0.18" opacity="0.15" />
      <line x1="7" y1="60.7" x2="73" y2="60.7" stroke={goldDark} strokeWidth="0.18" opacity="0.15" />
      {/* Center ornament — faceted diamond */}
      <path d="M37.5,60 L40,58 L42.5,60 L40,62 Z" fill={gold} opacity="0.22" />
      <path d="M38.5,60 L40,58.8 L41.5,60 L40,61.2 Z" fill={goldBright} opacity="0.12" />
      <circle cx="34" cy="60" r="0.45" fill={gold} opacity="0.15" />
      <circle cx="46" cy="60" r="0.45" fill={gold} opacity="0.15" />
      {/* Center suit pips */}
      <text x="12" y="57.8" fontSize="5.5" fill={c.primary} fontFamily="serif" opacity="0.5">{SUIT_SYMBOLS[suit]}</text>
      <text x="68" y="64" fontSize="5.5" fill={c.primary} fontFamily="serif" textAnchor="middle" transform="rotate(180,68,62)" opacity="0.5">{SUIT_SYMBOLS[suit]}</text>
      {/* Bottom Half (mirrored) */}
      <g clipPath={`url(#${pid}-bot)`} transform="rotate(180,40,90)">{children}</g>
      {/* Full-card brush overlay — slightly stronger for painted feel at gameplay scale */}
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${pid}-tex-brush)`} opacity="0.18" />
    </svg>
  )
}

/* Shared color palette factory for consistent court card styling */
function useCourtColors(suit: Suit) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  return {
    c,
    isRed,
    skin: '#f0dfc0',
    skinShade: '#c8a878',
    skinHi: '#f8ecd8',
    gold: '#c9a84c',
    goldDk: '#8b6914',
    goldLt: '#e0c470',
    ink: isRed ? '#6a0e1e' : '#0a0a18',
  }
}

/* ── Jack ─────────────────────────────────────────────── */
function JackSVG({ suit }: { suit: Suit }) {
  const { c, isRed, skin, skinShade, skinHi, gold, goldDk, goldLt, ink } = useCourtColors(suit)
  const hair = isRed ? '#6e4424' : '#1a1020'
  const hairHi = isRed ? '#8a5a38' : '#2a2040'
  const cap = isRed ? '#a41428' : '#141430'
  const capMid = isRed ? '#c82840' : '#262648'
  const capHi = isRed ? '#d83850' : '#363660'
  const tunic = isRed ? '#a41428' : '#141430'
  const tunicMid = isRed ? '#c42e40' : '#242444'
  const tunicHi = isRed ? '#d84858' : '#343458'
  const pid = `jack-${suit}`

  const halfContent = (
    <>
      {/* ── Plumed cap — tighter French portrait composition ── */}
      <ellipse cx="40" cy="20.5" rx="14" ry="6.5" fill={cap} stroke={ink} strokeWidth="0.55" />
      <path d="M27.5,20.5 Q26.5,13 31,8.5 Q35,4 40,10 Q45,4 49,8.5 Q53.5,13 52.5,20.5" fill={cap} stroke={ink} strokeWidth="0.55" />
      <path d="M29.5,19 Q29,14 33,10 Q36.5,6.5 40,10.5 Q43.5,6.5 47,10 Q51,14 50.5,19" fill={capMid} opacity="0.4" />
      <path d="M34,10.5 Q37,7.5 40,11 Q43,7.5 46,10.5" fill={capHi} opacity="0.15" />
      {/* Cap fabric texture — heavier for painted velvet read */}
      <ellipse cx="40" cy="14" rx="14" ry="10" fill={`url(#${pid}-tex-fabric)`} opacity="0.45" />
      <ellipse cx="40" cy="14" rx="14" ry="10" fill={`url(#${pid}-tex-brush)`} opacity="0.3" />
      {/* Cap texture lines */}
      <path d="M31,14 Q35.5,9 40,13" fill="none" stroke={ink} strokeWidth="0.08" opacity="0.08" />
      <path d="M40,13 Q44.5,9 49,14" fill="none" stroke={ink} strokeWidth="0.08" opacity="0.08" />
      {/* Gold hat-band */}
      <rect x="28" y="18.5" width="24" height="3.2" rx="1.2" fill={gold} stroke={goldDk} strokeWidth="0.35" />
      <rect x="29" y="19" width="22" height="2.2" rx="0.8" fill={goldLt} opacity="0.25" />
      <rect x="29" y="19" width="22" height="1" rx="0.4" fill={goldLt} opacity="0.12" />
      {/* Band stones */}
      <ellipse cx="40" cy="20" rx="1.2" ry="1.1" fill={c.secondary} stroke={goldDk} strokeWidth="0.3" />
      <ellipse cx="40" cy="19.8" rx="0.6" ry="0.5" fill={c.tertiary} opacity="0.3" />
      <circle cx="39.6" cy="19.6" r="0.3" fill="#fff" opacity="0.5" />
      <circle cx="34" cy="20" r="0.7" fill={gold} stroke={goldDk} strokeWidth="0.2" />
      <circle cx="46" cy="20" r="0.7" fill={gold} stroke={goldDk} strokeWidth="0.2" />
      {/* Plume */}
      <path d="M33,17 Q28,7 24.5,1" fill="none" stroke={gold} strokeWidth="0.9" strokeLinecap="round" />
      <path d="M33,16 Q29.5,8 26.5,3.5" fill="none" stroke={goldLt} strokeWidth="0.4" opacity="0.5" strokeLinecap="round" />
      <path d="M31.5,12 Q29,11 27.5,12" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.4" />
      <path d="M30.5,9 Q28,8.5 26.5,9.5" fill="none" stroke={gold} strokeWidth="0.22" opacity="0.35" />
      <path d="M29.5,6 Q27.5,5.5 26,6.5" fill="none" stroke={gold} strokeWidth="0.18" opacity="0.3" />
      <path d="M28.5,3.5 Q27,3 25.5,3.5" fill="none" stroke={gold} strokeWidth="0.15" opacity="0.25" />

      {/* ── Hair — loose curls from under cap ── */}
      <path d="M27,21.5 Q23,27 24.5,36" fill="none" stroke={hair} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M53,21.5 Q57,27 55.5,36" fill="none" stroke={hair} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M25.5,26 Q22.5,31 24,37" fill="none" stroke={hair} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <path d="M54.5,26 Q57.5,31 56,37" fill="none" stroke={hair} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <path d="M27.5,24 Q25.5,27 26,31" fill="none" stroke={hairHi} strokeWidth="0.45" opacity="0.2" strokeLinecap="round" />
      <path d="M52.5,24 Q54.5,27 54,31" fill="none" stroke={hairHi} strokeWidth="0.45" opacity="0.2" strokeLinecap="round" />
      {/* Hair paint texture — clip-masked to hair regions */}
      <g clipPath={`url(#${pid}-hair-clip)`}>
        <rect x="21" y="20" width="38" height="18" fill={`url(#${pid}-tex-hair)`} opacity="0.65" />
      </g>

      {/* ── Face — youthful oval (French portrait proportions) ── */}
      <ellipse cx="40" cy="33.5" rx="10.8" ry="11.8" fill={skin} stroke={ink} strokeWidth="0.55" />
      {/* Skin paint texture — clip-masked to face region, stronger for painterly depth */}
      <g clipPath={`url(#${pid}-face-clip)`}>
        <rect x="28" y="21" width="24" height="26" fill={`url(#${pid}-tex-skin)`} opacity="0.6" />
      </g>
      {/* Forehead highlight — warmer for oil-painted read */}
      <ellipse cx="40" cy="28" rx="6" ry="3" fill={skinHi} opacity="0.18" />
      {/* Orbital shadows — deeper for gameplay scale readability */}
      <ellipse cx="36" cy="30" rx="3.2" ry="1.8" fill={skinShade} opacity="0.1" />
      <ellipse cx="44" cy="30" rx="3.2" ry="1.8" fill={skinShade} opacity="0.1" />
      {/* Cheekbone highlights */}
      <ellipse cx="33.5" cy="34" rx="2" ry="1.2" fill={skinHi} opacity="0.12" />
      <ellipse cx="46.5" cy="34" rx="2" ry="1.2" fill={skinHi} opacity="0.12" />
      {/* Jaw modeling — stronger contour */}
      <path d="M30.5,38 Q33.5,44 40,45 Q46.5,44 49.5,38" fill="none" stroke={skinShade} strokeWidth="0.3" opacity="0.3" />
      {/* Cheek warmth — rosier for French portrait style */}
      <ellipse cx="33.5" cy="36.5" rx="2.5" ry="1.5" fill="#d8a080" opacity="0.22" />
      <ellipse cx="46.5" cy="36.5" rx="2.5" ry="1.5" fill="#d8a080" opacity="0.22" />
      {/* Temple shadows — deeper */}
      <ellipse cx="30.5" cy="32" rx="1.5" ry="3" fill={skinShade} opacity="0.1" />
      <ellipse cx="49.5" cy="32" rx="1.5" ry="3" fill={skinShade} opacity="0.1" />
      {/* Face brush texture overlay */}
      <ellipse cx="40" cy="33.5" rx="10" ry="11" fill={`url(#${pid}-tex-brush)`} opacity="0.22" />
      {/* Eyes — multi-layered for painted depth */}
      <ellipse cx="36" cy="31" rx="2" ry="1.35" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      <ellipse cx="44" cy="31" rx="2" ry="1.35" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      {/* Iris base */}
      <circle cx="36.2" cy="31.1" r="1.05" fill={c.primary} />
      <circle cx="44.2" cy="31.1" r="1.05" fill={c.primary} />
      {/* Iris definition rings */}
      <circle cx="36.2" cy="31.1" r="0.85" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.4" />
      <circle cx="44.2" cy="31.1" r="0.85" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.4" />
      {/* Pupil */}
      <circle cx="36.5" cy="30.7" r="0.5" fill="#111" />
      <circle cx="44.5" cy="30.7" r="0.5" fill="#111" />
      {/* Catchlight */}
      <circle cx="35.9" cy="30.6" r="0.28" fill="#fff" />
      <circle cx="43.9" cy="30.6" r="0.28" fill="#fff" />
      {/* Upper eyelids */}
      <path d="M33.7,29.6 Q36,28.8 38.3,29.6" fill="none" stroke={ink} strokeWidth="0.4" />
      <path d="M41.7,29.6 Q44,28.8 46.3,29.6" fill="none" stroke={ink} strokeWidth="0.4" />
      {/* Lower lid definition */}
      <path d="M34.2,32 Q36,32.5 37.8,32" fill="none" stroke={skinShade} strokeWidth="0.15" opacity="0.22" />
      <path d="M42.2,32 Q44,32.5 45.8,32" fill="none" stroke={skinShade} strokeWidth="0.15" opacity="0.22" />
      {/* Eyelashes — 3 per eye for painted detail at scale */}
      <line x1="34" y1="29.8" x2="33.5" y2="29.2" stroke={ink} strokeWidth="0.12" opacity="0.3" />
      <line x1="36" y1="29" x2="36" y2="28.4" stroke={ink} strokeWidth="0.12" opacity="0.25" />
      <line x1="38" y1="29.8" x2="38.5" y2="29.2" stroke={ink} strokeWidth="0.12" opacity="0.3" />
      <line x1="42" y1="29.8" x2="41.5" y2="29.2" stroke={ink} strokeWidth="0.12" opacity="0.3" />
      <line x1="44" y1="29" x2="44" y2="28.4" stroke={ink} strokeWidth="0.12" opacity="0.25" />
      <line x1="46" y1="29.8" x2="46.5" y2="29.2" stroke={ink} strokeWidth="0.12" opacity="0.3" />
      {/* Brows */}
      <path d="M33.3,28.3 Q36,27.1 38.7,28.1" fill="none" stroke={ink} strokeWidth="0.5" strokeLinecap="round" />
      <path d="M41.3,28.1 Q44,27.1 46.7,28.3" fill="none" stroke={ink} strokeWidth="0.5" strokeLinecap="round" />
      {/* Nose */}
      <path d="M40,32.5 L39.3,36.2 Q40,37 40.7,36.5" fill="none" stroke={skinShade} strokeWidth="0.4" strokeLinecap="round" />
      <line x1="40.2" y1="33" x2="40.1" y2="35" stroke={skinHi} strokeWidth="0.25" opacity="0.12" />
      {/* Nasolabial folds */}
      <path d="M37,37 Q36.5,38.5 37.5,39" fill="none" stroke={skinShade} strokeWidth="0.1" opacity="0.12" />
      <path d="M43,37 Q43.5,38.5 42.5,39" fill="none" stroke={skinShade} strokeWidth="0.1" opacity="0.12" />
      {/* Mouth — gradient-layered for painted depth */}
      <path d="M37.5,39.3 Q40,40.5 42.5,39.3" fill="#be6858" stroke="#985040" strokeWidth="0.3" />
      <path d="M37.5,39.3 Q40,40.1 42.5,39.3" fill="#d07868" opacity="0.35" />
      <path d="M38.3,39.4 Q40,39.7 41.7,39.4" fill="#f5e0d0" opacity="0.3" />

      {/* ── Pointed collar with gilding and lace detail ── */}
      <path d="M28.5,44.5 L33.5,49 L40,45.5 L46.5,49 L51.5,44.5" fill={gold} stroke={goldDk} strokeWidth="0.4" />
      <path d="M29.8,45.5 L33.5,48 L40,46 L46.5,48 L50.2,45.5" fill={goldLt} opacity="0.2" />
      {/* Lace scallop edge */}
      <path d="M29,44.8 Q30.5,43.5 32,44.8 Q33.5,43.5 35,44.8 Q36.5,43.5 38,44.8 Q39.5,43.5 40,44.5 Q40.5,43.5 42,44.8 Q43.5,43.5 45,44.8 Q46.5,43.5 48,44.8 Q49.5,43.5 51,44.8" fill="none" stroke="#f0eadc" strokeWidth="0.2" opacity="0.35" />
      <path d="M30,45 L33.5,48" fill="none" stroke={goldDk} strokeWidth="0.15" opacity="0.25" />
      <path d="M50,45 L46.5,48" fill="none" stroke={goldDk} strokeWidth="0.15" opacity="0.25" />
      {/* Filigree lines on collar */}
      <path d="M31,46 Q33,47.5 35,46.5" fill="none" stroke={goldLt} strokeWidth="0.1" opacity="0.18" />
      <path d="M45,46.5 Q47,47.5 49,46" fill="none" stroke={goldLt} strokeWidth="0.1" opacity="0.18" />
      <circle cx="40" cy="46.2" r="1.3" fill={c.secondary} stroke={goldDk} strokeWidth="0.3" />
      <path d="M39.2,45.8 L40,45 L40.8,45.8" fill={c.tertiary} opacity="0.3" />
      <circle cx="39.6" cy="45.8" r="0.28" fill="#fff" opacity="0.45" />
      {/* Flanking collar jewels */}
      <circle cx="34" cy="47" r="0.6" fill={gold} stroke={goldDk} strokeWidth="0.15" />
      <circle cx="46" cy="47" r="0.6" fill={gold} stroke={goldDk} strokeWidth="0.15" />

      {/* ── Tunic ── */}
      <path d="M24.5,49 L20.5,60 L59.5,60 L55.5,49 Q40,55.5 24.5,49 Z" fill={tunic} stroke={ink} strokeWidth="0.45" />
      {/* Fabric paint texture — clip-masked, stronger for painted garment read */}
      <g clipPath={`url(#${pid}-body-clip)`}>
        <rect x="20" y="49" width="40" height="12" fill={`url(#${pid}-tex-fabric)`} opacity="0.8" />
        <rect x="20" y="49" width="40" height="12" fill={`url(#${pid}-tex-brush)`} opacity="0.35" />
      </g>
      <path d="M32,50 Q36,54 40,51 Q44,54 48,50" fill={tunicHi} opacity="0.07" />
      <path d="M36.5,50.5 L40,58.5 L43.5,50.5" fill={tunicMid} opacity="0.22" />
      <line x1="40" y1="49" x2="40" y2="60" stroke={gold} strokeWidth="0.55" opacity="0.35" />
      <circle cx="40" cy="52" r="0.7" fill={gold} stroke={goldDk} strokeWidth="0.2" />
      <circle cx="40" cy="55" r="0.65" fill={gold} stroke={goldDk} strokeWidth="0.2" />
      <circle cx="40" cy="58" r="0.55" fill={gold} stroke={goldDk} strokeWidth="0.15" />
      {/* Fabric shading */}
      <path d="M26,52 L28.5,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.08" />
      <path d="M28,51 L30,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.06" />
      <path d="M52,51 L50,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.06" />
      <path d="M54,52 L51.5,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.08" />

      {/* ── Halberd (traditional Jack prop) ── */}
      <line x1="60" y1="24" x2="62.5" y2="56" stroke={goldDk} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="60" y1="24" x2="62.5" y2="56" stroke={gold} strokeWidth="0.35" opacity="0.2" strokeLinecap="round" />
      <circle cx="61" cy="35" r="0.5" fill="none" stroke={gold} strokeWidth="0.2" opacity="0.25" />
      <circle cx="61.5" cy="42" r="0.4" fill="none" stroke={gold} strokeWidth="0.18" opacity="0.2" />
      <path d="M58.5,26 L60,24 L64.5,27.5 L63,31.5 Z" fill={isRed ? '#788888' : '#888898'} stroke={ink} strokeWidth="0.35" />
      <path d="M59.5,27 L61,25.5 L63.5,28" fill="none" stroke="#b0b8b8" strokeWidth="0.2" opacity="0.2" />
      <path d="M64.5,27.5 L63,31.5" fill="none" stroke="#c0c8c8" strokeWidth="0.25" opacity="0.3" />
    </>
  )

  return <FaceCardFrame suit={suit} label="jack">{halfContent}</FaceCardFrame>
}

/* ── Queen ────────────────────────────────────────────── */
function QueenSVG({ suit }: { suit: Suit }) {
  const { c, isRed, skin, skinShade, skinHi, gold, goldDk, goldLt, ink } = useCourtColors(suit)
  const hair = isRed ? '#5c2c14' : '#100810'
  const hairHi = isRed ? '#7a4020' : '#201820'
  const dress = isRed ? '#a41428' : '#141430'
  const dressMid = isRed ? '#c42e40' : '#242444'
  const dressHi = isRed ? '#d44858' : '#343458'
  const jewel = isRed ? '#1e4488' : '#b82828'
  const jewelHi = isRed ? '#3a68b0' : '#d84848'
  const pid = `queen-${suit}`

  const halfContent = (
    <>
      {/* ── Five-pointed crown ── */}
      <path d="M28.5,20 L27,10.5 L31.5,15 L34.5,6 L37.5,13 L40,3.5 L42.5,13 L45.5,6 L48.5,15 L53,10.5 L51.5,20 Z" fill={gold} stroke={goldDk} strokeWidth="0.5" />
      <path d="M30,19 L28.5,12 L32,15.5 L34.5,8 L37.5,14 L40,6 L42.5,14 L45.5,8 L48,15.5 L51.5,12 L50,19" fill={goldLt} opacity="0.14" />
      {/* Crown band + ermine */}
      <rect x="28.5" y="18.5" width="23" height="3.5" rx="1" fill={gold} stroke={goldDk} strokeWidth="0.35" />
      <rect x="29.5" y="19.2" width="21" height="2.2" rx="0.7" fill="#f2ece0" opacity="0.85" />
      {[32.5, 36, 39.5, 43, 46.5].map((cx, i) => (
        <circle key={i} cx={cx} cy="20.3" r="0.4" fill="#1a1a1a" />
      ))}
      {/* Crown jewels */}
      <circle cx="34.5" cy="8" r="1.7" fill={jewel} stroke={goldDk} strokeWidth="0.3" />
      <circle cx="34.5" cy="7.5" r="0.7" fill={jewelHi} opacity="0.2" />
      <circle cx="40" cy="6" r="1.9" fill={jewel} stroke={goldDk} strokeWidth="0.35" />
      <circle cx="40" cy="5.5" r="0.8" fill={jewelHi} opacity="0.2" />
      <circle cx="45.5" cy="8" r="1.7" fill={jewel} stroke={goldDk} strokeWidth="0.3" />
      <circle cx="45.5" cy="7.5" r="0.7" fill={jewelHi} opacity="0.2" />
      <circle cx="34" cy="7.5" r="0.4" fill="#fff" opacity="0.45" />
      <circle cx="39.5" cy="5.5" r="0.45" fill="#fff" opacity="0.45" />
      <circle cx="45" cy="7.5" r="0.4" fill="#fff" opacity="0.45" />
      {/* Cross finial */}
      <line x1="40" y1="0.5" x2="40" y2="4" stroke={goldDk} strokeWidth="1" />
      <line x1="38.6" y1="1.8" x2="41.4" y2="1.8" stroke={goldDk} strokeWidth="0.7" />
      <circle cx="40" cy="0.5" r="0.5" fill={gold} />

      {/* ── Hair — flowing waves ── */}
      <path d="M28.5,22 Q24.5,29 25.5,39 Q25,43 23,48" fill="none" stroke={hair} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M51.5,22 Q55.5,29 54.5,39 Q55,43 57,48" fill="none" stroke={hair} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M26.5,24 Q23,32 24.5,41" fill="none" stroke={hair} strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
      <path d="M53.5,24 Q57,32 55.5,41" fill="none" stroke={hair} strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
      <path d="M28,25 Q25,30 26,35" fill="none" stroke={hairHi} strokeWidth="0.4" opacity="0.16" strokeLinecap="round" />
      <path d="M52,25 Q55,30 54,35" fill="none" stroke={hairHi} strokeWidth="0.4" opacity="0.16" strokeLinecap="round" />
      <path d="M27,28 Q25.5,33 26,37" fill="none" stroke={hair} strokeWidth="0.3" opacity="0.18" />
      <path d="M53,28 Q54.5,33 54,37" fill="none" stroke={hair} strokeWidth="0.3" opacity="0.18" />
      {/* Hair paint texture — clip-masked to hair regions */}
      <g clipPath={`url(#${pid}-hair-clip)`}>
        <rect x="21" y="22" width="38" height="26" fill={`url(#${pid}-tex-hair)`} opacity="0.65" />
      </g>

      {/* ── Face — elegant oval (French portrait proportions) ── */}
      <ellipse cx="40" cy="34" rx="10.3" ry="11.8" fill={skin} stroke={ink} strokeWidth="0.55" />
      {/* Skin paint texture — clip-masked to face region, stronger for painterly depth */}
      <g clipPath={`url(#${pid}-face-clip)`}>
        <rect x="28" y="22" width="24" height="26" fill={`url(#${pid}-tex-skin)`} opacity="0.6" />
      </g>
      {/* Forehead highlight — warmer */}
      <ellipse cx="40" cy="28.5" rx="5.5" ry="2.8" fill={skinHi} opacity="0.16" />
      {/* Orbital shadows — deeper */}
      <ellipse cx="36" cy="30.5" rx="3" ry="1.6" fill={skinShade} opacity="0.1" />
      <ellipse cx="44" cy="30.5" rx="3" ry="1.6" fill={skinShade} opacity="0.1" />
      {/* Cheekbone highlights */}
      <ellipse cx="33.5" cy="35" rx="2" ry="1.2" fill={skinHi} opacity="0.12" />
      <ellipse cx="46.5" cy="35" rx="2" ry="1.2" fill={skinHi} opacity="0.12" />
      {/* Jaw modeling — stronger contour */}
      <path d="M31.5,37 Q34.5,43.5 40,45 Q45.5,43.5 48.5,37" fill="none" stroke={skinShade} strokeWidth="0.28" opacity="0.3" />
      {/* Cheek warmth — rosier for French portrait */}
      <ellipse cx="34" cy="37" rx="2.5" ry="1.5" fill="#d8a080" opacity="0.22" />
      <ellipse cx="46" cy="37" rx="2.5" ry="1.5" fill="#d8a080" opacity="0.22" />
      {/* Temple shadows — deeper */}
      <ellipse cx="31" cy="33" rx="1.5" ry="3" fill={skinShade} opacity="0.1" />
      <ellipse cx="49" cy="33" rx="1.5" ry="3" fill={skinShade} opacity="0.1" />
      {/* Face brush texture overlay */}
      <ellipse cx="40" cy="34" rx="10" ry="11" fill={`url(#${pid}-tex-brush)`} opacity="0.22" />
      {/* Eyes — multi-layered for painted depth */}
      <ellipse cx="36" cy="31.5" rx="2.1" ry="1.4" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      <ellipse cx="44" cy="31.5" rx="2.1" ry="1.4" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      {/* Iris base */}
      <circle cx="36.2" cy="31.6" r="1.1" fill={c.primary} />
      <circle cx="44.2" cy="31.6" r="1.1" fill={c.primary} />
      {/* Iris definition rings */}
      <circle cx="36.2" cy="31.6" r="0.9" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.4" />
      <circle cx="44.2" cy="31.6" r="0.9" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.4" />
      {/* Pupil */}
      <circle cx="36.5" cy="31.2" r="0.5" fill="#111" />
      <circle cx="44.5" cy="31.2" r="0.5" fill="#111" />
      {/* Catchlight */}
      <circle cx="35.8" cy="31" r="0.28" fill="#fff" />
      <circle cx="43.8" cy="31" r="0.28" fill="#fff" />
      {/* Upper eyelids */}
      <path d="M33.6,30 Q36,29.1 38.5,30.1" fill="none" stroke={ink} strokeWidth="0.42" />
      <path d="M41.5,30.1 Q44,29.1 46.4,30" fill="none" stroke={ink} strokeWidth="0.42" />
      {/* Lower lid definition */}
      <path d="M34,32.5 Q36,33 38,32.5" fill="none" stroke={skinShade} strokeWidth="0.13" opacity="0.2" />
      <path d="M42,32.5 Q44,33 46,32.5" fill="none" stroke={skinShade} strokeWidth="0.13" opacity="0.2" />
      {/* Eyelashes */}
      <line x1="33.8" y1="30.2" x2="33.3" y2="29.6" stroke={ink} strokeWidth="0.1" opacity="0.3" />
      <line x1="36" y1="29.3" x2="36" y2="28.8" stroke={ink} strokeWidth="0.1" opacity="0.25" />
      <line x1="38.2" y1="30.2" x2="38.7" y2="29.6" stroke={ink} strokeWidth="0.1" opacity="0.3" />
      <line x1="41.8" y1="30.2" x2="41.3" y2="29.6" stroke={ink} strokeWidth="0.1" opacity="0.3" />
      <line x1="44" y1="29.3" x2="44" y2="28.8" stroke={ink} strokeWidth="0.1" opacity="0.25" />
      <line x1="46.2" y1="30.2" x2="46.7" y2="29.6" stroke={ink} strokeWidth="0.1" opacity="0.3" />
      {/* Delicate brows */}
      <path d="M33.5,28.6 Q36,27.4 38.5,28.3" fill="none" stroke={hair} strokeWidth="0.32" strokeLinecap="round" />
      <path d="M41.5,28.3 Q44,27.4 46.5,28.6" fill="none" stroke={hair} strokeWidth="0.32" strokeLinecap="round" />
      {/* Nose */}
      <path d="M40,33 L39.3,36.8 Q40,37.5 40.7,37" fill="none" stroke={skinShade} strokeWidth="0.38" strokeLinecap="round" />
      <line x1="40.1" y1="33.5" x2="40" y2="35.5" stroke={skinHi} strokeWidth="0.22" opacity="0.1" />
      {/* Nasolabial folds */}
      <path d="M37,38 Q36.5,39 37.5,39.5" fill="none" stroke={skinShade} strokeWidth="0.1" opacity="0.1" />
      <path d="M43,38 Q43.5,39 42.5,39.5" fill="none" stroke={skinShade} strokeWidth="0.1" opacity="0.1" />
      {/* Lips — gradient-layered for painted depth */}
      <path d="M37.4,39.8 Q38.5,39 40,40.1 Q41.5,39 42.6,39.8 Q41,41.5 40,41.5 Q39,41.5 37.4,39.8 Z" fill="#c06060" stroke="#9a4040" strokeWidth="0.25" />
      <path d="M37.8,39.9 Q40,40.5 42.2,39.9" fill="#d07070" opacity="0.3" />
      <path d="M38.5,39.6 Q40,39.9 41.5,39.6" fill="#f5e0d0" opacity="0.3" />

      {/* ── Necklace with pendant ── */}
      <path d="M30.5,45.5 Q35.5,48 40,49 Q44.5,48 49.5,45.5" fill="none" stroke={gold} strokeWidth="0.75" />
      <path d="M32,46.5 Q36,48.5 40,49 Q44,48.5 48,46.5" fill="none" stroke={goldLt} strokeWidth="0.25" opacity="0.25" />
      <circle cx="40" cy="49.2" r="1.9" fill={jewel} stroke={goldDk} strokeWidth="0.3" />
      <circle cx="40" cy="48.8" r="0.8" fill={jewelHi} opacity="0.15" />
      <circle cx="39.6" cy="48.7" r="0.35" fill="#fff" opacity="0.35" />
      <circle cx="35.5" cy="47.3" r="0.8" fill={gold} stroke={goldDk} strokeWidth="0.18" />
      <circle cx="44.5" cy="47.3" r="0.8" fill={gold} stroke={goldDk} strokeWidth="0.18" />

      {/* ── Dress bodice ── */}
      <path d="M23.5,48 L19.5,60 L60.5,60 L56.5,48 Q40,56 23.5,48 Z" fill={dress} stroke={ink} strokeWidth="0.45" />
      {/* Fabric paint texture — clip-masked, stronger for painted garment read */}
      <g clipPath={`url(#${pid}-body-clip)`}>
        <rect x="19" y="48" width="42" height="13" fill={`url(#${pid}-tex-fabric)`} opacity="0.8" />
        <rect x="19" y="48" width="42" height="13" fill={`url(#${pid}-tex-brush)`} opacity="0.35" />
      </g>
      <path d="M30,50 Q35,54 40,50.5 Q45,54 50,50" fill={dressHi} opacity="0.06" />
      <path d="M28.5,47.5 Q34.5,52.5 40,49.5 Q45.5,52.5 51.5,47.5" fill={dressMid} opacity="0.18" stroke={gold} strokeWidth="0.35" />
      <line x1="40" y1="49.5" x2="40" y2="60" stroke={gold} strokeWidth="0.5" opacity="0.3" />
      <path d="M27,51 L24.5,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.08" />
      <path d="M29,50 L26.5,60" fill="none" stroke={ink} strokeWidth="0.08" opacity="0.05" />
      <path d="M53,51 L55.5,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.08" />
      <path d="M51,50 L53.5,60" fill="none" stroke={ink} strokeWidth="0.08" opacity="0.05" />

      {/* ── Rose (traditional Queen attribute) ── */}
      <g transform="translate(62,38)">
        <circle r="3.2" fill={isRed ? '#d43838' : '#c43030'} opacity="0.75" />
        <path d="M-2.5,-1.2 Q-1,-3.2 0,-3.2 Q1,-3.2 2.5,-1.2" fill="none" stroke={isRed ? '#e06060' : '#d85050'} strokeWidth="0.3" opacity="0.35" />
        <path d="M-2.5,1.2 Q-1,3.2 0,3.2 Q1,3.2 2.5,1.2" fill="none" stroke={isRed ? '#e06060' : '#d85050'} strokeWidth="0.25" opacity="0.25" />
        <circle r="1.8" fill={isRed ? '#e85858' : '#d84848'} opacity="0.5" />
        <circle r="0.8" fill={isRed ? '#f08080' : '#e06868'} opacity="0.35" />
        <line x1="0" y1="3.2" x2="-1" y2="14" stroke="#2a5222" strokeWidth="0.85" strokeLinecap="round" />
        <path d="M-0.5,7.5 Q-3,6.5 -3.5,5.5" fill="none" stroke="#3a7232" strokeWidth="0.45" strokeLinecap="round" />
        <path d="M-3,6 Q-4.5,5 -3.5,4" fill="#3a7232" opacity="0.35" />
      </g>
    </>
  )

  return <FaceCardFrame suit={suit} label="queen">{halfContent}</FaceCardFrame>
}

/* ── King ─────────────────────────────────────────────── */
function KingSVG({ suit }: { suit: Suit }) {
  const { c, isRed, skin, skinShade, skinHi, gold, goldDk, goldLt, ink } = useCourtColors(suit)
  const hair = isRed ? '#4a2810' : '#100810'
  const hairHi = isRed ? '#6a3c1c' : '#201820'
  const beard = isRed ? '#5a3018' : '#161016'
  const robe = isRed ? '#a41428' : '#141430'
  const _robeMid = isRed ? '#c42e40' : '#242444'
  const robeHi = isRed ? '#d44858' : '#343458'
  const jewel = isRed ? '#1e4488' : '#b82828'
  const jewelHi = isRed ? '#3a68b0' : '#d84848'
  const ermine = '#f0eadc'
  const pid = `king-${suit}`

  const halfContent = (
    <>
      {/* ── Imperial crown — grander than Queen's ── */}
      <path d="M25.5,22 L23.5,8.5 L29.5,15 L34,4.5 L40,13 L46,4.5 L50.5,15 L56.5,8.5 L54.5,22 Z" fill={gold} stroke={goldDk} strokeWidth="0.5" />
      <path d="M27,21 L25.5,10.5 L30,15.5 L34,6.5 L40,14 L46,6.5 L50,15.5 L54.5,10.5 L53,21" fill={goldLt} opacity="0.11" />
      {/* Crown band + ermine */}
      <rect x="25.5" y="20.5" width="29" height="4.2" rx="1.2" fill={gold} stroke={goldDk} strokeWidth="0.4" />
      <rect x="26.5" y="21.2" width="27" height="2.6" rx="0.8" fill={ermine} opacity="0.85" />
      {[30, 33.5, 37, 40.5, 44, 47.5, 51].map((cx, i) => (
        <circle key={i} cx={cx} cy="22.5" r="0.45" fill="#111" />
      ))}
      {/* Crown jewels */}
      <circle cx="34" cy="6.5" r="1.9" fill={jewel} stroke={goldDk} strokeWidth="0.3" />
      <circle cx="34" cy="6" r="0.8" fill={jewelHi} opacity="0.2" />
      <circle cx="46" cy="6.5" r="1.9" fill={jewel} stroke={goldDk} strokeWidth="0.3" />
      <circle cx="46" cy="6" r="0.8" fill={jewelHi} opacity="0.2" />
      <circle cx="40" cy="12" r="1.4" fill={goldLt} opacity="0.45" stroke={goldDk} strokeWidth="0.25" />
      <circle cx="29.5" cy="13.5" r="1.2" fill={jewel} opacity="0.55" stroke={goldDk} strokeWidth="0.2" />
      <circle cx="50.5" cy="13.5" r="1.2" fill={jewel} opacity="0.55" stroke={goldDk} strokeWidth="0.2" />
      <circle cx="33.5" cy="6" r="0.45" fill="#fff" opacity="0.45" />
      <circle cx="45.5" cy="6" r="0.45" fill="#fff" opacity="0.45" />
      {/* Cross pattée finial */}
      <path d="M40,-0.5 L39,1.8 L40,1.5 L41,1.8 Z" fill={goldDk} />
      <line x1="40" y1="-0.5" x2="40" y2="4.5" stroke={goldDk} strokeWidth="1.2" />
      <line x1="38.2" y1="1.5" x2="41.8" y2="1.5" stroke={goldDk} strokeWidth="0.9" />
      <circle cx="40" cy="-0.5" r="0.6" fill={gold} />

      {/* ── Hair — shorter, distinguished ── */}
      <path d="M27.5,24.5 Q24,30 25.5,38" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />
      <path d="M52.5,24.5 Q56,30 54.5,38" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />
      <path d="M26.5,27 Q24.5,32 25.5,36" fill="none" stroke={hairHi} strokeWidth="0.6" opacity="0.22" strokeLinecap="round" />
      <path d="M53.5,27 Q55.5,32 54.5,36" fill="none" stroke={hairHi} strokeWidth="0.6" opacity="0.22" strokeLinecap="round" />
      {/* Hair paint texture — clip-masked to hair regions */}
      <g clipPath={`url(#${pid}-hair-clip)`}>
        <rect x="23" y="24" width="34" height="16" fill={`url(#${pid}-tex-hair)`} opacity="0.6" />
      </g>

      {/* ── Face — broader, authoritative (French portrait proportions) ── */}
      <ellipse cx="40" cy="36" rx="11.2" ry="12.2" fill={skin} stroke={ink} strokeWidth="0.55" />
      {/* Skin paint texture — clip-masked to face region, stronger for painterly depth */}
      <g clipPath={`url(#${pid}-face-clip)`}>
        <rect x="28" y="23" width="24" height="28" fill={`url(#${pid}-tex-skin)`} opacity="0.6" />
      </g>
      {/* Forehead highlight — warmer */}
      <ellipse cx="40" cy="30" rx="6" ry="3" fill={skinHi} opacity="0.16" />
      {/* Orbital shadows — deeper */}
      <ellipse cx="36" cy="32" rx="3" ry="1.6" fill={skinShade} opacity="0.1" />
      <ellipse cx="44" cy="32" rx="3" ry="1.6" fill={skinShade} opacity="0.1" />
      {/* Cheekbone highlights */}
      <ellipse cx="34" cy="36" rx="2" ry="1.2" fill={skinHi} opacity="0.12" />
      <ellipse cx="46" cy="36" rx="2" ry="1.2" fill={skinHi} opacity="0.12" />
      {/* Cheek warmth — rosier for French portrait */}
      <ellipse cx="34.5" cy="38" rx="2.5" ry="1.5" fill="#d8a080" opacity="0.2" />
      <ellipse cx="45.5" cy="38" rx="2.5" ry="1.5" fill="#d8a080" opacity="0.2" />
      {/* Temple shadows — deeper */}
      <ellipse cx="30" cy="34" rx="1.5" ry="3.5" fill={skinShade} opacity="0.1" />
      <ellipse cx="50" cy="34" rx="1.5" ry="3.5" fill={skinShade} opacity="0.1" />
      {/* Jaw modeling — stronger contour */}
      <path d="M30,40 Q34,47 40,48 Q46,47 50,40" fill="none" stroke={skinShade} strokeWidth="0.25" opacity="0.25" />
      {/* Face brush texture overlay */}
      <ellipse cx="40" cy="36" rx="10.5" ry="11.5" fill={`url(#${pid}-tex-brush)`} opacity="0.22" />
      {/* Eyes — multi-layered for painted depth */}
      <ellipse cx="36" cy="33" rx="1.8" ry="1.25" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      <ellipse cx="44" cy="33" rx="1.8" ry="1.25" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      {/* Iris base */}
      <circle cx="36.2" cy="33.15" r="0.95" fill={c.primary} />
      <circle cx="44.2" cy="33.15" r="0.95" fill={c.primary} />
      {/* Iris definition rings */}
      <circle cx="36.2" cy="33.15" r="0.78" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.4" />
      <circle cx="44.2" cy="33.15" r="0.78" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.4" />
      {/* Pupil */}
      <circle cx="36.5" cy="32.7" r="0.45" fill="#111" />
      <circle cx="44.5" cy="32.7" r="0.45" fill="#111" />
      {/* Catchlight */}
      <circle cx="35.8" cy="32.6" r="0.22" fill="#fff" />
      <circle cx="43.8" cy="32.6" r="0.22" fill="#fff" />
      {/* Eyelashes */}
      <line x1="33.8" y1="31.8" x2="33.4" y2="31.2" stroke={ink} strokeWidth="0.12" opacity="0.3" />
      <line x1="36" y1="31" x2="36" y2="30.5" stroke={ink} strokeWidth="0.1" opacity="0.25" />
      <line x1="37.8" y1="32" x2="38.2" y2="31.4" stroke={ink} strokeWidth="0.12" opacity="0.3" />
      <line x1="42.2" y1="32" x2="41.8" y2="31.4" stroke={ink} strokeWidth="0.12" opacity="0.3" />
      <line x1="44" y1="31" x2="44" y2="30.5" stroke={ink} strokeWidth="0.1" opacity="0.25" />
      <line x1="46.2" y1="31.8" x2="46.6" y2="31.2" stroke={ink} strokeWidth="0.12" opacity="0.3" />
      {/* Heavy brows */}
      <path d="M33.2,30.3 Q36,28.9 38.8,29.9" fill="none" stroke={ink} strokeWidth="0.75" strokeLinecap="round" />
      <path d="M41.2,29.9 Q44,28.9 46.8,30.3" fill="none" stroke={ink} strokeWidth="0.75" strokeLinecap="round" />
      {/* Nose */}
      <path d="M40,34.5 L39,37.8 Q40,38.7 41,38" fill="none" stroke={skinShade} strokeWidth="0.42" strokeLinecap="round" />
      <line x1="40.2" y1="35" x2="40.1" y2="37" stroke={skinHi} strokeWidth="0.22" opacity="0.1" />
      {/* Nasolabial folds */}
      <path d="M37,39 Q36.5,39.8 37.5,40" fill="none" stroke={skinShade} strokeWidth="0.1" opacity="0.1" />
      <path d="M43,39 Q43.5,39.8 42.5,40" fill="none" stroke={skinShade} strokeWidth="0.1" opacity="0.1" />

      {/* ── Mustache + beard ── */}
      <path d="M35.8,40.3 Q37.8,41.8 40,40.6 Q42.2,41.8 44.2,40.3" fill={beard} opacity="0.65" stroke={beard} strokeWidth="0.22" />
      <path d="M35.5,40.5 Q35,41 34.8,40.5" fill="none" stroke={beard} strokeWidth="0.18" opacity="0.25" />
      <path d="M44.5,40.5 Q45,41 45.2,40.5" fill="none" stroke={beard} strokeWidth="0.18" opacity="0.25" />
      <path d="M31.5,41 Q29.5,47 33.5,51.5 Q37,55 40,56 Q43,55 46.5,51.5 Q50.5,47 48.5,41" fill={beard} opacity="0.2" />
      <path d="M32.5,42 Q30.5,47 34.5,51.5 Q37.5,54 40,55 Q42.5,54 45.5,51.5 Q49.5,47 47.5,42" fill="none" stroke={beard} strokeWidth="0.4" opacity="0.35" />
      <path d="M34,44.5 Q37,48.5 40,49.5 Q43,48.5 46,44.5" fill="none" stroke={beard} strokeWidth="0.25" opacity="0.25" />
      <path d="M35,47 Q38,50.5 40,51 Q42,50.5 45,47" fill="none" stroke={beard} strokeWidth="0.2" opacity="0.2" />
      <line x1="38.3" y1="42.8" x2="41.7" y2="42.8" stroke="#8a4848" strokeWidth="0.45" strokeLinecap="round" />

      {/* ── Ermine collar ── */}
      <rect x="22.5" y="53" width="35" height="4.2" rx="1.6" fill={ermine} stroke={goldDk} strokeWidth="0.3" />
      {[26.5, 30.5, 34.5, 38.5, 42.5, 46.5, 50.5].map((cx, i) => (
        <circle key={i} cx={cx} cy="55" r="0.45" fill="#111" />
      ))}
      <path d="M32.5,53 Q36.5,55 40,55 Q43.5,55 47.5,53" fill="none" stroke={gold} strokeWidth="0.55" />
      <circle cx="40" cy="55.8" r="1" fill={jewel} stroke={goldDk} strokeWidth="0.2" />
      <circle cx="39.7" cy="55.5" r="0.28" fill="#fff" opacity="0.3" />

      {/* ── Robe ── */}
      <path d="M20.5,57 L17,60 L63,60 L59.5,57 Z" fill={robe} stroke={ink} strokeWidth="0.35" />
      {/* Fabric paint texture — clip-masked, stronger for painted garment read */}
      <g clipPath={`url(#${pid}-body-clip)`}>
        <rect x="17" y="49" width="46" height="12" fill={`url(#${pid}-tex-fabric)`} opacity="0.75" />
        <rect x="17" y="49" width="46" height="12" fill={`url(#${pid}-tex-brush)`} opacity="0.3" />
      </g>
      <path d="M30,57.5 Q40,58.5 50,57.5" fill={robeHi} opacity="0.05" />
      <path d="M20.5,57.2 L17,60" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.18" />
      <path d="M59.5,57.2 L63,60" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.18" />

      {/* ── Scepter (traditional King attribute) ── */}
      <line x1="15" y1="30" x2="13.8" y2="57" stroke={goldDk} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="15" y1="30" x2="13.8" y2="57" stroke={gold} strokeWidth="0.45" opacity="0.22" strokeLinecap="round" />
      <circle cx="14.5" cy="36" r="0.55" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.25" />
      <circle cx="14.3" cy="42" r="0.45" fill="none" stroke={gold} strokeWidth="0.2" opacity="0.2" />
      <circle cx="15" cy="28" r="3.4" fill={gold} stroke={goldDk} strokeWidth="0.4" />
      <circle cx="15" cy="28" r="1.8" fill={goldLt} opacity="0.18" />
      <circle cx="15" cy="28" r="1.4" fill={jewel} />
      <circle cx="15" cy="27.5" r="0.6" fill={jewelHi} opacity="0.15" />
      <circle cx="14.5" cy="27.4" r="0.35" fill="#fff" opacity="0.35" />
      <line x1="12.5" y1="25.5" x2="17.5" y2="25.5" stroke={goldDk} strokeWidth="0.8" />
      <line x1="15" y1="23.2" x2="15" y2="27.5" stroke={goldDk} strokeWidth="0.8" />
      <circle cx="12.5" cy="25.5" r="0.4" fill={gold} />
      <circle cx="17.5" cy="25.5" r="0.4" fill={gold} />
      <circle cx="15" cy="23.2" r="0.4" fill={gold} />
    </>
  )

  return <FaceCardFrame suit={suit} label="king">{halfContent}</FaceCardFrame>
}

const FACE_COMPONENTS: Record<string, React.FC<{ suit: Suit }>> = {
  J: JackSVG,
  Q: QueenSVG,
  K: KingSVG,
}

/* ─────────────────────────────────────────────────────────
   Standard Pip Layouts — Realistic playing card positions
   Based on actual poker deck pip arrangements.
   Viewbox 0 0 5 7 with center-origin suit symbols.
   ───────────────────────────────────────────────────────── */
const PIP_POSITIONS: Record<string, [number, number, boolean?][]> = {
  '2': [[0.5, 0.15], [0.5, 0.85, true]],
  '3': [[0.5, 0.15], [0.5, 0.5], [0.5, 0.85, true]],
  '4': [[0.25, 0.15], [0.75, 0.15], [0.25, 0.85, true], [0.75, 0.85, true]],
  '5': [[0.25, 0.15], [0.75, 0.15], [0.5, 0.5], [0.25, 0.85, true], [0.75, 0.85, true]],
  '6': [[0.25, 0.15], [0.75, 0.15], [0.25, 0.5], [0.75, 0.5], [0.25, 0.85, true], [0.75, 0.85, true]],
  '7': [[0.25, 0.15], [0.75, 0.15], [0.25, 0.5], [0.75, 0.5], [0.5, 0.325], [0.25, 0.85, true], [0.75, 0.85, true]],
  '8': [[0.25, 0.15], [0.75, 0.15], [0.25, 0.5], [0.75, 0.5], [0.5, 0.325], [0.5, 0.675, true], [0.25, 0.85, true], [0.75, 0.85, true]],
  '9': [[0.25, 0.13], [0.75, 0.13], [0.25, 0.38], [0.75, 0.38], [0.5, 0.5], [0.25, 0.62, true], [0.75, 0.62, true], [0.25, 0.87, true], [0.75, 0.87, true]],
  '10': [[0.25, 0.13], [0.75, 0.13], [0.5, 0.26], [0.25, 0.38], [0.75, 0.38], [0.25, 0.62, true], [0.75, 0.62, true], [0.5, 0.74, true], [0.25, 0.87, true], [0.75, 0.87, true]],
}

function PipLayout({ rank, suit }: { rank: string; suit: Suit }) {
  const symbol = SUIT_SYMBOLS[suit]
  const positions = PIP_POSITIONS[rank]
  if (!positions) return null

  return (
    <div className="pip-layout">
      {positions.map((pos, i) => (
        <span
          key={i}
          className={`pip-symbol${pos[2] ? ' pip-inverted' : ''}`}
          style={{
            left: `${pos[0] * 100}%`,
            top: `${pos[1] * 100}%`,
          }}
        >
          {symbol}
        </span>
      ))}
    </div>
  )
}

function getActiveSkin(): CardSkin {
  const state = loadCardSkinState()
  return getSkinById(state.activeSkinId) ?? CARD_SKINS[0]
}

function CardFace({ card }: { card: CardType }) {
  const symbol = SUIT_SYMBOLS[card.suit]
  const color = SUIT_COLORS[card.suit]
  const isFace = ['J', 'Q', 'K'].includes(card.rank)
  const FaceComponent = FACE_COMPONENTS[card.rank]
  const isNumber = !isFace && card.rank !== 'A'
  const skin = getActiveSkin()
  const skinStyle: React.CSSProperties = {}
  if (skin.id !== 'classic') {
    if (skin.faceFilter !== 'none') skinStyle.filter = skin.faceFilter
    if (skin.borderColor !== 'transparent') skinStyle.borderColor = skin.borderColor
    if (skin.glowColor !== 'transparent') skinStyle.boxShadow = `0 0 14px ${skin.glowColor}, 0 2px 4px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.1)`
  }

  return (
    <div className={`card card-face ${color} ${isFace ? 'face-card-type' : ''} ${card.rank === 'A' ? 'ace-card-type' : ''}`} style={skinStyle}>
      <div className="card-corner top-left">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{symbol}</span>
      </div>
      <div className="card-center">
        {isFace ? (
          <div className="face-card">
            <FaceComponent suit={card.suit} />
          </div>
        ) : card.rank === 'A' ? (
          <span className="ace-suit">{symbol}</span>
        ) : isNumber ? (
          <PipLayout rank={card.rank} suit={card.suit} />
        ) : null}
      </div>
      <div className="card-corner bottom-right">
        <span className="card-rank">{card.rank}</span>
        <span className="card-suit">{symbol}</span>
      </div>
      <div className="card-mobile-badge">
        <span className="badge-rank">{card.rank}</span>
        <span className="badge-suit">{symbol}</span>
      </div>
    </div>
  )
}

interface CardBackColors {
  bg1: string
  bg2: string
  border: string
  borderInner: string
  pattern: string
  patternAlt: string
  accent: string
  accentLight: string
  diamond: string
  logoFill: string
  logoStroke: string
}

const CARD_BACK_THEMES: Record<CardBackTheme, CardBackColors> = {
  'classic-blue': {
    bg1: '#1a3a5c', bg2: '#0f2444',
    border: '#2a5a8c', borderInner: '#3a6a9c',
    pattern: 'rgba(255,255,255,0.06)', patternAlt: 'rgba(255,255,255,0.03)',
    accent: '#4a8abe', accentLight: '#6aacde',
    diamond: '#3a7ab8', logoFill: '#d4a644', logoStroke: '#a07828',
  },
  'casino-red': {
    bg1: '#5c1a1a', bg2: '#44100f',
    border: '#8c2a2a', borderInner: '#9c3a3a',
    pattern: 'rgba(255,255,255,0.06)', patternAlt: 'rgba(255,255,255,0.03)',
    accent: '#be4a4a', accentLight: '#de6a6a',
    diamond: '#b83a3a', logoFill: '#d4a644', logoStroke: '#a07828',
  },
  'royal-green': {
    bg1: '#1a4a2a', bg2: '#0f3018',
    border: '#2a7a3c', borderInner: '#3a8a4c',
    pattern: 'rgba(255,255,255,0.06)', patternAlt: 'rgba(255,255,255,0.03)',
    accent: '#4abe6a', accentLight: '#6ade8a',
    diamond: '#3ab858', logoFill: '#d4a644', logoStroke: '#a07828',
  },
  'midnight-gold': {
    bg1: '#1a1a2e', bg2: '#0f0f1e',
    border: '#3a3a5e', borderInner: '#4a4a6e',
    pattern: 'rgba(212,166,68,0.08)', patternAlt: 'rgba(212,166,68,0.04)',
    accent: '#d4a644', accentLight: '#f0d68a',
    diamond: '#c9963a', logoFill: '#d4a644', logoStroke: '#8b6914',
  },
}

function CardBackSVG({ theme }: { theme: CardBackTheme }) {
  const c = CARD_BACK_THEMES[theme]
  const pid = `cb-${theme}`
  return (
    <svg viewBox="0 0 90 130" className="card-back-svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        {/* Fine linen texture */}
        <pattern id={`${pid}-linen`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="transparent" />
          <line x1="0" y1="2" x2="4" y2="2" stroke={c.pattern} strokeWidth="0.3" />
          <line x1="2" y1="0" x2="2" y2="4" stroke={c.patternAlt} strokeWidth="0.3" />
        </pattern>
        {/* Crosshatch pattern */}
        <pattern id={`${pid}-cross`} width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="8" y2="8" stroke={c.pattern} strokeWidth="0.7" />
          <line x1="8" y1="0" x2="0" y2="8" stroke={c.patternAlt} strokeWidth="0.7" />
        </pattern>
        {/* Diamond repeating pattern for border */}
        <pattern id={`${pid}-diamonds`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M6,0 L12,6 L6,12 L0,6 Z" fill="none" stroke={c.accent} strokeWidth="0.5" opacity="0.35" />
          <circle cx="6" cy="6" r="0.6" fill={c.accent} opacity="0.2" />
        </pattern>
        {/* Radial glow for center */}
        <radialGradient id={`${pid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.accent} stopOpacity="0.08" />
          <stop offset="70%" stopColor={c.accent} stopOpacity="0.02" />
          <stop offset="100%" stopColor={c.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background gradient with depth */}
      <rect width="90" height="130" rx="12" fill={c.bg1} />
      <rect width="90" height="130" rx="12" fill={c.bg2} opacity="0.4" />
      <rect width="90" height="130" rx="12" fill={`url(#${pid}-linen)`} />
      <rect width="90" height="130" rx="12" fill={`url(#${pid}-cross)`} />

      {/* Outer decorative border */}
      <rect x="3" y="3" width="84" height="124" rx="10" fill="none" stroke={c.border} strokeWidth="1.5" />
      <rect x="4.5" y="4.5" width="81" height="121" rx="9" fill="none" stroke={c.border} strokeWidth="0.3" opacity="0.5" />

      {/* Diamond border band */}
      <rect x="6" y="6" width="78" height="118" rx="8" fill={`url(#${pid}-diamonds)`} stroke={c.borderInner} strokeWidth="0.5" />

      {/* Inner frame - double line */}
      <rect x="10" y="10" width="70" height="110" rx="6" fill="none" stroke={c.accent} strokeWidth="0.8" opacity="0.45" />
      <rect x="12" y="12" width="66" height="106" rx="5" fill="none" stroke={c.accent} strokeWidth="0.3" opacity="0.25" />

      {/* Corner ornaments - top-left */}
      <g opacity="0.55">
        <path d="M15,15 Q15,24 24,24" fill="none" stroke={c.accentLight} strokeWidth="1" />
        <path d="M15,15 Q15,20 20,20" fill="none" stroke={c.accentLight} strokeWidth="0.6" />
        <path d="M15,15 Q15,17 17,17" fill="none" stroke={c.accentLight} strokeWidth="0.3" />
        <circle cx="15" cy="15" r="1.8" fill={c.accent} />
        <circle cx="15" cy="15" r="0.8" fill={c.accentLight} />
      </g>
      {/* Corner ornament - top-right */}
      <g opacity="0.55">
        <path d="M75,15 Q75,24 66,24" fill="none" stroke={c.accentLight} strokeWidth="1" />
        <path d="M75,15 Q75,20 70,20" fill="none" stroke={c.accentLight} strokeWidth="0.6" />
        <path d="M75,15 Q75,17 73,17" fill="none" stroke={c.accentLight} strokeWidth="0.3" />
        <circle cx="75" cy="15" r="1.8" fill={c.accent} />
        <circle cx="75" cy="15" r="0.8" fill={c.accentLight} />
      </g>
      {/* Corner ornament - bottom-left */}
      <g opacity="0.55">
        <path d="M15,115 Q15,106 24,106" fill="none" stroke={c.accentLight} strokeWidth="1" />
        <path d="M15,115 Q15,110 20,110" fill="none" stroke={c.accentLight} strokeWidth="0.6" />
        <path d="M15,115 Q15,113 17,113" fill="none" stroke={c.accentLight} strokeWidth="0.3" />
        <circle cx="15" cy="115" r="1.8" fill={c.accent} />
        <circle cx="15" cy="115" r="0.8" fill={c.accentLight} />
      </g>
      {/* Corner ornament - bottom-right */}
      <g opacity="0.55">
        <path d="M75,115 Q75,106 66,106" fill="none" stroke={c.accentLight} strokeWidth="1" />
        <path d="M75,115 Q75,110 70,110" fill="none" stroke={c.accentLight} strokeWidth="0.6" />
        <path d="M75,115 Q75,113 73,113" fill="none" stroke={c.accentLight} strokeWidth="0.3" />
        <circle cx="75" cy="115" r="1.8" fill={c.accent} />
        <circle cx="75" cy="115" r="0.8" fill={c.accentLight} />
      </g>

      {/* Center medallion glow */}
      <ellipse cx="45" cy="65" rx="26" ry="32" fill={`url(#${pid}-glow)`} />

      {/* Center medallion background */}
      <ellipse cx="45" cy="65" rx="22" ry="28" fill={c.bg2} stroke={c.accent} strokeWidth="0.8" opacity="0.55" />
      <ellipse cx="45" cy="65" rx="19" ry="25" fill="none" stroke={c.accentLight} strokeWidth="0.4" opacity="0.35" />

      {/* Casino spade logo in center */}
      <g transform="translate(45,58)">
        {/* Spade shape */}
        <path
          d="M0,-14 C-2,-12 -10,-4 -10,2 C-10,7 -6,10 -2,10 C-0.5,10 0.5,9.5 0,8
             C-0.5,9.5 0.5,10 2,10 C6,10 10,7 10,2 C10,-4 2,-12 0,-14 Z"
          fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.8"
        />
        {/* Spade highlight */}
        <path
          d="M0,-12 C-1.5,-10 -7,-4 -7,1 C-7,3 -6,4 -5,4"
          fill="none" stroke={c.accentLight} strokeWidth="0.5" opacity="0.3"
        />
        {/* Spade stem */}
        <rect x="-1.5" y="8" width="3" height="8" rx="1" fill={c.logoFill} stroke={c.logoStroke} strokeWidth="0.5" />
        {/* Stem base flourish */}
        <path d="M-6,16 Q-3,12 0,16 Q3,12 6,16" fill="none" stroke={c.logoFill} strokeWidth="0.8" />
        <path d="M-4,17 Q-2,14 0,17 Q2,14 4,17" fill="none" stroke={c.logoFill} strokeWidth="0.4" opacity="0.5" />
      </g>

      {/* Decorative scrollwork - top */}
      <g opacity="0.45">
        <path d="M28,27 Q36,22 45,27 Q54,22 62,27" fill="none" stroke={c.accentLight} strokeWidth="0.8" />
        <path d="M32,30 Q38,27 45,30 Q52,27 58,30" fill="none" stroke={c.accentLight} strokeWidth="0.5" />
        <path d="M36,32 Q40,30 45,32 Q50,30 54,32" fill="none" stroke={c.accentLight} strokeWidth="0.3" />
      </g>
      {/* Decorative scrollwork - bottom */}
      <g opacity="0.45">
        <path d="M28,103 Q36,108 45,103 Q54,108 62,103" fill="none" stroke={c.accentLight} strokeWidth="0.8" />
        <path d="M32,100 Q38,103 45,100 Q52,103 58,100" fill="none" stroke={c.accentLight} strokeWidth="0.5" />
        <path d="M36,98 Q40,100 45,98 Q50,100 54,98" fill="none" stroke={c.accentLight} strokeWidth="0.3" />
      </g>

      {/* Small suit symbols in corners of inner area */}
      <text x="18" y="34" fontSize="7" fill={c.accent} opacity="0.4" textAnchor="middle" fontFamily="serif">{'\u2660'}</text>
      <text x="72" y="34" fontSize="7" fill={c.accent} opacity="0.4" textAnchor="middle" fontFamily="serif">{'\u2665'}</text>
      <text x="18" y="104" fontSize="7" fill={c.accent} opacity="0.4" textAnchor="middle" fontFamily="serif">{'\u2666'}</text>
      <text x="72" y="104" fontSize="7" fill={c.accent} opacity="0.4" textAnchor="middle" fontFamily="serif">{'\u2663'}</text>
    </svg>
  )
}

function CardBack() {
  const { CARD_BACK_THEME } = useGameSettings()
  const skin = getActiveSkin()
  const skinStyle: React.CSSProperties = {}
  if (skin.id !== 'classic') {
    if (skin.backFilter !== 'none') skinStyle.filter = skin.backFilter
    if (skin.glowColor !== 'transparent') skinStyle.boxShadow = `0 0 14px ${skin.glowColor}, 0 2px 4px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.16)`
  }
  return (
    <div className={`card card-back card-back-${CARD_BACK_THEME}`} style={skinStyle}>
      <CardBackSVG theme={CARD_BACK_THEME} />
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

  // For the 3D-flip dealer hole card
  if (flipReveal) {
    const innerClass = `card-inner${!hidden ? ' flipped' : ''}${isFlipping ? ' flip-reveal' : ''}`
    return (
      <div
        className={`card-wrapper ${animClass}`}
        style={{ '--deal-i': index } as React.CSSProperties}
        role="listitem"
        aria-label={cardLabel}
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
    >
      <CardFace card={card} />
    </div>
  )
}

export default Card
