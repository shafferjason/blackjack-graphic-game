// ── Card Skin Shop — theme definitions, purchase logic, persistence ──
// Full custom skin overhaul: each skin has unique face card palettes,
// environment themes, and visual identity. No reused generic/default face art.

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
}

export interface CardSkin {
  id: string
  name: string
  description: string
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
  /** Whether this skin is unlocked via achievement (not purchasable until unlocked) */
  achievementUnlock?: string
  /** Long description for endgame/legendary skins */
  shopNote?: string
  /** Tier label for display */
  tier?: 'common' | 'rare' | 'epic' | 'legendary'
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
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original European court card design',
    price: 0,
    tier: 'common',
    faceFilter: 'none',
    backFilter: 'none',
    borderColor: 'transparent',
    glowColor: 'transparent',
    previewGradient: 'linear-gradient(135deg, #faf7f0, #f0ece2)',
    previewAccent: '#18182e',
    faceCardPalette: { red: CLASSIC_RED_PALETTE, black: CLASSIC_BLACK_PALETTE },
    environment: { felt: '#0b6623', feltDark: '#084a1a', feltLight: '#0d7a2b' },
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Cyberpunk court with electric neon glow',
    price: 500,
    tier: 'rare',
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
    environment: { felt: '#0a1e2e', feltDark: '#050e18', feltLight: '#0e3040' },
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    description: 'Opulent gilded court in Baroque splendor',
    price: 750,
    tier: 'rare',
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
    environment: { felt: '#2a1f0a', feltDark: '#1a1204', feltLight: '#3a2e14' },
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    description: 'Mystic court shrouded in arcane purple haze',
    price: 600,
    tier: 'rare',
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
    environment: { felt: '#1a0a3a', feltDark: '#0e0420', feltLight: '#281450' },
  },
  {
    id: 'crimson-flame',
    name: 'Crimson Flame',
    description: 'Infernal court ablaze with hellfire',
    price: 800,
    tier: 'epic',
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
    environment: { felt: '#2e0808', feltDark: '#1a0404', feltLight: '#441010' },
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Frozen court of ice queens and frost kings',
    price: 650,
    tier: 'rare',
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
    environment: { felt: '#0a2038', feltDark: '#041020', feltLight: '#103050' },
  },
  {
    id: 'emerald-fortune',
    name: 'Emerald Fortune',
    description: 'Lucky Irish court draped in emerald riches',
    price: 700,
    tier: 'rare',
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
    environment: { felt: '#0a2e10', feltDark: '#041a08', feltLight: '#0e4018' },
  },
  {
    id: 'sakura-bloom',
    name: 'Sakura Bloom',
    description: 'Japanese court under cherry blossoms',
    price: 900,
    tier: 'epic',
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
    environment: { felt: '#2a0818', feltDark: '#18040c', feltLight: '#3a1028' },
  },
  {
    id: 'shadow-dynasty',
    name: 'Shadow Dynasty',
    description: 'Dark sovereign court of obsidian and ash',
    price: 1200,
    tier: 'epic',
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
    environment: { felt: '#0a0a10', feltDark: '#040408', feltLight: '#141418' },
  },
  {
    id: 'solar-pharaoh',
    name: 'Solar Pharaoh',
    description: 'Ancient Egyptian court of sun gods',
    price: 1500,
    tier: 'epic',
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
    environment: { felt: '#1a1408', feltDark: '#0e0a04', feltLight: '#2a2010' },
  },
  {
    id: 'diamond-dynasty',
    name: 'Diamond Dynasty',
    description: 'The ultimate legendary court — dripping with diamonds and platinum. A true endgame trophy for blackjack masters.',
    price: 100000,
    tier: 'legendary',
    shopNote: 'The crown jewel of the collection. This legendary skin is a long-term goal — play your way to 100,000 chips to unlock the most exclusive court cards in the game.',
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
    environment: { felt: '#0a0a1e', feltDark: '#040410', feltLight: '#141430' },
  },
]

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
