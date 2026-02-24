import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import BettingControls from './BettingControls'
import { renderWithSettings } from '../test/renderWithSettings'

describe('BettingControls component', () => {
  const defaultProps = {
    chips: 1000,
    bet: 0,
    onPlaceBet: vi.fn(),
    onClearBet: vi.fn(),
    onDeal: vi.fn(),
  }

  it('renders chip denomination buttons', () => {
    renderWithSettings(<BettingControls {...defaultProps} />)
    expect(screen.getByText('$10')).toBeInTheDocument()
    expect(screen.getByText('$25')).toBeInTheDocument()
    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
  })

  it('renders Clear and Deal buttons', () => {
    renderWithSettings(<BettingControls {...defaultProps} />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
    expect(screen.getByText('Deal')).toBeInTheDocument()
  })

  it('disables Deal button when bet is 0', () => {
    renderWithSettings(<BettingControls {...defaultProps} bet={0} />)
    expect(screen.getByText('Deal')).toBeDisabled()
  })

  it('enables Deal button when bet > 0', () => {
    renderWithSettings(<BettingControls {...defaultProps} bet={50} />)
    expect(screen.getByText('Deal')).not.toBeDisabled()
  })

  it('disables Clear button when bet is 0', () => {
    renderWithSettings(<BettingControls {...defaultProps} bet={0} />)
    expect(screen.getByText('Clear')).toBeDisabled()
  })

  it('enables Clear button when bet > 0', () => {
    renderWithSettings(<BettingControls {...defaultProps} bet={25} />)
    expect(screen.getByText('Clear')).not.toBeDisabled()
  })

  it('disables chip button when chips < denomination', () => {
    renderWithSettings(<BettingControls {...defaultProps} chips={20} />)
    expect(screen.getByText('$25')).toBeDisabled()
    expect(screen.getByText('$50')).toBeDisabled()
    expect(screen.getByText('$100')).toBeDisabled()
  })

  it('calls onPlaceBet when chip button is clicked', () => {
    const onPlaceBet = vi.fn()
    renderWithSettings(<BettingControls {...defaultProps} onPlaceBet={onPlaceBet} />)
    fireEvent.click(screen.getByText('$25'))
    expect(onPlaceBet).toHaveBeenCalledWith(25)
  })

  it('calls onClearBet when Clear is clicked', () => {
    const onClearBet = vi.fn()
    renderWithSettings(<BettingControls {...defaultProps} bet={50} onClearBet={onClearBet} />)
    fireEvent.click(screen.getByText('Clear'))
    expect(onClearBet).toHaveBeenCalled()
  })

  it('calls onDeal when Deal is clicked', () => {
    const onDeal = vi.fn()
    renderWithSettings(<BettingControls {...defaultProps} bet={50} onDeal={onDeal} />)
    fireEvent.click(screen.getByText('Deal'))
    expect(onDeal).toHaveBeenCalled()
  })
})
