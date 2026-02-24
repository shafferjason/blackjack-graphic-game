import type { Achievement, DetailedStats, GameResult } from '../types'

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_blackjack', name: 'Natural!', description: 'Get your first Blackjack', icon: '\u{1F0CF}' },
  { id: 'first_win', name: 'Winner Winner', description: 'Win your first hand', icon: '\u{1F947}' },
  { id: 'streak_5', name: 'Hot Streak', description: 'Win 5 hands in a row', icon: '\u{1F525}' },
  { id: 'streak_10', name: 'Unstoppable', description: 'Win 10 hands in a row', icon: '\u{26A1}' },
  { id: 'hands_50', name: 'Getting Started', description: 'Play 50 hands', icon: '\u{1F4AA}' },
  { id: 'hands_100', name: 'Regular', description: 'Play 100 hands', icon: '\u{2B50}' },
  { id: 'hands_500', name: 'Veteran', description: 'Play 500 hands', icon: '\u{1F3C6}' },
  { id: 'bankroll_2000', name: 'High Roller', description: 'Reach a $2,000 bankroll', icon: '\u{1F4B0}' },
  { id: 'bankroll_5000', name: 'Whale', description: 'Reach a $5,000 bankroll', icon: '\u{1F433}' },
  { id: 'first_double', name: 'Double Down', description: 'Double down for the first time', icon: '\u{270C}\u{FE0F}' },
  { id: 'first_split', name: 'Split Decision', description: 'Split a pair for the first time', icon: '\u{2702}\u{FE0F}' },
  { id: 'comeback', name: 'Comeback Kid', description: 'Win after a 5-loss streak', icon: '\u{1F4AB}' },
  { id: 'blackjack_5', name: 'Card Sharp', description: 'Get 5 Blackjacks total', icon: '\u{1F3B0}' },
  { id: 'blackjack_20', name: 'Lucky 21', description: 'Get 20 Blackjacks total', icon: '\u{2728}' },
  { id: 'first_surrender', name: 'Live to Fight', description: 'Surrender a hand', icon: '\u{1F3F3}\u{FE0F}' },
  { id: 'first_insurance', name: 'Playing It Safe', description: 'Take insurance', icon: '\u{1F6E1}\u{FE0F}' },
]

export function getAchievementDefs(): AchievementDef[] {
  return ACHIEVEMENT_DEFS
}

export function createInitialAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFS.map(def => ({
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    unlockedAt: null,
  }))
}

export interface AchievementCheckContext {
  detailedStats: DetailedStats
  chips: number
  result: GameResult
  extra?: {
    isBlackjack?: boolean
    isDouble?: boolean
    isSplit?: boolean
    isSurrender?: boolean
    insuranceTaken?: boolean
  }
}

/** Check which achievements should be unlocked given current state. Returns IDs of newly unlocked. */
export function checkAchievements(
  achievements: Achievement[],
  ctx: AchievementCheckContext
): string[] {
  const { detailedStats, chips, result, extra } = ctx
  const newlyUnlocked: string[] = []

  function tryUnlock(id: string): void {
    const a = achievements.find(a => a.id === id)
    if (a && !a.unlockedAt) {
      newlyUnlocked.push(id)
    }
  }

  // First win
  if (result === 'win' || result === 'blackjack') {
    tryUnlock('first_win')
  }

  // First blackjack
  if (extra?.isBlackjack || result === 'blackjack') {
    tryUnlock('first_blackjack')
  }

  // Blackjack counts
  if (detailedStats.blackjackCount >= 5) tryUnlock('blackjack_5')
  if (detailedStats.blackjackCount >= 20) tryUnlock('blackjack_20')

  // Win streaks (currentWinStreak is already updated before this check)
  if (detailedStats.currentWinStreak >= 5) tryUnlock('streak_5')
  if (detailedStats.currentWinStreak >= 10) tryUnlock('streak_10')

  // Hands played
  if (detailedStats.totalHandsPlayed >= 50) tryUnlock('hands_50')
  if (detailedStats.totalHandsPlayed >= 100) tryUnlock('hands_100')
  if (detailedStats.totalHandsPlayed >= 500) tryUnlock('hands_500')

  // Bankroll milestones
  if (chips >= 2000) tryUnlock('bankroll_2000')
  if (chips >= 5000) tryUnlock('bankroll_5000')

  // First double
  if (extra?.isDouble || detailedStats.doubleCount >= 1) tryUnlock('first_double')

  // First split
  if (extra?.isSplit || detailedStats.splitCount >= 1) tryUnlock('first_split')

  // First surrender
  if (extra?.isSurrender || detailedStats.surrenderCount >= 1) tryUnlock('first_surrender')

  // First insurance
  if (extra?.insuranceTaken || detailedStats.insuranceTaken >= 1) tryUnlock('first_insurance')

  // Comeback: win after a 5+ loss streak (biggestLossStreak >= 5 and we just won)
  if (detailedStats.biggestLossStreak >= 5 && detailedStats.currentWinStreak === 1 && (result === 'win' || result === 'blackjack')) {
    // We just broke a loss streak with a win
    tryUnlock('comeback')
  }

  return newlyUnlocked
}
