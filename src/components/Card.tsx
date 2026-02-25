import { useEffect, useRef, useState } from 'react'
import './Card.css'
import type { Card as CardType, CardBackTheme, Suit } from '../types'
import { useGameSettings } from '../config/GameSettingsContext'

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
   Premium Face Card SVGs — Classic Court Card Style
   Traditional European court card aesthetic with fine
   linework, cross-hatching, and heraldic proportions.
   Consistent across J, Q, K with suit-themed coloring.
   Enhanced with refined engraving-style detail, balanced
   composition, and cohesive visual language.
   ───────────────────────────────────────────────────────── */

// Shared rendering helpers for consistent face-card artwork
function FaceCardFrame({ suit, label, children }: { suit: Suit; label: string; children: React.ReactNode }) {
  const c = SUIT_ACCENTS[suit]
  const gold = '#c9a84c'
  const goldDark = '#8b6914'
  const goldBright = '#e0c470'
  return (
    <svg viewBox="0 0 80 120" className="face-svg">
      <defs>
        <clipPath id={`${label}-top-${suit}`}><rect x="0" y="0" width="80" height="60" /></clipPath>
        <clipPath id={`${label}-bot-${suit}`}><rect x="0" y="60" width="80" height="60" /></clipPath>
        {/* Fine engraving-style cross-hatch for parchment depth */}
        <pattern id={`${label}-hatch-${suit}`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke={c.primary} strokeWidth="0.12" opacity="0.06" />
        </pattern>
        <pattern id={`${label}-hatch2-${suit}`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke={c.primary} strokeWidth="0.12" opacity="0.04" />
        </pattern>
        {/* Micro stipple for premium card-stock feel */}
        <pattern id={`${label}-stipple-${suit}`} width="2" height="2" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.15" fill={c.primary} opacity="0.03" />
        </pattern>
        {/* Warm inner glow */}
        <radialGradient id={`${label}-glow-${suit}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fffdf5" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#faf5e8" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#fffdf5" stopOpacity="0" />
        </radialGradient>
        {/* Gold gradient for premium gilding */}
        <linearGradient id={`${label}-goldGrad-${suit}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={goldBright} />
          <stop offset="50%" stopColor={gold} />
          <stop offset="100%" stopColor={goldDark} />
        </linearGradient>
      </defs>
      {/* Background fills — layered parchment texture */}
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${label}-hatch-${suit})`} />
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${label}-hatch2-${suit})`} />
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${label}-stipple-${suit})`} />
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${label}-glow-${suit})`} />
      {/* Decorative triple inner border — engraved frame */}
      <rect x="2" y="2" width="76" height="116" rx="3.5" fill="none" stroke={c.primary} strokeWidth="0.4" opacity="0.15" />
      <rect x="3.5" y="3.5" width="73" height="113" rx="3" fill="none" stroke={`url(#${label}-goldGrad-${suit})`} strokeWidth="0.35" opacity="0.22" />
      <rect x="5" y="5" width="70" height="110" rx="2.5" fill="none" stroke={goldBright} strokeWidth="0.15" opacity="0.12" />
      {/* Corner flourishes — refined scroll ornaments with enhanced detail */}
      {[[6, 6, ''], [74, 6, 'scale(-1,1) translate(-80,0)'], [6, 114, 'scale(1,-1) translate(0,-120)'], [74, 114, 'scale(-1,-1) translate(-80,-120)']].map(([x, y, t], i) => (
        <g key={i} transform={t as string}>
          <path d="M6,6 Q6,14 14,14" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.28" />
          <path d="M6,6 Q6,12 12,12" fill="none" stroke={goldBright} strokeWidth="0.25" opacity="0.2" />
          <path d="M6,6 Q6,9 9,9" fill="none" stroke={goldBright} strokeWidth="0.18" opacity="0.15" />
          <circle cx="6" cy="6" r="0.7" fill={gold} opacity="0.22" />
          <circle cx="6" cy="6" r="0.3" fill={goldBright} opacity="0.15" />
          {/* Acanthus leaf hint */}
          <path d="M7.5,7.5 Q9,9 10,11" fill="none" stroke={gold} strokeWidth="0.15" opacity="0.12" />
        </g>
      ))}
      {/* Top Half */}
      <g clipPath={`url(#${label}-top-${suit})`}>{children}</g>
      {/* Center divider — ornamental triple rule with rosette */}
      <line x1="5" y1="60" x2="75" y2="60" stroke={c.primary} strokeWidth="0.3" opacity="0.18" />
      <line x1="7" y1="59.3" x2="73" y2="59.3" stroke={goldDark} strokeWidth="0.15" opacity="0.12" />
      <line x1="7" y1="60.7" x2="73" y2="60.7" stroke={goldDark} strokeWidth="0.15" opacity="0.12" />
      {/* Center ornament — faceted diamond with surrounding pips */}
      <path d="M37.5,60 L40,58 L42.5,60 L40,62 Z" fill={gold} opacity="0.18" />
      <path d="M38.5,60 L40,58.8 L41.5,60 L40,61.2 Z" fill={goldBright} opacity="0.1" />
      {/* Flanking ornamental dots */}
      <circle cx="34" cy="60" r="0.4" fill={gold} opacity="0.12" />
      <circle cx="46" cy="60" r="0.4" fill={gold} opacity="0.12" />
      {/* Center suit pips */}
      <text x="12" y="57.8" fontSize="5.5" fill={c.primary} fontFamily="serif" opacity="0.45">{SUIT_SYMBOLS[suit]}</text>
      <text x="68" y="64" fontSize="5.5" fill={c.primary} fontFamily="serif" textAnchor="middle" transform="rotate(180,68,62)" opacity="0.45">{SUIT_SYMBOLS[suit]}</text>
      {/* Bottom Half (mirrored) */}
      <g clipPath={`url(#${label}-bot-${suit})`} transform="rotate(180,40,90)">{children}</g>
    </svg>
  )
}

function JackSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skin = '#f0dfc0'
  const skinShade = '#c8a878'
  const skinHighlight = '#f8ecd8'
  const hairColor = isRed ? '#6e4424' : '#1a1020'
  const hairHighlight = isRed ? '#8a5a38' : '#2a2040'
  const hatPrimary = isRed ? '#a41428' : '#141430'
  const hatAccent = isRed ? '#c82840' : '#262648'
  const hatHighlight = isRed ? '#d83850' : '#363660'
  const tunicPrimary = isRed ? '#a41428' : '#141430'
  const tunicAccent = isRed ? '#c42e40' : '#242444'
  const tunicHighlight = isRed ? '#d84858' : '#343458'
  const gold = '#c9a84c'
  const goldDark = '#8b6914'
  const goldBright = '#e0c470'
  const ink = isRed ? '#6a0e1e' : '#0a0a18'

  const halfContent = (
    <>
      {/* === Hat — Renaissance beret with structured feather === */}
      <ellipse cx="40" cy="20.5" rx="14" ry="6.5" fill={hatPrimary} stroke={ink} strokeWidth="0.5" />
      <path d="M27.5,20.5 Q26.5,13.5 30.5,9 Q35,4.5 40,10.5 Q45,4.5 49.5,9 Q53.5,13.5 52.5,20.5" fill={hatPrimary} stroke={ink} strokeWidth="0.5" />
      {/* Hat volumetric shading — enhanced with highlight */}
      <path d="M29.5,19.5 Q29,14.5 32.5,10.5 Q36,7 40,11 Q44,7 47.5,10.5 Q51,14.5 50.5,19.5" fill={hatAccent} opacity="0.35" />
      <path d="M34,11 Q37,8 40,11.5 Q43,8 46,11" fill={hatHighlight} opacity="0.12" />
      <path d="M32,15 Q36,9 40,12 Q44,9 48,15" fill="none" stroke={hatAccent} strokeWidth="0.3" opacity="0.2" />
      {/* Hat fabric texture — fine engraved lines */}
      <path d="M31,14 Q35.5,9.5 40,13" fill="none" stroke={ink} strokeWidth="0.08" opacity="0.08" />
      <path d="M40,13 Q44.5,9.5 49,14" fill="none" stroke={ink} strokeWidth="0.08" opacity="0.08" />
      {/* Hat band — richly decorated gold with gradient effect */}
      <rect x="28" y="18.5" width="24" height="3.2" rx="1.2" fill={gold} stroke={goldDark} strokeWidth="0.35" />
      <rect x="29" y="19" width="22" height="2.2" rx="0.8" fill={goldBright} opacity="0.25" />
      <rect x="29" y="19" width="22" height="1" rx="0.4" fill={goldBright} opacity="0.12" />
      {/* Band gemstones — faceted with extra sparkle */}
      <ellipse cx="40" cy="20" rx="1.2" ry="1.1" fill={c.secondary} stroke={goldDark} strokeWidth="0.3" />
      <ellipse cx="40" cy="19.8" rx="0.6" ry="0.5" fill={c.tertiary} opacity="0.3" />
      <circle cx="39.6" cy="19.6" r="0.3" fill="#fff" opacity="0.55" />
      <circle cx="34" cy="20" r="0.7" fill={gold} stroke={goldDark} strokeWidth="0.2" />
      <circle cx="34" cy="19.8" r="0.25" fill={goldBright} opacity="0.3" />
      <circle cx="46" cy="20" r="0.7" fill={gold} stroke={goldDark} strokeWidth="0.2" />
      <circle cx="46" cy="19.8" r="0.25" fill={goldBright} opacity="0.3" />
      {/* Feather — elegant quill with detailed barbs */}
      <path d="M33,17.5 Q28,7 24.5,1.5" fill="none" stroke={gold} strokeWidth="0.9" strokeLinecap="round" />
      <path d="M33,16.5 Q29.5,8 26.5,4" fill="none" stroke={goldBright} strokeWidth="0.4" opacity="0.5" strokeLinecap="round" />
      {/* Feather barbs — fine parallel lines with both sides */}
      <path d="M31.5,12 Q29,11 27.5,12" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.45" />
      <path d="M31,13 Q29.5,13.5 28.5,13" fill="none" stroke={gold} strokeWidth="0.18" opacity="0.25" />
      <path d="M30.5,9 Q28,8.5 26.5,9.5" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.38" />
      <path d="M29.5,6 Q27.5,5.5 26,6.5" fill="none" stroke={gold} strokeWidth="0.2" opacity="0.3" />
      <path d="M28.5,3.5 Q27,3 25.5,3.5" fill="none" stroke={gold} strokeWidth="0.18" opacity="0.25" />
      {/* Right-side barbs */}
      <path d="M31.2,11.5 Q32,10 33.5,10.5" fill="none" stroke={gold} strokeWidth="0.15" opacity="0.2" />
      <path d="M30,8.5 Q31,7.5 32,8" fill="none" stroke={gold} strokeWidth="0.12" opacity="0.15" />

      {/* === Hair — curled locks from under hat === */}
      <path d="M27,21.5 Q23,27.5 24.5,36" fill="none" stroke={hairColor} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M53,21.5 Q57,27.5 55.5,36" fill="none" stroke={hairColor} strokeWidth="2.4" strokeLinecap="round" />
      {/* Hair detail — layered curl strands with highlights */}
      <path d="M25.5,26 Q22.5,31.5 24,37" fill="none" stroke={hairColor} strokeWidth="1.1" opacity="0.45" strokeLinecap="round" />
      <path d="M54.5,26 Q57.5,31.5 56,37" fill="none" stroke={hairColor} strokeWidth="1.1" opacity="0.45" strokeLinecap="round" />
      <path d="M27.5,24 Q25.5,27 26,31" fill="none" stroke={hairHighlight} strokeWidth="0.5" opacity="0.2" strokeLinecap="round" />
      <path d="M52.5,24 Q54.5,27 54,31" fill="none" stroke={hairHighlight} strokeWidth="0.5" opacity="0.2" strokeLinecap="round" />
      <path d="M26.5,28 Q24.5,32 25,35" fill="none" stroke={hairColor} strokeWidth="0.35" opacity="0.2" strokeLinecap="round" />
      <path d="M53.5,28 Q55.5,32 55,35" fill="none" stroke={hairColor} strokeWidth="0.35" opacity="0.2" strokeLinecap="round" />

      {/* === Face — refined oval with proper modeling === */}
      <ellipse cx="40" cy="33.5" rx="10.8" ry="11.8" fill={skin} stroke={ink} strokeWidth="0.55" />
      {/* Forehead highlight for volume */}
      <ellipse cx="40" cy="28" rx="6" ry="3" fill={skinHighlight} opacity="0.15" />
      {/* Jawline definition */}
      <path d="M30.5,38 Q33.5,44 40,45.2 Q46.5,44 49.5,38" fill="none" stroke={skinShade} strokeWidth="0.25" opacity="0.25" />
      {/* Cheek warmth */}
      <ellipse cx="33.5" cy="36.5" rx="2.5" ry="1.6" fill="#e0b090" opacity="0.18" />
      <ellipse cx="46.5" cy="36.5" rx="2.5" ry="1.6" fill="#e0b090" opacity="0.18" />

      {/* Eyes — alert, youthful with refined detail */}
      <ellipse cx="36" cy="31" rx="2" ry="1.35" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      <ellipse cx="44" cy="31" rx="2" ry="1.35" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      <circle cx="36.2" cy="31.15" r="1.05" fill={c.primary} />
      <circle cx="44.2" cy="31.15" r="1.05" fill={c.primary} />
      <circle cx="36.5" cy="30.7" r="0.5" fill="#111" />
      <circle cx="44.5" cy="30.7" r="0.5" fill="#111" />
      <circle cx="35.9" cy="30.6" r="0.3" fill="#fff" />
      <circle cx="43.9" cy="30.6" r="0.3" fill="#fff" />
      {/* Lower eyelid hint */}
      <path d="M34.2,32 Q36,32.5 37.8,32" fill="none" stroke={skinShade} strokeWidth="0.15" opacity="0.2" />
      <path d="M42.2,32 Q44,32.5 45.8,32" fill="none" stroke={skinShade} strokeWidth="0.15" opacity="0.2" />
      {/* Upper lids — clean line weight */}
      <path d="M33.7,29.6 Q36,28.8 38.3,29.6" fill="none" stroke={ink} strokeWidth="0.4" />
      <path d="M41.7,29.6 Q44,28.8 46.3,29.6" fill="none" stroke={ink} strokeWidth="0.4" />
      {/* Eyebrows — clean refined arches */}
      <path d="M33.3,28.3 Q36,27.1 38.7,28.1" fill="none" stroke={ink} strokeWidth="0.5" strokeLinecap="round" />
      <path d="M41.3,28.1 Q44,27.1 46.7,28.3" fill="none" stroke={ink} strokeWidth="0.5" strokeLinecap="round" />

      {/* Nose — straight, refined with nostril hint */}
      <path d="M40,32.5 L39.3,36.2 Q40,37 40.7,36.5" fill="none" stroke={skinShade} strokeWidth="0.45" strokeLinecap="round" />
      <path d="M38.8,36.3 Q39.5,37.2 40,37.2" fill="none" stroke={skinShade} strokeWidth="0.2" opacity="0.35" />
      {/* Nose bridge highlight */}
      <line x1="40.2" y1="33" x2="40.1" y2="35" stroke={skinHighlight} strokeWidth="0.3" opacity="0.15" />
      {/* Mouth — youthful, slight confident smile */}
      <path d="M37.5,39.3 Q40,40.6 42.5,39.3" fill="#be6858" stroke="#985040" strokeWidth="0.3" />
      <path d="M38.3,39.4 Q40,39.7 41.7,39.4" fill="#f5e0d0" opacity="0.25" />

      {/* === Collar — ornate pointed with layered gilding === */}
      <path d="M28.5,44.5 L33.5,49 L40,45.5 L46.5,49 L51.5,44.5" fill={gold} stroke={goldDark} strokeWidth="0.45" />
      <path d="M29.8,45.5 L33.5,48 L40,46 L46.5,48 L50.2,45.5" fill={goldBright} opacity="0.2" />
      {/* Collar point details — cross-hatched fill */}
      <path d="M30,45 L33.5,48" fill="none" stroke={goldDark} strokeWidth="0.15" opacity="0.3" />
      <path d="M50,45 L46.5,48" fill="none" stroke={goldDark} strokeWidth="0.15" opacity="0.3" />
      <path d="M31,46 L34,48.5" fill="none" stroke={goldDark} strokeWidth="0.1" opacity="0.15" />
      <path d="M49,46 L46,48.5" fill="none" stroke={goldDark} strokeWidth="0.1" opacity="0.15" />
      {/* Collar gem — faceted */}
      <circle cx="40" cy="46.2" r="1.3" fill={c.secondary} stroke={goldDark} strokeWidth="0.3" />
      <path d="M39.2,45.8 L40,45 L40.8,45.8" fill={c.tertiary} opacity="0.3" />
      <circle cx="39.6" cy="45.8" r="0.3" fill="#fff" opacity="0.5" />

      {/* === Tunic — richly textured fabric === */}
      <path d="M24.5,49 L20.5,60 L59.5,60 L55.5,49 Q40,55.5 24.5,49 Z" fill={tunicPrimary} stroke={ink} strokeWidth="0.4" />
      {/* Fabric sheen highlight */}
      <path d="M32,50 Q36,54 40,51 Q44,54 48,50" fill={tunicHighlight} opacity="0.08" />
      {/* Center panel with gold seam */}
      <path d="M36.5,50.5 L40,58.5 L43.5,50.5" fill={tunicAccent} opacity="0.25" />
      <line x1="40" y1="49" x2="40" y2="60" stroke={gold} strokeWidth="0.6" opacity="0.4" />
      {/* Gold buttons — with highlight dot */}
      <circle cx="40" cy="52" r="0.7" fill={gold} stroke={goldDark} strokeWidth="0.2" />
      <circle cx="39.8" cy="51.8" r="0.2" fill={goldBright} opacity="0.4" />
      <circle cx="40" cy="55" r="0.65" fill={gold} stroke={goldDark} strokeWidth="0.2" />
      <circle cx="39.8" cy="54.8" r="0.2" fill={goldBright} opacity="0.4" />
      <circle cx="40" cy="58" r="0.55" fill={gold} stroke={goldDark} strokeWidth="0.15" />
      {/* Engraved fabric shading — fine parallel lines */}
      <path d="M26,52 L28.5,60" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.1" />
      <path d="M28,51 L30,60" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.08" />
      <path d="M30,50.5 L31.5,60" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.06" />
      <path d="M52,51 L50,60" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.08" />
      <path d="M54,52 L51.5,60" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.1" />
      <path d="M50,50.5 L48.5,60" fill="none" stroke={ink} strokeWidth="0.12" opacity="0.06" />
      {/* Sleeve cuff detail */}
      <path d="M22,58 L24.5,60" fill="none" stroke={gold} strokeWidth="0.4" opacity="0.2" />
      <path d="M58,58 L55.5,60" fill="none" stroke={gold} strokeWidth="0.4" opacity="0.2" />

      {/* === Held item — halberd/axe (traditional Jack prop) === */}
      <line x1="60" y1="24" x2="62.5" y2="56" stroke={goldDark} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="60" y1="24" x2="62.5" y2="56" stroke={gold} strokeWidth="0.4" opacity="0.2" strokeLinecap="round" />
      {/* Shaft decoration rings */}
      <circle cx="61" cy="35" r="0.5" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.3" />
      <circle cx="61.5" cy="42" r="0.4" fill="none" stroke={gold} strokeWidth="0.2" opacity="0.25" />
      <path d="M58.5,26 L60,24 L64.5,27.5 L63,31.5 Z" fill={isRed ? '#788888' : '#888898'} stroke={ink} strokeWidth="0.35" />
      <path d="M59.5,27 L61,25.5 L63.5,28" fill="none" stroke="#b0b8b8" strokeWidth="0.25" opacity="0.25" />
      {/* Axe edge highlight */}
      <path d="M64.5,27.5 L63,31.5" fill="none" stroke="#c0c8c8" strokeWidth="0.3" opacity="0.35" />
      {/* Blade engraving */}
      <path d="M60.5,27.5 L62.5,29.5" fill="none" stroke="#a0a8a8" strokeWidth="0.12" opacity="0.2" />
    </>
  )

  return <FaceCardFrame suit={suit} label="jack">{halfContent}</FaceCardFrame>
}

function QueenSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skin = '#f0dfc0'
  const skinShade = '#c8a878'
  const skinHighlight = '#f8ecd8'
  const hairColor = isRed ? '#5c2c14' : '#100810'
  const hairHighlight = isRed ? '#7a4020' : '#201820'
  const dressPrimary = isRed ? '#a41428' : '#141430'
  const dressAccent = isRed ? '#c42e40' : '#242444'
  const dressHighlight = isRed ? '#d44858' : '#343458'
  const gold = '#c9a84c'
  const goldDark = '#8b6914'
  const goldBright = '#e0c470'
  const ink = isRed ? '#6a0e1e' : '#0a0a18'
  const jewel = isRed ? '#1e4488' : '#b82828'
  const jewelHighlight = isRed ? '#3a68b0' : '#d84848'

  const halfContent = (
    <>
      {/* === Crown — regal with 5 points and arched bridges === */}
      <path d="M28.5,20 L27,10.5 L31.5,15 L34.5,6 L37.5,13 L40,3.5 L42.5,13 L45.5,6 L48.5,15 L53,10.5 L51.5,20 Z" fill={gold} stroke={goldDark} strokeWidth="0.55" />
      {/* Crown highlight — left edge catch light */}
      <path d="M30,19 L28.5,12 L32,15.5 L34.5,8 L37.5,14 L40,6 L42.5,14 L45.5,8 L48,15.5 L51.5,12 L50,19" fill={goldBright} opacity="0.15" />
      <path d="M29,18 L28,13 L31,15.5" fill={goldBright} opacity="0.08" />
      {/* Crown band */}
      <rect x="28.5" y="18.5" width="23" height="3.5" rx="1" fill={gold} stroke={goldDark} strokeWidth="0.35" />
      <rect x="29" y="18.8" width="22" height="1.5" rx="0.5" fill={goldBright} opacity="0.1" />
      {/* Ermine trim with spots */}
      <rect x="29.5" y="19.2" width="21" height="2.2" rx="0.7" fill="#f2ece0" opacity="0.85" />
      {[32.5, 36, 39.5, 43, 46.5].map((cx, i) => (
        <circle key={i} cx={cx} cy="20.3" r="0.4" fill="#1a1a1a" />
      ))}
      {/* Crown jewels on points — faceted gemstones with inner glow */}
      <circle cx="34.5" cy="8" r="1.7" fill={jewel} stroke={goldDark} strokeWidth="0.3" />
      <circle cx="34.5" cy="7.5" r="0.8" fill={jewelHighlight} opacity="0.2" />
      <circle cx="40" cy="6" r="1.9" fill={jewel} stroke={goldDark} strokeWidth="0.35" />
      <circle cx="40" cy="5.5" r="0.9" fill={jewelHighlight} opacity="0.2" />
      <circle cx="45.5" cy="8" r="1.7" fill={jewel} stroke={goldDark} strokeWidth="0.3" />
      <circle cx="45.5" cy="7.5" r="0.8" fill={jewelHighlight} opacity="0.2" />
      {/* Jewel facet highlights */}
      <circle cx="34" cy="7.5" r="0.45" fill="#fff" opacity="0.5" />
      <circle cx="39.5" cy="5.5" r="0.5" fill="#fff" opacity="0.5" />
      <circle cx="45" cy="7.5" r="0.45" fill="#fff" opacity="0.5" />
      {/* Small gems between points */}
      <circle cx="31" cy="12.5" r="0.7" fill={gold} stroke={goldDark} strokeWidth="0.15" />
      <circle cx="49" cy="12.5" r="0.7" fill={gold} stroke={goldDark} strokeWidth="0.15" />
      {/* Cross finial — enhanced */}
      <line x1="40" y1="0.5" x2="40" y2="4" stroke={goldDark} strokeWidth="1" />
      <line x1="38.6" y1="1.8" x2="41.4" y2="1.8" stroke={goldDark} strokeWidth="0.7" />
      <circle cx="40" cy="0.5" r="0.5" fill={gold} />

      {/* === Hair — flowing waves with volume and texture === */}
      <path d="M28.5,22 Q24.5,29 25.5,39 Q25,43 23,48" fill="none" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M51.5,22 Q55.5,29 54.5,39 Q55,43 57,48" fill="none" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" />
      {/* Inner wave detail with highlight strands */}
      <path d="M26.5,24 Q23,32 24.5,41" fill="none" stroke={hairColor} strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
      <path d="M53.5,24 Q57,32 55.5,41" fill="none" stroke={hairColor} strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
      <path d="M28,25 Q25,30 26,35" fill="none" stroke={hairHighlight} strokeWidth="0.4" opacity="0.18" strokeLinecap="round" />
      <path d="M52,25 Q55,30 54,35" fill="none" stroke={hairHighlight} strokeWidth="0.4" opacity="0.18" strokeLinecap="round" />
      {/* Fine strands for engraved texture */}
      <path d="M30,22.5 Q28.5,26 29,30" fill="none" stroke={hairColor} strokeWidth="0.5" opacity="0.25" />
      <path d="M50,22.5 Q51.5,26 51,30" fill="none" stroke={hairColor} strokeWidth="0.5" opacity="0.25" />
      <path d="M27,28 Q25.5,33 26,37" fill="none" stroke={hairColor} strokeWidth="0.35" opacity="0.2" />
      <path d="M53,28 Q54.5,33 54,37" fill="none" stroke={hairColor} strokeWidth="0.35" opacity="0.2" />
      {/* Hair end curls */}
      <path d="M23.5,46 Q22,48 23,49" fill="none" stroke={hairColor} strokeWidth="0.6" opacity="0.3" strokeLinecap="round" />
      <path d="M56.5,46 Q58,48 57,49" fill="none" stroke={hairColor} strokeWidth="0.6" opacity="0.3" strokeLinecap="round" />

      {/* === Face — elegant oval === */}
      <ellipse cx="40" cy="34" rx="10.3" ry="11.8" fill={skin} stroke={ink} strokeWidth="0.5" />
      {/* Forehead highlight */}
      <ellipse cx="40" cy="28.5" rx="5.5" ry="2.8" fill={skinHighlight} opacity="0.12" />
      {/* Jawline modeling */}
      <path d="M31.5,37 Q34.5,43.5 40,45 Q45.5,43.5 48.5,37" fill="none" stroke={skinShade} strokeWidth="0.2" opacity="0.22" />
      {/* Cheek warmth — enhanced rosy glow */}
      <ellipse cx="34" cy="37" rx="2.5" ry="1.5" fill="#e0b090" opacity="0.16" />
      <ellipse cx="46" cy="37" rx="2.5" ry="1.5" fill="#e0b090" opacity="0.16" />

      {/* Eyes — almond-shaped, elegant with enhanced detail */}
      <ellipse cx="36" cy="31.5" rx="2.1" ry="1.4" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      <ellipse cx="44" cy="31.5" rx="2.1" ry="1.4" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      <circle cx="36.2" cy="31.6" r="1.1" fill={c.primary} />
      <circle cx="44.2" cy="31.6" r="1.1" fill={c.primary} />
      <circle cx="36.5" cy="31.2" r="0.5" fill="#111" />
      <circle cx="44.5" cy="31.2" r="0.5" fill="#111" />
      <circle cx="35.8" cy="31" r="0.3" fill="#fff" />
      <circle cx="43.8" cy="31" r="0.3" fill="#fff" />
      {/* Lower lid hint */}
      <path d="M34.2,32.5 Q36,33 37.8,32.5" fill="none" stroke={skinShade} strokeWidth="0.12" opacity="0.18" />
      <path d="M42.2,32.5 Q44,33 45.8,32.5" fill="none" stroke={skinShade} strokeWidth="0.12" opacity="0.18" />
      {/* Elegant upper lashes */}
      <path d="M33.6,30 Q36,29.1 38.5,30.1" fill="none" stroke={ink} strokeWidth="0.45" />
      <path d="M41.5,30.1 Q44,29.1 46.4,30" fill="none" stroke={ink} strokeWidth="0.45" />
      {/* Delicate brows */}
      <path d="M33.5,28.6 Q36,27.4 38.5,28.3" fill="none" stroke={hairColor} strokeWidth="0.35" strokeLinecap="round" />
      <path d="M41.5,28.3 Q44,27.4 46.5,28.6" fill="none" stroke={hairColor} strokeWidth="0.35" strokeLinecap="round" />

      {/* Nose — delicate */}
      <path d="M40,33 L39.3,36.8 Q40,37.5 40.7,37" fill="none" stroke={skinShade} strokeWidth="0.4" strokeLinecap="round" />
      {/* Nose bridge highlight */}
      <line x1="40.1" y1="33.5" x2="40" y2="35.5" stroke={skinHighlight} strokeWidth="0.25" opacity="0.12" />
      {/* Lips — full, regal with enhanced detail */}
      <path d="M37.4,39.8 Q38.5,39 40,40.1 Q41.5,39 42.6,39.8 Q41,41.5 40,41.5 Q39,41.5 37.4,39.8 Z" fill="#c06060" stroke="#9a4040" strokeWidth="0.25" />
      <path d="M38.5,39.6 Q40,39.9 41.5,39.6" fill="#f5e0d0" opacity="0.25" />
      {/* Cupid's bow highlight */}
      <path d="M39,39.3 Q40,38.8 41,39.3" fill="#d87070" opacity="0.15" />

      {/* === Necklace with pendant — delicate chain with more detail === */}
      <path d="M30.5,45.5 Q35.5,48 40,49 Q44.5,48 49.5,45.5" fill="none" stroke={gold} strokeWidth="0.8" />
      <path d="M32,46.5 Q36,48.5 40,49 Q44,48.5 48,46.5" fill="none" stroke={goldBright} strokeWidth="0.3" opacity="0.3" />
      {/* Chain link dots */}
      {[33, 36, 38, 42, 44, 47].map((cx, i) => (
        <circle key={i} cx={cx} cy={46.8 + Math.sin(i) * 0.5} r="0.25" fill={gold} opacity="0.3" />
      ))}
      <circle cx="40" cy="49.2" r="1.9" fill={jewel} stroke={goldDark} strokeWidth="0.3" />
      <circle cx="40" cy="48.8" r="0.9" fill={jewelHighlight} opacity="0.15" />
      <circle cx="39.6" cy="48.7" r="0.4" fill="#fff" opacity="0.4" />
      <circle cx="35.5" cy="47.3" r="0.8" fill={gold} stroke={goldDark} strokeWidth="0.18" />
      <circle cx="35.3" cy="47.1" r="0.2" fill={goldBright} opacity="0.3" />
      <circle cx="44.5" cy="47.3" r="0.8" fill={gold} stroke={goldDark} strokeWidth="0.18" />
      <circle cx="44.3" cy="47.1" r="0.2" fill={goldBright} opacity="0.3" />

      {/* === Dress bodice — richly textured === */}
      <path d="M23.5,48 L19.5,60 L60.5,60 L56.5,48 Q40,56 23.5,48 Z" fill={dressPrimary} stroke={ink} strokeWidth="0.4" />
      {/* Fabric sheen */}
      <path d="M30,50 Q35,54 40,50.5 Q45,54 50,50" fill={dressHighlight} opacity="0.06" />
      {/* Neckline with gold piping */}
      <path d="M28.5,47.5 Q34.5,52.5 40,49.5 Q45.5,52.5 51.5,47.5" fill={dressAccent} opacity="0.2" stroke={gold} strokeWidth="0.4" />
      <line x1="40" y1="49.5" x2="40" y2="60" stroke={gold} strokeWidth="0.55" opacity="0.35" />
      {/* Engraved fabric shading */}
      <path d="M27,51 L24.5,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.1" />
      <path d="M29,50 L26.5,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.07" />
      <path d="M31,49.5 L29,60" fill="none" stroke={ink} strokeWidth="0.08" opacity="0.05" />
      <path d="M53,51 L55.5,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.1" />
      <path d="M51,50 L53.5,60" fill="none" stroke={ink} strokeWidth="0.1" opacity="0.07" />
      <path d="M49,49.5 L51,60" fill="none" stroke={ink} strokeWidth="0.08" opacity="0.05" />

      {/* === Rose (traditional Queen prop) — enhanced detail === */}
      <g transform="translate(62,38)">
        {/* Outer petals — more defined */}
        <circle r="3.2" fill={isRed ? '#d43838' : '#c43030'} opacity="0.8" />
        <path d="M-2.5,-1.2 Q-1,-3.2 0,-3.2 Q1,-3.2 2.5,-1.2" fill="none" stroke={isRed ? '#e06060' : '#d85050'} strokeWidth="0.35" opacity="0.4" />
        <path d="M-2.5,1.2 Q-1,3.2 0,3.2 Q1,3.2 2.5,1.2" fill="none" stroke={isRed ? '#e06060' : '#d85050'} strokeWidth="0.3" opacity="0.3" />
        <path d="M-1.2,-2.5 Q-3.2,-1 -3.2,0 Q-3.2,1 -1.2,2.5" fill="none" stroke={isRed ? '#e06060' : '#d85050'} strokeWidth="0.25" opacity="0.2" />
        <path d="M1.2,-2.5 Q3.2,-1 3.2,0 Q3.2,1 1.2,2.5" fill="none" stroke={isRed ? '#e06060' : '#d85050'} strokeWidth="0.25" opacity="0.2" />
        {/* Inner petals */}
        <circle r="1.8" fill={isRed ? '#e85858' : '#d84848'} opacity="0.55" />
        <circle r="0.8" fill={isRed ? '#f08080' : '#e06868'} opacity="0.4" />
        {/* Center highlight */}
        <circle r="0.3" fill="#fff" opacity="0.15" />
        {/* Stem */}
        <line x1="0" y1="3.2" x2="-1" y2="14" stroke="#2a5222" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="-0.2" y1="4" x2="-0.8" y2="12" stroke="#3a7232" strokeWidth="0.3" opacity="0.25" strokeLinecap="round" />
        <path d="M-0.5,7.5 Q-3,6.5 -3.5,5.5" fill="none" stroke="#3a7232" strokeWidth="0.5" strokeLinecap="round" />
        {/* Leaf — more detailed */}
        <path d="M-3,6 Q-4.5,5 -3.5,4" fill="#3a7232" opacity="0.4" />
        <path d="M-3.2,5.5 L-3.8,4.8" fill="none" stroke="#2a5222" strokeWidth="0.15" opacity="0.3" />
        {/* Thorn */}
        <path d="M-0.7,9 L-1.5,8.2" fill="none" stroke="#2a5222" strokeWidth="0.3" opacity="0.25" />
      </g>
    </>
  )

  return <FaceCardFrame suit={suit} label="queen">{halfContent}</FaceCardFrame>
}

function KingSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skin = '#f0dfc0'
  const skinShade = '#c8a878'
  const skinHighlight = '#f8ecd8'
  const hairColor = isRed ? '#4a2810' : '#100810'
  const hairHighlight = isRed ? '#6a3c1c' : '#201820'
  const beardColor = isRed ? '#5a3018' : '#161016'
  const robePrimary = isRed ? '#a41428' : '#141430'
  const robeAccent = isRed ? '#c42e40' : '#242444'
  const robeHighlight = isRed ? '#d44858' : '#343458'
  const gold = '#c9a84c'
  const goldDark = '#8b6914'
  const goldBright = '#e0c470'
  const ink = isRed ? '#6a0e1e' : '#0a0a18'
  const jewel = isRed ? '#1e4488' : '#b82828'
  const jewelHighlight = isRed ? '#3a68b0' : '#d84848'
  const ermine = '#f0eadc'

  const halfContent = (
    <>
      {/* === Imperial crown — larger, grander than Queen's === */}
      <path d="M25.5,22 L23.5,8.5 L29.5,15 L34,4.5 L40,13 L46,4.5 L50.5,15 L56.5,8.5 L54.5,22 Z" fill={gold} stroke={goldDark} strokeWidth="0.55" />
      {/* Crown highlight — left edge catch light */}
      <path d="M27,21 L25.5,10.5 L30,15.5 L34,6.5 L40,14 L46,6.5 L50,15.5 L54.5,10.5 L53,21" fill={goldBright} opacity="0.12" />
      <path d="M26,20 L25,12 L28.5,15" fill={goldBright} opacity="0.06" />
      {/* Crown body band */}
      <rect x="25.5" y="20.5" width="29" height="4.2" rx="1.2" fill={gold} stroke={goldDark} strokeWidth="0.4" />
      <rect x="26" y="20.8" width="28" height="1.8" rx="0.6" fill={goldBright} opacity="0.1" />
      {/* Ermine band with spots */}
      <rect x="26.5" y="21.2" width="27" height="2.6" rx="0.8" fill={ermine} opacity="0.85" />
      {[30, 33.5, 37, 40.5, 44, 47.5, 51].map((cx, i) => (
        <circle key={i} cx={cx} cy="22.5" r="0.45" fill="#111" />
      ))}
      {/* Crown jewels — richer arrangement with facets and inner glow */}
      <circle cx="34" cy="6.5" r="1.9" fill={jewel} stroke={goldDark} strokeWidth="0.3" />
      <circle cx="34" cy="6" r="0.9" fill={jewelHighlight} opacity="0.2" />
      <circle cx="46" cy="6.5" r="1.9" fill={jewel} stroke={goldDark} strokeWidth="0.3" />
      <circle cx="46" cy="6" r="0.9" fill={jewelHighlight} opacity="0.2" />
      <circle cx="40" cy="12" r="1.4" fill={goldBright} opacity="0.5" stroke={goldDark} strokeWidth="0.25" />
      <circle cx="29.5" cy="13.5" r="1.2" fill={jewel} opacity="0.6" stroke={goldDark} strokeWidth="0.2" />
      <circle cx="50.5" cy="13.5" r="1.2" fill={jewel} opacity="0.6" stroke={goldDark} strokeWidth="0.2" />
      {/* Jewel highlights */}
      <circle cx="33.5" cy="6" r="0.5" fill="#fff" opacity="0.5" />
      <circle cx="45.5" cy="6" r="0.5" fill="#fff" opacity="0.5" />
      <circle cx="29.2" cy="13.2" r="0.3" fill="#fff" opacity="0.3" />
      <circle cx="50.2" cy="13.2" r="0.3" fill="#fff" opacity="0.3" />
      {/* Crown arch decoration between points */}
      <path d="M29.5,15 Q32,11 34,6.5" fill="none" stroke={goldDark} strokeWidth="0.15" opacity="0.12" />
      <path d="M50.5,15 Q48,11 46,6.5" fill="none" stroke={goldDark} strokeWidth="0.15" opacity="0.12" />
      {/* Cross pattée finial — enhanced */}
      <path d="M40,-0.5 L39,1.8 L40,1.5 L41,1.8 Z" fill={goldDark} />
      <line x1="40" y1="-0.5" x2="40" y2="4.5" stroke={goldDark} strokeWidth="1.2" />
      <line x1="38.2" y1="1.5" x2="41.8" y2="1.5" stroke={goldDark} strokeWidth="0.9" />
      <circle cx="40" cy="-0.5" r="0.6" fill={gold} />
      {/* Orb at top of cross */}
      <circle cx="40" cy="1.5" r="0.35" fill={goldBright} opacity="0.25" />

      {/* === Hair — shorter, distinguished with silver highlights === */}
      <path d="M27.5,24.5 Q24,30 25.5,38" fill="none" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />
      <path d="M52.5,24.5 Q56,30 54.5,38" fill="none" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />
      <path d="M26.5,27 Q24.5,32 25.5,36" fill="none" stroke={hairHighlight} strokeWidth="0.7" opacity="0.25" strokeLinecap="round" />
      <path d="M53.5,27 Q55.5,32 54.5,36" fill="none" stroke={hairHighlight} strokeWidth="0.7" opacity="0.25" strokeLinecap="round" />
      {/* Temple gray streaks */}
      <path d="M28,25 Q26.5,28 27,31" fill="none" stroke="#808080" strokeWidth="0.3" opacity="0.12" strokeLinecap="round" />
      <path d="M52,25 Q53.5,28 53,31" fill="none" stroke="#808080" strokeWidth="0.3" opacity="0.12" strokeLinecap="round" />

      {/* === Face — broader, authoritative === */}
      <ellipse cx="40" cy="36" rx="11.2" ry="12.2" fill={skin} stroke={ink} strokeWidth="0.55" />
      {/* Forehead highlight */}
      <ellipse cx="40" cy="30" rx="6" ry="3" fill={skinHighlight} opacity="0.12" />
      {/* Face modeling — enhanced cheek warmth */}
      <ellipse cx="34.5" cy="38" rx="2.5" ry="1.5" fill="#e0b090" opacity="0.15" />
      <ellipse cx="45.5" cy="38" rx="2.5" ry="1.5" fill="#e0b090" opacity="0.15" />

      {/* Eyes — commanding, stern with more detail */}
      <ellipse cx="36" cy="33" rx="1.8" ry="1.25" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      <ellipse cx="44" cy="33" rx="1.8" ry="1.25" fill="#f8f6f0" stroke={ink} strokeWidth="0.28" />
      <circle cx="36.2" cy="33.15" r="0.95" fill={c.primary} />
      <circle cx="44.2" cy="33.15" r="0.95" fill={c.primary} />
      <circle cx="36.5" cy="32.7" r="0.45" fill="#111" />
      <circle cx="44.5" cy="32.7" r="0.45" fill="#111" />
      <circle cx="35.8" cy="32.6" r="0.25" fill="#fff" />
      <circle cx="43.8" cy="32.6" r="0.25" fill="#fff" />
      {/* Lower lid crease — wisdom lines */}
      <path d="M34.4,34 Q36,34.4 37.6,34" fill="none" stroke={skinShade} strokeWidth="0.12" opacity="0.15" />
      <path d="M42.4,34 Q44,34.4 45.6,34" fill="none" stroke={skinShade} strokeWidth="0.12" opacity="0.15" />
      {/* Heavy brows — regal authority */}
      <path d="M33.2,30.3 Q36,28.9 38.8,29.9" fill="none" stroke={ink} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M41.2,29.9 Q44,28.9 46.8,30.3" fill="none" stroke={ink} strokeWidth="0.8" strokeLinecap="round" />

      {/* Nose — strong, distinguished */}
      <path d="M40,34.5 L39,37.8 Q40,38.7 41,38" fill="none" stroke={skinShade} strokeWidth="0.45" strokeLinecap="round" />
      {/* Nose bridge highlight */}
      <line x1="40.2" y1="35" x2="40.1" y2="37" stroke={skinHighlight} strokeWidth="0.25" opacity="0.1" />

      {/* Mustache — full, turned, engraved detail */}
      <path d="M35.8,40.3 Q37.8,41.8 40,40.6 Q42.2,41.8 44.2,40.3" fill={beardColor} opacity="0.7" stroke={beardColor} strokeWidth="0.25" />
      <path d="M36.5,40.5 Q38,41.2 40,40.8 Q42,41.2 43.5,40.5" fill="none" stroke={beardColor} strokeWidth="0.15" opacity="0.3" />
      {/* Mustache curl tips */}
      <path d="M35.5,40.5 Q35,41 34.8,40.5" fill="none" stroke={beardColor} strokeWidth="0.2" opacity="0.3" />
      <path d="M44.5,40.5 Q45,41 45.2,40.5" fill="none" stroke={beardColor} strokeWidth="0.2" opacity="0.3" />
      {/* Full beard — layered engraving strokes with more depth */}
      <path d="M31.5,41 Q29.5,47 33.5,51.5 Q37,55 40,56 Q43,55 46.5,51.5 Q50.5,47 48.5,41" fill={beardColor} opacity="0.22" />
      <path d="M32.5,42 Q30.5,47 34.5,51.5 Q37.5,54 40,55 Q42.5,54 45.5,51.5 Q49.5,47 47.5,42" fill="none" stroke={beardColor} strokeWidth="0.45" opacity="0.4" />
      <path d="M33.5,43.5 Q31.5,47.5 35,51 Q38,53.5 40,54" fill="none" stroke={beardColor} strokeWidth="0.2" opacity="0.15" />
      <path d="M46.5,43.5 Q48.5,47.5 45,51 Q42,53.5 40,54" fill="none" stroke={beardColor} strokeWidth="0.2" opacity="0.15" />
      <path d="M34,44.5 Q37,48.5 40,49.5 Q43,48.5 46,44.5" fill="none" stroke={beardColor} strokeWidth="0.3" opacity="0.3" />
      <path d="M35,47 Q38,50.5 40,51 Q42,50.5 45,47" fill="none" stroke={beardColor} strokeWidth="0.25" opacity="0.25" />
      <path d="M36.5,49 Q39,52 40,52.5 Q41,52 43.5,49" fill="none" stroke={beardColor} strokeWidth="0.2" opacity="0.2" />
      {/* Mouth line */}
      <line x1="38.3" y1="42.8" x2="41.7" y2="42.8" stroke="#8a4848" strokeWidth="0.5" strokeLinecap="round" />

      {/* === Ermine collar — rich and detailed === */}
      <rect x="22.5" y="53" width="35" height="4.2" rx="1.6" fill={ermine} stroke={goldDark} strokeWidth="0.3" />
      {[26.5, 30.5, 34.5, 38.5, 42.5, 46.5, 50.5].map((cx, i) => (
        <circle key={i} cx={cx} cy="55" r="0.45" fill="#111" />
      ))}
      {/* Gold chain over collar — with chain link detail */}
      <path d="M32.5,53 Q36.5,55 40,55 Q43.5,55 47.5,53" fill="none" stroke={gold} strokeWidth="0.6" />
      <path d="M33.5,53.5 Q37,55.5 40,55.5 Q43,55.5 46.5,53.5" fill="none" stroke={goldBright} strokeWidth="0.2" opacity="0.25" />
      {/* Chain pendant */}
      <circle cx="40" cy="55.8" r="1" fill={jewel} stroke={goldDark} strokeWidth="0.2" />
      <circle cx="39.7" cy="55.5" r="0.3" fill="#fff" opacity="0.3" />

      {/* === Robe — with engraved detail and highlight === */}
      <path d="M20.5,57 L17,60 L63,60 L59.5,57 Z" fill={robePrimary} stroke={ink} strokeWidth="0.3" />
      {/* Fabric sheen */}
      <path d="M30,57.5 Q40,58.5 50,57.5" fill={robeHighlight} opacity="0.06" />
      <path d="M25,57.5 L23,60" fill="none" stroke={robeAccent} strokeWidth="0.1" opacity="0.15" />
      <path d="M55,57.5 L57,60" fill="none" stroke={robeAccent} strokeWidth="0.1" opacity="0.15" />
      {/* Gold trim on robe */}
      <path d="M20.5,57.2 L17,60" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.2" />
      <path d="M59.5,57.2 L63,60" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.2" />

      {/* === Scepter (traditional King prop) — enhanced === */}
      <line x1="15" y1="30" x2="13.8" y2="57" stroke={goldDark} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="15" y1="30" x2="13.8" y2="57" stroke={gold} strokeWidth="0.5" opacity="0.25" strokeLinecap="round" />
      {/* Shaft decoration rings */}
      <circle cx="14.5" cy="36" r="0.6" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.3" />
      <circle cx="14.3" cy="42" r="0.5" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.25" />
      <circle cx="14.1" cy="48" r="0.4" fill="none" stroke={gold} strokeWidth="0.2" opacity="0.2" />
      {/* Scepter orb — enhanced */}
      <circle cx="15" cy="28" r="3.4" fill={gold} stroke={goldDark} strokeWidth="0.45" />
      <circle cx="15" cy="28" r="2" fill={goldBright} opacity="0.2" />
      <circle cx="15" cy="28" r="1.4" fill={jewel} />
      <circle cx="15" cy="27.5" r="0.7" fill={jewelHighlight} opacity="0.15" />
      <circle cx="14.5" cy="27.4" r="0.4" fill="#fff" opacity="0.4" />
      {/* Scepter cross — enhanced */}
      <line x1="12.5" y1="25.5" x2="17.5" y2="25.5" stroke={goldDark} strokeWidth="0.8" />
      <line x1="15" y1="23.2" x2="15" y2="27.5" stroke={goldDark} strokeWidth="0.8" />
      {/* Cross end caps */}
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

function CardFace({ card }: { card: CardType }) {
  const symbol = SUIT_SYMBOLS[card.suit]
  const color = SUIT_COLORS[card.suit]
  const isFace = ['J', 'Q', 'K'].includes(card.rank)
  const FaceComponent = FACE_COMPONENTS[card.rank]
  const isNumber = !isFace && card.rank !== 'A'

  return (
    <div className={`card card-face ${color} ${isFace ? 'face-card-type' : ''} ${card.rank === 'A' ? 'ace-card-type' : ''}`}>
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
  return (
    <div className={`card card-back card-back-${CARD_BACK_THEME}`}>
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
