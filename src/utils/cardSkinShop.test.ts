import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  CARD_SKINS,
  purchaseSkin,
  loadCardSkinState,
  saveCardSkinState,
  getSkinById,
  getSortedSkins,
  getSkinsByTier,
  getCollectionStats,
  checkAchievementSkinRewards,
  ACHIEVEMENT_SKIN_REWARDS,
  type CardSkinState,
  type SkinTier,
} from './cardSkinShop'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})

describe('CARD_SKINS definitions', () => {
  it('has at least 15 skins (expanded catalog)', () => {
    expect(CARD_SKINS.length).toBeGreaterThanOrEqual(15)
  })

  it('has unique IDs', () => {
    const ids = CARD_SKINS.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has a free classic skin', () => {
    const classic = CARD_SKINS.find(s => s.id === 'classic')
    expect(classic).toBeDefined()
    expect(classic!.price).toBe(0)
  })

  it('all paid skins have a positive price', () => {
    CARD_SKINS.filter(s => s.id !== 'classic').forEach(skin => {
      expect(skin.price).toBeGreaterThan(0)
    })
  })

  it('every skin has unique custom face card palettes (not reusing defaults)', () => {
    const palettes = CARD_SKINS.map(s => JSON.stringify(s.faceCardPalette))
    expect(new Set(palettes).size).toBe(palettes.length)
  })

  it('every skin has custom J/Q/K face palettes with all required color fields', () => {
    const requiredFields = [
      'skin', 'skinShade', 'skinHi', 'hair', 'hairHi',
      'clothing', 'clothingMid', 'clothingHi',
      'gold', 'goldDk', 'goldLt', 'jewel', 'jewelHi',
      'ink', 'lip', 'lipShadow', 'cheekWarmth', 'beard',
    ]

    for (const skin of CARD_SKINS) {
      for (const suitGroup of ['red', 'black'] as const) {
        const palette = skin.faceCardPalette[suitGroup]
        for (const field of requiredFields) {
          expect(palette[field as keyof typeof palette], `${skin.id}.${suitGroup}.${field}`).toBeTruthy()
        }
      }
    }
  })

  it('every skin has an environment theme with accent', () => {
    for (const skin of CARD_SKINS) {
      expect(skin.environment.felt, `${skin.id} missing felt`).toBeTruthy()
      expect(skin.environment.feltDark, `${skin.id} missing feltDark`).toBeTruthy()
      expect(skin.environment.feltLight, `${skin.id} missing feltLight`).toBeTruthy()
      expect(skin.environment.accent, `${skin.id} missing accent`).toBeTruthy()
    }
  })

  it('every skin has unique environment colors', () => {
    const envs = CARD_SKINS.map(s => JSON.stringify({ felt: s.environment.felt, feltDark: s.environment.feltDark, feltLight: s.environment.feltLight }))
    expect(new Set(envs).size).toBe(envs.length)
  })

  it('every skin has a tier label', () => {
    for (const skin of CARD_SKINS) {
      expect(['common', 'rare', 'epic', 'legendary']).toContain(skin.tier)
    }
  })

  it('every skin has a flavorText', () => {
    for (const skin of CARD_SKINS) {
      expect(skin.flavorText, `${skin.id} missing flavorText`).toBeTruthy()
      expect(skin.flavorText.length).toBeGreaterThan(5)
    }
  })

  it('every skin has a sortOrder', () => {
    for (const skin of CARD_SKINS) {
      expect(typeof skin.sortOrder).toBe('number')
    }
  })
})

describe('new skins in expanded catalog', () => {
  it('includes Velvet Noir as a rare skin', () => {
    const vn = getSkinById('velvet-noir')
    expect(vn).toBeDefined()
    expect(vn!.tier).toBe('rare')
    expect(vn!.price).toBeGreaterThan(0)
  })

  it('includes Celestial as an epic skin', () => {
    const cel = getSkinById('celestial')
    expect(cel).toBeDefined()
    expect(cel!.tier).toBe('epic')
  })

  it('includes Blood Moon as an epic skin', () => {
    const bm = getSkinById('blood-moon')
    expect(bm).toBeDefined()
    expect(bm!.tier).toBe('epic')
  })

  it('includes Gilded Serpent as a legendary skin', () => {
    const gs = getSkinById('gilded-serpent')
    expect(gs).toBeDefined()
    expect(gs!.tier).toBe('legendary')
    expect(gs!.achievementUnlock).toBe('bankroll_5000')
  })
})

