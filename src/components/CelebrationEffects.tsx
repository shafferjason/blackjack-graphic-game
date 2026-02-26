import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameResult, GamePhase } from '../types'
import { loadCardSkinState, getSkinById, CARD_SKINS, type CardSkin } from '../utils/cardSkinShop'
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
  color: string
  shape?: 'circle' | 'petal' | 'diamond' | 'spark'
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

type CelebrationStyle = 'gold' | 'electric' | 'petals' | 'jewels' | 'fire' | 'cosmic' | 'shadow' | 'emerald'

// Skin-themed particle colors
const STYLE_PARTICLE_COLORS: Record<CelebrationStyle, string[]> = {
  gold: ['#FFD700', '#E8C040', '#F0D870', '#D4A644', '#C9A84C'],
  electric: ['#00FFCC', '#00E5B0', '#80FFE6', '#40FFCC', '#00DDAA'],
  petals: ['#F9A8D4', '#F472B6', '#FBD0E0', '#E88AAA', '#F7C0D8'],
  jewels: ['#E8C040', '#A0B0F0', '#F0D870', '#C8D0E0', '#D4A644'],
  fire: ['#FF6600', '#FF4400', '#FF8800', '#FFAA00', '#FF2200'],
  cosmic: ['#818CF8', '#A5B4FC', '#C084FC', '#F0C060', '#E0E7FF'],
  shadow: ['#9CA3AF', '#6B7280', '#D1D5DB', '#4B5563', '#E5E7EB'],
  emerald: ['#22C55E', '#4ADE80', '#86EFAC', '#16A34A', '#A3E635'],
}

// Skin-themed confetti colors
const STYLE_CONFETTI_COLORS: Record<CelebrationStyle, string[]> = {
  gold: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#F8B500', '#FF4081'],
  electric: ['#00FFCC', '#FF00AA', '#00E5B0', '#FF66CC', '#80FFE6', '#40FFCC', '#00DDAA', '#FF88DD'],
  petals: ['#F9A8D4', '#F472B6', '#FBD0E0', '#E88AAA', '#FFE0EC', '#D85888', '#FF90C0', '#F7C0D8'],
  jewels: ['#E8C040', '#4070C0', '#F0D870', '#C02020', '#D4A644', '#6090E0', '#F8D888', '#E04040'],
  fire: ['#FF6600', '#FF4400', '#FF8800', '#FFAA00', '#FF2200', '#FFCC00', '#FF3300', '#FF5500'],
  cosmic: ['#818CF8', '#A5B4FC', '#C084FC', '#F0C060', '#E0E7FF', '#6060C0', '#D0D0FF', '#B8B8F0'],
  shadow: ['#9CA3AF', '#6B7280', '#D1D5DB', '#4B5563', '#E5E7EB', '#374151', '#F3F4F6', '#1F2937'],
  emerald: ['#22C55E', '#4ADE80', '#86EFAC', '#16A34A', '#A3E635', '#84CC16', '#BBF7D0', '#15803D'],
}

// Skin-themed text glow
const STYLE_TEXT_GLOW: Record<CelebrationStyle, { color: string; glow: string }> = {
  gold: { color: 'var(--gold-light, #f0d68a)', glow: 'rgba(212, 166, 68, 0.6)' },
  electric: { color: '#80FFE6', glow: 'rgba(0, 255, 204, 0.6)' },
  petals: { color: '#F9A8D4', glow: 'rgba(244, 114, 182, 0.6)' },
  jewels: { color: '#F0D870', glow: 'rgba(232, 192, 64, 0.6)' },
  fire: { color: '#FFAA00', glow: 'rgba(255, 102, 0, 0.6)' },
  cosmic: { color: '#C084FC', glow: 'rgba(129, 140, 248, 0.6)' },
  shadow: { color: '#D1D5DB', glow: 'rgba(107, 114, 128, 0.6)' },
  emerald: { color: '#86EFAC', glow: 'rgba(34, 197, 94, 0.6)' },
}

const PARTICLE_COUNT = 24
const CONFETTI_COUNT = 40
const EFFECT_CLEANUP_MS = 2000

function getActiveCelebrationStyle(): CelebrationStyle {
  const state = loadCardSkinState()
  const skin = getSkinById(state.activeSkinId) ?? CARD_SKINS[0]
  return (skin.celebrationStyle as CelebrationStyle) || 'gold'
}

export default function CelebrationEffects({ result, gameState, winAmount, bet }: CelebrationEffectsProps) {
  const [activeEffect, setActiveEffect] = useState<ActiveEffect>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [celebStyle, setCelebStyle] = useState<CelebrationStyle>('gold')
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

    if (!isGameOver || wasGameOver) return
    if (result === prevResultRef.current) return
    prevResultRef.current = result

    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current)
    clearEffects()

    const style = getActiveCelebrationStyle()
    setCelebStyle(style)
    const particleColors = STYLE_PARTICLE_COLORS[style]
    const confettiColors = STYLE_CONFETTI_COLORS[style]

    if (result === 'blackjack') {
      const newParticles: Particle[] = []
      const shapes: Particle['shape'][] = style === 'petals' ? ['petal'] : style === 'jewels' ? ['diamond'] : style === 'electric' ? ['spark'] : ['circle']
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2
        const speed = 20 + Math.random() * 30
        newParticles.push({
          id: ++idRef.current,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed - 10,
          size: 4 + Math.random() * 6,
          color: particleColors[i % particleColors.length],
          shape: shapes[i % shapes.length],
        })
      }
      setParticles(newParticles)
      setActiveEffect('blackjack')
    } else if (result === 'lose') {
      setActiveEffect('bust')
    } else if (result === 'win' && bet > 0 && winAmount > bet * 2) {
      const pieces: ConfettiPiece[] = []
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        pieces.push({
          id: ++idRef.current,
          left: Math.random() * 100,
          color: confettiColors[i % confettiColors.length],
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

  useEffect(() => {
    if (gameState !== 'game_over') {
      prevResultRef.current = null
    }
  }, [gameState])

  if (!activeEffect) return null

  const textGlow = STYLE_TEXT_GLOW[celebStyle]
  const particleShape = celebStyle === 'petals' ? 'petal' : celebStyle === 'jewels' ? 'diamond' : celebStyle === 'electric' ? 'spark' : 'circle'

  return (
    <div className="celebration-layer" aria-hidden="true">
      {activeEffect === 'blackjack' && (
        <>
          {particles.map(p => (
            <div
              key={p.id}
              className={`gold-particle particle-${p.shape || 'circle'}`}
              style={{
                left: '50%',
                top: '40%',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 6px ${p.color}`,
                ['--dx' as string]: `${p.dx}px`,
                ['--dy' as string]: `${p.dy}px`,
              }}
            />
          ))}
          <div
            className="blackjack-text"
            style={{
              color: textGlow.color,
              textShadow: `0 0 20px ${textGlow.glow}, 0 0 40px ${textGlow.glow}80, 0 2px 4px rgba(0,0,0,0.5)`,
            }}
          >
            BLACKJACK!
          </div>
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
