import { render } from '@testing-library/react'
import { GameSettingsProvider } from '../config/GameSettingsContext'
import type { ReactNode } from 'react'

export function renderWithSettings(ui: ReactNode) {
  return render(<GameSettingsProvider>{ui}</GameSettingsProvider>)
}
