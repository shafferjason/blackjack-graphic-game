import { createContext, useContext, useState, type ReactNode } from 'react'
import * as constants from '../constants'
import type { GameSettings } from '../types'

const GameSettingsContext = createContext<GameSettings | null>(null)

export const GameSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [overrides, setOverrides] = useState<Record<string, unknown>>({})

  const updateSetting = (key: string, value: unknown) => {
    setOverrides(prev => ({ ...prev, [key]: value }))
  }

  // Merge compile-time constants with any runtime overrides
  const value = { ...constants, ...overrides, updateSetting } as GameSettings

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  )
}

export const useGameSettings = (): GameSettings => {
  const context = useContext(GameSettingsContext)
  if (context === null) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider')
  }
  return context
}