describe('legendary endgame skin (Diamond Dynasty)', () => {
  it('exists with price of 100000', () => {
    const legendary = CARD_SKINS.find(s => s.price === 100000)
    expect(legendary).toBeDefined()
    expect(legendary!.id).toBe('diamond-dynasty')
    expect(legendary!.tier).toBe('legendary')
  })

  it('has a shopNote explaining the long-term goal', () => {
    const legendary = getSkinById('diamond-dynasty')!
    expect(legendary.shopNote).toBeTruthy()
    expect(legendary.shopNote!.length).toBeGreaterThan(20)
  })

  it('has custom face card palettes distinct from Classic', () => {
    const classic = getSkinById('classic')!
    const legendary = getSkinById('diamond-dynasty')!
    expect(JSON.stringify(legendary.faceCardPalette)).not.toBe(JSON.stringify(classic.faceCardPalette))
  })
})

describe('getSkinById', () => {
  it('returns skin for valid id', () => {
    const skin = getSkinById('neon-nights')
    expect(skin).toBeDefined()
    expect(skin!.name).toBe('Neon Nights')
  })

  it('returns undefined for invalid id', () => {
    expect(getSkinById('nonexistent')).toBeUndefined()
  })
})

describe('getSortedSkins', () => {
  it('returns all skins sorted by tier then sortOrder', () => {
    const sorted = getSortedSkins()
    expect(sorted.length).toBe(CARD_SKINS.length)

    const tierOrder: Record<SkinTier, number> = { common: 0, rare: 1, epic: 2, legendary: 3 }
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      const prevTier = tierOrder[prev.tier]
      const currTier = tierOrder[curr.tier]
      if (prevTier === currTier) {
        expect(prev.sortOrder).toBeLessThanOrEqual(curr.sortOrder)
      } else {
        expect(prevTier).toBeLessThan(currTier)
      }
    }
  })
})

describe('getSkinsByTier', () => {
  it('groups skins into all four tiers', () => {
    const grouped = getSkinsByTier()
    expect(grouped.common.length).toBeGreaterThanOrEqual(1)
    expect(grouped.rare.length).toBeGreaterThanOrEqual(4)
    expect(grouped.epic.length).toBeGreaterThanOrEqual(4)
    expect(grouped.legendary.length).toBeGreaterThanOrEqual(2)
  })

  it('every skin in a tier group has that tier', () => {
    const grouped = getSkinsByTier()
    for (const [tier, skins] of Object.entries(grouped)) {
      for (const skin of skins) {
        expect(skin.tier).toBe(tier)
      }
    }
  })
})

describe('getCollectionStats', () => {
  it('returns correct counts for default state', () => {
    const stats = getCollectionStats(['classic'])
    expect(stats.owned).toBe(1)
    expect(stats.total).toBe(CARD_SKINS.length)
    expect(stats.byTier.common.owned).toBe(1)
    expect(stats.byTier.rare.owned).toBe(0)
  })

  it('tracks multi-tier ownership', () => {
    const stats = getCollectionStats(['classic', 'neon-nights', 'crimson-flame', 'diamond-dynasty'])
    expect(stats.owned).toBe(4)
    expect(stats.byTier.common.owned).toBe(1)
    expect(stats.byTier.rare.owned).toBe(1)
    expect(stats.byTier.epic.owned).toBe(1)
    expect(stats.byTier.legendary.owned).toBe(1)
  })

  it('ignores invalid skin IDs', () => {
    const stats = getCollectionStats(['classic', 'nonexistent-skin'])
    expect(stats.owned).toBe(1)
  })
})

