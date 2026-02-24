import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChipStack from './ChipStack'

describe('ChipStack component', () => {
  it('displays chip total', () => {
    render(<ChipStack chips={1000} bet={0} />)
    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('shows bet display when bet > 0', () => {
    render(<ChipStack chips={900} bet={100} />)
    expect(screen.getByText('$100')).toBeInTheDocument()
  })

  it('hides bet display when bet is 0', () => {
    const { container } = render(<ChipStack chips={1000} bet={0} />)
    expect(container.querySelector('.bet-display')).not.toBeInTheDocument()
  })
})
