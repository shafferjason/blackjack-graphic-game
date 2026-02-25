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
   Premium Face Card SVGs — Heraldic Woodcut Style
   Consistent line-art approach across J, Q, K with
   suit-themed coloring. Classic half-mirrored layout.
   ───────────────────────────────────────────────────────── */

function JackSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skinTone = '#f0d0a0'
  const skinHighlight = '#f8e0c0'
  const skinShade = '#d4a878'
  const hairColor = isRed ? '#8b5e3c' : '#1e1428'
  const hatPrimary = isRed ? '#c41e3a' : '#1a1a2e'
  const hatSecondary = isRed ? '#e04858' : '#2e2e4e'
  const tunicPrimary = isRed ? '#c41e3a' : '#1a1a2e'
  const tunicSecondary = isRed ? '#d84060' : '#2e2e50'
  const gold = '#d4a844'
  const goldDark = '#a07828'
  const goldLight = '#e8c878'
  const outlineColor = isRed ? '#7a1020' : '#0e0e1e'

  const halfContent = (
    <>
      {/* Hat — Beret with feather plume */}
      <ellipse cx="40" cy="19" rx="15" ry="7.5" fill={hatPrimary} stroke={outlineColor} strokeWidth="0.6" />
      <path d="M26,19 Q25,11 30,7 Q36,3 40,9 Q44,3 50,7 Q55,11 54,19" fill={hatPrimary} stroke={outlineColor} strokeWidth="0.6" />
      <path d="M28,18.5 Q27,12 31,8.5 Q36,5 40,10 Q44,5 49,8.5 Q53,12 52,18.5" fill={hatSecondary} opacity="0.5" />
      {/* Hat band */}
      <rect x="27" y="17.5" width="26" height="3.5" rx="1.5" fill={gold} stroke={goldDark} strokeWidth="0.4" />
      <circle cx="40" cy="19.2" r="1.2" fill={goldLight} stroke={goldDark} strokeWidth="0.3" />
      {/* Feather plume */}
      <path d="M34,16 Q30,4 25,1" fill="none" stroke={gold} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M34,15 Q31,6 27,3" fill="none" stroke={goldLight} strokeWidth="0.7" opacity="0.7" strokeLinecap="round" />
      <path d="M34,14 Q32,8 29,6" fill="none" stroke={gold} strokeWidth="0.4" opacity="0.5" strokeLinecap="round" />

      {/* Hair flowing from under hat */}
      <path d="M26,21 Q22,28 24,37" fill="none" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M54,21 Q58,28 56,37" fill="none" stroke={hairColor} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M25,28 Q21,34 23,38" fill="none" stroke={hairColor} strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />
      <path d="M55,28 Q59,34 57,38" fill="none" stroke={hairColor} strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />

      {/* Face — oval */}
      <ellipse cx="40" cy="33" rx="11.5" ry="12.5" fill={skinTone} stroke={outlineColor} strokeWidth="0.7" />
      {/* Cheek highlights */}
      <ellipse cx="33" cy="36" rx="3" ry="2" fill={skinHighlight} opacity="0.3" />
      <ellipse cx="47" cy="36" rx="3" ry="2" fill={skinHighlight} opacity="0.3" />

      {/* Eyes */}
      <ellipse cx="36" cy="30.5" rx="2.2" ry="1.5" fill="#fff" stroke={outlineColor} strokeWidth="0.3" />
      <ellipse cx="44" cy="30.5" rx="2.2" ry="1.5" fill="#fff" stroke={outlineColor} strokeWidth="0.3" />
      <circle cx="36.4" cy="30.8" r="1.2" fill={c.primary} />
      <circle cx="44.4" cy="30.8" r="1.2" fill={c.primary} />
      <circle cx="36.8" cy="30.3" r="0.4" fill="#fff" />
      <circle cx="44.8" cy="30.3" r="0.4" fill="#fff" />
      {/* Eyebrows */}
      <path d="M33,28 Q36,26.5 38.5,27.5" fill="none" stroke={outlineColor} strokeWidth="0.7" strokeLinecap="round" />
      <path d="M41.5,27.5 Q44,26.5 47,28" fill="none" stroke={outlineColor} strokeWidth="0.7" strokeLinecap="round" />

      {/* Nose */}
      <path d="M40,32 L39,36.5 Q40,37.2 41,36.8" fill="none" stroke={skinShade} strokeWidth="0.6" strokeLinecap="round" />
      {/* Mouth */}
      <path d="M37.5,39.5 Q40,41 42.5,39.5" fill="#c06060" stroke="#9a4a4a" strokeWidth="0.4" />

      {/* Collar — ornate pointed */}
      <path d="M28,44 L33,49 L40,45 L47,49 L52,44" fill={gold} stroke={goldDark} strokeWidth="0.6" />
      <path d="M30,45 L40,51 L50,45" fill={tunicPrimary} opacity="0.25" />
      {/* Collar gems */}
      <circle cx="40" cy="46" r="1.2" fill={c.secondary} stroke={goldDark} strokeWidth="0.3" />

      {/* Tunic */}
      <path d="M24,49 L20,60 L60,60 L56,49 Q40,57 24,49 Z" fill={tunicPrimary} stroke={outlineColor} strokeWidth="0.5" />
      <path d="M35,51 L40,59 L45,51" fill={tunicSecondary} opacity="0.35" />
      <line x1="40" y1="49" x2="40" y2="60" stroke={gold} strokeWidth="1" opacity="0.5" />
      {/* Tunic buttons */}
      <circle cx="40" cy="53" r="0.7" fill={gold} />
      <circle cx="40" cy="56" r="0.7" fill={gold} />

      {/* Held item — leaf/feather */}
      <path d="M58,36 Q64,30 67,22 Q63,28 57,34" fill={isRed ? '#4a8c3f' : '#3a6a3a'} stroke={isRed ? '#2d5a27' : '#1a3a1a'} strokeWidth="0.5" />
      <line x1="57.5" y1="37" x2="66" y2="24" stroke={isRed ? '#2d5a27' : '#1a3a1a'} strokeWidth="0.6" />
    </>
  )

  return (
    <svg viewBox="0 0 80 120" className="face-svg">
      <defs>
        <clipPath id={`jack-top-${suit}`}><rect x="0" y="0" width="80" height="60" /></clipPath>
        <clipPath id={`jack-bot-${suit}`}><rect x="0" y="60" width="80" height="60" /></clipPath>
      </defs>
      {/* Decorative inner border */}
      <rect x="2" y="2" width="76" height="116" rx="4" fill="none" stroke={c.primary} strokeWidth="0.4" opacity="0.15" />
      <rect x="3.5" y="3.5" width="73" height="113" rx="3" fill="none" stroke={gold} strokeWidth="0.2" opacity="0.12" />
      {/* Top Half */}
      <g clipPath={`url(#jack-top-${suit})`}>{halfContent}</g>
      {/* Center divider */}
      <line x1="5" y1="60" x2="75" y2="60" stroke={c.primary} strokeWidth="0.3" opacity="0.25" />
      <text x="10" y="57" fontSize="7" fill={c.primary} fontFamily="serif" opacity="0.7">{SUIT_SYMBOLS[suit]}</text>
      <text x="70" y="65" fontSize="7" fill={c.primary} fontFamily="serif" textAnchor="middle" transform="rotate(180,70,63)" opacity="0.7">{SUIT_SYMBOLS[suit]}</text>
      {/* Bottom Half (mirrored) */}
      <g clipPath={`url(#jack-bot-${suit})`} transform="rotate(180,40,90)">{halfContent}</g>
    </svg>
  )
}

function QueenSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skinTone = '#f0d0a0'
  const skinHighlight = '#f8e0c0'
  const skinShade = '#d4a878'
  const hairColor = isRed ? '#7a3a18' : '#120810'
  const dressPrimary = isRed ? '#c41e3a' : '#1a1a2e'
  const dressSecondary = isRed ? '#d84060' : '#2e2e50'
  const gold = '#d4a844'
  const goldDark = '#a07828'
  const goldLight = '#e8c878'
  const outlineColor = isRed ? '#7a1020' : '#0e0e1e'
  const crownJewel = isRed ? '#2255aa' : '#cc3333'

  const halfContent = (
    <>
      {/* Grand crown with arches */}
      <path d="M27,20 L25,9 L30,15 L33,5 L36.5,13 L40,2.5 L43.5,13 L47,5 L50,15 L55,9 L53,20 Z" fill={gold} stroke={goldDark} strokeWidth="0.7" />
      <rect x="27" y="18.5" width="26" height="4" rx="1" fill={gold} stroke={goldDark} strokeWidth="0.4" />
      {/* Ermine band */}
      <rect x="28" y="19" width="24" height="2.5" rx="0.8" fill="#f5f0e0" opacity="0.8" />
      <circle cx="32" cy="20.2" r="0.5" fill="#222" />
      <circle cx="36" cy="20.2" r="0.5" fill="#222" />
      <circle cx="40" cy="20.2" r="0.5" fill="#222" />
      <circle cx="44" cy="20.2" r="0.5" fill="#222" />
      <circle cx="48" cy="20.2" r="0.5" fill="#222" />

      {/* Crown jewels */}
      <circle cx="33" cy="7" r="2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
      <circle cx="40" cy="5" r="2.3" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
      <circle cx="47" cy="7" r="2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
      {/* Jewel highlights */}
      <circle cx="32.5" cy="6.5" r="0.6" fill="#fff" opacity="0.5" />
      <circle cx="39.5" cy="4.5" r="0.7" fill="#fff" opacity="0.5" />
      <circle cx="46.5" cy="6.5" r="0.6" fill="#fff" opacity="0.5" />
      {/* Cross */}
      <line x1="40" y1="0" x2="40" y2="4" stroke={goldDark} strokeWidth="1.2" />
      <line x1="38.2" y1="1.8" x2="41.8" y2="1.8" stroke={goldDark} strokeWidth="0.9" />

      {/* Hair — elegant waves */}
      <path d="M27,22 Q23,30 24,40 Q23,44 21,48" fill="none" stroke={hairColor} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M53,22 Q57,30 56,40 Q57,44 59,48" fill="none" stroke={hairColor} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M25,25 Q21,33 23,42" fill="none" stroke={hairColor} strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
      <path d="M55,25 Q59,33 57,42" fill="none" stroke={hairColor} strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
      {/* Wispy strands */}
      <path d="M29,22 Q27,26 28,30" fill="none" stroke={hairColor} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <path d="M51,22 Q53,26 52,30" fill="none" stroke={hairColor} strokeWidth="1" opacity="0.4" strokeLinecap="round" />

      {/* Face */}
      <ellipse cx="40" cy="34" rx="11" ry="12.5" fill={skinTone} stroke={outlineColor} strokeWidth="0.7" />
      <ellipse cx="34" cy="37" rx="3" ry="2" fill={skinHighlight} opacity="0.25" />
      <ellipse cx="46" cy="37" rx="3" ry="2" fill={skinHighlight} opacity="0.25" />

      {/* Eyes with lashes */}
      <ellipse cx="36" cy="31.5" rx="2.3" ry="1.6" fill="#fff" stroke={outlineColor} strokeWidth="0.3" />
      <ellipse cx="44" cy="31.5" rx="2.3" ry="1.6" fill="#fff" stroke={outlineColor} strokeWidth="0.3" />
      <circle cx="36.3" cy="31.8" r="1.3" fill={c.primary} />
      <circle cx="44.3" cy="31.8" r="1.3" fill={c.primary} />
      <circle cx="36.7" cy="31.2" r="0.4" fill="#fff" />
      <circle cx="44.7" cy="31.2" r="0.4" fill="#fff" />
      {/* Lashes */}
      <path d="M33.4,29.5 Q36,28.8 38.8,29.8" fill="none" stroke={outlineColor} strokeWidth="0.6" />
      <path d="M41.2,29.8 Q44,28.8 46.6,29.5" fill="none" stroke={outlineColor} strokeWidth="0.6" />
      {/* Eyebrows — delicate arches */}
      <path d="M33,28 Q36,26.8 38.5,27.8" fill="none" stroke={hairColor} strokeWidth="0.5" strokeLinecap="round" />
      <path d="M41.5,27.8 Q44,26.8 47,28" fill="none" stroke={hairColor} strokeWidth="0.5" strokeLinecap="round" />

      {/* Nose */}
      <path d="M40,33 L39,37 Q40,37.8 41,37.2" fill="none" stroke={skinShade} strokeWidth="0.5" strokeLinecap="round" />
      {/* Lips — fuller, regal */}
      <path d="M37,40 Q38.5,39.2 40,40.5 Q41.5,39.2 43,40 Q41,42 40,42 Q39,42 37,40 Z" fill="#c06060" stroke="#9a4040" strokeWidth="0.3" />

      {/* Necklace */}
      <path d="M29,45 Q35,48.5 40,49.5 Q45,48.5 51,45" fill="none" stroke={gold} strokeWidth="1.2" />
      <circle cx="40" cy="49.5" r="2.2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
      <circle cx="40" cy="49.5" r="0.7" fill="#fff" opacity="0.4" />
      <circle cx="35" cy="47.5" r="1" fill={gold} stroke={goldDark} strokeWidth="0.2" />
      <circle cx="45" cy="47.5" r="1" fill={gold} stroke={goldDark} strokeWidth="0.2" />

      {/* Dress bodice */}
      <path d="M22,48 L18,60 L62,60 L58,48 Q40,57 22,48 Z" fill={dressPrimary} stroke={outlineColor} strokeWidth="0.5" />
      {/* Sweetheart neckline */}
      <path d="M27,47 Q34,53 40,49 Q46,53 53,47" fill={dressSecondary} opacity="0.3" stroke={gold} strokeWidth="0.5" />
      <line x1="40" y1="49" x2="40" y2="60" stroke={gold} strokeWidth="0.8" opacity="0.5" />

      {/* Rose */}
      <circle cx="62" cy="40" r="3.5" fill={isRed ? '#e84848' : '#d44444'} opacity="0.85" />
      <circle cx="62" cy="40" r="2" fill={isRed ? '#ff6868' : '#e66666'} opacity="0.6" />
      <circle cx="62" cy="40" r="0.8" fill={isRed ? '#ffa0a0' : '#f09090'} opacity="0.5" />
      <path d="M62,43.5 L61,53" stroke="#2d5a27" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M61.5,47 Q58,46 57,45" fill="none" stroke="#3a7a3a" strokeWidth="0.7" strokeLinecap="round" />
    </>
  )

  return (
    <svg viewBox="0 0 80 120" className="face-svg">
      <defs>
        <clipPath id={`queen-top-${suit}`}><rect x="0" y="0" width="80" height="60" /></clipPath>
        <clipPath id={`queen-bot-${suit}`}><rect x="0" y="60" width="80" height="60" /></clipPath>
      </defs>
      <rect x="2" y="2" width="76" height="116" rx="4" fill="none" stroke={c.primary} strokeWidth="0.4" opacity="0.15" />
      <rect x="3.5" y="3.5" width="73" height="113" rx="3" fill="none" stroke={gold} strokeWidth="0.2" opacity="0.12" />
      <g clipPath={`url(#queen-top-${suit})`}>{halfContent}</g>
      <line x1="5" y1="60" x2="75" y2="60" stroke={c.primary} strokeWidth="0.3" opacity="0.25" />
      <text x="10" y="57" fontSize="7" fill={c.primary} fontFamily="serif" opacity="0.7">{SUIT_SYMBOLS[suit]}</text>
      <text x="70" y="65" fontSize="7" fill={c.primary} fontFamily="serif" textAnchor="middle" transform="rotate(180,70,63)" opacity="0.7">{SUIT_SYMBOLS[suit]}</text>
      <g clipPath={`url(#queen-bot-${suit})`} transform="rotate(180,40,90)">{halfContent}</g>
    </svg>
  )
}

function KingSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skinTone = '#f0d0a0'
  const skinHighlight = '#f8e0c0'
  const skinShade = '#d4a878'
  const hairColor = isRed ? '#5c3018' : '#120810'
  const beardColor = isRed ? '#6b3a20' : '#1a1018'
  const robePrimary = isRed ? '#c41e3a' : '#1a1a2e'
  const gold = '#d4a844'
  const goldDark = '#a07828'
  const goldLight = '#e8c878'
  const outlineColor = isRed ? '#7a1020' : '#0e0e1e'
  const crownJewel = isRed ? '#2255aa' : '#cc3333'
  const ermineBg = '#f5f0e0'

  const halfContent = (
    <>
      {/* Grand imperial crown */}
      <path d="M24,22 L22,7 L29,15 L34,3 L40,13 L46,3 L51,15 L58,7 L56,22 Z" fill={gold} stroke={goldDark} strokeWidth="0.7" />
      <rect x="24" y="20.5" width="32" height="5" rx="1.5" fill={gold} stroke={goldDark} strokeWidth="0.5" />
      {/* Ermine band */}
      <rect x="25" y="21.5" width="30" height="3" rx="1" fill={ermineBg} opacity="0.8" />
      <circle cx="29" cy="23" r="0.6" fill="#111" />
      <circle cx="33.5" cy="23" r="0.6" fill="#111" />
      <circle cx="38" cy="23" r="0.6" fill="#111" />
      <circle cx="42.5" cy="23" r="0.6" fill="#111" />
      <circle cx="47" cy="23" r="0.6" fill="#111" />
      <circle cx="51" cy="23" r="0.6" fill="#111" />

      {/* Crown jewels */}
      <circle cx="34" cy="5" r="2.2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
      <circle cx="40" cy="11" r="1.6" fill={goldLight} opacity="0.6" stroke={goldDark} strokeWidth="0.3" />
      <circle cx="46" cy="5" r="2.2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
      <circle cx="29" cy="13" r="1.4" fill={crownJewel} opacity="0.7" stroke={goldDark} strokeWidth="0.3" />
      <circle cx="51" cy="13" r="1.4" fill={crownJewel} opacity="0.7" stroke={goldDark} strokeWidth="0.3" />
      {/* Jewel highlights */}
      <circle cx="33.5" cy="4.5" r="0.6" fill="#fff" opacity="0.5" />
      <circle cx="45.5" cy="4.5" r="0.6" fill="#fff" opacity="0.5" />
      {/* Cross pattée */}
      <path d="M40,-1 L38.5,2.5 L40,2 L41.5,2.5 Z" fill={goldDark} />
      <line x1="40" y1="-1" x2="40" y2="4.5" stroke={goldDark} strokeWidth="1.5" />
      <line x1="37.5" y1="1.5" x2="42.5" y2="1.5" stroke={goldDark} strokeWidth="1.2" />

      {/* Hair */}
      <path d="M26,25 Q22,31 24,40" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M54,25 Q58,31 56,40" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />

      {/* Face */}
      <ellipse cx="40" cy="36" rx="12" ry="13" fill={skinTone} stroke={outlineColor} strokeWidth="0.7" />
      <ellipse cx="34" cy="38" rx="3" ry="2" fill={skinHighlight} opacity="0.2" />
      <ellipse cx="46" cy="38" rx="3" ry="2" fill={skinHighlight} opacity="0.2" />

      {/* Eyes — stern, regal */}
      <ellipse cx="36" cy="33" rx="2" ry="1.4" fill="#fff" stroke={outlineColor} strokeWidth="0.3" />
      <ellipse cx="44" cy="33" rx="2" ry="1.4" fill="#fff" stroke={outlineColor} strokeWidth="0.3" />
      <circle cx="36.3" cy="33.2" r="1.1" fill={c.primary} />
      <circle cx="44.3" cy="33.2" r="1.1" fill={c.primary} />
      <circle cx="36.7" cy="32.8" r="0.35" fill="#fff" />
      <circle cx="44.7" cy="32.8" r="0.35" fill="#fff" />
      {/* Heavy eyebrows */}
      <path d="M33,30 Q36,28.5 39,29.5" fill="none" stroke={outlineColor} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M41,29.5 Q44,28.5 47,30" fill="none" stroke={outlineColor} strokeWidth="1.1" strokeLinecap="round" />

      {/* Nose */}
      <path d="M40,34.5 L38.8,38 Q40,39 41.2,38.3" fill="none" stroke={skinShade} strokeWidth="0.6" strokeLinecap="round" />

      {/* Mustache */}
      <path d="M35,40.5 Q37.5,42 40,40.8 Q42.5,42 45,40.5" fill={beardColor} opacity="0.8" stroke={beardColor} strokeWidth="0.3" />
      {/* Full beard */}
      <path d="M30,41 Q28,48 32,53 Q36,57 40,58 Q44,57 48,53 Q52,48 50,41" fill={beardColor} opacity="0.3" />
      <path d="M31,42 Q29,48 33,53 Q37,56 40,57 Q43,56 47,53 Q51,48 49,42" fill="none" stroke={beardColor} strokeWidth="0.6" opacity="0.55" />
      <path d="M33,45 Q36,49 40,50 Q44,49 47,45" fill="none" stroke={beardColor} strokeWidth="0.4" opacity="0.45" />
      <path d="M34,48 Q37,52 40,53 Q43,52 46,48" fill="none" stroke={beardColor} strokeWidth="0.4" opacity="0.35" />
      {/* Mouth line */}
      <line x1="38" y1="43" x2="42" y2="43" stroke="#9a5050" strokeWidth="0.7" strokeLinecap="round" />

      {/* Ermine collar */}
      <rect x="21" y="53" width="38" height="5" rx="2" fill={ermineBg} stroke={goldDark} strokeWidth="0.4" />
      <circle cx="25" cy="55.5" r="0.6" fill="#111" />
      <circle cx="30" cy="55.5" r="0.6" fill="#111" />
      <circle cx="35" cy="55.5" r="0.6" fill="#111" />
      <circle cx="40" cy="55.5" r="0.6" fill="#111" />
      <circle cx="45" cy="55.5" r="0.6" fill="#111" />
      <circle cx="50" cy="55.5" r="0.6" fill="#111" />
      <circle cx="55" cy="55.5" r="0.6" fill="#111" />

      {/* Robe */}
      <path d="M19,57 L15,60 L65,60 L61,57 Z" fill={robePrimary} stroke={outlineColor} strokeWidth="0.4" />
      {/* Gold chain */}
      <path d="M31,53 Q36,56 40,56 Q44,56 49,53" fill="none" stroke={gold} strokeWidth="0.8" />

      {/* Scepter */}
      <line x1="15" y1="30" x2="13" y2="58" stroke={goldDark} strokeWidth="2" strokeLinecap="round" />
      <circle cx="15" cy="28" r="3.8" fill={gold} stroke={goldDark} strokeWidth="0.6" />
      <circle cx="15" cy="28" r="1.6" fill={crownJewel} />
      <circle cx="14.5" cy="27.5" r="0.5" fill="#fff" opacity="0.4" />
      <line x1="12.5" y1="25.5" x2="17.5" y2="25.5" stroke={goldDark} strokeWidth="1" />
      <line x1="15" y1="23" x2="15" y2="28" stroke={goldDark} strokeWidth="1" />
    </>
  )

  return (
    <svg viewBox="0 0 80 120" className="face-svg">
      <defs>
        <clipPath id={`king-top-${suit}`}><rect x="0" y="0" width="80" height="60" /></clipPath>
        <clipPath id={`king-bot-${suit}`}><rect x="0" y="60" width="80" height="60" /></clipPath>
      </defs>
      <rect x="2" y="2" width="76" height="116" rx="4" fill="none" stroke={c.primary} strokeWidth="0.4" opacity="0.15" />
      <rect x="3.5" y="3.5" width="73" height="113" rx="3" fill="none" stroke={gold} strokeWidth="0.2" opacity="0.12" />
      <g clipPath={`url(#king-top-${suit})`}>{halfContent}</g>
      <line x1="5" y1="60" x2="75" y2="60" stroke={c.primary} strokeWidth="0.3" opacity="0.25" />
      <text x="10" y="57" fontSize="7" fill={c.primary} fontFamily="serif" opacity="0.7">{SUIT_SYMBOLS[suit]}</text>
      <text x="70" y="65" fontSize="7" fill={c.primary} fontFamily="serif" textAnchor="middle" transform="rotate(180,70,63)" opacity="0.7">{SUIT_SYMBOLS[suit]}</text>
      <g clipPath={`url(#king-bot-${suit})`} transform="rotate(180,40,90)">{halfContent}</g>
    </svg>
  )
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
