import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameResult, GamePhase } from '../types'
import './CelebrationEffects.css'

interface CelebrationEffectsProps {
  result: GameResult | null
  gameState: GamePhase
  winAmount: number
  bet: number
}

interface Particle {
  id: number
  dx: number
  dy: number
  size: number
}

interface ConfettiPiece {
  id: number
  left: number
  color: string
  delay: number
  sway: number
  spin: number
  fallDuration: number
  fallDist: number
}

type ActiveEffect = 'blackjack' | 'bust' | 'bigwin' | null

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#F8B500', '#FF4081']
const PARTICLE_COUNT = 24
const CONFETTI_COUNT = 40
const EFFECT_CLEANUP_MS = 2000

export default function CelebrationEffects({ result, gameState, winAmount, bet }: CelebrationEffectsProps) {
  const [activeEffect, setActiveEffect] = useState<ActiveEffect>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const idRef = useRef(0)
  const prevResultRef = useRef<GameResult | null>(null)
  const prevGameStateRef = useRef<GamePhase>(gameState)
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearEffects = useCallback(() => {
    setActiveEffect(null)
    setParticles([])
    setConfetti([])
  }, [])

  useEffect(() => {
    const wasGameOver = prevGameStateRef.current === 'game_over'
    const isGameOver = gameState === 'game_over'
    prevGameStateRef.current = gameState

    // Only trigger on fresh game_over transitions with a new result
    if (!isGameOver || wasGameOver) return
    if (result === prevResultRef.current) return
    prevResultRef.current = result

    // Clear any lingering effects
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current)
    clearEffects()

    if (result === 'blackjack') {
      // Gold particle burst
      const newParticles: Particle[] = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2
        const speed = 20 + Math.random() * 30
        newParticles.push({
          id: ++idRef.current,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed - 10,
          size: 4 + Math.random() * 6,
        })
      }
      setParticles(newParticles)
      setActiveEffect('blackjack')
    } else if (result === 'lose') {
      setActiveEffect('bust')
    } else if (result === 'win' && bet > 0 && winAmount > bet * 2) {
      // Big win: net gain exceeds a standard 1:1 payout (e.g. double down wins)
      const pieces: ConfettiPiece[] = []
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        pieces.push({
          id: ++idRef.current,
          left: Math.random() * 100,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          delay: Math.random() * 0.4,
          sway: (Math.random() - 0.5) * 60,
          spin: 360 + Math.random() * 720,
          fallDuration: 1.2 + Math.random() * 0.6,
          fallDist: 300 + Math.random() * 200,
        })
      }
      setConfetti(pieces)
      setActiveEffect('bigwin')
    }

    cleanupTimerRef.current = setTimeout(clearEffects, EFFECT_CLEANUP_MS)

    return () => {
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current)
    }
  }, [gameState, result, winAmount, bet, clearEffects])

  // Reset prevResultRef when leaving game_over so next round can trigger
  useEffect(() => {
    if (gameState !== 'game_over') {
      prevResultRef.current = null
    }
  }, [gameState])

  if (!activeEffect) return null

  return (
    <div className="celebration-layer" aria-hidden="true">
      {activeEffect === 'blackjack' && (
        <>
          {particles.map(p => (
            <div
              key={p.id}
              className="gold-particle"
              style={{
                left: '50%',
                top: '40%',
                width: p.size,
                height: p.size,
                ['--dx' as string]: `${p.dx}px`,
                ['--dy' as string]: `${p.dy}px`,
              }}
            />
          ))}
          <div className="blackjack-text">BLACKJACK!</div>
        </>
      )}

      {activeEffect === 'bust' && (
        <div className="bust-flash" />
      )}

      {activeEffect === 'bigwin' && (
        <>
          {confetti.map(c => (
            <div
              key={c.id}
              className="confetti-piece"
              style={{
                left: `${c.left}%`,
                backgroundColor: c.color,
                ['--delay' as string]: `${c.delay}s`,
                ['--sway' as string]: `${c.sway}px`,
                ['--spin' as string]: `${c.spin}deg`,
                ['--fall-duration' as string]: `${c.fallDuration}s`,
                ['--fall-dist' as string]: `${c.fallDist}px`,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