describe('purchaseSkin', () => {
  const defaultState: CardSkinState = {
    unlockedSkins: ['classic'],
    activeSkinId: 'classic',
  }

  it('succeeds when bankroll is sufficient', () => {
    const result = purchaseSkin('neon-nights', 1000, defaultState)
    expect(result.success).toBe(true)
    expect(result.newBankroll).toBe(1000 - 500)
  })

  it('fails when bankroll is insufficient', () => {
    const result = purchaseSkin('neon-nights', 100, defaultState)
    expect(result.success).toBe(false)
    expect(result.error).toContain('Not enough chips')
  })

  it('fails for already owned skin', () => {
    const state: CardSkinState = {
      unlockedSkins: ['classic', 'neon-nights'],
      activeSkinId: 'classic',
    }
    const result = purchaseSkin('neon-nights', 1000, state)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Already owned')
  })

  it('fails for nonexistent skin', () => {
    const result = purchaseSkin('fake-skin', 1000, defaultState)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Skin not found')
  })

  it('deducts exact price from bankroll', () => {
    const skin = getSkinById('royal-gold')!
    const result = purchaseSkin('royal-gold', 750, defaultState)
    expect(result.success).toBe(true)
    expect(result.newBankroll).toBe(750 - skin.price)
  })

  it('fails when bankroll equals price minus one', () => {
    const skin = getSkinById('neon-nights')!
    const result = purchaseSkin('neon-nights', skin.price - 1, defaultState)
    expect(result.success).toBe(false)
  })

  it('succeeds when bankroll exactly equals price', () => {
    const skin = getSkinById('neon-nights')!
    const result = purchaseSkin('neon-nights', skin.price, defaultState)
    expect(result.success).toBe(true)
    expect(result.newBankroll).toBe(0)
  })

  it('handles legendary skin premium pricing (100k)', () => {
    const result = purchaseSkin('diamond-dynasty', 100000, defaultState)
    expect(result.success).toBe(true)
    expect(result.newBankroll).toBe(0)
  })

  it('fails for legendary skin with 99999 chips', () => {
    const result = purchaseSkin('diamond-dynasty', 99999, defaultState)
    expect(result.success).toBe(false)
    expect(result.error).toContain('Not enough chips')
  })

  it('can purchase new skins (velvet-noir, celestial, blood-moon, gilded-serpent)', () => {
    for (const id of ['velvet-noir', 'celestial', 'blood-moon', 'gilded-serpent']) {
      const skin = getSkinById(id)!
      const result = purchaseSkin(id, skin.price, defaultState)
      expect(result.success).toBe(true)
      expect(result.newBankroll).toBe(0)
    }
  })
})

describe('persistence (load/save)', () => {
  it('returns default state when nothing stored', () => {
    const state = loadCardSkinState()
    expect(state.unlockedSkins).toEqual(['classic'])
    expect(state.activeSkinId).toBe('classic')
  })

  it('saves and loads state correctly', () => {
    const state: CardSkinState = {
      unlockedSkins: ['classic', 'neon-nights', 'royal-gold'],
      activeSkinId: 'neon-nights',
    }
    saveCardSkinState(state)
    const loaded = loadCardSkinState()
    expect(loaded.unlockedSkins).toEqual(['classic', 'neon-nights', 'royal-gold'])
    expect(loaded.activeSkinId).toBe('neon-nights')
  })

  it('ensures classic is always unlocked even if missing from stored data', () => {
    const state: CardSkinState = {
      unlockedSkins: ['neon-nights'],
      activeSkinId: 'neon-nights',
    }
    saveCardSkinState(state)
    const loaded = loadCardSkinState()
    expect(loaded.unlockedSkins).toContain('classic')
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorageMock.setItem('blackjack-card-skins', 'not valid json{{{')
    const state = loadCardSkinState()
    expect(state.unlockedSkins).toEqual(['classic'])
    expect(state.activeSkinId).toBe('classic')
  })

  it('handles missing fields in stored data', () => {
    localStorageMock.setItem('blackjack-card-skins', JSON.stringify({ activeSkinId: 'classic' }))
    const state = loadCardSkinState()
    // Should return default since unlockedSkins is missing (not an array)
    expect(state.unlockedSkins).toEqual(['classic'])
  })

  it('preserves purchased skins across loads', () => {
    const initial = loadCardSkinState()
    const afterPurchase: CardSkinState = {
      unlockedSkins: [...initial.unlockedSkins, 'crimson-flame'],
      activeSkinId: 'crimson-flame',
    }
    saveCardSkinState(afterPurchase)

    // Simulate "new session" by loading again
    const reloaded = loadCardSkinState()
    expect(reloaded.unlockedSkins).toContain('crimson-flame')
    expect(reloaded.activeSkinId).toBe('crimson-flame')
  })
})

