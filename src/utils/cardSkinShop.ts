// ── Card Skin Shop — theme definitions, purchase logic, persistence ──

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
}

export const CARD_SKINS: CardSkin[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original card design',
    price: 0,
    faceFilter: 'none',
    backFilter: 'none',
    borderColor: 'transparent',
    glowColor: 'transparent',
    previewGradient: 'linear-gradient(135deg, #faf7f0, #f0ece2)',
    previewAccent: '#18182e',
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Electric neon glow for high-rollers',
    price: 500,
    faceFilter: 'saturate(1.3) brightness(1.05)',
    backFilter: 'saturate(1.4) hue-rotate(180deg)',
    borderColor: '#00ffcc',
    glowColor: 'rgba(0, 255, 204, 0.35)',
    previewGradient: 'linear-gradient(135deg, #0a2e2a, #00ffcc)',
    previewAccent: '#00ffcc',
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    description: 'Gilded edges fit for a king',
    price: 750,
    faceFilter: 'sepia(0.15) saturate(1.2)',
    backFilter: 'sepia(0.2) brightness(1.1)',
    borderColor: '#d4a644',
    glowColor: 'rgba(212, 166, 68, 0.4)',
    previewGradient: 'linear-gradient(135deg, #2a1f0a, #d4a644)',
    previewAccent: '#d4a644',
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    description: 'Mysterious purple-haze aura',
    price: 600,
    faceFilter: 'hue-rotate(20deg) saturate(1.15)',
    backFilter: 'hue-rotate(240deg) saturate(1.3)',
    borderColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    previewGradient: 'linear-gradient(135deg, #1a0a2e, #a855f7)',
    previewAccent: '#a855f7',
  },
  {
    id: 'crimson-flame',
    name: 'Crimson Flame',
    description: 'Fiery red cards that burn the table',
    price: 800,
    faceFilter: 'saturate(1.25) contrast(1.05)',
    backFilter: 'hue-rotate(330deg) saturate(1.5)',
    borderColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    previewGradient: 'linear-gradient(135deg, #2e0a0a, #ef4444)',
    previewAccent: '#ef4444',
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Ice-cold blue shimmer',
    price: 650,
    faceFilter: 'hue-rotate(190deg) saturate(1.1) brightness(1.05)',
    backFilter: 'hue-rotate(190deg) saturate(1.3)',
    borderColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    previewGradient: 'linear-gradient(135deg, #0a1a2e, #38bdf8)',
    previewAccent: '#38bdf8',
  },
  {
    id: 'emerald-fortune',
    name: 'Emerald Fortune',
    description: 'Lucky green for winning streaks',
    price: 700,
    faceFilter: 'hue-rotate(100deg) saturate(1.15)',
    backFilter: 'hue-rotate(100deg) saturate(1.4)',
    borderColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.35)',
    previewGradient: 'linear-gradient(135deg, #0a2e14, #22c55e)',
    previewAccent: '#22c55e',
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
    return { success: false, error: `Not enough chips. Need $${skin.price}, have $${currentBankroll}` }
  }
  return {
    success: true,
    newBankroll: currentBankroll - skin.price,
  }
}
