// ── Card Skin Shop — premium theme definitions, purchase logic, persistence ──
// Full custom skin overhaul: each skin has unique face card palettes,
// environment themes, rarity tiers, and rich visual identity.

export interface FaceCardPalette {
  /** Skin/face base tone */
  skin: string
  /** Skin shadow */
  skinShade: string
  /** Skin highlight */
  skinHi: string
  /** Hair color */
  hair: string
  /** Hair highlight */
  hairHi: string
  /** Primary clothing color */
  clothing: string
  /** Mid-tone clothing */
  clothingMid: string
  /** Highlight clothing */
  clothingHi: string
  /** Gold/gilding accent */
  gold: string
  /** Dark gold */
  goldDk: string
  /** Light gold */
  goldLt: string
  /** Jewel primary */
  jewel: string
  /** Jewel highlight */
  jewelHi: string
  /** Ink/outline color */
  ink: string
  /** Lip color */
  lip: string
  /** Lip shadow */
  lipShadow: string
  /** Cheek warmth */
  cheekWarmth: string
  /** Beard color (King) */
  beard: string
}

export interface EnvironmentTheme {
  /** Table felt main */
  felt: string
  /** Felt dark (vignette edge) */
  feltDark: string
  /** Felt light (radial center) */
  feltLight: string
  /** UI accent color for buttons, highlights, etc. */
  accent: string
}

export type SkinTier = 'common' | 'rare' | 'epic' | 'legendary'

/** Card back color palette — defines the unique visual identity of each skin's card back */
export interface CardBackDesign {
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
  /** SVG pattern style: 'scroll' | 'circuit' | 'blossom' | 'damask' | 'scales' | 'stars' | 'crosshatch' */
  patternStyle: 'scroll' | 'circuit' | 'blossom' | 'damask' | 'scales' | 'stars' | 'crosshatch'
  /** Center logo symbol: 'spade' | 'flame' | 'sakura' | 'eye' | 'serpent' | 'diamond' | 'moon' | 'sun' | 'star' */
  centerLogo: 'spade' | 'flame' | 'sakura' | 'eye' | 'serpent' | 'diamond' | 'moon' | 'sun' | 'star'
}

export interface CardSkin {
  id: string
  name: string
  description: string
  /** Short flavor text / lore tagline */
  flavorText: string
  price: number
  /** CSS filter applied to .card-face */
  faceFilter: string
  /** CSS filter applied to .card-back */
  backFilter: string
  /** Optional CSS outline/border override on .card */
  borderColor: string
  /** Optional glow shadow color */
  glowColor: string
  /** Preview gradient for the shop thumbnail */
  previewGradient: string
  /** Preview accent (used in the mini card preview) */
  previewAccent: string
  /** Custom face card color palettes for J/Q/K — red suits and black suits */
  faceCardPalette: {
    red: FaceCardPalette
    black: FaceCardPalette
  }
  /** Environment theme applied to table when this skin is active */
  environment: EnvironmentTheme
  /** Per-skin card back design — unique SVG patterns and colors */
  cardBackDesign: CardBackDesign
  /** Whether this skin is unlocked via achievement (not purchasable until unlocked) */
  achievementUnlock?: string
  /** Long description for endgame/legendary skins */
  shopNote?: string
  /** Tier label for display */
  tier: SkinTier
  /** Progression hint shown when skin is locked */
  unlockHint?: string
  /** Sort order within tier group */
  sortOrder: number
  /** Card stock material type */
  cardMaterial?: 'linen' | 'vellum' | 'metallic' | 'silk' | 'washi'
  /** Celebration effect style */
  celebrationStyle?: 'gold' | 'electric' | 'petals' | 'jewels' | 'fire' | 'cosmic' | 'shadow' | 'emerald'
}

// ── Classic: Traditional European court card palette ──
const CLASSIC_RED_PALETTE: FaceCardPalette = {
  skin: '#f0dfc0', skinShade: '#c8a878', skinHi: '#f8ecd8',
  hair: '#6e4424', hairHi: '#8a5a38',
  clothing: '#a41428', clothingMid: '#c42e40', clothingHi: '#d44858',
  gold: '#c9a84c', goldDk: '#8b6914', goldLt: '#e0c470',
  jewel: '#1e4488', jewelHi: '#3a68b0',
  ink: '#6a0e1e', lip: '#be6858', lipShadow: '#985040',
  cheekWarmth: '#d8a080', beard: '#5a3018',
}

const CLASSIC_BLACK_PALETTE: FaceCardPalette = {
  skin: '#f0dfc0', skinShade: '#c8a878', skinHi: '#f8ecd8',
  hair: '#1a1020', hairHi: '#2a2040',
  clothing: '#141430', clothingMid: '#242444', clothingHi: '#343458',
  gold: '#c9a84c', goldDk: '#8b6914', goldLt: '#e0c470',
  jewel: '#b82828', jewelHi: '#d84848',
  ink: '#0a0a18', lip: '#be6858', lipShadow: '#985040',
  cheekWarmth: '#d8a080', beard: '#161016',
}

