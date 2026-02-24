import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card'
import { GameSettingsProvider } from '../config/GameSettingsContext'

const wrap = (ui: React.ReactElement) => render(<GameSettingsProvider>{ui}</GameSettingsProvider>)

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

  it('renders pip grid for number cards', () => {
    const { container } = render(<Card card={{ suit: 'clubs', rank: '7', id: 1 }} index={0} />)
    expect(container.querySelector('.pip-grid')).toBeInTheDocument()
    expect(container.querySelectorAll('.pip')).toHaveLength(7)
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
