import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlayerHand from './PlayerHand'

describe('PlayerHand component', () => {
  it('renders "You" header', () => {
    render(<PlayerHand hand={[]} playerScore={0} />)
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('renders empty card slots when hand is empty', () => {
    const { container } = render(<PlayerHand hand={[]} playerScore={0} />)
    expect(container.querySelectorAll('.card-slot')).toHaveLength(2)
  })

  it('does not show score when hand is empty', () => {
    const { container } = render(<PlayerHand hand={[]} playerScore={0} />)
    expect(container.querySelector('.score-pill')).not.toBeInTheDocument()
  })

  it('renders cards when hand has cards', () => {
    const hand = [
      { rank: 'K', suit: 'hearts', id: 1 },
      { rank: '5', suit: 'clubs', id: 2 },
    ]
    const { container } = render(<PlayerHand hand={hand} playerScore={15} />)
    expect(container.querySelectorAll('.card')).toHaveLength(2)
    expect(container.querySelectorAll('.card-slot')).toHaveLength(0)
  })

  it('displays the player score', () => {
    const hand = [{ rank: 'K', suit: 'hearts', id: 1 }]
    const { container } = render(<PlayerHand hand={hand} playerScore={10} />)
    const pill = container.querySelector('.score-pill')
    expect(pill).toBeInTheDocument()
    expect(pill.textContent).toBe('10')
  })

  it('applies bust class when score > 21', () => {
    const hand = [{ rank: 'K', suit: 'hearts', id: 1 }]
    const { container } = render(<PlayerHand hand={hand} playerScore={25} />)
    expect(container.querySelector('.score-pill.bust')).toBeInTheDocument()
  })

  it('does not apply bust class when score <= 21', () => {
    const hand = [{ rank: 'K', suit: 'hearts', id: 1 }]
    const { container } = render(<PlayerHand hand={hand} playerScore={20} />)
    expect(container.querySelector('.score-pill.bust')).not.toBeInTheDocument()
  })
})