describe('skin environment theme switching', () => {
  it('classic skin returns classic green environment', () => {
    const classic = getSkinById('classic')!
    expect(classic.environment.felt).toBe('#0b6623')
  })

  it('each non-classic skin has a different environment than classic', () => {
    const classic = getSkinById('classic')!
    for (const skin of CARD_SKINS.filter(s => s.id !== 'classic')) {
      expect(skin.environment.felt, `${skin.id} felt should differ from classic`).not.toBe(classic.environment.felt)
    }
  })

  it('selecting a skin returns its environment theme', () => {
    const neon = getSkinById('neon-nights')!
    expect(neon.environment.felt).toBe('#0a1e2e')
    expect(neon.environment.feltDark).toBe('#050e18')
    expect(neon.environment.feltLight).toBe('#0e3040')
    expect(neon.environment.accent).toBe('#00ffcc')
  })

  it('every skin has a valid accent color', () => {
    for (const skin of CARD_SKINS) {
      expect(skin.environment.accent).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})

describe('custom face card palette per skin', () => {
  it('each skin has distinct red-suit face palette', () => {
    const redPalettes = CARD_SKINS.map(s => JSON.stringify(s.faceCardPalette.red))
    expect(new Set(redPalettes).size).toBe(redPalettes.length)
  })

  it('each skin has distinct black-suit face palette', () => {
    const blackPalettes = CARD_SKINS.map(s => JSON.stringify(s.faceCardPalette.black))
    expect(new Set(blackPalettes).size).toBe(blackPalettes.length)
  })

  it('neon-nights has custom cyberpunk hair color (cyan)', () => {
    const neon = getSkinById('neon-nights')!
    expect(neon.faceCardPalette.red.hair).toBe('#00e5b0')
    expect(neon.faceCardPalette.black.hair).toBe('#00ccaa')
  })

  it('diamond-dynasty has platinum/diamond hair', () => {
    const dd = getSkinById('diamond-dynasty')!
    expect(dd.faceCardPalette.red.hair).toBe('#c0c8d8')
  })

  it('new skins have distinct palettes from each other', () => {
    const newIds = ['velvet-noir', 'celestial', 'blood-moon', 'gilded-serpent']
    const palettes = newIds.map(id => JSON.stringify(getSkinById(id)!.faceCardPalette))
    expect(new Set(palettes).size).toBe(palettes.length)
  })
})

describe('achievement-based skin unlock rewards', () => {
  it('has defined achievement-to-skin mappings including new gilded-serpent', () => {
    expect(ACHIEVEMENT_SKIN_REWARDS.length).toBeGreaterThanOrEqual(4)
  })

  it('all reward skin IDs are valid', () => {
    for (const reward of ACHIEVEMENT_SKIN_REWARDS) {
      expect(getSkinById(reward.skinId), `${reward.skinId} should exist`).toBeDefined()
    }
  })

  it('includes gilded-serpent linked to bankroll_5000', () => {
    const gs = ACHIEVEMENT_SKIN_REWARDS.find(r => r.skinId === 'gilded-serpent')
    expect(gs).toBeDefined()
    expect(gs!.achievementId).toBe('bankroll_5000')
  })

  it('grants skins for matching unlocked achievements', () => {
    const unlockedAchievements = ['streak_10']
    const ownedSkins = ['classic']
    const grants = checkAchievementSkinRewards(unlockedAchievements, ownedSkins)
    expect(grants).toContain('crimson-flame')
  })

  it('does not re-grant already owned skins', () => {
    const unlockedAchievements = ['streak_10']
    const ownedSkins = ['classic', 'crimson-flame']
    const grants = checkAchievementSkinRewards(unlockedAchievements, ownedSkins)
    expect(grants).not.toContain('crimson-flame')
    expect(grants).toHaveLength(0)
  })

  it('grants multiple skins if multiple achievements match', () => {
    const unlockedAchievements = ['streak_10', 'hands_500', 'blackjack_20', 'bankroll_5000']
    const ownedSkins = ['classic']
    const grants = checkAchievementSkinRewards(unlockedAchievements, ownedSkins)
    expect(grants).toContain('crimson-flame')
    expect(grants).toContain('shadow-dynasty')
    expect(grants).toContain('solar-pharaoh')
    expect(grants).toContain('gilded-serpent')
  })

  it('returns empty array when no achievements match', () => {
    const unlockedAchievements = ['first_win', 'first_blackjack']
    const ownedSkins = ['classic']
    const grants = checkAchievementSkinRewards(unlockedAchievements, ownedSkins)
    expect(grants).toHaveLength(0)
  })
})

describe('tier distribution', () => {
  it('has exactly 1 common skin', () => {
    expect(CARD_SKINS.filter(s => s.tier === 'common').length).toBe(1)
  })

  it('has multiple rare skins', () => {
    expect(CARD_SKINS.filter(s => s.tier === 'rare').length).toBeGreaterThanOrEqual(6)
  })

  it('has multiple epic skins', () => {
    expect(CARD_SKINS.filter(s => s.tier === 'epic').length).toBeGreaterThanOrEqual(5)
  })

  it('has at least 2 legendary skins', () => {
    expect(CARD_SKINS.filter(s => s.tier === 'legendary').length).toBeGreaterThanOrEqual(2)
  })

  it('prices increase with tier', () => {
    const avgByTier = (tier: SkinTier) => {
      const skins = CARD_SKINS.filter(s => s.tier === tier && s.price > 0)
      if (skins.length === 0) return 0
      return skins.reduce((sum, s) => sum + s.price, 0) / skins.length
    }
    expect(avgByTier('rare')).toBeLessThan(avgByTier('epic'))
    expect(avgByTier('epic')).toBeLessThan(avgByTier('legendary'))
  })
})
