import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DealerHand from './DealerHand'
import { GameSettingsProvider } from '../config/GameSettingsContext'

const wrap = (ui: React.ReactElement) => render(<GameSettingsProvider>{ui}</GameSettingsProvider>)

describe('DealerHand component', () => {
  it('renders "Dealer" header', () => {
    wrap(<DealerHand hand={[]} dealerRevealed={false} dealerVisibleScore={0} />)
    expect(screen.getByText('Dealer')).toBeInTheDocument()
  })

  it('renders empty card slots when hand is empty', () => {
    const { container } = wrap(<DealerHand hand={[]} dealerRevealed={false} dealerVisibleScore={0} />)
    expect(container.querySelectorAll('.card-slot')).toHaveLength(2)
  })

  it('shows score with "?" when dealer is not revealed', () => {
    const hand = [
      { rank: 'K' as const, suit: 'hearts' as const, id: 1 },
      { rank: '5' as const, suit: 'clubs' as const, id: 2 },
    ]
    wrap(<DealerHand hand={hand} dealerRevealed={false} dealerVisibleScore={10} />)
    expect(screen.getByText('10 + ?')).toBeInTheDocument()
  })

  it('shows full score when dealer is revealed', () => {
    const hand = [
      { rank: 'K' as const, suit: 'hearts' as const, id: 1 },
      { rank: '5' as const, suit: 'clubs' as const, id: 2 },
    ]
    wrap(<DealerHand hand={hand} dealerRevealed={true} dealerVisibleScore={15} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('hides second card when not revealed', () => {
    const hand = [
      { rank: 'K' as const, suit: 'hearts' as const, id: 1 },
      { rank: '5' as const, suit: 'clubs' as const, id: 2 },
    ]
    const { container } = wrap(<DealerHand hand={hand} dealerRevealed={false} dealerVisibleScore={10} />)
    expect(container.querySelector('.card-back')).toBeInTheDocument()
  })

  it('shows all cards face-up when revealed', () => {
    const hand = [
      { rank: 'K' as const, suit: 'hearts' as const, id: 1 },
      { rank: '5' as const, suit: 'clubs' as const, id: 2 },
    ]
    const { container } = wrap(<DealerHand hand={hand} dealerRevealed={true} dealerVisibleScore={15} />)
    // Both card faces should be rendered
    expect(container.querySelectorAll('.card-face')).toHaveLength(2)
    // The flip container has flipped to show the face
    expect(container.querySelector('.card-inner.flipped')).toBeInTheDocument()
  })
})
