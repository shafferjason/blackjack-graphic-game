import { useEffect, useCallback } from 'react'
import type { GamePhase } from '../types'

interface KeyboardShortcutActions {
  // Game actions
  onHit: () => void
  onStand: () => void
  onDoubleDown: () => void
  onSplit: () => void
  onSurrender: () => void
  onAcceptInsurance: (amount: number) => void
  onDeclineInsurance: () => void
  onNewRound: () => void
  onDeal: () => void
  // Betting actions
  onPlaceBet: (amount: number) => void
  onClearBet: () => void
  // Sound
  onButtonClick?: () => void
}

interface KeyboardShortcutState {
  gameState: GamePhase
  chips: number
  bet: number
  canDouble: boolean
  canSplit: boolean
  canSurrender: boolean
  canDoubleAfterSplit: boolean
  maxInsuranceBet: number
  chipDenominations: number[]
  isBetting: boolean
  isGameOver: boolean
}

export function useKeyboardShortcuts(
  actions: KeyboardShortcutActions,
  state: KeyboardShortcutState,
  gameStates: Record<string, GamePhase>
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input or textarea
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    // Suppress game shortcuts while any modal overlay is open (stats, settings, tutorial, etc.)
    if (document.querySelector('[aria-modal="true"]')) {
      return
    }

    const key = e.key.toLowerCase()

    // ── Betting phase shortcuts ──
    if (state.isBetting) {
      // Number keys 1-4 for chip denominations
      const chipIndex = parseInt(key) - 1
      if (chipIndex >= 0 && chipIndex < state.chipDenominations.length) {
        const amount = state.chipDenominations[chipIndex]
        if (state.chips >= amount && (state.chips - state.bet) >= amount) {
          actions.onButtonClick?.()
          actions.onPlaceBet(amount)
        }
        return
      }

      // C = Clear bet
      if (key === 'c' && state.bet > 0) {
        actions.onButtonClick?.()
        actions.onClearBet()
        return
      }

      // Enter or N = Deal
      if ((key === 'enter' || key === 'n') && state.bet > 0) {
        e.preventDefault()
        actions.onButtonClick?.()
        actions.onDeal()
        return
      }
      return
    }

    // ── Player turn shortcuts ──
    if (state.gameState === gameStates.PLAYER_TURN) {
      switch (key) {
        case 'h':
          actions.onButtonClick?.()
          actions.onHit()
          return
        case 's':
          actions.onButtonClick?.()
          actions.onStand()
          return
        case 'd':
          if (state.canDouble) {
            actions.onButtonClick?.()
            actions.onDoubleDown()
          }
          return
        case 'p':
          if (state.canSplit) {
            actions.onButtonClick?.()
            actions.onSplit()
          }
          return
        case 'r':
          if (state.canSurrender) {
            actions.onButtonClick?.()
            actions.onSurrender()
          }
          return
      }
    }

    // ── Splitting phase shortcuts ──
    if (state.gameState === gameStates.SPLITTING) {
      switch (key) {
        case 'h':
          actions.onButtonClick?.()
          actions.onHit()
          return
        case 's':
          actions.onButtonClick?.()
          actions.onStand()
          return
        case 'd':
          if (state.canDoubleAfterSplit) {
            actions.onButtonClick?.()
            actions.onDoubleDown()
          }
          return
      }
    }

    // ── Insurance offer shortcuts ──
    if (state.gameState === gameStates.INSURANCE_OFFER) {
      switch (key) {
        case 'i':
        case 'y':
          actions.onButtonClick?.()
          actions.onAcceptInsurance(state.maxInsuranceBet)
          return
        case 'n':
          actions.onButtonClick?.()
          actions.onDeclineInsurance()
          return
      }
    }

    // ── Game over / resolving shortcuts ──
    if (state.isGameOver) {
      if (key === 'enter' || key === 'n' || key === ' ') {
        e.preventDefault()
        if (state.chips > 0) {
          actions.onButtonClick?.()
          actions.onNewRound()
        }
        return
      }
    }
  }, [actions, state, gameStates])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
