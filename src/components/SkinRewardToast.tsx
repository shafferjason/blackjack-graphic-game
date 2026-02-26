import { useEffect, useState } from 'react'
import { getSkinById } from '../utils/cardSkinShop'

interface SkinRewardToastProps {
  skinIds: string[]
}

interface ToastItem {
  skinId: string
  skinName: string
  key: number
}

let toastKey = 0

export default function SkinRewardToast({ skinIds }: SkinRewardToastProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [shownIds, setShownIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const newToasts: ToastItem[] = []
    const newShownIds = new Set(shownIds)

    for (const id of skinIds) {
      if (!shownIds.has(id)) {
        newShownIds.add(id)
        const skin = getSkinById(id)
        if (skin) {
          newToasts.push({ skinId: id, skinName: skin.name, key: ++toastKey })
        }
      }
    }

    if (newToasts.length > 0) {
      setShownIds(newShownIds)
      setToasts(prev => [...prev, ...newToasts])
    }
  }, [skinIds]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (toasts.length === 0) return
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1))
    }, 4500)
    return () => clearTimeout(timer)
  }, [toasts])

  if (toasts.length === 0) return null

  return (
    <div className="skin-reward-toast-container" role="log" aria-label="Skin reward notifications" aria-live="assertive">
      {toasts.slice(0, 2).map(t => (
        <div key={t.key} className="skin-reward-toast" role="alert">
          <span className="skin-reward-toast-icon" aria-hidden="true">{'\uD83C\uDFA8'}</span>
          <div>
            <div style={{ fontWeight: 700 }}>Skin Unlocked!</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{t.skinName} — Achievement Reward</div>
          </div>
        </div>
      ))}
    </div>
  )
}
