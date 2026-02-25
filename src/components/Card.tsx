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
   ───────────────────────────────────────────────────────── */

// Shared rendering helpers for consistent face-card artwork
function FaceCardFrame({ suit, label, children }: { suit: Suit; label: string; children: React.ReactNode }) {
  const c = SUIT_ACCENTS[suit]
  const gold = '#c9a84c'
  const goldDark = '#8b6914'
  return (
    <svg viewBox="0 0 80 120" className="face-svg">
      <defs>
        <clipPath id={`${label}-top-${suit}`}><rect x="0" y="0" width="80" height="60" /></clipPath>
        <clipPath id={`${label}-bot-${suit}`}><rect x="0" y="60" width="80" height="60" /></clipPath>
        {/* Cross-hatch pattern for depth */}
        <pattern id={`${label}-hatch-${suit}`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="3" stroke={c.primary} strokeWidth="0.15" opacity="0.08" />
        </pattern>
      </defs>
      {/* Background fill for face card area */}
      <rect x="1" y="1" width="78" height="118" rx="4" fill={`url(#${label}-hatch-${suit})`} />
      {/* Decorative double inner border */}
      <rect x="2.5" y="2.5" width="75" height="115" rx="3.5" fill="none" stroke={c.primary} strokeWidth="0.35" opacity="0.18" />
      <rect x="4" y="4" width="72" height="112" rx="3" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.15" />
      {/* Fine corner flourishes */}
      <path d="M6,6 Q6,10 10,10" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.2" />
      <path d="M74,6 Q74,10 70,10" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.2" />
      <path d="M6,114 Q6,110 10,110" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.2" />
      <path d="M74,114 Q74,110 70,110" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.2" />
      {/* Top Half */}
      <g clipPath={`url(#${label}-top-${suit})`}>{children}</g>
      {/* Center divider — fine ornamental line */}
      <line x1="6" y1="60" x2="74" y2="60" stroke={c.primary} strokeWidth="0.25" opacity="0.2" />
      <line x1="8" y1="59.5" x2="72" y2="59.5" stroke={goldDark} strokeWidth="0.15" opacity="0.12" />
      <line x1="8" y1="60.5" x2="72" y2="60.5" stroke={goldDark} strokeWidth="0.15" opacity="0.12" />
      {/* Center suit pips */}
      <text x="11" y="57.5" fontSize="6" fill={c.primary} fontFamily="serif" opacity="0.55">{SUIT_SYMBOLS[suit]}</text>
      <text x="69" y="64.5" fontSize="6" fill={c.primary} fontFamily="serif" textAnchor="middle" transform="rotate(180,69,62.5)" opacity="0.55">{SUIT_SYMBOLS[suit]}</text>
      {/* Bottom Half (mirrored) */}
      <g clipPath={`url(#${label}-bot-${suit})`} transform="rotate(180,40,90)">{children}</g>
    </svg>
  )
}

function JackSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skin = '#eedcb8'
  const skinLight = '#f5e8d0'
  const skinShade = '#c8a878'
  const hairColor = isRed ? '#6e4424' : '#1a1020'
  const hatPrimary = isRed ? '#b01830' : '#161630'
  const hatAccent = isRed ? '#d43050' : '#2a2a50'
  const tunicPrimary = isRed ? '#b01830' : '#161630'
  const tunicAccent = isRed ? '#cc3848' : '#282848'
  const gold = '#c9a84c'
  const goldDark = '#8b6914'
  const goldBright = '#e0c470'
  const ink = isRed ? '#6a0e1e' : '#0a0a18'

  const halfContent = (
    <>
      {/* === Hat — Renaissance beret with structured feather === */}
      <ellipse cx="40" cy="20" rx="14.5" ry="7" fill={hatPrimary} stroke={ink} strokeWidth="0.55" />
      <path d="M27,20 Q26,13 30,8.5 Q35,4 40,10 Q45,4 50,8.5 Q54,13 53,20" fill={hatPrimary} stroke={ink} strokeWidth="0.55" />
      {/* Hat shading for volume */}
      <path d="M29,19 Q28.5,14 32,10 Q36,6 40,11 Q44,6 48,10 Q51.5,14 51,19" fill={hatAccent} opacity="0.4" />
      {/* Hat band — gold with gemstone center */}
      <rect x="27.5" y="18" width="25" height="3.5" rx="1.5" fill={gold} stroke={goldDark} strokeWidth="0.4" />
      <rect x="28.5" y="18.5" width="23" height="2.5" rx="1" fill={goldBright} opacity="0.3" />
      <ellipse cx="40" cy="19.8" r="1.3" fill={c.secondary} stroke={goldDark} strokeWidth="0.35" />
      <circle cx="39.6" cy="19.4" r="0.35" fill="#fff" opacity="0.5" />
      {/* Feather — elegant quill with barbs */}
      <path d="M33,17 Q28,6 24,1" fill="none" stroke={gold} strokeWidth="1.0" strokeLinecap="round" />
      <path d="M33,16 Q29.5,7.5 26,3.5" fill="none" stroke={goldBright} strokeWidth="0.5" opacity="0.6" strokeLinecap="round" />
      {/* Feather barbs */}
      <path d="M31,11 Q28.5,10.5 27,11.5" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.5" />
      <path d="M30,8 Q27.5,7.5 26,8.5" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.4" />
      <path d="M29,5 Q27,4.5 25.5,5" fill="none" stroke={gold} strokeWidth="0.25" opacity="0.35" />

      {/* === Hair — curled locks from under hat === */}
      <path d="M26.5,21 Q22.5,27 24,36" fill="none" stroke={hairColor} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M53.5,21 Q57.5,27 56,36" fill="none" stroke={hairColor} strokeWidth="2.6" strokeLinecap="round" />
      {/* Hair detail strands */}
      <path d="M25,26 Q22,32 23.5,37" fill="none" stroke={hairColor} strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
      <path d="M55,26 Q58,32 56.5,37" fill="none" stroke={hairColor} strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
      <path d="M27,24 Q25,27 25.5,31" fill="none" stroke={hairColor} strokeWidth="0.6" opacity="0.35" strokeLinecap="round" />
      <path d="M53,24 Q55,27 54.5,31" fill="none" stroke={hairColor} strokeWidth="0.6" opacity="0.35" strokeLinecap="round" />

      {/* === Face — refined oval with proper modeling === */}
      <ellipse cx="40" cy="33.5" rx="11" ry="12" fill={skin} stroke={ink} strokeWidth="0.6" />
      {/* Jawline definition */}
      <path d="M30,38 Q33,44 40,45.5 Q47,44 50,38" fill="none" stroke={skinShade} strokeWidth="0.3" opacity="0.3" />
      {/* Cheek warmth */}
      <ellipse cx="33.5" cy="36.5" rx="2.8" ry="1.8" fill="#e0b090" opacity="0.18" />
      <ellipse cx="46.5" cy="36.5" rx="2.8" ry="1.8" fill="#e0b090" opacity="0.18" />

      {/* Eyes — alert, youthful */}
      <ellipse cx="36" cy="31" rx="2.1" ry="1.4" fill="#f8f6f0" stroke={ink} strokeWidth="0.3" />
      <ellipse cx="44" cy="31" rx="2.1" ry="1.4" fill="#f8f6f0" stroke={ink} strokeWidth="0.3" />
      <circle cx="36.3" cy="31.2" r="1.1" fill={c.primary} />
      <circle cx="44.3" cy="31.2" r="1.1" fill={c.primary} />
      <circle cx="35.9" cy="30.7" r="0.35" fill="#fff" />
      <circle cx="43.9" cy="30.7" r="0.35" fill="#fff" />
      {/* Upper lids */}
      <path d="M33.5,29.5 Q36,28.8 38.5,29.5" fill="none" stroke={ink} strokeWidth="0.45" />
      <path d="M41.5,29.5 Q44,28.8 46.5,29.5" fill="none" stroke={ink} strokeWidth="0.45" />
      {/* Eyebrows — refined arches */}
      <path d="M33.2,28.2 Q36,27 38.8,28" fill="none" stroke={ink} strokeWidth="0.55" strokeLinecap="round" />
      <path d="M41.2,28 Q44,27 46.8,28.2" fill="none" stroke={ink} strokeWidth="0.55" strokeLinecap="round" />

      {/* Nose — straight, refined */}
      <path d="M40,32.5 L39.2,36.5 Q40,37.3 40.8,36.8" fill="none" stroke={skinShade} strokeWidth="0.5" strokeLinecap="round" />
      <path d="M38.5,36.5 Q39.2,37.5 40,37.5" fill="none" stroke={skinShade} strokeWidth="0.25" opacity="0.4" />
      {/* Mouth — youthful, slight smile */}
      <path d="M37.5,39.5 Q40,40.8 42.5,39.5" fill="#be6858" stroke="#985040" strokeWidth="0.35" />
      <path d="M38.3,39.5 Q40,39.8 41.7,39.5" fill={skinLight} opacity="0.3" />

      {/* === Collar — ornate pointed with layered detail === */}
      <path d="M28,44.5 L33,49.5 L40,45.5 L47,49.5 L52,44.5" fill={gold} stroke={goldDark} strokeWidth="0.5" />
      <path d="M29.5,45.5 L33,48.5 L40,46 L47,48.5 L50.5,45.5" fill={goldBright} opacity="0.25" />
      {/* Collar gem */}
      <circle cx="40" cy="46.2" r="1.3" fill={c.secondary} stroke={goldDark} strokeWidth="0.35" />
      <circle cx="39.6" cy="45.8" r="0.35" fill="#fff" opacity="0.45" />

      {/* === Tunic — rich fabric with center seam === */}
      <path d="M24,49 L20,60 L60,60 L56,49 Q40,56 24,49 Z" fill={tunicPrimary} stroke={ink} strokeWidth="0.45" />
      {/* Tunic panel detail */}
      <path d="M36,50.5 L40,59 L44,50.5" fill={tunicAccent} opacity="0.3" />
      <line x1="40" y1="49" x2="40" y2="60" stroke={gold} strokeWidth="0.7" opacity="0.45" />
      {/* Gold buttons */}
      <circle cx="40" cy="52.5" r="0.65" fill={gold} stroke={goldDark} strokeWidth="0.2" />
      <circle cx="40" cy="55.5" r="0.65" fill={gold} stroke={goldDark} strokeWidth="0.2" />
      {/* Cross-hatch fabric shading */}
      <path d="M26,52 L29,60" fill="none" stroke={ink} strokeWidth="0.15" opacity="0.12" />
      <path d="M28,51 L30,60" fill="none" stroke={ink} strokeWidth="0.15" opacity="0.1" />
      <path d="M52,51 L50,60" fill="none" stroke={ink} strokeWidth="0.15" opacity="0.1" />
      <path d="M54,52 L51,60" fill="none" stroke={ink} strokeWidth="0.15" opacity="0.12" />

      {/* === Held item — halberd/axe (traditional Jack prop) === */}
      <line x1="60" y1="24" x2="63" y2="56" stroke={goldDark} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M58,26 L60,24 L65,28 L63,32 Z" fill={isRed ? '#7a8a8a' : '#8a8a9a'} stroke={ink} strokeWidth="0.4" />
      <path d="M59.5,26.5 L61,25.5 L63.5,28" fill="none" stroke="#b0b8b8" strokeWidth="0.3" opacity="0.3" />
    </>
  )

  return <FaceCardFrame suit={suit} label="jack">{halfContent}</FaceCardFrame>
}

function QueenSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skin = '#eedcb8'
  const skinLight = '#f5e8d0'
  const skinShade = '#c8a878'
  const hairColor = isRed ? '#5c2c14' : '#100810'
  const dressPrimary = isRed ? '#b01830' : '#161630'
  const dressAccent = isRed ? '#cc3848' : '#282848'
  const gold = '#c9a84c'
  const goldDark = '#8b6914'
  const goldBright = '#e0c470'
  const ink = isRed ? '#6a0e1e' : '#0a0a18'
  const jewel = isRed ? '#1e4488' : '#b82828'

  const halfContent = (
    <>
      {/* === Crown — regal with 5 points and arched bridges === */}
      <path d="M28,20 L26.5,10 L31,15 L34,5.5 L37,13 L40,3 L43,13 L46,5.5 L49,15 L53.5,10 L52,20 Z" fill={gold} stroke={goldDark} strokeWidth="0.6" />
      {/* Crown band */}
      <rect x="28" y="18.5" width="24" height="3.8" rx="1" fill={gold} stroke={goldDark} strokeWidth="0.4" />
      {/* Ermine trim */}
      <rect x="29" y="19.2" width="22" height="2.3" rx="0.7" fill="#f2ece0" opacity="0.85" />
      {[32, 35.5, 39, 42.5, 46].map((cx, i) => (
        <circle key={i} cx={cx} cy="20.3" r="0.45" fill="#1a1a1a" />
      ))}
      {/* Crown jewels on points */}
      <circle cx="34" cy="7.5" r="1.8" fill={jewel} stroke={goldDark} strokeWidth="0.35" />
      <circle cx="40" cy="5.5" r="2" fill={jewel} stroke={goldDark} strokeWidth="0.4" />
      <circle cx="46" cy="7.5" r="1.8" fill={jewel} stroke={goldDark} strokeWidth="0.35" />
      {/* Jewel facet highlights */}
      <circle cx="33.5" cy="7" r="0.5" fill="#fff" opacity="0.45" />
      <circle cx="39.5" cy="5" r="0.55" fill="#fff" opacity="0.45" />
      <circle cx="45.5" cy="7" r="0.5" fill="#fff" opacity="0.45" />
      {/* Cross finial */}
      <line x1="40" y1="0.5" x2="40" y2="3.5" stroke={goldDark} strokeWidth="1.1" />
      <line x1="38.5" y1="1.8" x2="41.5" y2="1.8" stroke={goldDark} strokeWidth="0.8" />

      {/* === Hair — flowing waves with volume === */}
      <path d="M28,22 Q24,29 25,39 Q24,43 22,48" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M52,22 Q56,29 55,39 Q56,43 58,48" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
      {/* Inner wave detail */}
      <path d="M26,24 Q22.5,32 24,41" fill="none" stroke={hairColor} strokeWidth="1.5" opacity="0.45" strokeLinecap="round" />
      <path d="M54,24 Q57.5,32 56,41" fill="none" stroke={hairColor} strokeWidth="1.5" opacity="0.45" strokeLinecap="round" />
      {/* Fine strands for texture */}
      <path d="M29.5,22.5 Q28,26 28.5,30" fill="none" stroke={hairColor} strokeWidth="0.6" opacity="0.3" />
      <path d="M50.5,22.5 Q52,26 51.5,30" fill="none" stroke={hairColor} strokeWidth="0.6" opacity="0.3" />

      {/* === Face — elegant oval === */}
      <ellipse cx="40" cy="34" rx="10.5" ry="12" fill={skin} stroke={ink} strokeWidth="0.55" />
      {/* Subtle modeling */}
      <path d="M31,37 Q34,44 40,45.5 Q46,44 49,37" fill="none" stroke={skinShade} strokeWidth="0.25" opacity="0.25" />
      <ellipse cx="34" cy="37" rx="2.5" ry="1.5" fill="#e0b090" opacity="0.15" />
      <ellipse cx="46" cy="37" rx="2.5" ry="1.5" fill="#e0b090" opacity="0.15" />

      {/* Eyes — almond-shaped, elegant */}
      <ellipse cx="36" cy="31.5" rx="2.2" ry="1.5" fill="#f8f6f0" stroke={ink} strokeWidth="0.3" />
      <ellipse cx="44" cy="31.5" rx="2.2" ry="1.5" fill="#f8f6f0" stroke={ink} strokeWidth="0.3" />
      <circle cx="36.2" cy="31.7" r="1.2" fill={c.primary} />
      <circle cx="44.2" cy="31.7" r="1.2" fill={c.primary} />
      <circle cx="35.8" cy="31.1" r="0.35" fill="#fff" />
      <circle cx="43.8" cy="31.1" r="0.35" fill="#fff" />
      {/* Elegant lashes */}
      <path d="M33.5,29.8 Q36,29 38.7,30" fill="none" stroke={ink} strokeWidth="0.5" />
      <path d="M41.3,30 Q44,29 46.5,29.8" fill="none" stroke={ink} strokeWidth="0.5" />
      {/* Delicate brows */}
      <path d="M33.5,28.5 Q36,27.3 38.5,28.2" fill="none" stroke={hairColor} strokeWidth="0.4" strokeLinecap="round" />
      <path d="M41.5,28.2 Q44,27.3 46.5,28.5" fill="none" stroke={hairColor} strokeWidth="0.4" strokeLinecap="round" />

      {/* Nose */}
      <path d="M40,33 L39.2,37 Q40,37.8 40.8,37.3" fill="none" stroke={skinShade} strokeWidth="0.45" strokeLinecap="round" />
      {/* Lips — full, regal */}
      <path d="M37.2,40 Q38.5,39.2 40,40.3 Q41.5,39.2 42.8,40 Q41,41.8 40,41.8 Q39,41.8 37.2,40 Z" fill="#c06060" stroke="#9a4040" strokeWidth="0.3" />
      <path d="M38.5,39.8 Q40,40 41.5,39.8" fill={skinLight} opacity="0.25" />

      {/* === Necklace with pendant === */}
      <path d="M30,45.5 Q35,48.5 40,49.5 Q45,48.5 50,45.5" fill="none" stroke={gold} strokeWidth="1" />
      <circle cx="40" cy="49.5" r="2" fill={jewel} stroke={goldDark} strokeWidth="0.35" />
      <circle cx="39.6" cy="49" r="0.55" fill="#fff" opacity="0.4" />
      <circle cx="35.5" cy="47.5" r="0.85" fill={gold} stroke={goldDark} strokeWidth="0.2" />
      <circle cx="44.5" cy="47.5" r="0.85" fill={gold} stroke={goldDark} strokeWidth="0.2" />

      {/* === Dress bodice === */}
      <path d="M23,48 L19,60 L61,60 L57,48 Q40,56.5 23,48 Z" fill={dressPrimary} stroke={ink} strokeWidth="0.45" />
      {/* Neckline with gold piping */}
      <path d="M28,47.5 Q34,53 40,49.5 Q46,53 52,47.5" fill={dressAccent} opacity="0.25" stroke={gold} strokeWidth="0.45" />
      <line x1="40" y1="49.5" x2="40" y2="60" stroke={gold} strokeWidth="0.65" opacity="0.4" />
      {/* Fabric shading lines */}
      <path d="M27,51 L24,60" fill="none" stroke={ink} strokeWidth="0.15" opacity="0.12" />
      <path d="M53,51 L56,60" fill="none" stroke={ink} strokeWidth="0.15" opacity="0.12" />

      {/* === Rose (traditional Queen prop) === */}
      <g transform="translate(62,38)">
        <circle r="3.2" fill={isRed ? '#d83838' : '#c83030'} opacity="0.85" />
        <circle r="2" fill={isRed ? '#e85858' : '#d84848'} opacity="0.6" />
        <circle r="0.9" fill={isRed ? '#f08080' : '#e06868'} opacity="0.45" />
        {/* Petals suggestion */}
        <path d="M-2.5,0 Q-1,-2.5 0,-2.5 Q1,-2.5 2.5,0" fill="none" stroke={isRed ? '#f09090' : '#e07878'} strokeWidth="0.3" opacity="0.35" />
        {/* Stem */}
        <line x1="0" y1="3.2" x2="-1" y2="15" stroke="#2a5222" strokeWidth="1" strokeLinecap="round" />
        <path d="M-0.5,8 Q-3,7 -4,6" fill="none" stroke="#3a7232" strokeWidth="0.6" strokeLinecap="round" />
      </g>
    </>
  )

  return <FaceCardFrame suit={suit} label="queen">{halfContent}</FaceCardFrame>
}

function KingSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skin = '#eedcb8'
  const skinLight = '#f5e8d0'
  const skinShade = '#c8a878'
  const hairColor = isRed ? '#4a2810' : '#100810'
  const beardColor = isRed ? '#5a3018' : '#161016'
  const robePrimary = isRed ? '#b01830' : '#161630'
  const gold = '#c9a84c'
  const goldDark = '#8b6914'
  const goldBright = '#e0c470'
  const ink = isRed ? '#6a0e1e' : '#0a0a18'
  const jewel = isRed ? '#1e4488' : '#b82828'
  const ermine = '#f0eadc'

  const halfContent = (
    <>
      {/* === Imperial crown — larger, grander than Queen's === */}
      <path d="M25,22 L23,8 L29.5,15 L34,4 L40,13 L46,4 L50.5,15 L57,8 L55,22 Z" fill={gold} stroke={goldDark} strokeWidth="0.6" />
      {/* Crown body */}
      <rect x="25" y="20.5" width="30" height="4.5" rx="1.2" fill={gold} stroke={goldDark} strokeWidth="0.45" />
      {/* Ermine band */}
      <rect x="26" y="21.2" width="28" height="2.8" rx="0.8" fill={ermine} opacity="0.85" />
      {[30, 34, 38, 42, 46, 50].map((cx, i) => (
        <circle key={i} cx={cx} cy="22.6" r="0.5" fill="#111" />
      ))}
      {/* Crown jewels — richer arrangement */}
      <circle cx="34" cy="6" r="2" fill={jewel} stroke={goldDark} strokeWidth="0.35" />
      <circle cx="46" cy="6" r="2" fill={jewel} stroke={goldDark} strokeWidth="0.35" />
      <circle cx="40" cy="11.5" r="1.4" fill={goldBright} opacity="0.55" stroke={goldDark} strokeWidth="0.3" />
      <circle cx="29.5" cy="13.5" r="1.2" fill={jewel} opacity="0.65" stroke={goldDark} strokeWidth="0.25" />
      <circle cx="50.5" cy="13.5" r="1.2" fill={jewel} opacity="0.65" stroke={goldDark} strokeWidth="0.25" />
      {/* Jewel highlights */}
      <circle cx="33.5" cy="5.5" r="0.5" fill="#fff" opacity="0.45" />
      <circle cx="45.5" cy="5.5" r="0.5" fill="#fff" opacity="0.45" />
      {/* Cross pattée finial */}
      <path d="M40,-0.5 L38.8,2 L40,1.8 L41.2,2 Z" fill={goldDark} />
      <line x1="40" y1="-0.5" x2="40" y2="4" stroke={goldDark} strokeWidth="1.3" />
      <line x1="38" y1="1.5" x2="42" y2="1.5" stroke={goldDark} strokeWidth="1" />

      {/* === Hair — shorter, distinguished === */}
      <path d="M27,24.5 Q23.5,30 25,38" fill="none" stroke={hairColor} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M53,24.5 Q56.5,30 55,38" fill="none" stroke={hairColor} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M26,27 Q24,32 25,36" fill="none" stroke={hairColor} strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
      <path d="M54,27 Q56,32 55,36" fill="none" stroke={hairColor} strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />

      {/* === Face — broader, authoritative === */}
      <ellipse cx="40" cy="36" rx="11.5" ry="12.5" fill={skin} stroke={ink} strokeWidth="0.6" />
      {/* Face modeling */}
      <ellipse cx="34.5" cy="38" rx="2.5" ry="1.5" fill="#e0b090" opacity="0.14" />
      <ellipse cx="45.5" cy="38" rx="2.5" ry="1.5" fill="#e0b090" opacity="0.14" />

      {/* Eyes — commanding, stern */}
      <ellipse cx="36" cy="33" rx="1.9" ry="1.3" fill="#f8f6f0" stroke={ink} strokeWidth="0.3" />
      <ellipse cx="44" cy="33" rx="1.9" ry="1.3" fill="#f8f6f0" stroke={ink} strokeWidth="0.3" />
      <circle cx="36.2" cy="33.2" r="1" fill={c.primary} />
      <circle cx="44.2" cy="33.2" r="1" fill={c.primary} />
      <circle cx="35.8" cy="32.7" r="0.3" fill="#fff" />
      <circle cx="43.8" cy="32.7" r="0.3" fill="#fff" />
      {/* Heavy brows — regal authority */}
      <path d="M33,30.2 Q36,28.8 39,29.8" fill="none" stroke={ink} strokeWidth="0.9" strokeLinecap="round" />
      <path d="M41,29.8 Q44,28.8 47,30.2" fill="none" stroke={ink} strokeWidth="0.9" strokeLinecap="round" />

      {/* Nose — strong, distinguished */}
      <path d="M40,34.5 L38.8,38 Q40,39 41.2,38.3" fill="none" stroke={skinShade} strokeWidth="0.5" strokeLinecap="round" />

      {/* Mustache — full, turned */}
      <path d="M35.5,40.5 Q37.5,42 40,40.8 Q42.5,42 44.5,40.5" fill={beardColor} opacity="0.75" stroke={beardColor} strokeWidth="0.3" />
      {/* Full beard — layered strokes for texture */}
      <path d="M31,41 Q29,47 33,52 Q37,56 40,57 Q43,56 47,52 Q51,47 49,41" fill={beardColor} opacity="0.25" />
      <path d="M32,42 Q30,47.5 34,52 Q37.5,55 40,56 Q42.5,55 46,52 Q50,47.5 48,42" fill="none" stroke={beardColor} strokeWidth="0.55" opacity="0.45" />
      <path d="M34,45 Q37,49 40,50 Q43,49 46,45" fill="none" stroke={beardColor} strokeWidth="0.35" opacity="0.35" />
      <path d="M35,48 Q38,51.5 40,52 Q42,51.5 45,48" fill="none" stroke={beardColor} strokeWidth="0.3" opacity="0.28" />
      {/* Mouth */}
      <line x1="38.2" y1="43" x2="41.8" y2="43" stroke="#8a4848" strokeWidth="0.6" strokeLinecap="round" />

      {/* === Ermine collar — rich and detailed === */}
      <rect x="22" y="53" width="36" height="4.5" rx="1.8" fill={ermine} stroke={goldDark} strokeWidth="0.35" />
      {[26, 30.5, 35, 39.5, 44, 48.5, 53].map((cx, i) => (
        <circle key={i} cx={cx} cy="55.2" r="0.5" fill="#111" />
      ))}
      {/* Gold chain over collar */}
      <path d="M32,53 Q36,55.5 40,55.5 Q44,55.5 48,53" fill="none" stroke={gold} strokeWidth="0.7" />

      {/* === Robe === */}
      <path d="M20,57 L16,60 L64,60 L60,57 Z" fill={robePrimary} stroke={ink} strokeWidth="0.35" />

      {/* === Scepter (traditional King prop) === */}
      <line x1="15" y1="30" x2="13.5" y2="57" stroke={goldDark} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="15" y1="30" x2="13.5" y2="57" stroke={gold} strokeWidth="0.6" opacity="0.3" strokeLinecap="round" />
      {/* Scepter orb */}
      <circle cx="15" cy="28" r="3.5" fill={gold} stroke={goldDark} strokeWidth="0.5" />
      <circle cx="15" cy="28" r="1.5" fill={jewel} />
      <circle cx="14.5" cy="27.4" r="0.45" fill="#fff" opacity="0.4" />
      {/* Scepter cross */}
      <line x1="12.8" y1="25.5" x2="17.2" y2="25.5" stroke={goldDark} strokeWidth="0.85" />
      <line x1="15" y1="23.5" x2="15" y2="27.5" stroke={goldDark} strokeWidth="0.85" />
      {/* Scepter gold ring */}
      <circle cx="13.8" cy="38" r="1" fill="none" stroke={gold} strokeWidth="0.4" />
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
