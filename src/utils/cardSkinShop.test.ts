import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  CARD_SKINS,
  purchaseSkin,
  loadCardSkinState,
  saveCardSkinState,
  getSkinById,
  checkAchievementSkinRewards,
  ACHIEVEMENT_SKIN_REWARDS,
  type CardSkinState,
  type CardSkin,
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
  it('has at least 10 skins (full overhaul catalog)', () => {
    expect(CARD_SKINS.length).toBeGreaterThanOrEqual(10)
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

  it('every skin has an environment theme', () => {
    for (const skin of CARD_SKINS) {
      expect(skin.environment.felt, `${skin.id} missing felt`).toBeTruthy()
      expect(skin.environment.feltDark, `${skin.id} missing feltDark`).toBeTruthy()
      expect(skin.environment.feltLight, `${skin.id} missing feltLight`).toBeTruthy()
    }
  })

  it('every skin has unique environment colors', () => {
    const envs = CARD_SKINS.map(s => JSON.stringify(s.environment))
    expect(new Set(envs).size).toBe(envs.length)
  })

  it('every skin has a tier label', () => {
    for (const skin of CARD_SKINS) {
      expect(['common', 'rare', 'epic', 'legendary']).toContain(skin.tier)
    }
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
})

describe('achievement-based skin unlock rewards', () => {
  it('has defined achievement-to-skin mappings', () => {
    expect(ACHIEVEMENT_SKIN_REWARDS.length).toBeGreaterThanOrEqual(3)
  })

  it('all reward skin IDs are valid', () => {
    for (const reward of ACHIEVEMENT_SKIN_REWARDS) {
      expect(getSkinById(reward.skinId), `${reward.skinId} should exist`).toBeDefined()
    }
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
    const unlockedAchievements = ['streak_10', 'hands_500', 'blackjack_20']
    const ownedSkins = ['classic']
    const grants = checkAchievementSkinRewards(unlockedAchievements, ownedSkins)
    expect(grants).toContain('crimson-flame')
    expect(grants).toContain('shadow-dynasty')
    expect(grants).toContain('solar-pharaoh')
  })

  it('returns empty array when no achievements match', () => {
    const unlockedAchievements = ['first_win', 'first_blackjack']
    const ownedSkins = ['classic']
    const grants = checkAchievementSkinRewards(unlockedAchievements, ownedSkins)
    expect(grants).toHaveLength(0)
  })
})
