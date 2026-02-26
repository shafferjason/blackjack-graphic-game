import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StatsDashboard from './StatsDashboard'
import type { GameStats, DetailedStats, Achievement } from '../types'

const stats: GameStats = { wins: 5, losses: 3, pushes: 2 }

const detailedStats: DetailedStats = {
  totalHandsPlayed: 10,
  totalBetAmount: 1000,
  totalPayoutAmount: 1100,
  blackjackCount: 1,
  doubleCount: 2,
  splitCount: 1,
  surrenderCount: 0,
  insuranceTaken: 0,
  insuranceWon: 0,
  currentWinStreak: 2,
  currentLossStreak: 0,
  biggestWinStreak: 3,
  biggestLossStreak: 2,
  startingChips: 1000,
  chipHistory: [1050, 1100],
  resultHistory: ['win', 'lose', 'win'],
}

const achievements: Achievement[] = []

function renderDashboard() {
  return render(
    <StatsDashboard stats={stats} detailedStats={detailedStats} chips={1100} achievements={achievements} />
  )
}

describe('StatsDashboard close behavior', () => {
  it('opens and closes via toggle button', () => {
    renderDashboard()
    const toggle = screen.getByRole('button', { name: /open statistics dashboard/i })

    // Open
    fireEvent.click(toggle)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Close via same toggle button
    const closeToggle = screen.getByRole('button', { name: /close statistics dashboard/i })
    fireEvent.click(closeToggle)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes via the X close button', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /open statistics dashboard/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close statistics' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes via Escape key', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /open statistics dashboard/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes via click on overlay backdrop', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /open statistics dashboard/i }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    // Click the overlay (the dialog element itself, not the inner panel)
    fireEvent.click(dialog)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not close when clicking inside the panel', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /open statistics dashboard/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Click inside the panel content (e.g. the heading)
    fireEvent.click(screen.getByText('Statistics'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('sets aria-modal="true" on the overlay to suppress keyboard shortcuts', () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /open statistics dashboard/i }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('toggle button has correct aria-expanded state', () => {
    renderDashboard()
    const toggle = screen.getByRole('button', { name: /open statistics dashboard/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    const closeToggle = screen.getByRole('button', { name: /close statistics dashboard/i })
    expect(closeToggle).toHaveAttribute('aria-expanded', 'true')
  })
})
