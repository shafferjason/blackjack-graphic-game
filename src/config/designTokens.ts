// ── Design Token System ──
// Single source of truth for all visual constants.
// Art direction pillars: painterly authenticity, thematic cohesion, premium polish.
// See PREMIUM_SKIN_MASTERPLAN.md for full context.

// ── Color Scales ──

/** Gold accent scale — the signature luxury color */
export const GOLD = {
  50: '#fdf8e8',
  100: '#f8ecd0',
  200: '#f0d68a',
  300: '#e0c470',
  400: '#d4a644',
  500: '#c9a84c',
  600: '#b08a30',
  700: '#8b6914',
  800: '#6b5010',
  900: '#4a370a',
} as const

/** Ink scale — outlines, shadows, text on cards */
export const INK = {
  pure: '#000000',
  heavy: '#0a0a18',
  dark: '#141430',
  mid: '#36365c',
  light: '#6a6a8a',
  faint: '#9a9ab0',
  ghost: '#d4d4e6',
} as const

/** Parchment scale — card face background warmth */
export const PARCHMENT = {
  white: '#fffef8',
  cream: '#faf7f0',
  warm: '#f5f1e8',
  base: '#f0ece2',
  aged: '#e8dcc8',
  antique: '#d8ceb8',
  dark: '#c8b8a0',
} as const

/** Shadow scale — depth and elevation */
export const SHADOW = {
  ambient: 'rgba(0, 0, 0, 0.06)',
  near: 'rgba(0, 0, 0, 0.08)',
  mid: 'rgba(0, 0, 0, 0.10)',
  far: 'rgba(0, 0, 0, 0.13)',
  deep: 'rgba(0, 0, 0, 0.20)',
  abyss: 'rgba(0, 0, 0, 0.35)',
} as const

/** Status colors — win/loss/push feedback */
export const STATUS = {
  win: { base: '#27ae60', bright: '#4ade80', muted: '#1a7a42' },
  lose: { base: '#e74c3c', bright: '#f87171', muted: '#b91c1c' },
  push: { base: '#3498db', bright: '#60a5fa', muted: '#1d6fa5' },
  bust: { base: '#ef4444', bright: '#f87171', muted: '#dc2626' },
} as const

/** UI background scale */
export const BG = {
  darkest: '#060a12',
  dark: '#0a0f1a',
  mid: '#141c2e',
  light: '#1e2a42',
  surface: '#243050',
} as const

/** Text color scale */
export const TEXT = {
  primary: '#f0ece4',
  secondary: '#b0a890',
  tertiary: '#8a8068',
  muted: '#6a6050',
  inverse: '#1a1a1a',
} as const

// ── Typography ──

export const FONT = {
  display: "'Playfair Display', serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
} as const

export const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
} as const

export const FONT_SIZE = {
  xs: '0.65rem',
  sm: '0.75rem',
  base: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  '4xl': '2.5rem',
  '5xl': '3rem',
} as const

// ── Card Dimensions ──

export interface CardSize {
  width: number
  height: number
  borderRadius: number
  overlap: number
  padding: number
}

/** Card sizes at each responsive breakpoint */
export const CARD_SIZES: Record<string, CardSize> = {
  /** < 375px — extra small phones */
  xs: { width: 68, height: 100, borderRadius: 8, overlap: -10, padding: 3 },
  /** 375-413px — small phones */
  sm: { width: 75, height: 110, borderRadius: 10, overlap: -12, padding: 3 },
  /** 414-599px — medium phones */
  md: { width: 80, height: 120, borderRadius: 11, overlap: -13, padding: 4 },
  /** 600px+ — desktop default */
  lg: { width: 90, height: 130, borderRadius: 12, overlap: -14, padding: 4 },
} as const

/** SVG viewBox dimensions for face cards */
export const FACE_CARD_VIEWBOX = {
  width: 80,
  height: 120,
} as const

// ── Animation ──

