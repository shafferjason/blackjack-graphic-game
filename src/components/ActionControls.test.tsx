import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import ActionControls from './ActionControls'
import { renderWithSettings } from '../test/renderWithSettings'
import { GAME_STATES } from '../constants'
import type { GamePhase } from '../types'

const defaultProps = {
  chips: 900,
  bet: 100,
  canDouble: true,
  canSplit: false,
  canSurrender: true,
  canDoubleAfterSplit: false,
  maxInsuranceBet: 50,
  onHit: vi.fn(),
  onStand: vi.fn(),
  onDoubleDown: vi.fn(),
  onSplit: vi.fn(),
  onSurrender: vi.fn(),
  onAcceptInsurance: vi.fn(),
  onDeclineInsurance: vi.fn(),
  onNewRound: vi.fn(),
  onReset: vi.fn(),
}

describe('ActionControls component', () => {
  it('shows Hit and Stand buttons during PLAYER_TURN', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
      />
    )
    expect(screen.getByText('Hit')).toBeInTheDocument()
    expect(screen.getByText('Stand')).toBeInTheDocument()
  })

  it('shows Double button during PLAYER_TURN', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        canDouble={true}
      />
    )
    expect(screen.getByText('Double')).toBeInTheDocument()
    expect(screen.getByText('Double')).not.toBeDisabled()
  })

  it('disables Double button when canDouble is false', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        canDouble={false}
      />
    )
    expect(screen.getByText('Double')).toBeDisabled()
  })

  it('shows Split button during PLAYER_TURN', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        canSplit={true}
      />
    )
    expect(screen.getByText('Split')).toBeInTheDocument()
    expect(screen.getByText('Split')).not.toBeDisabled()
  })

  it('disables Split button when canSplit is false', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        canSplit={false}
      />
    )
    expect(screen.getByText('Split')).toBeDisabled()
  })

  it('calls onSplit when Split is clicked', () => {
    const onSplit = vi.fn()
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        canSplit={true}
        onSplit={onSplit}
      />
    )
    fireEvent.click(screen.getByText('Split'))
    expect(onSplit).toHaveBeenCalled()
  })

  it('calls onDoubleDown when Double is clicked', () => {
    const onDoubleDown = vi.fn()
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        canDouble={true}
        onDoubleDown={onDoubleDown}
      />
    )
    fireEvent.click(screen.getByText('Double'))
    expect(onDoubleDown).toHaveBeenCalled()
  })

  it('calls onHit when Hit is clicked', () => {
    const onHit = vi.fn()
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        onHit={onHit}
      />
    )
    fireEvent.click(screen.getByText('Hit'))
    expect(onHit).toHaveBeenCalled()
  })

  it('calls onStand when Stand is clicked', () => {
    const onStand = vi.fn()
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        onStand={onStand}
      />
    )
    fireEvent.click(screen.getByText('Stand'))
    expect(onStand).toHaveBeenCalled()
  })

  it('shows Hit and Stand buttons during SPLITTING', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.SPLITTING as GamePhase}
      />
    )
    expect(screen.getByText('Hit')).toBeInTheDocument()
    expect(screen.getByText('Stand')).toBeInTheDocument()
  })

  it('shows "Dealer is drawing..." during DEALING', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.DEALING as GamePhase}
      />
    )
    expect(screen.getByText('Dealer is drawing...')).toBeInTheDocument()
  })

  it('shows "Dealer is drawing..." during DEALER_TURN', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.DEALER_TURN as GamePhase}
      />
    )
    expect(screen.getByText('Dealer is drawing...')).toBeInTheDocument()
  })

  it('shows "Doubling down..." during DOUBLING', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.DOUBLING as GamePhase}
        chips={800}
        bet={200}
      />
    )
    expect(screen.getByText('Doubling down...')).toBeInTheDocument()
  })

  it('shows "Surrendering..." during SURRENDERING', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.SURRENDERING as GamePhase}
        chips={950}
      />
    )
    expect(screen.getByText('Surrendering...')).toBeInTheDocument()
  })

  it('shows New Round and Reset buttons during GAME_OVER', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.GAME_OVER as GamePhase}
        chips={1100}
        bet={0}
      />
    )
    expect(screen.getByText('New Round')).toBeInTheDocument()
    expect(screen.getByText('Reset')).toBeInTheDocument()
  })

  it('disables New Round when chips <= 0', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.GAME_OVER as GamePhase}
        chips={0}
        bet={0}
      />
    )
    expect(screen.getByText('New Round')).toBeDisabled()
  })

  it('calls onNewRound when New Round is clicked', () => {
    const onNewRound = vi.fn()
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.GAME_OVER as GamePhase}
        chips={1000}
        bet={0}
        onNewRound={onNewRound}
      />
    )
    fireEvent.click(screen.getByText('New Round'))
    expect(onNewRound).toHaveBeenCalled()
  })

  it('calls onReset when Reset is clicked', () => {
    const onReset = vi.fn()
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.GAME_OVER as GamePhase}
        chips={1000}
        bet={0}
        onReset={onReset}
      />
    )
    fireEvent.click(screen.getByText('Reset'))
    expect(onReset).toHaveBeenCalled()
  })

  it('shows insurance buttons during INSURANCE_OFFER', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.INSURANCE_OFFER as GamePhase}
      />
    )
    expect(screen.getByText('Insure $50')).toBeInTheDocument()
    expect(screen.getByText('No Insurance')).toBeInTheDocument()
  })

  it('calls onAcceptInsurance when Insure is clicked', () => {
    const onAcceptInsurance = vi.fn()
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.INSURANCE_OFFER as GamePhase}
        onAcceptInsurance={onAcceptInsurance}
      />
    )
    fireEvent.click(screen.getByText('Insure $50'))
    expect(onAcceptInsurance).toHaveBeenCalledWith(50)
  })

  it('calls onDeclineInsurance when No Insurance is clicked', () => {
    const onDeclineInsurance = vi.fn()
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.INSURANCE_OFFER as GamePhase}
        onDeclineInsurance={onDeclineInsurance}
      />
    )
    fireEvent.click(screen.getByText('No Insurance'))
    expect(onDeclineInsurance).toHaveBeenCalled()
  })

  it('shows Surrender button during PLAYER_TURN', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        canSurrender={true}
      />
    )
    expect(screen.getByText('Surrender')).toBeInTheDocument()
    expect(screen.getByText('Surrender')).not.toBeDisabled()
  })

  it('disables Surrender button when canSurrender is false', () => {
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        canSurrender={false}
      />
    )
    expect(screen.getByText('Surrender')).toBeDisabled()
  })

  it('calls onSurrender when Surrender is clicked', () => {
    const onSurrender = vi.fn()
    renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        canSurrender={true}
        onSurrender={onSurrender}
      />
    )
    fireEvent.click(screen.getByText('Surrender'))
    expect(onSurrender).toHaveBeenCalled()
  })

  it('returns null for unhandled game states', () => {
    const { container } = renderWithSettings(
      <ActionControls
        {...defaultProps}
        gameState={GAME_STATES.BETTING as GamePhase}
        chips={1000}
        bet={50}
      />
    )
    expect(container.innerHTML).toBe('')
  })
})
