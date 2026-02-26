import { useEffect, useState } from 'react'
import type { Achievement } from '../types'

interface AchievementToastProps {
  achievements: Achievement[]
}

interface ToastItem {
  achievement: Achievement
  key: number
}

let toastKey = 0

export default function AchievementToast({ achievements }: AchievementToastProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [shownIds, setShownIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const newToasts: ToastItem[] = []
    const newShownIds = new Set(shownIds)

    for (const a of achievements) {
      if (a.unlockedAt && !shownIds.has(a.id)) {
        newShownIds.add(a.id)
        newToasts.push({ achievement: a, key: ++toastKey })
      }
    }

    if (newToasts.length > 0) {
      setShownIds(newShownIds)
      setToasts(prev => [...prev, ...newToasts])
    }
  }, [achievements]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (toasts.length === 0) return
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1))
    }, 3500)
    return () => clearTimeout(timer)
  }, [toasts])

  if (toasts.length === 0) return null

  return (
    <div className="achievement-toast-container" role="log" aria-label="Achievement notifications" aria-live="polite">
      {toasts.slice(0, 3).map(t => (
        <div key={t.key} className="achievement-toast" role="alert">
          <span className="achievement-toast-icon" aria-hidden="true">{t.achievement.icon}</span>
          <div className="achievement-toast-text">
            <span className="achievement-toast-title">Achievement Unlocked!</span>
            <span className="achievement-toast-name">{t.achievement.name}</span>
            <span className="achievement-toast-desc">{t.achievement.description}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
