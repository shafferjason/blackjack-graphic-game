import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import GameBanner from './GameBanner'
import { renderWithSettings } from '../test/renderWithSettings'
import { GAME_STATES } from '../constants'

describe('GameBanner component', () => {
  it('displays the message text', () => {
    renderWithSettings(
      <GameBanner message="Place your bet!" result={null} gameState={GAME_STATES.BETTING} />
    )
    expect(screen.getByText('Place your bet!')).toBeInTheDocument()
  })

  it('applies result class for win', () => {
    const { container } = renderWithSettings(
      <GameBanner message="You win!" result="win" gameState={GAME_STATES.GAME_OVER} />
    )
    expect(container.querySelector('.banner.win')).toBeInTheDocument()
  })

  it('applies result class for lose', () => {
    const { container } = renderWithSettings(
      <GameBanner message="Dealer wins." result="lose" gameState={GAME_STATES.GAME_OVER} />
    )
    expect(container.querySelector('.banner.lose')).toBeInTheDocument()
  })

  it('applies result class for push', () => {
    const { container } = renderWithSettings(
      <GameBanner message="Push!" result="push" gameState={GAME_STATES.GAME_OVER} />
    )
    expect(container.querySelector('.banner.push')).toBeInTheDocument()
  })

  it('applies result class for blackjack', () => {
    const { container } = renderWithSettings(
      <GameBanner message="Blackjack!" result="blackjack" gameState={GAME_STATES.GAME_OVER} />
    )
    expect(container.querySelector('.banner.blackjack')).toBeInTheDocument()
  })

  it('applies dealing class during DEALER_TURN', () => {
    const { container } = renderWithSettings(
      <GameBanner message="Dealer is playing..." result={null} gameState={GAME_STATES.DEALER_TURN} />
    )
    expect(container.querySelector('.banner.dealing')).toBeInTheDocument()
  })

  it('applies dealing class during DEALING', () => {
    const { container } = renderWithSettings(
      <GameBanner message="Dealing..." result={null} gameState={GAME_STATES.DEALING} />
    )
    expect(container.querySelector('.banner.dealing')).toBeInTheDocument()
  })

  it('does not apply dealing class in other states', () => {
    const { container } = renderWithSettings(
      <GameBanner message="Hit or Stand?" result={null} gameState={GAME_STATES.PLAYER_TURN} />
    )
    expect(container.querySelector('.banner.dealing')).not.toBeInTheDocument()
  })
})