export const CARD_SKINS: CardSkin[] = [
  // ── COMMON ──
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original European court card design',
    flavorText: 'Where every legend begins.',
    price: 0,
    tier: 'common',
    sortOrder: 0,
    faceFilter: 'none',
    backFilter: 'none',
    borderColor: 'transparent',
    glowColor: 'transparent',
    previewGradient: 'linear-gradient(135deg, #faf7f0, #f0ece2)',
    previewAccent: '#18182e',
    faceCardPalette: { red: CLASSIC_RED_PALETTE, black: CLASSIC_BLACK_PALETTE },
    environment: { felt: '#0b6623', feltDark: '#084a1a', feltLight: '#0d7a2b', accent: '#4ade80' },
    cardBackDesign: { bg1: '#1a3a5c', bg2: '#0f2444', border: '#2a5a8c', borderInner: '#3a6a9c', pattern: 'rgba(255,255,255,0.06)', patternAlt: 'rgba(255,255,255,0.03)', accent: '#4a8abe', accentLight: '#6aacde', diamond: '#3a7ab8', logoFill: '#d4a644', logoStroke: '#a07828', patternStyle: 'scroll', centerLogo: 'spade' },
    cardMaterial: 'linen',
    celebrationStyle: 'gold',
  },
  // ── RARE ──
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Cyberpunk court with electric neon glow',
    flavorText: 'The future plays with light.',
    price: 500,
    tier: 'rare',
    sortOrder: 10,
    faceFilter: 'saturate(1.3) brightness(1.05)',
    backFilter: 'saturate(1.4) hue-rotate(180deg)',
    borderColor: '#00ffcc',
    glowColor: 'rgba(0, 255, 204, 0.35)',
    previewGradient: 'linear-gradient(135deg, #0a2e2a, #00ffcc)',
    previewAccent: '#00ffcc',
    faceCardPalette: {
      red: {
        skin: '#e0d8cc', skinShade: '#a898a0', skinHi: '#f0e8e0',
        hair: '#00e5b0', hairHi: '#40ffcc',
        clothing: '#0a3a38', clothingMid: '#006858', clothingHi: '#00a088',
        gold: '#00ffcc', goldDk: '#00aa88', goldLt: '#80ffe6',
        jewel: '#ff00aa', jewelHi: '#ff66cc',
        ink: '#003830', lip: '#ff6688', lipShadow: '#cc4466',
        cheekWarmth: '#c890a0', beard: '#008868',
      },
      black: {
        skin: '#d8d0c8', skinShade: '#a090a0', skinHi: '#e8e0d8',
        hair: '#00ccaa', hairHi: '#40e8cc',
        clothing: '#081828', clothingMid: '#0a3050', clothingHi: '#104870',
        gold: '#00ffcc', goldDk: '#00aa88', goldLt: '#80ffe6',
        jewel: '#ff3388', jewelHi: '#ff66aa',
        ink: '#001820', lip: '#e05878', lipShadow: '#b04060',
        cheekWarmth: '#c08898', beard: '#006050',
      },
    },
    environment: { felt: '#0a1e2e', feltDark: '#050e18', feltLight: '#0e3040', accent: '#00ffcc' },
    cardBackDesign: { bg1: '#0a2e2a', bg2: '#041a18', border: '#00aa88', borderInner: '#00ccaa', pattern: 'rgba(0,255,204,0.08)', patternAlt: 'rgba(0,255,204,0.04)', accent: '#00ffcc', accentLight: '#80ffe6', diamond: '#00ddaa', logoFill: '#00ffcc', logoStroke: '#00aa88', patternStyle: 'circuit', centerLogo: 'diamond' },
    cardMaterial: 'metallic',
    celebrationStyle: 'electric',
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    description: 'Opulent gilded court in Baroque splendor',
    flavorText: 'Draped in riches, crowned in gold.',
    price: 750,
    tier: 'rare',
    sortOrder: 11,
    faceFilter: 'sepia(0.15) saturate(1.2)',
    backFilter: 'sepia(0.2) brightness(1.1)',
    borderColor: '#d4a644',
    glowColor: 'rgba(212, 166, 68, 0.4)',
    previewGradient: 'linear-gradient(135deg, #2a1f0a, #d4a644)',
    previewAccent: '#d4a644',
    faceCardPalette: {
      red: {
        skin: '#f5e8d0', skinShade: '#d4b888', skinHi: '#faf0e0',
        hair: '#4a2810', hairHi: '#6a3c1c',
        clothing: '#8b1a10', clothingMid: '#a83020', clothingHi: '#c04030',
        gold: '#e8c040', goldDk: '#a07020', goldLt: '#f0d870',
        jewel: '#2050a0', jewelHi: '#4070c0',
        ink: '#3a1808', lip: '#c86858', lipShadow: '#a04838',
        cheekWarmth: '#d8a878', beard: '#3a2010',
      },
      black: {
        skin: '#f2e4cc', skinShade: '#d0b480', skinHi: '#f8eedc',
        hair: '#18100a', hairHi: '#2a2018',
        clothing: '#1a1408', clothingMid: '#2a2410', clothingHi: '#3a3418',
        gold: '#e8c040', goldDk: '#a07020', goldLt: '#f0d870',
        jewel: '#c02020', jewelHi: '#e04040',
        ink: '#0a0808', lip: '#c06050', lipShadow: '#984838',
        cheekWarmth: '#d0a070', beard: '#0a0808',
      },
    },
    environment: { felt: '#2a1f0a', feltDark: '#1a1204', feltLight: '#3a2e14', accent: '#e8c040' },
    cardBackDesign: { bg1: '#2a1f0a', bg2: '#1a1204', border: '#c9963a', borderInner: '#d4a644', pattern: 'rgba(212,166,68,0.1)', patternAlt: 'rgba(212,166,68,0.05)', accent: '#d4a644', accentLight: '#f0d68a', diamond: '#c9963a', logoFill: '#e8c040', logoStroke: '#8b6914', patternStyle: 'damask', centerLogo: 'spade' },
    cardMaterial: 'metallic',
    celebrationStyle: 'jewels',
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    description: 'Mystic court shrouded in arcane purple haze',
    flavorText: 'The cards whisper forgotten spells.',
    price: 600,
    tier: 'rare',
    sortOrder: 12,
    faceFilter: 'hue-rotate(20deg) saturate(1.15)',
    backFilter: 'hue-rotate(240deg) saturate(1.3)',
    borderColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    previewGradient: 'linear-gradient(135deg, #1a0a2e, #a855f7)',
    previewAccent: '#a855f7',
    faceCardPalette: {
      red: {
        skin: '#e8d8d0', skinShade: '#b898a8', skinHi: '#f0e4e0',
        hair: '#4a1848', hairHi: '#6a2868',
        clothing: '#6a1888', clothingMid: '#8828a8', clothingHi: '#a040c0',
        gold: '#c8a0e0', goldDk: '#8060a0', goldLt: '#e0c8f0',
        jewel: '#e040a0', jewelHi: '#f070c0',
        ink: '#2a0830', lip: '#c060a0', lipShadow: '#984080',
        cheekWarmth: '#c890a8', beard: '#3a1040',
      },
      black: {
        skin: '#e0d0d0', skinShade: '#b090a0', skinHi: '#ece0e0',
        hair: '#200828', hairHi: '#381040',
        clothing: '#1a0830', clothingMid: '#2a1048', clothingHi: '#3a1858',
        gold: '#b898d0', goldDk: '#705890', goldLt: '#d0b8e8',
        jewel: '#c828c8', jewelHi: '#e050e0',
        ink: '#100418', lip: '#b858a0', lipShadow: '#903878',
        cheekWarmth: '#c08898', beard: '#180620',
      },
    },
    environment: { felt: '#1a0a3a', feltDark: '#0e0420', feltLight: '#281450', accent: '#c084fc' },
    cardBackDesign: { bg1: '#1a0a2e', bg2: '#0e0420', border: '#6a2898', borderInner: '#8040b8', pattern: 'rgba(168,85,247,0.08)', patternAlt: 'rgba(168,85,247,0.04)', accent: '#a855f7', accentLight: '#c084fc', diamond: '#8040b8', logoFill: '#c084fc', logoStroke: '#6a2898', patternStyle: 'stars', centerLogo: 'eye' },
    cardMaterial: 'silk',
    celebrationStyle: 'cosmic',
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Frozen court of ice queens and frost kings',
    flavorText: 'Cold hands, cold heart, cold cards.',
    price: 650,
    tier: 'rare',
    sortOrder: 13,
    faceFilter: 'hue-rotate(190deg) saturate(1.1) brightness(1.05)',
    backFilter: 'hue-rotate(190deg) saturate(1.3)',
    borderColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    previewGradient: 'linear-gradient(135deg, #0a1a2e, #38bdf8)',
    previewAccent: '#38bdf8',
    faceCardPalette: {
      red: {
        skin: '#e8e4e0', skinShade: '#b0b8c8', skinHi: '#f4f0f0',
        hair: '#c0d8e8', hairHi: '#d8e8f4',
        clothing: '#1868a0', clothingMid: '#2888c0', clothingHi: '#40a8e0',
        gold: '#88c8e8', goldDk: '#5890b0', goldLt: '#b0e0f8',
        jewel: '#40b0f0', jewelHi: '#70c8f8',
        ink: '#082838', lip: '#a08898', lipShadow: '#807080',
        cheekWarmth: '#c0a8b8', beard: '#5880a0',
      },
      black: {
        skin: '#e0e0e0', skinShade: '#a8b0c0', skinHi: '#f0f0f0',
        hair: '#90a8c0', hairHi: '#b0c0d8',
        clothing: '#0a2840', clothingMid: '#103858', clothingHi: '#184870',
        gold: '#80b8d8', goldDk: '#5080a0', goldLt: '#a8d8f0',
        jewel: '#2898d8', jewelHi: '#50b0e8',
        ink: '#041820', lip: '#9880a0', lipShadow: '#786878',
        cheekWarmth: '#b0a0b0', beard: '#406888',
      },
    },
    environment: { felt: '#0a2038', feltDark: '#041020', feltLight: '#103050', accent: '#38bdf8' },
    cardBackDesign: { bg1: '#0a1a2e', bg2: '#041020', border: '#2080c0', borderInner: '#38a0e0', pattern: 'rgba(56,189,248,0.08)', patternAlt: 'rgba(56,189,248,0.04)', accent: '#38bdf8', accentLight: '#7dd3fc', diamond: '#2098d8', logoFill: '#38bdf8', logoStroke: '#1870a8', patternStyle: 'crosshatch', centerLogo: 'diamond' },
    cardMaterial: 'silk',
    celebrationStyle: 'cosmic',
  },
  {
    id: 'emerald-fortune',
    name: 'Emerald Fortune',
    description: 'Lucky Irish court draped in emerald riches',
    flavorText: 'Fortune favors the bold and green.',
    price: 700,
    tier: 'rare',
    sortOrder: 14,
    faceFilter: 'hue-rotate(100deg) saturate(1.15)',
    backFilter: 'hue-rotate(100deg) saturate(1.4)',
    borderColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.35)',
    previewGradient: 'linear-gradient(135deg, #0a2e14, #22c55e)',
    previewAccent: '#22c55e',
    faceCardPalette: {
      red: {
        skin: '#e8e0c8', skinShade: '#b8a880', skinHi: '#f4ecd8',
        hair: '#2a4818', hairHi: '#3a6028',
        clothing: '#186030', clothingMid: '#208040', clothingHi: '#30a050',
        gold: '#a8d040', goldDk: '#708820', goldLt: '#c8e868',
        jewel: '#20a850', jewelHi: '#40c870',
        ink: '#082810', lip: '#c08060', lipShadow: '#985840',
        cheekWarmth: '#c8a078', beard: '#1a3810',
      },
      black: {
        skin: '#e0dcc4', skinShade: '#b0a878', skinHi: '#f0e8d0',
        hair: '#0a2008', hairHi: '#183018',
        clothing: '#082810', clothingMid: '#0c3818', clothingHi: '#104820',
        gold: '#98c038', goldDk: '#607818', goldLt: '#b8d860',
        jewel: '#18a040', jewelHi: '#38c060',
        ink: '#041808', lip: '#b87858', lipShadow: '#905038',
        cheekWarmth: '#c09870', beard: '#0a1808',
      },
    },
    environment: { felt: '#0a2e10', feltDark: '#041a08', feltLight: '#0e4018', accent: '#22c55e' },
    cardBackDesign: { bg1: '#0a2e14', bg2: '#041a08', border: '#18803a', borderInner: '#22a04a', pattern: 'rgba(34,197,94,0.08)', patternAlt: 'rgba(34,197,94,0.04)', accent: '#22c55e', accentLight: '#4ade80', diamond: '#18a040', logoFill: '#22c55e', logoStroke: '#0e6828', patternStyle: 'scroll', centerLogo: 'diamond' },
    cardMaterial: 'vellum',
    celebrationStyle: 'emerald',
  },
  {
    id: 'velvet-noir',
    name: 'Velvet Noir',
    description: 'Noir detective court — monochrome elegance with crimson accents',
    flavorText: 'In the shadows, every card has a secret.',
    price: 550,
    tier: 'rare',
    sortOrder: 15,
    faceFilter: 'saturate(0.6) contrast(1.12)',
    backFilter: 'saturate(0.5) contrast(1.15)',
    borderColor: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.3)',
    previewGradient: 'linear-gradient(135deg, #1a1a1a, #dc2626)',
    previewAccent: '#dc2626',
    faceCardPalette: {
      red: {
        skin: '#e0d8d0', skinShade: '#b0a098', skinHi: '#ece4dc',
        hair: '#2a2228', hairHi: '#3a3038',
        clothing: '#8b1a1a', clothingMid: '#a82828', clothingHi: '#c03838',
        gold: '#a0989080', goldDk: '#787068', goldLt: '#c0b8b0',
        jewel: '#dc2626', jewelHi: '#ef4444',
        ink: '#1a1418', lip: '#c05050', lipShadow: '#984040',
        cheekWarmth: '#c8a0a0', beard: '#221820',
      },
      black: {
        skin: '#d8d0c8', skinShade: '#a89890', skinHi: '#e4dcd4',
        hair: '#181418', hairHi: '#282028',
        clothing: '#141418', clothingMid: '#1e1e22', clothingHi: '#28282e',
        gold: '#908888', goldDk: '#686060', goldLt: '#b0a8a0',
        jewel: '#b91c1c', jewelHi: '#dc2626',
        ink: '#0e0c10', lip: '#b04848', lipShadow: '#883838',
        cheekWarmth: '#b89898', beard: '#141018',
      },
    },
    environment: { felt: '#141414', feltDark: '#0a0a0a', feltLight: '#1e1e1e', accent: '#dc2626' },
    cardBackDesign: { bg1: '#1a1a1a', bg2: '#0e0e0e', border: '#3a3a3a', borderInner: '#4a4a4a', pattern: 'rgba(220,38,38,0.06)', patternAlt: 'rgba(220,38,38,0.03)', accent: '#dc2626', accentLight: '#ef4444', diamond: '#b91c1c', logoFill: '#dc2626', logoStroke: '#7f1d1d', patternStyle: 'crosshatch', centerLogo: 'spade' },
    cardMaterial: 'vellum',
    celebrationStyle: 'shadow',
  },
  // ── EPIC ──
  {
    id: 'crimson-flame',
    name: 'Crimson Flame',
    description: 'Infernal court ablaze with hellfire',
    flavorText: 'Burn the house down.',
    price: 800,
    tier: 'epic',
    sortOrder: 20,
    achievementUnlock: 'streak_10',
    unlockHint: 'Win 10 hands in a row',
    faceFilter: 'saturate(1.25) contrast(1.05)',
    backFilter: 'hue-rotate(330deg) saturate(1.5)',
    borderColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    previewGradient: 'linear-gradient(135deg, #2e0a0a, #ef4444)',
    previewAccent: '#ef4444',
    faceCardPalette: {
      red: {
        skin: '#f0d8c0', skinShade: '#c8a070', skinHi: '#f8e8d0',
        hair: '#8a2010', hairHi: '#b03020',
        clothing: '#b01010', clothingMid: '#d02020', clothingHi: '#e83838',
        gold: '#f0a020', goldDk: '#b07010', goldLt: '#f8c040',
        jewel: '#f04040', jewelHi: '#f87070',
        ink: '#3a0808', lip: '#e06050', lipShadow: '#b04030',
        cheekWarmth: '#e0a070', beard: '#601810',
      },
      black: {
        skin: '#e8d0b8', skinShade: '#c09868', skinHi: '#f0e0c8',
        hair: '#401010', hairHi: '#601818',
        clothing: '#2a0808', clothingMid: '#401010', clothingHi: '#581818',
        gold: '#e89818', goldDk: '#a06810', goldLt: '#f0b838',
        jewel: '#e02828', jewelHi: '#f05050',
        ink: '#180404', lip: '#d85848', lipShadow: '#a83828',
        cheekWarmth: '#d89868', beard: '#280808',
      },
    },
    environment: { felt: '#2e0808', feltDark: '#1a0404', feltLight: '#441010', accent: '#ef4444' },
    cardBackDesign: { bg1: '#2e0a0a', bg2: '#1a0404', border: '#a01010', borderInner: '#c02020', pattern: 'rgba(239,68,68,0.1)', patternAlt: 'rgba(239,68,68,0.05)', accent: '#ef4444', accentLight: '#f87171', diamond: '#dc2626', logoFill: '#f0a020', logoStroke: '#b07010', patternStyle: 'scales', centerLogo: 'flame' },
    cardMaterial: 'vellum',
    celebrationStyle: 'fire',
  },
  {
    id: 'sakura-bloom',
    name: 'Sakura Bloom',
    description: 'Japanese court under cherry blossoms',
    flavorText: 'Petals fall, empires rise.',
    price: 900,
    tier: 'epic',
    sortOrder: 21,
    faceFilter: 'saturate(1.1) brightness(1.02)',
    backFilter: 'hue-rotate(330deg) saturate(1.1)',
    borderColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.3)',
    previewGradient: 'linear-gradient(135deg, #2e0a1a, #f472b6)',
    previewAccent: '#f472b6',
    faceCardPalette: {
      red: {
        skin: '#f5e8d8', skinShade: '#d4b098', skinHi: '#faf2e8',
        hair: '#1a0810', hairHi: '#2a1020',
        clothing: '#c03060', clothingMid: '#d84878', clothingHi: '#e86090',
        gold: '#e8b868', goldDk: '#b08030', goldLt: '#f0d090',
        jewel: '#f070a0', jewelHi: '#f890b8',
        ink: '#3a0818', lip: '#e07080', lipShadow: '#c05060',
        cheekWarmth: '#e8a8b0', beard: '#2a0810',
      },
      black: {
        skin: '#f0e4d4', skinShade: '#c8a890', skinHi: '#f8f0e4',
        hair: '#100810', hairHi: '#201018',
        clothing: '#2a0820', clothingMid: '#401030', clothingHi: '#581840',
        gold: '#d8a858', goldDk: '#a07828', goldLt: '#e8c078',
        jewel: '#d05888', jewelHi: '#e878a0',
        ink: '#180410', lip: '#d06878', lipShadow: '#b04858',
        cheekWarmth: '#d8a0a8', beard: '#180410',
      },
    },
    environment: { felt: '#2a0818', feltDark: '#18040c', feltLight: '#3a1028', accent: '#f472b6' },
    cardBackDesign: { bg1: '#2e0a1a', bg2: '#18040c', border: '#c04070', borderInner: '#d85888', pattern: 'rgba(244,114,182,0.08)', patternAlt: 'rgba(244,114,182,0.04)', accent: '#f472b6', accentLight: '#f9a8d4', diamond: '#e05898', logoFill: '#f472b6', logoStroke: '#a83868', patternStyle: 'blossom', centerLogo: 'sakura' },
    cardMaterial: 'washi',
    celebrationStyle: 'petals',
  },
  {
    id: 'shadow-dynasty',
    name: 'Shadow Dynasty',
    description: 'Dark sovereign court of obsidian and ash',
    flavorText: 'Rule from the darkness.',
    price: 1200,
    tier: 'epic',
    sortOrder: 22,
    achievementUnlock: 'hands_500',
    unlockHint: 'Play 500 hands',
    faceFilter: 'contrast(1.1) brightness(0.95)',
    backFilter: 'brightness(0.85) contrast(1.15)',
    borderColor: '#6b7280',
    glowColor: 'rgba(107, 114, 128, 0.4)',
    previewGradient: 'linear-gradient(135deg, #0a0a0e, #6b7280)',
    previewAccent: '#9ca3af',
    faceCardPalette: {
      red: {
        skin: '#d8ccc0', skinShade: '#a89888', skinHi: '#e4d8cc',
        hair: '#1a1418', hairHi: '#2a2028',
        clothing: '#2a2028', clothingMid: '#3a3038', clothingHi: '#4a4048',
        gold: '#808088', goldDk: '#505058', goldLt: '#a0a0a8',
        jewel: '#c03030', jewelHi: '#e05050',
        ink: '#0a0a10', lip: '#a86060', lipShadow: '#804848',
        cheekWarmth: '#b89088', beard: '#181418',
      },
      black: {
        skin: '#d0c4b8', skinShade: '#a09080', skinHi: '#dcd0c4',
        hair: '#101018', hairHi: '#201820',
        clothing: '#101018', clothingMid: '#181820', clothingHi: '#202028',
        gold: '#707078', goldDk: '#404048', goldLt: '#909098',
        jewel: '#808890', jewelHi: '#a0a8b0',
        ink: '#080810', lip: '#a05858', lipShadow: '#784040',
        cheekWarmth: '#a88880', beard: '#080810',
      },
    },
    environment: { felt: '#0a0a10', feltDark: '#040408', feltLight: '#141418', accent: '#9ca3af' },
    cardBackDesign: { bg1: '#0a0a0e', bg2: '#040408', border: '#2a2a3e', borderInner: '#3a3a4e', pattern: 'rgba(107,114,128,0.08)', patternAlt: 'rgba(107,114,128,0.04)', accent: '#6b7280', accentLight: '#9ca3af', diamond: '#4b5563', logoFill: '#9ca3af', logoStroke: '#4b5563', patternStyle: 'scales', centerLogo: 'eye' },
    cardMaterial: 'metallic',
    celebrationStyle: 'shadow',
  },
  {
    id: 'solar-pharaoh',
    name: 'Solar Pharaoh',
    description: 'Ancient Egyptian court of sun gods',
    flavorText: 'The sun god deals in eternity.',
    price: 1500,
    tier: 'epic',
    sortOrder: 23,
    achievementUnlock: 'blackjack_20',
    unlockHint: 'Get 20 Blackjacks',
    faceFilter: 'sepia(0.2) saturate(1.3)',
    backFilter: 'sepia(0.25) saturate(1.2)',
    borderColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    previewGradient: 'linear-gradient(135deg, #1a1408, #f59e0b)',
    previewAccent: '#f59e0b',
    faceCardPalette: {
      red: {
        skin: '#c8a070', skinShade: '#986838', skinHi: '#d8b888',
        hair: '#0a0a08', hairHi: '#1a1810',
        clothing: '#c08010', clothingMid: '#d89820', clothingHi: '#e8b030',
        gold: '#f0c030', goldDk: '#b88818', goldLt: '#f8d868',
        jewel: '#1880c0', jewelHi: '#30a0e0',
        ink: '#1a1008', lip: '#b87050', lipShadow: '#985838',
        cheekWarmth: '#c08858', beard: '#0a0a08',
      },
      black: {
        skin: '#c09868', skinShade: '#906030', skinHi: '#d0b080',
        hair: '#080808', hairHi: '#181410',
        clothing: '#0a1028', clothingMid: '#101838', clothingHi: '#182048',
        gold: '#e8b828', goldDk: '#a88018', goldLt: '#f0d060',
        jewel: '#e03010', jewelHi: '#f05030',
        ink: '#080808', lip: '#a86848', lipShadow: '#885030',
        cheekWarmth: '#b88050', beard: '#080808',
      },
    },
    environment: { felt: '#1a1408', feltDark: '#0e0a04', feltLight: '#2a2010', accent: '#f59e0b' },
    cardBackDesign: { bg1: '#1a1408', bg2: '#0e0a04', border: '#b88818', borderInner: '#d4a020', pattern: 'rgba(245,158,11,0.1)', patternAlt: 'rgba(245,158,11,0.05)', accent: '#f59e0b', accentLight: '#fbbf24', diamond: '#d4a020', logoFill: '#f59e0b', logoStroke: '#92600a', patternStyle: 'damask', centerLogo: 'sun' },
    cardMaterial: 'metallic',
    celebrationStyle: 'gold',
  },
  {
    id: 'celestial',
    name: 'Celestial',
    description: 'Astral court of stars and constellations',
    flavorText: 'Written in the stars, dealt by fate.',
    price: 1100,
    tier: 'epic',
    sortOrder: 24,
    faceFilter: 'saturate(1.15) brightness(1.06)',
    backFilter: 'saturate(1.2) brightness(1.05)',
    borderColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.35)',
    previewGradient: 'linear-gradient(135deg, #0c0a2e, #818cf8)',
    previewAccent: '#818cf8',
    faceCardPalette: {
      red: {
        skin: '#e8e0e8', skinShade: '#b8a8c0', skinHi: '#f4eef4',
        hair: '#4848a0', hairHi: '#6868c0',
        clothing: '#3838a0', clothingMid: '#5050b8', clothingHi: '#6868d0',
        gold: '#b8b8f0', goldDk: '#7878b0', goldLt: '#d0d0ff',
        jewel: '#f0c060', jewelHi: '#f8d888',
        ink: '#181840', lip: '#c088a8', lipShadow: '#986888',
        cheekWarmth: '#c8a8c0', beard: '#303068',
      },
      black: {
        skin: '#e0d8e4', skinShade: '#b0a0b8', skinHi: '#ece4f0',
        hair: '#282858', hairHi: '#383878',
        clothing: '#101038', clothingMid: '#181850', clothingHi: '#202068',
        gold: '#a8a8e0', goldDk: '#6868a0', goldLt: '#c8c8f8',
        jewel: '#e8b850', jewelHi: '#f0d078',
        ink: '#0c0c28', lip: '#b87898', lipShadow: '#905878',
        cheekWarmth: '#c0a0b8', beard: '#1c1c48',
      },
    },
    environment: { felt: '#0c0a2e', feltDark: '#060420', feltLight: '#18143e', accent: '#818cf8' },
    cardBackDesign: { bg1: '#0c0a2e', bg2: '#060420', border: '#4848a0', borderInner: '#6060b8', pattern: 'rgba(129,140,248,0.08)', patternAlt: 'rgba(129,140,248,0.04)', accent: '#818cf8', accentLight: '#a5b4fc', diamond: '#6060c0', logoFill: '#f0c060', logoStroke: '#b08838', patternStyle: 'stars', centerLogo: 'star' },
    cardMaterial: 'silk',
    celebrationStyle: 'cosmic',
  },
  {
    id: 'blood-moon',
    name: 'Blood Moon',
    description: 'Vampiric court beneath the crimson moon',
    flavorText: 'The moon bleeds. The table calls.',
    price: 1000,
    tier: 'epic',
    sortOrder: 25,
    faceFilter: 'saturate(1.2) contrast(1.08)',
    backFilter: 'hue-rotate(340deg) saturate(1.35)',
    borderColor: '#b91c1c',
    glowColor: 'rgba(185, 28, 28, 0.4)',
    previewGradient: 'linear-gradient(135deg, #1a0808, #b91c1c)',
    previewAccent: '#b91c1c',
    faceCardPalette: {
      red: {
        skin: '#e0c8c0', skinShade: '#b89080', skinHi: '#ecdcd4',
        hair: '#200808', hairHi: '#381010',
        clothing: '#6a0a0a', clothingMid: '#881818', clothingHi: '#a82828',
        gold: '#c8a040', goldDk: '#907020', goldLt: '#e0c060',
        jewel: '#b01010', jewelHi: '#d83030',
        ink: '#280404', lip: '#c04040', lipShadow: '#982828',
        cheekWarmth: '#d09080', beard: '#180808',
      },
      black: {
        skin: '#d8c0b8', skinShade: '#b08878', skinHi: '#e4d4cc',
        hair: '#140808', hairHi: '#280c0c',
        clothing: '#180808', clothingMid: '#280c0c', clothingHi: '#381414',
        gold: '#b89838', goldDk: '#886818', goldLt: '#d0b058',
        jewel: '#981818', jewelHi: '#c02828',
        ink: '#140404', lip: '#b83838', lipShadow: '#882020',
        cheekWarmth: '#c88878', beard: '#100404',
      },
    },
    environment: { felt: '#1a0808', feltDark: '#0e0404', feltLight: '#2e0c0c', accent: '#f87171' },
    cardBackDesign: { bg1: '#1a0808', bg2: '#0e0404', border: '#6a0a0a', borderInner: '#8a1818', pattern: 'rgba(185,28,28,0.1)', patternAlt: 'rgba(185,28,28,0.05)', accent: '#b91c1c', accentLight: '#f87171', diamond: '#981818', logoFill: '#b91c1c', logoStroke: '#5a0808', patternStyle: 'scales', centerLogo: 'moon' },
    cardMaterial: 'vellum',
    celebrationStyle: 'fire',
  },
  // ── LEGENDARY ──
  {
    id: 'gilded-serpent',
    name: 'Gilded Serpent',
    description: 'Mythic court of the serpent king — scales of gold and venom',
    flavorText: 'Coiled in gold, striking with fortune.',
    price: 5000,
    tier: 'legendary',
    sortOrder: 30,
    shopNote: 'A mythic prize for dedicated players. Earn your place among the serpent royalty.',
    unlockHint: 'Reach $5,000 bankroll',
    achievementUnlock: 'bankroll_5000',
    faceFilter: 'saturate(1.35) contrast(1.06)',
    backFilter: 'saturate(1.3) brightness(1.05)',
    borderColor: '#84cc16',
    glowColor: 'rgba(132, 204, 22, 0.4)',
    previewGradient: 'linear-gradient(135deg, #0a1a08, #84cc16)',
    previewAccent: '#84cc16',
    faceCardPalette: {
      red: {
        skin: '#d8d0b8', skinShade: '#a89868', skinHi: '#e8e0c8',
        hair: '#2a3808', hairHi: '#3a4818',
        clothing: '#486010', clothingMid: '#608018', clothingHi: '#78a020',
        gold: '#c8d040', goldDk: '#889020', goldLt: '#e0e868',
        jewel: '#a0d020', jewelHi: '#c0e848',
        ink: '#1a2808', lip: '#b89058', lipShadow: '#987040',
        cheekWarmth: '#c8a870', beard: '#1a2008',
      },
      black: {
        skin: '#d0c8b0', skinShade: '#a09060', skinHi: '#e0d8c0',
        hair: '#141c08', hairHi: '#202c10',
        clothing: '#0a1808', clothingMid: '#102810', clothingHi: '#183818',
        gold: '#b8c038', goldDk: '#788018', goldLt: '#d0d858',
        jewel: '#88b018', jewelHi: '#a8d030',
        ink: '#0a1408', lip: '#a88850', lipShadow: '#886838',
        cheekWarmth: '#c0a068', beard: '#0e1408',
      },
    },
    environment: { felt: '#0a1a08', feltDark: '#040e04', feltLight: '#142a10', accent: '#84cc16' },
    cardBackDesign: { bg1: '#0a1a08', bg2: '#040e04', border: '#488010', borderInner: '#60a018', pattern: 'rgba(132,204,22,0.1)', patternAlt: 'rgba(132,204,22,0.05)', accent: '#84cc16', accentLight: '#a3e635', diamond: '#68a018', logoFill: '#84cc16', logoStroke: '#3a5808', patternStyle: 'scales', centerLogo: 'serpent' },
    cardMaterial: 'metallic',
    celebrationStyle: 'emerald',
  },
  {
    id: 'dragons-hoard',
    name: "Dragon's Hoard",
    description: 'Mythic dragon court forged in dragonfire and ancient gold',
    flavorText: 'Where dragons deal and treasures burn.',
    price: 3000,
    tier: 'legendary',
    sortOrder: 31,
    achievementUnlock: 'bankroll_10000',
    unlockHint: 'Reach $10,000 bankroll',
    shopNote: 'A legendary court of fire-breathing royalty. Only the wealthiest dragonlords sit at this table.',
    faceFilter: 'saturate(1.4) brightness(1.04) contrast(1.06)',
    backFilter: 'saturate(1.3) brightness(1.05)',
    borderColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    previewGradient: 'linear-gradient(135deg, #1a0e04, #f59e0b)',
    previewAccent: '#f59e0b',
    faceCardPalette: {
      red: {
        skin: '#e0c8a0', skinShade: '#b89060', skinHi: '#f0d8b0',
        hair: '#3a1808', hairHi: '#5a2810',
        clothing: '#a82010', clothingMid: '#c83020', clothingHi: '#e84030',
        gold: '#f0b020', goldDk: '#b87810', goldLt: '#f8d060',
        jewel: '#f05020', jewelHi: '#f87848',
        ink: '#2a0808', lip: '#c07050', lipShadow: '#985838',
        cheekWarmth: '#d89868', beard: '#2a1008',
      },
      black: {
        skin: '#d8c098', skinShade: '#b08858', skinHi: '#e8d0a8',
        hair: '#181008', hairHi: '#281810',
        clothing: '#1a1008', clothingMid: '#2a1810', clothingHi: '#3a2818',
        gold: '#e8a818', goldDk: '#a87010', goldLt: '#f0c838',
        jewel: '#d84020', jewelHi: '#f06038',
        ink: '#100808', lip: '#b06848', lipShadow: '#885030',
        cheekWarmth: '#c88858', beard: '#100808',
      },
    },
    environment: { felt: '#1a0e04', feltDark: '#0e0602', feltLight: '#2a1808', accent: '#f59e0b' },
    cardBackDesign: { bg1: '#1a0e04', bg2: '#0e0602', border: '#a87010', borderInner: '#c88820', pattern: 'rgba(245,158,11,0.12)', patternAlt: 'rgba(245,158,11,0.06)', accent: '#f59e0b', accentLight: '#fbbf24', diamond: '#c88820', logoFill: '#f59e0b', logoStroke: '#885008', patternStyle: 'scales', centerLogo: 'flame' },
    cardMaterial: 'metallic',
    celebrationStyle: 'fire',
  },
  {
    id: 'diamond-dynasty',
    name: 'Diamond Dynasty',
    description: 'The ultimate legendary court — dripping with diamonds and platinum',
    flavorText: 'The pinnacle. The endgame. The dynasty.',
    price: 100000,
    tier: 'legendary',
    sortOrder: 32,
    shopNote: 'The crown jewel of the collection. This legendary skin is a long-term goal — play your way to 100,000 chips to unlock the most exclusive court cards in the game.',
    unlockHint: 'Amass $100,000 in chips',
    faceFilter: 'saturate(1.4) brightness(1.08) contrast(1.05)',
    backFilter: 'saturate(1.3) brightness(1.1)',
    borderColor: '#e0e7ff',
    glowColor: 'rgba(224, 231, 255, 0.5)',
    previewGradient: 'linear-gradient(135deg, #0a0a1e, #e0e7ff)',
    previewAccent: '#e0e7ff',
    faceCardPalette: {
      red: {
        skin: '#f4ecf0', skinShade: '#c8b8c8', skinHi: '#faf4f8',
        hair: '#c0c8d8', hairHi: '#d8dce8',
        clothing: '#b0b8d0', clothingMid: '#c8d0e0', clothingHi: '#e0e4f0',
        gold: '#e0e8f8', goldDk: '#a0b0c8', goldLt: '#f0f4ff',
        jewel: '#8090e0', jewelHi: '#a0b0f0',
        ink: '#282838', lip: '#c8a0b0', lipShadow: '#a08090',
        cheekWarmth: '#d8b8c0', beard: '#8898b0',
      },
      black: {
        skin: '#f0e8ec', skinShade: '#c0b0c0', skinHi: '#f8f0f4',
        hair: '#b0b8c8', hairHi: '#c8d0d8',
        clothing: '#181828', clothingMid: '#282838', clothingHi: '#383850',
        gold: '#d8e0f0', goldDk: '#98a8c0', goldLt: '#e8f0ff',
        jewel: '#c0c8e8', jewelHi: '#d8e0f8',
        ink: '#181828', lip: '#c098a8', lipShadow: '#987888',
        cheekWarmth: '#d0b0b8', beard: '#7888a0',
      },
    },
    environment: { felt: '#0a0a1e', feltDark: '#040410', feltLight: '#141430', accent: '#e0e7ff' },
    cardBackDesign: { bg1: '#0a0a1e', bg2: '#040410', border: '#6068a0', borderInner: '#8088c0', pattern: 'rgba(224,231,255,0.08)', patternAlt: 'rgba(224,231,255,0.04)', accent: '#e0e7ff', accentLight: '#f0f4ff', diamond: '#a0a8e0', logoFill: '#e0e7ff', logoStroke: '#8088b0', patternStyle: 'damask', centerLogo: 'diamond' },
    cardMaterial: 'metallic',
    celebrationStyle: 'jewels',
  },
]

