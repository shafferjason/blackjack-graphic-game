import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import * as constants from '../constants'
import type { GameSettings, HouseRules } from '../types'

const STORAGE_KEY = 'blackjack-house-rules'

const DEFAULT_HOUSE_RULES: HouseRules = {
  NUM_DECKS: constants.NUM_DECKS,
  DEALER_HITS_SOFT_17: constants.DEALER_HITS_SOFT_17,
  BLACKJACK_PAYOUT_RATIO: constants.BLACKJACK_PAYOUT_RATIO,
  ALLOW_DOUBLE_AFTER_SPLIT: constants.ALLOW_DOUBLE_AFTER_SPLIT,
  ALLOW_SURRENDER: constants.ALLOW_SURRENDER,
}

function loadHouseRules(): HouseRules {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_HOUSE_RULES, ...parsed }
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_HOUSE_RULES }
}

function saveHouseRules(rules: HouseRules) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
  } catch {
    // ignore storage errors
  }
}

const GameSettingsContext = createContext<GameSettings | null>(null)

export const GameSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [overrides, setOverrides] = useState<Record<string, unknown>>(() => {
    const saved = loadHouseRules()
    return { ...saved }
  })

  // Persist house rules whenever overrides change
  useEffect(() => {
    const rules: HouseRules = {
      NUM_DECKS: (overrides.NUM_DECKS as number) ?? DEFAULT_HOUSE_RULES.NUM_DECKS,
      DEALER_HITS_SOFT_17: (overrides.DEALER_HITS_SOFT_17 as boolean) ?? DEFAULT_HOUSE_RULES.DEALER_HITS_SOFT_17,
      BLACKJACK_PAYOUT_RATIO: (overrides.BLACKJACK_PAYOUT_RATIO as number) ?? DEFAULT_HOUSE_RULES.BLACKJACK_PAYOUT_RATIO,
      ALLOW_DOUBLE_AFTER_SPLIT: (overrides.ALLOW_DOUBLE_AFTER_SPLIT as boolean) ?? DEFAULT_HOUSE_RULES.ALLOW_DOUBLE_AFTER_SPLIT,
      ALLOW_SURRENDER: (overrides.ALLOW_SURRENDER as boolean) ?? DEFAULT_HOUSE_RULES.ALLOW_SURRENDER,
    }
    saveHouseRules(rules)
  }, [overrides])

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
