import { render } from '@testing-library/react'
import { GameSettingsProvider } from '../config/GameSettingsContext'

export function renderWithSettings(ui) {
  return render(<GameSettingsProvider>{ui}</GameSettingsProvider>)
}
