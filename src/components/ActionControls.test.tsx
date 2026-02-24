import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import ActionControls from './ActionControls'
import { renderWithSettings } from '../test/renderWithSettings'
import { GAME_STATES } from '../constants'
import type { GamePhase } from '../types'

describe('ActionControls component', () => {
  it('shows Hit and Stand buttons during PLAYER_TURN', () => {
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        chips={900}
        bet={100}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('Hit')).toBeInTheDocument()
    expect(screen.getByText('Stand')).toBeInTheDocument()
  })

  it('calls onHit when Hit is clicked', () => {
    const onHit = vi.fn()
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        chips={900}
        bet={100}
        onHit={onHit}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Hit'))
    expect(onHit).toHaveBeenCalled()
  })

  it('calls onStand when Stand is clicked', () => {
    const onStand = vi.fn()
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.PLAYER_TURN as GamePhase}
        chips={900}
        bet={100}
        onHit={vi.fn()}
        onStand={onStand}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Stand'))
    expect(onStand).toHaveBeenCalled()
  })

  it('shows "Dealer is drawing..." during DEALING', () => {
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.DEALING as GamePhase}
        chips={900}
        bet={100}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('Dealer is drawing...')).toBeInTheDocument()
  })

  it('shows "Dealer is drawing..." during DEALER_TURN', () => {
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.DEALER_TURN as GamePhase}
        chips={900}
        bet={100}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('Dealer is drawing...')).toBeInTheDocument()
  })

  it('shows "Doubling down..." during DOUBLING', () => {
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.DOUBLING as GamePhase}
        chips={800}
        bet={200}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('Doubling down...')).toBeInTheDocument()
  })

  it('shows "Surrendering..." during SURRENDERING', () => {
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.SURRENDERING as GamePhase}
        chips={950}
        bet={100}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('Surrendering...')).toBeInTheDocument()
  })

  it('shows New Round and Reset buttons during GAME_OVER', () => {
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.GAME_OVER as GamePhase}
        chips={1100}
        bet={0}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('New Round')).toBeInTheDocument()
    expect(screen.getByText('Reset')).toBeInTheDocument()
  })

  it('disables New Round when chips <= 0', () => {
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.GAME_OVER as GamePhase}
        chips={0}
        bet={0}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('New Round')).toBeDisabled()
  })

  it('calls onNewRound when New Round is clicked', () => {
    const onNewRound = vi.fn()
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.GAME_OVER as GamePhase}
        chips={1000}
        bet={0}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={onNewRound}
        onReset={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('New Round'))
    expect(onNewRound).toHaveBeenCalled()
  })

  it('calls onReset when Reset is clicked', () => {
    const onReset = vi.fn()
    renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.GAME_OVER as GamePhase}
        chips={1000}
        bet={0}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={onReset}
      />
    )
    fireEvent.click(screen.getByText('Reset'))
    expect(onReset).toHaveBeenCalled()
  })

  it('returns null for unhandled game states', () => {
    const { container } = renderWithSettings(
      <ActionControls
        gameState={GAME_STATES.BETTING as GamePhase}
        chips={1000}
        bet={50}
        onHit={vi.fn()}
        onStand={vi.fn()}
        onNewRound={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(container.innerHTML).toBe('')
  })
})
