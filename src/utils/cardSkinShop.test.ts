import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  CARD_SKINS,
  purchaseSkin,
  loadCardSkinState,
  saveCardSkinState,
  getSkinById,
  type CardSkinState,
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
  it('has at least 6 skins', () => {
    expect(CARD_SKINS.length).toBeGreaterThanOrEqual(6)
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