/** Get all skins sorted by tier and sortOrder */
export function getSortedSkins(): CardSkin[] {
  const tierOrder: Record<SkinTier, number> = { common: 0, rare: 1, epic: 2, legendary: 3 }
  return [...CARD_SKINS].sort((a, b) => {
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier]
    if (tierDiff !== 0) return tierDiff
    return a.sortOrder - b.sortOrder
  })
}

/** Get skins grouped by tier */
export function getSkinsByTier(): Record<SkinTier, CardSkin[]> {
  const grouped: Record<SkinTier, CardSkin[]> = { common: [], rare: [], epic: [], legendary: [] }
  for (const skin of getSortedSkins()) {
    grouped[skin.tier].push(skin)
  }
  return grouped
}

/** Get collection progress stats */
export function getCollectionStats(unlockedSkins: string[]): { owned: number; total: number; byTier: Record<SkinTier, { owned: number; total: number }> } {
  const byTier: Record<SkinTier, { owned: number; total: number }> = {
    common: { owned: 0, total: 0 },
    rare: { owned: 0, total: 0 },
    epic: { owned: 0, total: 0 },
    legendary: { owned: 0, total: 0 },
  }
  for (const skin of CARD_SKINS) {
    byTier[skin.tier].total++
    if (unlockedSkins.includes(skin.id)) byTier[skin.tier].owned++
  }
  return {
    owned: unlockedSkins.filter(id => CARD_SKINS.some(s => s.id === id)).length,
    total: CARD_SKINS.length,
    byTier,
  }
}

