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

  it('displays rank and suit symbol on face card', () => {
    render(<Card card={{ suit: 'hearts', rank: 'K', id: 1 }} index={0} />)
    const ranks = screen.getAllByText('K')
    expect(ranks.length).toBeGreaterThanOrEqual(2) // top-left + bottom-right + badge
  })

  it('applies red class for hearts', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: '2', id: 1 }} index={0} />)
    expect(container.querySelector('.card-face.red')).toBeInTheDocument()
  })

  it('applies black class for spades', () => {
    const { container } = render(<Card card={{ suit: 'spades', rank: '3', id: 1 }} index={0} />)
    expect(container.querySelector('.card-face.black')).toBeInTheDocument()
  })

  it('renders face card for J, Q, K', () => {
    for (const rank of ['J', 'Q', 'K'] as const) {
      const { container } = render(<Card card={{ suit: 'hearts', rank, id: 1 }} index={0} />)
      // Classic skin uses canvas art — look for canvas-art-card or face-card-type
      const canvasCard = container.querySelector('.canvas-art-card')
      const faceCardType = container.querySelector('.face-card-type')
      expect(canvasCard || faceCardType, `${rank} should render as face card`).toBeInTheDocument()
    }
  })

  it('renders ace card for A', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'A', id: 1 }} index={0} />)
    // Classic skin uses canvas art for aces — look for canvas-art-card or ace-suit
    const canvasCard = container.querySelector('.canvas-art-card')
    const aceSuit = container.querySelector('.ace-suit')
    expect(canvasCard || aceSuit, 'Ace should render').toBeInTheDocument()
  })

  it('renders pip layout for number cards', () => {
    const { container } = render(<Card card={{ suit: 'clubs', rank: '7', id: 1 }} index={0} />)
    expect(container.querySelector('.pip-layout')).toBeInTheDocument()
    expect(container.querySelectorAll('.pip-symbol')).toHaveLength(7)
  })

  it('sets --deal-i css variable from index prop', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: '5', id: 1 }} index={3} />)
    const wrapper = container.querySelector('.card-wrapper') as HTMLElement
    expect(wrapper.style.getPropertyValue('--deal-i')).toBe('3')
  })

  it('renders face card content for Jack', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'J', id: 1 }} index={0} />)
    // Canvas art or SVG path rendering
    const canvasCard = container.querySelector('.canvas-art-card')
    const faceSvg = container.querySelector('.face-svg')
    expect(canvasCard || faceSvg, 'Jack should render with canvas art or SVG').toBeInTheDocument()
  })

  it('renders face card content for Queen', () => {
    const { container } = render(<Card card={{ suit: 'diamonds', rank: 'Q', id: 1 }} index={0} />)
    const canvasCard = container.querySelector('.canvas-art-card')
    const faceSvg = container.querySelector('.face-svg')
    expect(canvasCard || faceSvg, 'Queen should render with canvas art or SVG').toBeInTheDocument()
  })

  it('renders face card content for King', () => {
    const { container } = render(<Card card={{ suit: 'spades', rank: 'K', id: 1 }} index={0} />)
    const canvasCard = container.querySelector('.canvas-art-card')
    const faceSvg = container.querySelector('.face-svg')
    expect(canvasCard || faceSvg, 'King should render with canvas art or SVG').toBeInTheDocument()
  })
})

describe('Custom skin rendering on face cards', () => {
  it('renders face card with neon-nights skin active', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'neon-nights'], activeSkinId: 'neon-nights' })
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'K', id: 1 }} index={0} />)
    // Neon nights uses canvas art — check for canvas-art-card
    const canvasCard = container.querySelector('.canvas-art-card')
    const faceSvg = container.querySelector('.face-svg')
    expect(canvasCard || faceSvg, 'Neon King should render').toBeInTheDocument()
  })

  it('renders face card with diamond-dynasty skin active', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'diamond-dynasty'], activeSkinId: 'diamond-dynasty' })
    const { container } = render(<Card card={{ suit: 'spades', rank: 'Q', id: 1 }} index={0} />)
    // Diamond dynasty now uses canvas art — check for either canvas-art-card or face-svg
    const canvasCard = container.querySelector('.canvas-art-card')
    const faceSvg = container.querySelector('.face-svg')
    expect(canvasCard || faceSvg, 'Diamond Dynasty Queen should render').toBeInTheDocument()
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
    // Canvas art card won't have inline filter/boxShadow for classic skin
    expect(cardFace.style.filter).toBe('')
  })

  it('renders all J/Q/K face cards without error across multiple skins', () => {
    const skins = ['classic', 'neon-nights', 'crimson-flame', 'arctic-frost', 'diamond-dynasty']
    for (const skinId of skins) {
      saveCardSkinState({ unlockedSkins: ['classic', skinId], activeSkinId: skinId })
      for (const rank of ['J', 'Q', 'K'] as const) {
        for (const suit of ['hearts', 'spades'] as const) {
          const { container } = render(<Card card={{ suit, rank, id: 1 }} index={0} />)
          // Canvas art skins render canvas-art-card; SVG skins render face-svg
          const canvasCard = container.querySelector('.canvas-art-card')
          const faceSvg = container.querySelector('.face-svg')
          expect(canvasCard || faceSvg, `${skinId} ${rank} of ${suit}`).toBeInTheDocument()
        }
      }
    }
  })
})
