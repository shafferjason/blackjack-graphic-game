import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Scoreboard from './Scoreboard'

describe('Scoreboard component', () => {
  it('displays win count', () => {
    render(<Scoreboard stats={{ wins: 5, losses: 3, pushes: 1 }} />)
    expect(screen.getByText('W 5')).toBeInTheDocument()
  })

  it('displays loss count', () => {
    render(<Scoreboard stats={{ wins: 5, losses: 3, pushes: 1 }} />)
    expect(screen.getByText('L 3')).toBeInTheDocument()
  })

  it('displays push count', () => {
    render(<Scoreboard stats={{ wins: 5, losses: 3, pushes: 1 }} />)
    expect(screen.getByText('D 1')).toBeInTheDocument()
  })

  it('renders with zero stats', () => {
    render(<Scoreboard stats={{ wins: 0, losses: 0, pushes: 0 }} />)
    expect(screen.getByText('W 0')).toBeInTheDocument()
    expect(screen.getByText('L 0')).toBeInTheDocument()
    expect(screen.getByText('D 0')).toBeInTheDocument()
  })

  it('applies correct stat classes', () => {
    const { container } = render(<Scoreboard stats={{ wins: 1, losses: 2, pushes: 3 }} />)
    expect(container.querySelector('.win-stat')).toBeInTheDocument()
    expect(container.querySelector('.loss-stat')).toBeInTheDocument()
    expect(container.querySelector('.push-stat')).toBeInTheDocument()
  })
})