const STORAGE_KEY = 'blackjack-card-skins'

export interface CardSkinState {
  unlockedSkins: string[]  // skin IDs
  activeSkinId: string
}

const DEFAULT_STATE: CardSkinState = {
  unlockedSkins: ['classic'],
  activeSkinId: 'classic',
}

export function loadCardSkinState(): CardSkinState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed.unlockedSkins) && typeof parsed.activeSkinId === 'string') {
        // Ensure 'classic' is always unlocked
        if (!parsed.unlockedSkins.includes('classic')) {
          parsed.unlockedSkins.unshift('classic')
        }
        return parsed
      }
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_STATE }
}

export function saveCardSkinState(state: CardSkinState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

export function getSkinById(id: string): CardSkin | undefined {
  return CARD_SKINS.find(s => s.id === id)
}

export interface PurchaseResult {
  success: boolean
  error?: string
  newBankroll?: number
}

export function purchaseSkin(
  skinId: string,
  currentBankroll: number,
  skinState: CardSkinState,
): PurchaseResult {
  const skin = getSkinById(skinId)
  if (!skin) {
    return { success: false, error: 'Skin not found' }
  }
  if (skinState.unlockedSkins.includes(skinId)) {
    return { success: false, error: 'Already owned' }
  }
  if (currentBankroll < skin.price) {
    return { success: false, error: `Not enough chips. Need $${skin.price.toLocaleString()}, have $${currentBankroll.toLocaleString()}` }
  }
  return {
    success: true,
    newBankroll: currentBankroll - skin.price,
  }
}

// ── Achievement-to-Skin Reward Mapping ──
export interface AchievementSkinReward {
  achievementId: string
  skinId: string
  description: string
}

export const ACHIEVEMENT_SKIN_REWARDS: AchievementSkinReward[] = [
  {
    achievementId: 'streak_10',
    skinId: 'crimson-flame',
    description: 'Win 10 hands in a row to unlock Crimson Flame',
  },
  {
    achievementId: 'hands_500',
    skinId: 'shadow-dynasty',
    description: 'Play 500 hands to unlock Shadow Dynasty',
  },
  {
    achievementId: 'blackjack_20',
    skinId: 'solar-pharaoh',
    description: 'Get 20 Blackjacks to unlock Solar Pharaoh',
  },
  {
    achievementId: 'bankroll_5000',
    skinId: 'gilded-serpent',
    description: 'Reach a $5,000 bankroll to unlock Gilded Serpent',
  },
  {
    achievementId: 'bankroll_10000',
    skinId: 'dragons-hoard',
    description: "Reach a $10,000 bankroll to unlock Dragon's Hoard",
  },
]

/**
 * Check if any achievement-based skins should be granted.
 * Returns skin IDs that should be unlocked.
 */
export function checkAchievementSkinRewards(
  unlockedAchievementIds: string[],
  currentlyOwnedSkinIds: string[],
): string[] {
  return ACHIEVEMENT_SKIN_REWARDS
    .filter(r => unlockedAchievementIds.includes(r.achievementId) && !currentlyOwnedSkinIds.includes(r.skinId))
    .map(r => r.skinId)
}
