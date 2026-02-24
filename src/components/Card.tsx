import { useEffect, useRef, useState } from 'react'
import './Card.css'
import type { Card as CardType, Suit } from '../types'

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
  hearts: { primary: '#c41e3a', secondary: '#e8485e', tertiary: '#f9dce1' },
  diamonds: { primary: '#c41e3a', secondary: '#e8485e', tertiary: '#f9dce1' },
  clubs: { primary: '#1a1a2e', secondary: '#3a3a5e', tertiary: '#d8d8e8' },
  spades: { primary: '#1a1a2e', secondary: '#3a3a5e', tertiary: '#d8d8e8' },
}

function JackSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skinTone = '#f5d0a9'
  const skinShade = '#e8b88a'
  const hairColor = isRed ? '#8b5e3c' : '#2a1a0a'
  const hatColor = isRed ? '#c41e3a' : '#1a1a2e'
  const hatAccent = isRed ? '#e8485e' : '#3a3a5e'
  const tunicColor = isRed ? '#c41e3a' : '#1a1a2e'
  const tunicLight = isRed ? '#e8485e' : '#3a3a5e'
  const goldTrim = '#d4a844'
  const goldDark = '#a07828'
  return (
    <svg viewBox="0 0 80 120" className="face-svg">
      <defs>
        <clipPath id={`jack-top-${suit}`}><rect x="0" y="0" width="80" height="60" /></clipPath>
        <clipPath id={`jack-bot-${suit}`}><rect x="0" y="60" width="80" height="60" /></clipPath>
      </defs>
      {/* Decorative border */}
      <rect x="2" y="2" width="76" height="116" rx="4" fill="none" stroke={c.primary} strokeWidth="0.5" opacity="0.2" />
      {/* === TOP HALF === */}
      <g clipPath={`url(#jack-top-${suit})`}>
        {/* Feathered beret/cap */}
        <ellipse cx="40" cy="18" rx="14" ry="7" fill={hatColor} />
        <path d="M28,18 Q26,12 30,8 Q36,5 40,10 Q44,5 50,8 Q54,12 52,18" fill={hatColor} stroke={hatAccent} strokeWidth="0.5" />
        <path d="M34,16 Q32,6 28,4 Q26,2 24,5" fill="none" stroke={goldTrim} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M32,14 Q30,6 27,5" fill="none" stroke={goldTrim} strokeWidth="0.7" opacity="0.6" strokeLinecap="round" />
        <ellipse cx="40" cy="19" rx="13" ry="3" fill={hatAccent} opacity="0.5" />
        <rect x="30" y="17" width="20" height="3" rx="1.5" fill={goldTrim} opacity="0.8" />
        {/* Hair curling out from under hat */}
        <path d="M27,20 Q24,26 26,34" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M53,20 Q56,26 54,34" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26,30 Q23,34 25,36" fill="none" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M54,30 Q57,34 55,36" fill="none" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" />
        {/* Face */}
        <ellipse cx="40" cy="32" rx="11" ry="12" fill={skinTone} stroke={skinShade} strokeWidth="0.8" />
        {/* Eyes */}
        <ellipse cx="36" cy="30" rx="2" ry="1.5" fill="#fff" />
        <ellipse cx="44" cy="30" rx="2" ry="1.5" fill="#fff" />
        <circle cx="36.5" cy="30.2" r="1.2" fill={c.primary} />
        <circle cx="44.5" cy="30.2" r="1.2" fill={c.primary} />
        <circle cx="37" cy="29.8" r="0.4" fill="#fff" />
        <circle cx="45" cy="29.8" r="0.4" fill="#fff" />
        {/* Eyebrows */}
        <path d="M33,27.5 Q36,26 38.5,27" fill="none" stroke={hairColor} strokeWidth="0.8" />
        <path d="M41.5,27 Q44,26 47,27.5" fill="none" stroke={hairColor} strokeWidth="0.8" />
        {/* Nose */}
        <path d="M40,31 L39,35 L40.5,35.5" fill="none" stroke={skinShade} strokeWidth="0.6" strokeLinecap="round" />
        {/* Mouth */}
        <path d="M37,38 Q40,40 43,38" fill="#c47070" stroke="#a05050" strokeWidth="0.4" />
        {/* Collar - ornate */}
        <path d="M29,43 L33,48 L40,44 L47,48 L51,43" fill={goldTrim} stroke={goldDark} strokeWidth="0.5" />
        <path d="M31,44 L40,50 L49,44" fill={tunicColor} opacity="0.3" />
        {/* Tunic top */}
        <path d="M25,48 L22,60 L58,60 L55,48 Q40,56 25,48 Z" fill={tunicColor} stroke={tunicColor} strokeWidth="0.5" />
        <path d="M35,50 L40,58 L45,50" fill={tunicLight} opacity="0.4" />
        {/* Gold trim on tunic */}
        <line x1="40" y1="48" x2="40" y2="60" stroke={goldTrim} strokeWidth="1" opacity="0.6" />
        {/* Leaf/feather held in hand */}
        <path d="M58,36 Q64,32 66,24 Q62,30 56,34" fill={isRed ? '#4a8c3f' : '#3a6a3a'} stroke={isRed ? '#2d5a27' : '#1a3a1a'} strokeWidth="0.4" />
        <line x1="57" y1="37" x2="65" y2="26" stroke={isRed ? '#2d5a27' : '#1a3a1a'} strokeWidth="0.5" />
      </g>
      {/* === CENTER DIVIDER === */}
      <line x1="6" y1="60" x2="74" y2="60" stroke={c.primary} strokeWidth="0.3" opacity="0.3" />
      {/* Suit symbols at center */}
      <text x="10" y="57" fontSize="8" fill={c.primary} fontFamily="serif">{SUIT_SYMBOLS[suit]}</text>
      <text x="70" y="65" fontSize="8" fill={c.primary} fontFamily="serif" textAnchor="middle" transform="rotate(180,70,63)">{SUIT_SYMBOLS[suit]}</text>
      {/* === BOTTOM HALF (mirrored) === */}
      <g clipPath={`url(#jack-bot-${suit})`} transform="rotate(180,40,90)">
        {/* Feathered beret/cap */}
        <ellipse cx="40" cy="18" rx="14" ry="7" fill={hatColor} />
        <path d="M28,18 Q26,12 30,8 Q36,5 40,10 Q44,5 50,8 Q54,12 52,18" fill={hatColor} stroke={hatAccent} strokeWidth="0.5" />
        <path d="M34,16 Q32,6 28,4 Q26,2 24,5" fill="none" stroke={goldTrim} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M32,14 Q30,6 27,5" fill="none" stroke={goldTrim} strokeWidth="0.7" opacity="0.6" strokeLinecap="round" />
        <ellipse cx="40" cy="19" rx="13" ry="3" fill={hatAccent} opacity="0.5" />
        <rect x="30" y="17" width="20" height="3" rx="1.5" fill={goldTrim} opacity="0.8" />
        {/* Hair */}
        <path d="M27,20 Q24,26 26,34" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M53,20 Q56,26 54,34" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26,30 Q23,34 25,36" fill="none" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M54,30 Q57,34 55,36" fill="none" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" />
        {/* Face */}
        <ellipse cx="40" cy="32" rx="11" ry="12" fill={skinTone} stroke={skinShade} strokeWidth="0.8" />
        <ellipse cx="36" cy="30" rx="2" ry="1.5" fill="#fff" />
        <ellipse cx="44" cy="30" rx="2" ry="1.5" fill="#fff" />
        <circle cx="36.5" cy="30.2" r="1.2" fill={c.primary} />
        <circle cx="44.5" cy="30.2" r="1.2" fill={c.primary} />
        <circle cx="37" cy="29.8" r="0.4" fill="#fff" />
        <circle cx="45" cy="29.8" r="0.4" fill="#fff" />
        <path d="M33,27.5 Q36,26 38.5,27" fill="none" stroke={hairColor} strokeWidth="0.8" />
        <path d="M41.5,27 Q44,26 47,27.5" fill="none" stroke={hairColor} strokeWidth="0.8" />
        <path d="M40,31 L39,35 L40.5,35.5" fill="none" stroke={skinShade} strokeWidth="0.6" strokeLinecap="round" />
        <path d="M37,38 Q40,40 43,38" fill="#c47070" stroke="#a05050" strokeWidth="0.4" />
        <path d="M29,43 L33,48 L40,44 L47,48 L51,43" fill={goldTrim} stroke={goldDark} strokeWidth="0.5" />
        <path d="M31,44 L40,50 L49,44" fill={tunicColor} opacity="0.3" />
        <path d="M25,48 L22,60 L58,60 L55,48 Q40,56 25,48 Z" fill={tunicColor} stroke={tunicColor} strokeWidth="0.5" />
        <path d="M35,50 L40,58 L45,50" fill={tunicLight} opacity="0.4" />
        <line x1="40" y1="48" x2="40" y2="60" stroke={goldTrim} strokeWidth="1" opacity="0.6" />
        <path d="M58,36 Q64,32 66,24 Q62,30 56,34" fill={isRed ? '#4a8c3f' : '#3a6a3a'} stroke={isRed ? '#2d5a27' : '#1a3a1a'} strokeWidth="0.4" />
        <line x1="57" y1="37" x2="65" y2="26" stroke={isRed ? '#2d5a27' : '#1a3a1a'} strokeWidth="0.5" />
      </g>
    </svg>
  )
}

function QueenSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skinTone = '#f5d0a9'
  const skinShade = '#e8b88a'
  const hairColor = isRed ? '#8b4513' : '#1a0a00'
  const dressColor = isRed ? '#c41e3a' : '#1a1a2e'
  const dressLight = isRed ? '#e8485e' : '#3a3a5e'
  const goldTrim = '#d4a844'
  const goldDark = '#a07828'
  const crownJewel = isRed ? '#2255aa' : '#cc3333'
  return (
    <svg viewBox="0 0 80 120" className="face-svg">
      <defs>
        <clipPath id={`queen-top-${suit}`}><rect x="0" y="0" width="80" height="60" /></clipPath>
        <clipPath id={`queen-bot-${suit}`}><rect x="0" y="60" width="80" height="60" /></clipPath>
      </defs>
      <rect x="2" y="2" width="76" height="116" rx="4" fill="none" stroke={c.primary} strokeWidth="0.5" opacity="0.2" />
      {/* === TOP HALF === */}
      <g clipPath={`url(#queen-top-${suit})`}>
        {/* Crown - ornate arched crown */}
        <path d="M28,20 L26,10 L31,16 L34,6 L37,14 L40,4 L43,14 L46,6 L49,16 L54,10 L52,20 Z" fill={goldTrim} stroke={goldDark} strokeWidth="0.8" />
        <rect x="28" y="18" width="24" height="4" rx="1" fill={goldTrim} stroke={goldDark} strokeWidth="0.5" />
        {/* Crown jewels */}
        <circle cx="34" cy="8" r="1.8" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="40" cy="6" r="2.2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="46" cy="8" r="1.8" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="31" cy="14" r="1.2" fill="#fff" opacity="0.7" />
        <circle cx="49" cy="14" r="1.2" fill="#fff" opacity="0.7" />
        {/* Cross atop crown */}
        <line x1="40" y1="1" x2="40" y2="6" stroke={goldDark} strokeWidth="1.2" />
        <line x1="38" y1="3" x2="42" y2="3" stroke={goldDark} strokeWidth="1" />
        {/* Hair - elegant waves */}
        <path d="M28,22 Q24,28 25,38 Q24,42 22,46" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M52,22 Q56,28 55,38 Q56,42 58,46" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M26,24 Q22,32 24,40" fill="none" stroke={hairColor} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
        <path d="M54,24 Q58,32 56,40" fill="none" stroke={hairColor} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
        {/* Face */}
        <ellipse cx="40" cy="33" rx="11" ry="12" fill={skinTone} stroke={skinShade} strokeWidth="0.8" />
        {/* Eyes - elegant with lashes */}
        <ellipse cx="36" cy="31" rx="2.2" ry="1.6" fill="#fff" />
        <ellipse cx="44" cy="31" rx="2.2" ry="1.6" fill="#fff" />
        <circle cx="36.3" cy="31.2" r="1.3" fill={c.primary} />
        <circle cx="44.3" cy="31.2" r="1.3" fill={c.primary} />
        <circle cx="36.7" cy="30.7" r="0.4" fill="#fff" />
        <circle cx="44.7" cy="30.7" r="0.4" fill="#fff" />
        {/* Upper lashes */}
        <path d="M33.5,29 Q36,28.5 38.5,29.5" fill="none" stroke={hairColor} strokeWidth="0.7" />
        <path d="M41.5,29.5 Q44,28.5 46.5,29" fill="none" stroke={hairColor} strokeWidth="0.7" />
        {/* Delicate eyebrows */}
        <path d="M33,27.5 Q36,26.5 38.5,27.5" fill="none" stroke={hairColor} strokeWidth="0.6" />
        <path d="M41.5,27.5 Q44,26.5 47,27.5" fill="none" stroke={hairColor} strokeWidth="0.6" />
        {/* Nose */}
        <path d="M40,32.5 L39.2,36 Q40,36.8 41,36.3" fill="none" stroke={skinShade} strokeWidth="0.5" strokeLinecap="round" />
        {/* Lips - fuller, regal */}
        <path d="M37,39 Q38.5,38 40,39.5 Q41.5,38 43,39 Q41,41 40,41 Q39,41 37,39 Z" fill="#c06060" stroke="#a04040" strokeWidth="0.3" />
        {/* Necklace */}
        <path d="M30,44 Q35,47 40,48 Q45,47 50,44" fill="none" stroke={goldTrim} strokeWidth="1" />
        <circle cx="40" cy="48" r="2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="35" cy="46.5" r="1" fill={goldTrim} />
        <circle cx="45" cy="46.5" r="1" fill={goldTrim} />
        {/* Dress bodice */}
        <path d="M24,46 L20,60 L60,60 L56,46 Q40,55 24,46 Z" fill={dressColor} stroke={dressColor} strokeWidth="0.5" />
        {/* Dress neckline - sweetheart */}
        <path d="M28,46 Q34,52 40,48 Q46,52 52,46" fill={dressLight} opacity="0.3" stroke={goldTrim} strokeWidth="0.5" />
        {/* Dress center decoration */}
        <line x1="40" y1="48" x2="40" y2="60" stroke={goldTrim} strokeWidth="0.8" opacity="0.6" />
        {/* Rose/flower held */}
        <circle cx="62" cy="42" r="3.5" fill={isRed ? '#e84848' : '#d44'} opacity="0.8" />
        <circle cx="62" cy="42" r="2" fill={isRed ? '#ff6868' : '#e66'} opacity="0.6" />
        <path d="M62,45 L61,54" stroke="#2d5a27" strokeWidth="1" strokeLinecap="round" />
        <path d="M61.5,48 Q58,47 57,46" fill="none" stroke="#3a7a3a" strokeWidth="0.6" strokeLinecap="round" />
      </g>
      {/* CENTER DIVIDER */}
      <line x1="6" y1="60" x2="74" y2="60" stroke={c.primary} strokeWidth="0.3" opacity="0.3" />
      <text x="10" y="57" fontSize="8" fill={c.primary} fontFamily="serif">{SUIT_SYMBOLS[suit]}</text>
      <text x="70" y="65" fontSize="8" fill={c.primary} fontFamily="serif" textAnchor="middle" transform="rotate(180,70,63)">{SUIT_SYMBOLS[suit]}</text>
      {/* === BOTTOM HALF (mirrored) === */}
      <g clipPath={`url(#queen-bot-${suit})`} transform="rotate(180,40,90)">
        <path d="M28,20 L26,10 L31,16 L34,6 L37,14 L40,4 L43,14 L46,6 L49,16 L54,10 L52,20 Z" fill={goldTrim} stroke={goldDark} strokeWidth="0.8" />
        <rect x="28" y="18" width="24" height="4" rx="1" fill={goldTrim} stroke={goldDark} strokeWidth="0.5" />
        <circle cx="34" cy="8" r="1.8" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="40" cy="6" r="2.2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="46" cy="8" r="1.8" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="31" cy="14" r="1.2" fill="#fff" opacity="0.7" />
        <circle cx="49" cy="14" r="1.2" fill="#fff" opacity="0.7" />
        <line x1="40" y1="1" x2="40" y2="6" stroke={goldDark} strokeWidth="1.2" />
        <line x1="38" y1="3" x2="42" y2="3" stroke={goldDark} strokeWidth="1" />
        <path d="M28,22 Q24,28 25,38 Q24,42 22,46" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M52,22 Q56,28 55,38 Q56,42 58,46" fill="none" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M26,24 Q22,32 24,40" fill="none" stroke={hairColor} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
        <path d="M54,24 Q58,32 56,40" fill="none" stroke={hairColor} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
        <ellipse cx="40" cy="33" rx="11" ry="12" fill={skinTone} stroke={skinShade} strokeWidth="0.8" />
        <ellipse cx="36" cy="31" rx="2.2" ry="1.6" fill="#fff" />
        <ellipse cx="44" cy="31" rx="2.2" ry="1.6" fill="#fff" />
        <circle cx="36.3" cy="31.2" r="1.3" fill={c.primary} />
        <circle cx="44.3" cy="31.2" r="1.3" fill={c.primary} />
        <circle cx="36.7" cy="30.7" r="0.4" fill="#fff" />
        <circle cx="44.7" cy="30.7" r="0.4" fill="#fff" />
        <path d="M33.5,29 Q36,28.5 38.5,29.5" fill="none" stroke={hairColor} strokeWidth="0.7" />
        <path d="M41.5,29.5 Q44,28.5 46.5,29" fill="none" stroke={hairColor} strokeWidth="0.7" />
        <path d="M33,27.5 Q36,26.5 38.5,27.5" fill="none" stroke={hairColor} strokeWidth="0.6" />
        <path d="M41.5,27.5 Q44,26.5 47,27.5" fill="none" stroke={hairColor} strokeWidth="0.6" />
        <path d="M40,32.5 L39.2,36 Q40,36.8 41,36.3" fill="none" stroke={skinShade} strokeWidth="0.5" strokeLinecap="round" />
        <path d="M37,39 Q38.5,38 40,39.5 Q41.5,38 43,39 Q41,41 40,41 Q39,41 37,39 Z" fill="#c06060" stroke="#a04040" strokeWidth="0.3" />
        <path d="M30,44 Q35,47 40,48 Q45,47 50,44" fill="none" stroke={goldTrim} strokeWidth="1" />
        <circle cx="40" cy="48" r="2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="35" cy="46.5" r="1" fill={goldTrim} />
        <circle cx="45" cy="46.5" r="1" fill={goldTrim} />
        <path d="M24,46 L20,60 L60,60 L56,46 Q40,55 24,46 Z" fill={dressColor} stroke={dressColor} strokeWidth="0.5" />
        <path d="M28,46 Q34,52 40,48 Q46,52 52,46" fill={dressLight} opacity="0.3" stroke={goldTrim} strokeWidth="0.5" />
        <line x1="40" y1="48" x2="40" y2="60" stroke={goldTrim} strokeWidth="0.8" opacity="0.6" />
        <circle cx="62" cy="42" r="3.5" fill={isRed ? '#e84848' : '#d44'} opacity="0.8" />
        <circle cx="62" cy="42" r="2" fill={isRed ? '#ff6868' : '#e66'} opacity="0.6" />
        <path d="M62,45 L61,54" stroke="#2d5a27" strokeWidth="1" strokeLinecap="round" />
        <path d="M61.5,48 Q58,47 57,46" fill="none" stroke="#3a7a3a" strokeWidth="0.6" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function KingSVG({ suit }: { suit: Suit }) {
  const c = SUIT_ACCENTS[suit]
  const isRed = suit === 'hearts' || suit === 'diamonds'
  const skinTone = '#f5d0a9'
  const skinShade = '#e8b88a'
  const hairColor = isRed ? '#6b3a1a' : '#1a0a00'
  const beardColor = isRed ? '#7b4a2a' : '#2a1a0a'
  const robeColor = isRed ? '#c41e3a' : '#1a1a2e'
  const goldTrim = '#d4a844'
  const goldDark = '#a07828'
  const crownJewel = isRed ? '#2255aa' : '#cc3333'
  const ermineBg = '#f0ead6'
  return (
    <svg viewBox="0 0 80 120" className="face-svg">
      <defs>
        <clipPath id={`king-top-${suit}`}><rect x="0" y="0" width="80" height="60" /></clipPath>
        <clipPath id={`king-bot-${suit}`}><rect x="0" y="60" width="80" height="60" /></clipPath>
      </defs>
      <rect x="2" y="2" width="76" height="116" rx="4" fill="none" stroke={c.primary} strokeWidth="0.5" opacity="0.2" />
      {/* === TOP HALF === */}
      <g clipPath={`url(#king-top-${suit})`}>
        {/* Grand crown */}
        <path d="M25,22 L23,8 L30,16 L35,4 L40,14 L45,4 L50,16 L57,8 L55,22 Z" fill={goldTrim} stroke={goldDark} strokeWidth="0.8" />
        <rect x="25" y="20" width="30" height="5" rx="1.5" fill={goldTrim} stroke={goldDark} strokeWidth="0.6" />
        {/* Ermine band on crown */}
        <rect x="26" y="21" width="28" height="3" rx="1" fill={ermineBg} opacity="0.7" />
        <circle cx="30" cy="22.5" r="0.6" fill="#111" />
        <circle cx="35" cy="22.5" r="0.6" fill="#111" />
        <circle cx="40" cy="22.5" r="0.6" fill="#111" />
        <circle cx="45" cy="22.5" r="0.6" fill="#111" />
        <circle cx="50" cy="22.5" r="0.6" fill="#111" />
        {/* Crown jewels */}
        <circle cx="35" cy="6" r="2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="40" cy="12" r="1.5" fill="#fff" opacity="0.5" stroke={goldDark} strokeWidth="0.3" />
        <circle cx="45" cy="6" r="2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="30" cy="14" r="1.3" fill={crownJewel} opacity="0.7" stroke={goldDark} strokeWidth="0.3" />
        <circle cx="50" cy="14" r="1.3" fill={crownJewel} opacity="0.7" stroke={goldDark} strokeWidth="0.3" />
        {/* Cross pattée atop crown */}
        <path d="M40,0 L38.5,3 L40,2.5 L41.5,3 Z" fill={goldDark} />
        <line x1="40" y1="0" x2="40" y2="5" stroke={goldDark} strokeWidth="1.5" />
        <line x1="37.5" y1="2.5" x2="42.5" y2="2.5" stroke={goldDark} strokeWidth="1.2" />
        {/* Hair */}
        <path d="M27,25 Q24,30 25,38" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M53,25 Q56,30 55,38" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        {/* Face */}
        <ellipse cx="40" cy="35" rx="12" ry="13" fill={skinTone} stroke={skinShade} strokeWidth="0.8" />
        {/* Eyes - stern, regal */}
        <ellipse cx="36" cy="32" rx="2" ry="1.4" fill="#fff" />
        <ellipse cx="44" cy="32" rx="2" ry="1.4" fill="#fff" />
        <circle cx="36.3" cy="32.2" r="1.1" fill={c.primary} />
        <circle cx="44.3" cy="32.2" r="1.1" fill={c.primary} />
        <circle cx="36.7" cy="31.8" r="0.35" fill="#fff" />
        <circle cx="44.7" cy="31.8" r="0.35" fill="#fff" />
        {/* Heavy eyebrows */}
        <path d="M33,29.5 Q36,28 39,29" fill="none" stroke={hairColor} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M41,29 Q44,28 47,29.5" fill="none" stroke={hairColor} strokeWidth="1.2" strokeLinecap="round" />
        {/* Nose */}
        <path d="M40,33.5 L38.8,37.5 Q40,38.5 41.2,37.8" fill="none" stroke={skinShade} strokeWidth="0.6" strokeLinecap="round" />
        {/* Mustache */}
        <path d="M35,39 Q37,41 40,39.5 Q43,41 45,39" fill={beardColor} opacity="0.7" />
        {/* Beard - full and regal */}
        <path d="M30,40 Q29,46 32,52 Q36,56 40,57 Q44,56 48,52 Q51,46 50,40" fill={beardColor} opacity="0.25" />
        <path d="M31,41 Q30,47 33,52 Q37,55 40,56 Q43,55 47,52 Q50,47 49,41" fill="none" stroke={beardColor} strokeWidth="0.6" opacity="0.5" />
        <path d="M33,44 Q36,48 40,49 Q44,48 47,44" fill="none" stroke={beardColor} strokeWidth="0.4" opacity="0.4" />
        <path d="M34,47 Q37,51 40,52 Q43,51 46,47" fill="none" stroke={beardColor} strokeWidth="0.4" opacity="0.3" />
        {/* Mouth (in beard) */}
        <line x1="38" y1="42" x2="42" y2="42" stroke="#a06060" strokeWidth="0.8" strokeLinecap="round" />
        {/* Ermine collar / robe top */}
        <rect x="22" y="52" width="36" height="5" rx="2" fill={ermineBg} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="26" cy="54.5" r="0.6" fill="#111" />
        <circle cx="31" cy="54.5" r="0.6" fill="#111" />
        <circle cx="36" cy="54.5" r="0.6" fill="#111" />
        <circle cx="40" cy="54.5" r="0.6" fill="#111" />
        <circle cx="44" cy="54.5" r="0.6" fill="#111" />
        <circle cx="49" cy="54.5" r="0.6" fill="#111" />
        <circle cx="54" cy="54.5" r="0.6" fill="#111" />
        {/* Robe */}
        <path d="M20,56 L16,60 L64,60 L60,56 Z" fill={robeColor} stroke={robeColor} strokeWidth="0.5" />
        {/* Gold chain/medallion */}
        <path d="M32,52 Q36,55 40,55 Q44,55 48,52" fill="none" stroke={goldTrim} strokeWidth="0.8" />
        {/* Scepter */}
        <line x1="16" y1="30" x2="14" y2="58" stroke={goldDark} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="28" r="3.5" fill={goldTrim} stroke={goldDark} strokeWidth="0.6" />
        <circle cx="16" cy="28" r="1.5" fill={crownJewel} />
        <line x1="13.5" y1="25.5" x2="18.5" y2="25.5" stroke={goldDark} strokeWidth="1" />
        <line x1="16" y1="23" x2="16" y2="28" stroke={goldDark} strokeWidth="1" />
      </g>
      {/* CENTER DIVIDER */}
      <line x1="6" y1="60" x2="74" y2="60" stroke={c.primary} strokeWidth="0.3" opacity="0.3" />
      <text x="10" y="57" fontSize="8" fill={c.primary} fontFamily="serif">{SUIT_SYMBOLS[suit]}</text>
      <text x="70" y="65" fontSize="8" fill={c.primary} fontFamily="serif" textAnchor="middle" transform="rotate(180,70,63)">{SUIT_SYMBOLS[suit]}</text>
      {/* === BOTTOM HALF (mirrored) === */}
      <g clipPath={`url(#king-bot-${suit})`} transform="rotate(180,40,90)">
        <path d="M25,22 L23,8 L30,16 L35,4 L40,14 L45,4 L50,16 L57,8 L55,22 Z" fill={goldTrim} stroke={goldDark} strokeWidth="0.8" />
        <rect x="25" y="20" width="30" height="5" rx="1.5" fill={goldTrim} stroke={goldDark} strokeWidth="0.6" />
        <rect x="26" y="21" width="28" height="3" rx="1" fill={ermineBg} opacity="0.7" />
        <circle cx="30" cy="22.5" r="0.6" fill="#111" />
        <circle cx="35" cy="22.5" r="0.6" fill="#111" />
        <circle cx="40" cy="22.5" r="0.6" fill="#111" />
        <circle cx="45" cy="22.5" r="0.6" fill="#111" />
        <circle cx="50" cy="22.5" r="0.6" fill="#111" />
        <circle cx="35" cy="6" r="2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="40" cy="12" r="1.5" fill="#fff" opacity="0.5" stroke={goldDark} strokeWidth="0.3" />
        <circle cx="45" cy="6" r="2" fill={crownJewel} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="30" cy="14" r="1.3" fill={crownJewel} opacity="0.7" stroke={goldDark} strokeWidth="0.3" />
        <circle cx="50" cy="14" r="1.3" fill={crownJewel} opacity="0.7" stroke={goldDark} strokeWidth="0.3" />
        <path d="M40,0 L38.5,3 L40,2.5 L41.5,3 Z" fill={goldDark} />
        <line x1="40" y1="0" x2="40" y2="5" stroke={goldDark} strokeWidth="1.5" />
        <line x1="37.5" y1="2.5" x2="42.5" y2="2.5" stroke={goldDark} strokeWidth="1.2" />
        <path d="M27,25 Q24,30 25,38" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M53,25 Q56,30 55,38" fill="none" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="40" cy="35" rx="12" ry="13" fill={skinTone} stroke={skinShade} strokeWidth="0.8" />
        <ellipse cx="36" cy="32" rx="2" ry="1.4" fill="#fff" />
        <ellipse cx="44" cy="32" rx="2" ry="1.4" fill="#fff" />
        <circle cx="36.3" cy="32.2" r="1.1" fill={c.primary} />
        <circle cx="44.3" cy="32.2" r="1.1" fill={c.primary} />
        <circle cx="36.7" cy="31.8" r="0.35" fill="#fff" />
        <circle cx="44.7" cy="31.8" r="0.35" fill="#fff" />
        <path d="M33,29.5 Q36,28 39,29" fill="none" stroke={hairColor} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M41,29 Q44,28 47,29.5" fill="none" stroke={hairColor} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M40,33.5 L38.8,37.5 Q40,38.5 41.2,37.8" fill="none" stroke={skinShade} strokeWidth="0.6" strokeLinecap="round" />
        <path d="M35,39 Q37,41 40,39.5 Q43,41 45,39" fill={beardColor} opacity="0.7" />
        <path d="M30,40 Q29,46 32,52 Q36,56 40,57 Q44,56 48,52 Q51,46 50,40" fill={beardColor} opacity="0.25" />
        <path d="M31,41 Q30,47 33,52 Q37,55 40,56 Q43,55 47,52 Q50,47 49,41" fill="none" stroke={beardColor} strokeWidth="0.6" opacity="0.5" />
        <path d="M33,44 Q36,48 40,49 Q44,48 47,44" fill="none" stroke={beardColor} strokeWidth="0.4" opacity="0.4" />
        <path d="M34,47 Q37,51 40,52 Q43,51 46,47" fill="none" stroke={beardColor} strokeWidth="0.4" opacity="0.3" />
        <line x1="38" y1="42" x2="42" y2="42" stroke="#a06060" strokeWidth="0.8" strokeLinecap="round" />
        <rect x="22" y="52" width="36" height="5" rx="2" fill={ermineBg} stroke={goldDark} strokeWidth="0.4" />
        <circle cx="26" cy="54.5" r="0.6" fill="#111" />
        <circle cx="31" cy="54.5" r="0.6" fill="#111" />
        <circle cx="36" cy="54.5" r="0.6" fill="#111" />
        <circle cx="40" cy="54.5" r="0.6" fill="#111" />
        <circle cx="44" cy="54.5" r="0.6" fill="#111" />
        <circle cx="49" cy="54.5" r="0.6" fill="#111" />
        <circle cx="54" cy="54.5" r="0.6" fill="#111" />
        <path d="M20,56 L16,60 L64,60 L60,56 Z" fill={robeColor} stroke={robeColor} strokeWidth="0.5" />
        <path d="M32,52 Q36,55 40,55 Q44,55 48,52" fill="none" stroke={goldTrim} strokeWidth="0.8" />
        <line x1="16" y1="30" x2="14" y2="58" stroke={goldDark} strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="28" r="3.5" fill={goldTrim} stroke={goldDark} strokeWidth="0.6" />
        <circle cx="16" cy="28" r="1.5" fill={crownJewel} />
        <line x1="13.5" y1="25.5" x2="18.5" y2="25.5" stroke={goldDark} strokeWidth="1" />
        <line x1="16" y1="23" x2="16" y2="28" stroke={goldDark} strokeWidth="1" />
      </g>
    </svg>
  )
}

const FACE_COMPONENTS: Record<string, React.FC<{ suit: Suit }>> = {
  J: JackSVG,
  Q: QueenSVG,
  K: KingSVG,
}

function CardFace({ card }: { card: CardType }) {
  const symbol = SUIT_SYMBOLS[card.suit]
  const color = SUIT_COLORS[card.suit]
  const isFace = ['J', 'Q', 'K'].includes(card.rank)
  const FaceComponent = FACE_COMPONENTS[card.rank]

  return (
    <div className={`card card-face ${color} ${isFace ? 'face-card-type' : ''}`}>
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
        ) : (
          <div className={`pip-grid pips-${card.rank}`}>
            {Array.from({ length: parseInt(card.rank) || 1 }).map((_, i) => (
              <span key={i} className="pip">{symbol}</span>
            ))}
          </div>
        )}
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

function CardBack() {
  return (
    <div className="card card-back">
      <div className="card-back-pattern">
        <div className="card-back-inner" />
      </div>
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

  // For the 3D-flip dealer hole card
  if (flipReveal) {
    const innerClass = `card-inner${!hidden ? ' flipped' : ''}${isFlipping ? ' flip-reveal' : ''}`
    return (
      <div
        className={`card-wrapper ${animClass}`}
        style={{ '--deal-i': index } as React.CSSProperties}
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
      >
        <CardBack />
      </div>
    )
  }

  return (
    <div
      className={`card-wrapper ${animClass}`}
      style={{ '--deal-i': index } as React.CSSProperties}
    >
      <CardFace card={card} />
    </div>
  )
}

export default Card