export const DURATION = {
  instant: '0.1s',
  fast: '0.2s',
  normal: '0.3s',
  deal: '0.55s',
  hit: '0.42s',
  flip: '0.65s',
  flipReveal: '0.75s',
  celebration: '1.8s',
  particle: '1.5s',
  slow: '1s',
} as const

export const EASING = {
  /** Snappy default for UI interactions */
  default: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Smooth card deal arc */
  dealArc: 'cubic-bezier(0.22, 0.68, 0.35, 1.0)',
  /** Card flip with slight overshoot */
  flip: 'cubic-bezier(0.4, 0.0, 0.15, 1)',
  /** Particle/celebration burst */
  burst: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  /** Ease out for fading elements */
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  /** Ease in-out for symmetrical transitions */
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  /** Spring for bouncy interactions */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

/** Deal animation stagger: each card delays by this amount */
export const DEAL_STAGGER = '0.15s' as const

// ── Elevation / Shadow Presets ──

export const ELEVATION = {
  /** Flat — chips on felt */
  flat: '0 1px 2px rgba(0, 0, 0, 0.1)',
  /** Low — resting card on table */
  card: [
    '0 0.5px 1px rgba(0, 0, 0, 0.06)',
    '0 2px 4px rgba(0, 0, 0, 0.08)',
    '0 4px 10px rgba(0, 0, 0, 0.1)',
    '0 8px 22px rgba(0, 0, 0, 0.13)',
  ].join(', '),
  /** Card inner edge highlights for 3D feel */
  cardInset: [
    'inset 0 1px 0 rgba(255, 255, 255, 0.75)',
    'inset 0 -1px 0 rgba(0, 0, 0, 0.04)',
    'inset 1px 0 0 rgba(255, 255, 255, 0.3)',
  ].join(', '),
  /** Medium — hovered card */
  cardHover: [
    '0 1px 2px rgba(0, 0, 0, 0.08)',
    '0 4px 8px rgba(0, 0, 0, 0.1)',
    '0 8px 18px rgba(0, 0, 0, 0.12)',
    '0 14px 30px rgba(0, 0, 0, 0.16)',
  ].join(', '),
  /** High — modals, overlays */
  modal: '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
  /** Chip on felt */
  chip: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
  /** Glow — skin accent highlight */
  glow: (color: string, intensity = 0.5) =>
    `0 0 12px rgba(${hexToRgb(color)}, ${intensity}), 0 0 24px rgba(${hexToRgb(color)}, ${intensity * 0.4})`,
} as const

// ── Z-Index Scale ──

export const Z = {
  base: 0,
  card: 1,
  cardHover: 10,
  controls: 50,
  chipAnimation: 50,
  celebration: 60,
  celebrationText: 61,
  header: 100,
  modal: 100,
  tooltip: 110,
  toast: 120,
} as const

// ── Premium Effect Config ──

export interface PremiumEffects {
  /** Canvas grain texture opacity (0-1) */
  canvasGrain: number
  /** Brush overlay opacity (0-1) */
  brushOverlay: number
  /** Skin paint texture opacity (0-1) */
  skinPaint: number
  /** Fabric paint texture opacity (0-1) */
  fabricPaint: number
  /** Vignette strength (0-1) */
  vignette: number
  /** Inner glow intensity (0-1) */
  innerGlow: number
  /** Gold gilding opacity (0-1) */
  goldGilding: number
  /** Corner flourish opacity (0-1) */
  cornerFlourish: number
}

/** Default face card texture intensities — tuned for painted look at gameplay scale */
export const PREMIUM_DEFAULTS: PremiumEffects = {
  canvasGrain: 0.65,
  brushOverlay: 0.18,
  skinPaint: 0.60,
  fabricPaint: 0.80,
  vignette: 0.18,
  innerGlow: 0.35,
  goldGilding: 0.28,
  cornerFlourish: 0.24,
} as const

// ── Card Material Types ──

export type CardMaterial = 'linen' | 'vellum' | 'metallic' | 'silk' | 'washi'

export interface MaterialConfig {
  /** Background gradient for card face */
  background: string
  /** Border color */
  border: string
  /** Additional CSS for material-specific effects */
  edgeHighlight: string
  /** Texture overlay CSS (linen weave, silk sheen, etc.) */
  textureOverlay: string
}

/** Material definitions — each creates a distinct card stock feel */
export const MATERIALS: Record<CardMaterial, MaterialConfig> = {
  linen: {
    background: `linear-gradient(155deg, ${PARCHMENT.white} 0%, ${PARCHMENT.cream} 30%, ${PARCHMENT.warm} 60%, ${PARCHMENT.base} 100%)`,
    border: 'rgba(170, 160, 140, 0.5)',
    edgeHighlight: 'rgba(255, 255, 255, 0.75)',
    textureOverlay: [
      'repeating-linear-gradient(0deg, transparent, transparent 1.5px, rgba(0,0,0,0.006) 1.5px, rgba(0,0,0,0.006) 2px)',
      'repeating-linear-gradient(90deg, transparent, transparent 1.5px, rgba(0,0,0,0.004) 1.5px, rgba(0,0,0,0.004) 2px)',
      'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.003) 3px, rgba(0,0,0,0.003) 4px)',
    ].join(', '),
  },
  vellum: {
    background: `linear-gradient(155deg, #fefdf5 0%, #f8f3e5 30%, #f0e8d2 60%, #e8dfc0 100%)`,
    border: 'rgba(180, 150, 110, 0.5)',
    edgeHighlight: 'rgba(255, 252, 240, 0.8)',
    textureOverlay: [
      'repeating-linear-gradient(12deg, transparent, transparent 4px, rgba(120,100,60,0.008) 4px, rgba(120,100,60,0.008) 5px)',
      'repeating-linear-gradient(168deg, transparent, transparent 6px, rgba(120,100,60,0.005) 6px, rgba(120,100,60,0.005) 7px)',
    ].join(', '),
  },
  metallic: {
    background: `linear-gradient(155deg, #f5f0e8 0%, #e8e0d0 25%, #f0e8d8 50%, #e0d4c0 75%, #f2ece0 100%)`,
    border: 'rgba(200, 180, 140, 0.6)',
    edgeHighlight: 'rgba(255, 248, 220, 0.9)',
    textureOverlay: [
      'repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(200,180,120,0.012) 2px, rgba(200,180,120,0.012) 3px)',
      'linear-gradient(90deg, rgba(255,252,240,0.05) 0%, rgba(200,180,120,0.08) 50%, rgba(255,252,240,0.05) 100%)',
    ].join(', '),
  },
  silk: {
    background: `linear-gradient(155deg, #fefcf5 0%, #f8f4ea 30%, #f4eee2 60%, #efe8da 100%)`,
    border: 'rgba(160, 150, 130, 0.4)',
    edgeHighlight: 'rgba(255, 255, 250, 0.85)',
    textureOverlay: [
      'repeating-linear-gradient(0deg, transparent, transparent 0.8px, rgba(0,0,0,0.003) 0.8px, rgba(0,0,0,0.003) 1.2px)',
      'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 4px)',
    ].join(', '),
  },
  washi: {
    background: `linear-gradient(155deg, #faf5ec 0%, #f2ebe0 30%, #ece3d4 60%, #e6dbc8 100%)`,
    border: 'rgba(180, 160, 120, 0.45)',
    edgeHighlight: 'rgba(250, 245, 235, 0.7)',
    textureOverlay: [
      'repeating-linear-gradient(7deg, transparent, transparent 3px, rgba(140,120,80,0.01) 3px, rgba(140,120,80,0.01) 4px)',
      'repeating-linear-gradient(173deg, transparent, transparent 5px, rgba(140,120,80,0.008) 5px, rgba(140,120,80,0.008) 6px)',
      'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(180,160,100,0.006) 2px, rgba(180,160,100,0.006) 2.5px)',
    ].join(', '),
  },
} as const

// ── Skin Tier Visual Tokens ──

export const TIER_COLORS = {
  common: { badge: '#a0a0a0', glow: 'rgba(160, 160, 160, 0.3)', label: 'Silver' },
  rare: { badge: GOLD[400], glow: `rgba(212, 166, 68, 0.3)`, label: 'Gold' },
  epic: { badge: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)', label: 'Diamond' },
  legendary: { badge: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', label: 'Prismatic' },
} as const

// ── Table Felt Defaults ──

export const TABLE_FELT = {
  classic: { felt: '#0b6623', dark: '#084a1a', light: '#0d7a2b', accent: GOLD[400] },
  navy: { felt: '#1a3a6b', dark: '#0f2444', light: '#234a85', accent: '#60a5fa' },
  crimson: { felt: '#6b1a1a', dark: '#441010', light: '#852323', accent: '#f87171' },
  royal: { felt: '#4a1a6b', dark: '#2e1044', light: '#5c2385', accent: '#a855f7' },
} as const

// ── SVG Constants ──

/** Face card decorative constants */
export const FACE_CARD = {
  /** Border widths for the triple inner frame */
  borderOuter: 0.45,
  borderMid: 0.4,
  borderInner: 0.18,
  /** Corner flourish scroll curve radius */
  flourishRadius: 14,
  /** Center divider ornament dimensions */
  dividerDiamond: { outer: 2.5, inner: 1.2 },
  /** Minimum crown jewel size */
  jewelMinRadius: 1.5,
  /** Max SVG elements per face card (performance ceiling) */
  maxElements: 200,
} as const

// ── Number Card Treatment ──
// Design decision: Number cards (2-10) are gameplay-critical — rank and suit
// must remain instantly readable at all sizes. Skin treatment is applied via:
//   1. Card material (background gradient, border, texture overlay) — already applied
//   2. Card glow/shadow from skin's glowColor — already applied
//   3. Pip accent tint — optional subtle hue shift (max ±15deg) for thematic feel
//   4. Card center watermark — optional translucent skin motif behind pips
// Pips ALWAYS use standard suit colors (#bf1b35 red, #18182e black) for WCAG AA.

export interface NumberCardTreatment {
  /** Subtle CSS hue-rotate on pips (clamped to ±15deg). 0 = no tint. */
  pipHueShift: number
  /** Optional watermark opacity (0 = none, max 0.06 for readability) */
  watermarkOpacity: number
  /** Watermark symbol (suit pip or skin motif) */
  watermarkSymbol: 'none' | 'suit' | 'motif'
}

/** Default: no tinting, no watermark — classic clean look */
export const NUMBER_CARD_DEFAULTS: NumberCardTreatment = {
  pipHueShift: 0,
  watermarkOpacity: 0,
  watermarkSymbol: 'none',
}

/** Per-tier number card treatment presets */
export const NUMBER_CARD_TREATMENTS: Record<string, NumberCardTreatment> = {
  classic: { pipHueShift: 0, watermarkOpacity: 0, watermarkSymbol: 'none' },
  /** Rare skins get subtle watermark */
  rare: { pipHueShift: 0, watermarkOpacity: 0.035, watermarkSymbol: 'suit' },
  /** Epic skins get watermark + slight tint */
  epic: { pipHueShift: 5, watermarkOpacity: 0.045, watermarkSymbol: 'motif' },
  /** Legendary skins get full treatment */
  legendary: { pipHueShift: 10, watermarkOpacity: 0.055, watermarkSymbol: 'motif' },
} as const

// ── SVG Filter Performance Caps ──
// Controls maximum visual complexity by tier and device capability.
// Prevents frame drops on low-end mobile during deal animations.

export interface SVGFilterCaps {
  /** Maximum SVG elements per face card */
  maxElements: number
  /** Maximum CSS filter operations (contrast, saturate, hue-rotate, etc.) */
  maxFilterOps: number
  /** Maximum texture pattern layers per card */
  maxTextureLayers: number
  /** Allow idle glow animation */
  allowIdleGlow: boolean
  /** Allow canvas grain texture overlay */
  allowCanvasGrain: boolean
  /** Allow brush overlay texture */
  allowBrushOverlay: boolean
}

/** Device performance profiles */
export type DeviceProfile = 'low' | 'mid' | 'high'

/** Detect device profile from viewport width and hardware concurrency */
export function getDeviceProfile(): DeviceProfile {
  const width = typeof window !== 'undefined' ? window.innerWidth : 768
  const cores = typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator
    ? navigator.hardwareConcurrency : 4
  // Low-end: small screen + few cores (iPhone SE, budget Android)
  if (width < 375 && cores <= 4) return 'low'
  if (width < 414 || cores <= 2) return 'low'
  // High-end: large screen + many cores (iPad, desktop)
  if (width >= 768 && cores >= 6) return 'high'
  return 'mid'
}

/** Filter caps by skin tier */
export const TIER_FILTER_CAPS: Record<string, SVGFilterCaps> = {
  common: {
    maxElements: 200,
    maxFilterOps: 2,
    maxTextureLayers: 3,
    allowIdleGlow: false,
    allowCanvasGrain: true,
    allowBrushOverlay: true,
  },
  rare: {
    maxElements: 200,
    maxFilterOps: 3,
    maxTextureLayers: 4,
    allowIdleGlow: false,
    allowCanvasGrain: true,
    allowBrushOverlay: true,
  },
  epic: {
    maxElements: 200,
    maxFilterOps: 3,
    maxTextureLayers: 5,
    allowIdleGlow: false,
    allowCanvasGrain: true,
    allowBrushOverlay: true,
  },
  legendary: {
    maxElements: 200,
    maxFilterOps: 4,
    maxTextureLayers: 5,
    allowIdleGlow: true,
    allowCanvasGrain: true,
    allowBrushOverlay: true,
  },
} as const

/** Device-level overrides — low-end devices get reduced effects */
export const DEVICE_FILTER_OVERRIDES: Record<DeviceProfile, Partial<SVGFilterCaps>> = {
  low: {
    maxElements: 150,
    maxFilterOps: 2,
    maxTextureLayers: 2,
    allowIdleGlow: false,
    allowCanvasGrain: false,
    allowBrushOverlay: false,
  },
  mid: {
    // Mid uses tier defaults unchanged
  },
  high: {
    // High uses tier defaults unchanged
  },
} as const

/** Get effective filter caps for a skin tier on the current device */
export function getEffectiveFilterCaps(tier: string): SVGFilterCaps {
  const tierCaps = TIER_FILTER_CAPS[tier] || TIER_FILTER_CAPS.common
  const device = getDeviceProfile()
  const overrides = DEVICE_FILTER_OVERRIDES[device]
  return { ...tierCaps, ...overrides }
}

// ── Deterministic PRNG ──
// Mulberry32 — fast, deterministic 32-bit PRNG for reproducible animation values.
// Used instead of Math.random() for celebration particles, confetti, chip physics.

/** Mulberry32 PRNG — returns a function that yields [0,1) deterministically */
export function mulberry32(seed: number): () => number {
  let t = seed | 0
  return () => {
    t = (t + 0x6D2B79F5) | 0
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

// ── Helpers ──

/** Convert hex color to r,g,b string for use in rgba() */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

/** Get CSS custom properties object for a skin's environment */
export function getEnvironmentCSSVars(env: { felt: string; feltDark: string; feltLight: string; accent: string }) {
  return {
    '--felt': env.felt,
    '--felt-dark': env.feltDark,
    '--felt-light': env.feltLight,
    '--skin-accent': env.accent,
  } as React.CSSProperties
}
