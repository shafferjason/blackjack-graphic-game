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

  it('renders face-card-type class for J, Q, K', () => {
    for (const rank of ['J', 'Q', 'K'] as const) {
      const { container } = render(<Card card={{ suit: 'hearts', rank, id: 1 }} index={0} />)
      expect(container.querySelector('.face-card-type')).toBeInTheDocument()
    }
  })

  it('renders ace with ace-suit class', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'A', id: 1 }} index={0} />)
    expect(container.querySelector('.ace-suit')).toBeInTheDocument()
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

  it('renders face SVG for Jack', () => {
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'J', id: 1 }} index={0} />)
    expect(container.querySelector('.face-svg')).toBeInTheDocument()
  })

  it('renders face SVG for Queen', () => {
    const { container } = render(<Card card={{ suit: 'diamonds', rank: 'Q', id: 1 }} index={0} />)
    expect(container.querySelector('.face-svg')).toBeInTheDocument()
  })

  it('renders face SVG for King', () => {
    const { container } = render(<Card card={{ suit: 'spades', rank: 'K', id: 1 }} index={0} />)
    expect(container.querySelector('.face-svg')).toBeInTheDocument()
  })
})

describe('Custom skin rendering on face cards', () => {
  it('renders face card SVG with neon-nights skin active', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'neon-nights'], activeSkinId: 'neon-nights' })
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'K', id: 1 }} index={0} />)
    const svg = container.querySelector('.face-svg')
    expect(svg).toBeInTheDocument()
    // The card face should have skin filter applied
    const cardFace = container.querySelector('.card-face') as HTMLElement
    expect(cardFace.style.filter).toContain('saturate')
  })

  it('renders face card SVG with diamond-dynasty skin active', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'diamond-dynasty'], activeSkinId: 'diamond-dynasty' })
    const { container } = render(<Card card={{ suit: 'spades', rank: 'Q', id: 1 }} index={0} />)
    const svg = container.querySelector('.face-svg')
    expect(svg).toBeInTheDocument()
    const cardFace = container.querySelector('.card-face') as HTMLElement
    expect(cardFace.style.filter).toContain('saturate')
  })

  it('applies glow effect for skins with glowColor', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'neon-nights'], activeSkinId: 'neon-nights' })
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'J', id: 1 }} index={0} />)
    const cardFace = container.querySelector('.card-face') as HTMLElement
    expect(cardFace.style.boxShadow).toContain('rgba(0, 255, 204')
  })

  it('applies border color for skins with borderColor', () => {
    saveCardSkinState({ unlockedSkins: ['classic', 'neon-nights'], activeSkinId: 'neon-nights' })
    const { container } = render(<Card card={{ suit: 'clubs', rank: 'K', id: 1 }} index={0} />)
    const cardFace = container.querySelector('.card-face') as HTMLElement
    // Browser normalizes hex to rgb()
    expect(cardFace.style.borderColor).toBe('rgb(0, 255, 204)')
  })

  it('classic skin does not apply filters or glow', () => {
    saveCardSkinState({ unlockedSkins: ['classic'], activeSkinId: 'classic' })
    const { container } = render(<Card card={{ suit: 'hearts', rank: 'K', id: 1 }} index={0} />)
    const cardFace = container.querySelector('.card-face') as HTMLElement
    expect(cardFace.style.filter).toBe('')
    expect(cardFace.style.boxShadow).toBe('')
  })

  it('renders all J/Q/K face cards without error across multiple skins', () => {
    const skins = ['classic', 'neon-nights', 'crimson-flame', 'arctic-frost', 'diamond-dynasty']
    for (const skinId of skins) {
      saveCardSkinState({ unlockedSkins: ['classic', skinId], activeSkinId: skinId })
      for (const rank of ['J', 'Q', 'K'] as const) {
        for (const suit of ['hearts', 'spades'] as const) {
          const { container } = render(<Card card={{ suit, rank, id: 1 }} index={0} />)
          expect(container.querySelector('.face-svg'), `${skinId} ${rank} of ${suit}`).toBeInTheDocument()
        }
      }
    }
  })
})
