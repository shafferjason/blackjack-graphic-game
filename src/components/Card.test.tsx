import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card'
import { GameSettingsProvider } from '../config/GameSettingsContext'
import { saveCardSkinState } from '../utils/cardSkinShop'

// Mock localStorage for skin state
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

const wrap = (ui: React.ReactElement) => render(<GameSettingsProvider>{ui}</GameSettingsProvider>)

beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})

describe('Card component', () => {
  it('renders card back when hidden', () => {
    const { container } = wrap(<Card card={{ suit: 'hearts', rank: 'K', id: 1 }} hidden index={0} />)
    expect(container.querySelector('.card-back')).toBeInTheDocument()
    expect(container.querySelector('.card-face')).not.toBeInTheDocument()
  })

  it('renders card face when not hidden', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: '5', id: 1 }} index={0} />)
    expect(container.querySelector('.card-face')).toBeInTheDocument()
    expect(container.querySelector('.card-back')).not.toBeInTheDocument()
  })

  it('renders number card with themed asset for hearts', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: '2', id: 1 }} index={0} />)
    expect(container.querySelector('.card-face')).toBeInTheDocument()
  })

  it('renders number card with themed asset for spades', () => {
    const { container } = render(<Card card={{ suit: 'spades', rank: '3', id: 1 }} index={0} />)
    expect(container.querySelector('.card-face')).toBeInTheDocument()
  })

  it('renders face card J/Q/K as themed asset card using cardsJS SVGs', () => {
    for (const rank of ['J', 'Q', 'K'] as const) {
      const { container } = render(<Card card={{ suit: 'hearts', rank, id: 1 }} index={0} />)
      const themedCard = container.querySelector('.themed-asset-card')
      const themedImg = container.querySelector('.themed-asset-img')
      expect(themedCard || themedImg, `${rank} should render as themed asset card`).toBeInTheDocument()
    }
  })

  it('renders ace card as themed asset card using cardsJS SVGs', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'A', id: 1 }} index={0} />)
    const themedCard = container.querySelector('.themed-asset-card')
    const themedImg = container.querySelector('.themed-asset-img')
    expect(themedCard || themedImg, 'Ace should render as themed asset card').toBeInTheDocument()
  })

  it('renders number cards as themed asset cards', () => {
    const { container } = render(<Card card={{ suit: 'clubs', rank: '7', id: 1 }} index={0} />)
    // Number cards now use cardsJS SVG assets via ThemedAssetCardFace
    const themedCard = container.querySelector('.themed-asset-card')
    const assetImg = container.querySelector('.themed-asset-img')
    expect(themedCard || assetImg).toBeInTheDocument()
  })

  it('sets --deal-i css variable from index prop', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: '5', id: 1 }} index={3} />)
    const wrapper = container.querySelector('.card-wrapper') as HTMLElement
    expect(wrapper.style.getPropertyValue('--deal-i')).toBe('3')
  })

  it('renders face cards J/Q/K as cardsJS SVG assets (no canvas art)', () => {
    for (const rank of ['J', 'Q', 'K'] as const) {
      const { container } = render(<Card card={{ suit: 'hearts', rank, id: 1 }} index={0} />)
      // Must NOT render canvas art
      expect(container.querySelector('.canvas-art-card')).toBeNull()
      // Must render as themed asset card with cardsJS SVG
      const themedCard = container.querySelector('.themed-asset-card')
      expect(themedCard, `${rank} should render as themed asset card`).toBeInTheDocument()
    }
  })
})

describe('Custom skin rendering on face cards', () => {
  it('renders face card with neon-nights skin active', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'neon-nights'], activeSkinId: 'neon-nights' })
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'K', id: 1 }} index={0} />)
    const themedCard = container.querySelector('.themed-asset-card')
    expect(themedCard, 'Neon King should render as themed asset card').toBeInTheDocument()
  })

  it('renders face card with diamond-dynasty skin active', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'diamond-dynasty'], activeSkinId: 'diamond-dynasty' })
    const { container } = render(<Card card={{ suit: 'spades', rank: 'Q', id: 1 }} index={0} />)
    const themedCard = container.querySelector('.themed-asset-card')
    expect(themedCard, 'Diamond Dynasty Queen should render as themed asset card').toBeInTheDocument()
  })

  it('renders card face element for neon-nights with glowColor', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'neon-nights'], activeSkinId: 'neon-nights' })
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'J', id: 1 }} index={0} />)
    const cardFace = container.querySelector('.card-face') as HTMLElement
    expect(cardFace).toBeInTheDocument()
  })

  it('renders card face element for neon-nights with borderColor', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'neon-nights'], activeSkinId: 'neon-nights' })
    const { container } = render(<Card card={{ suit: 'clubs', rank: 'K', id: 1 }} index={0} />)
    const cardFace = container.querySelector('.card-face') as HTMLElement
    expect(cardFace).toBeInTheDocument()
  })

  it('classic skin renders card face without filters or glow', () => {
    saveCardSkinState({ unlockedSkins: ['classic'], activeSkinId: 'classic' })
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'K', id: 1 }} index={0} />)
    const cardFace = container.querySelector('.card-face') as HTMLElement
    expect(cardFace.style.filter).toBe('')
  })

  it('renders all J/Q/K face cards as themed asset cards across multiple skins', () => {
    const skins = ['classic', 'neon-nights', 'crimson-flame', 'arctic-frost', 'diamond-dynasty']
    for (const skinId of skins) {
      saveCardSkinState({ unlockedSkins: ['classic', skinId], activeSkinId: skinId })
      for (const rank of ['J', 'Q', 'K'] as const) {
        for (const suit of ['hearts', 'spades'] as const) {
          const { container } = render(<Card card={{ suit, rank, id: 1 }} index={0} />)
          // All skins now render as themed asset cards using cardsJS SVG assets
          const themedCard = container.querySelector('.themed-asset-card')
          expect(themedCard, `${skinId} ${rank} of ${suit}`).toBeInTheDocument()
          // Must NOT render canvas art
          expect(container.querySelector('.canvas-art-card')).toBeNull()
        }
      }
    }
  })
})
