import { useRef, useEffect, useCallback, useState } from 'react'
import Card from './Card'
import { calculateScore } from '../utils/scoring'
import type { SplitHand } from '../types'

interface SplitHandsDisplayProps {
  splitHands: SplitHand[]
  activeHandIndex: number
  isPlaying: boolean
}

function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}

export default function SplitHandsDisplay({ splitHands, activeHandIndex, isPlaying }: SplitHandsDisplayProps) {
  const isMobile = useIsMobile()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [visibleIndex, setVisibleIndex] = useState(activeHandIndex)

  // Auto-scroll to active hand when it changes
  useEffect(() => {
    if (!isMobile || !scrollRef.current) return
    const container = scrollRef.current
    const children = container.children
    if (children[activeHandIndex]) {
      const child = children[activeHandIndex] as HTMLElement
      child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      setVisibleIndex(activeHandIndex)
    }
  }, [activeHandIndex, isMobile])

  // Track scroll position to update dot indicators
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const scrollLeft = container.scrollLeft
    const containerWidth = container.clientWidth

    let closestIndex = 0
    let closestDistance = Infinity

    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement
      const childCenter = el.offsetLeft + el.offsetWidth / 2
      const viewCenter = scrollLeft + containerWidth / 2
      const distance = Math.abs(childCenter - viewCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = i
      }
    })

    setVisibleIndex(closestIndex)
  }, [])

  // Navigate to a specific hand via dot tap
  const scrollToHand = useCallback((index: number) => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const children = container.children
    if (children[index]) {
      const child = children[index] as HTMLElement
      child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [])

  return (
    <div className="split-hands-wrapper" role="region" aria-label="Split hands">
      <div
        ref={scrollRef}
        className={`split-hands-container${isMobile ? ' split-hands-swipe' : ''}`}
        onScroll={isMobile ? handleScroll : undefined}
        aria-roledescription={isMobile ? 'carousel' : undefined}
      >
        {splitHands.map((hand, i) => {
          const score = calculateScore(hand.cards)
          const isActive = isPlaying && i === activeHandIndex
          const isBust = score > 21
          const resultClass = hand.result === 'win' ? 'split-win' : hand.result === 'lose' ? 'split-lose' : hand.result === 'push' ? 'split-push' : ''
          const handLabel = `Hand ${i + 1}${isActive ? ', currently playing' : ''}${isBust ? ', bust' : ''}, score: ${score}`

          return (
            <section
              key={i}
              className={`split-hand ${isActive ? 'split-hand-active' : ''} ${resultClass}`}
              aria-label={handLabel}
              aria-current={isActive ? 'true' : undefined}
              role={isMobile ? 'group' : undefined}
              aria-roledescription={isMobile ? 'slide' : undefined}
            >
              <div className="hand-header">
                <span className="hand-title">Hand {i + 1}</span>
                {hand.cards.length > 0 && (
                  <span className={`score-pill ${isBust ? 'bust' : ''}`} aria-label={`Score: ${score}${isBust ? ', bust' : ''}`}>{score}</span>
                )}
                {hand.result && (
                  <span className={`split-result-badge split-result-${hand.result}`}>
                    {hand.result === 'win' ? 'Win' : hand.result === 'lose' ? 'Lose' : 'Push'}
                  </span>
                )}
              </div>
              <div className="cards-row" role="list" aria-label={`Hand ${i + 1} cards`}>
                {hand.cards.map((card, ci) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={ci}
                    animationType={ci < 2 ? 'none' : 'hit'}
                  />
                ))}
              </div>
              <div className="split-bet-tag" aria-label={`Bet: $${hand.bet}`}>Bet: ${hand.bet}</div>
            </section>
          )
        })}
      </div>
      {isMobile && splitHands.length > 1 && (
        <div className="split-swipe-dots" role="tablist" aria-label="Split hand navigation">
          {splitHands.map((_, i) => (
            <button
              key={i}
              className={`split-swipe-dot${visibleIndex === i ? ' split-swipe-dot-active' : ''}`}
              onClick={() => scrollToHand(i)}
              role="tab"
              aria-selected={visibleIndex === i}
              aria-label={`Go to hand ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
