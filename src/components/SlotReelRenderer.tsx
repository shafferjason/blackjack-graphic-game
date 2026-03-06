/**
 * PixiJS-powered slot reel renderer.
 * Renders 3 vertical reel strips with custom symbol art,
 * motion blur during spin, and elastic settle on landing.
 */
import { useRef, useEffect, useCallback } from 'react'
import { Application, Container, Graphics, Text, TextStyle, BlurFilter } from 'pixi.js'
import type { SlotSymbol } from '../hooks/useSlots'

// ── Symbol visual config ──

const SYMBOL_GLYPHS: Record<SlotSymbol, { emoji: string; color: number }> = {
  '7':       { emoji: '7',  color: 0xFF2D55 },
  'BAR':     { emoji: 'B',  color: 0xB44DFF },
  'cherry':  { emoji: '\uD83C\uDF52', color: 0xFF4081 },
  'bell':    { emoji: '\uD83D\uDD14', color: 0xFFD700 },
  'lemon':   { emoji: '\uD83C\uDF4B', color: 0xFFEB3B },
  'grape':   { emoji: '\uD83C\uDF47', color: 0xAB47BC },
  'diamond': { emoji: '\uD83D\uDC8E', color: 0x00E5FF },
  'star':    { emoji: '\u2B50', color: 0xFFC107 },
}

const ALL_SYMBOLS: SlotSymbol[] = ['7', 'BAR', 'cherry', 'bell', 'lemon', 'grape', 'diamond', 'star']

// ── Layout constants ──

const REEL_COUNT = 3
const SYMBOL_HEIGHT = 100
const VISIBLE_ROWS = 1  // Only the center row is the "payline"
const REEL_WIDTH = 110
const REEL_GAP = 8
const CANVAS_WIDTH = REEL_COUNT * REEL_WIDTH + (REEL_COUNT - 1) * REEL_GAP + 20
const CANVAS_HEIGHT = SYMBOL_HEIGHT * 3 // Show 3 rows for context (top, center, bottom)
const STRIP_LENGTH = 24 // symbols in each virtual reel strip
const SPIN_SPEED_MAX = 45 // px per frame at peak
const SPIN_ACCEL_FRAMES = 12
const SETTLE_DURATION_MS = 400

interface SlotReelRendererProps {
  reels: SlotSymbol[]
  spinning: boolean
  stoppedReels: [boolean, boolean, boolean]
  winningReels: boolean[]
  isJackpot: boolean
  isWin: boolean
  onReelLand?: (index: number) => void
}

// ── Elastic ease-out for settle bounce ──
function elasticOut(t: number): number {
  if (t === 0 || t === 1) return t
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1
}

// ── Build a random reel strip with target symbol at a specific position ──
function buildStrip(targetSymbol: SlotSymbol): SlotSymbol[] {
  const strip: SlotSymbol[] = []
  for (let i = 0; i < STRIP_LENGTH; i++) {
    strip.push(ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)])
  }
  // Place target at the landing position (we'll stop so this index is centered)
  const landIndex = Math.floor(STRIP_LENGTH / 2)
  strip[landIndex] = targetSymbol
  // Also place neighbors for visual context
  strip[landIndex - 1] = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]
  strip[landIndex + 1] = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]
  return strip
}

export default function SlotReelRenderer({
  reels,
  spinning,
  stoppedReels,
  winningReels,
  isJackpot,
  isWin,
  onReelLand,
}: SlotReelRendererProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const reelContainersRef = useRef<Container[]>([])
  const blurFiltersRef = useRef<BlurFilter[]>([])
  const animStateRef = useRef<{
    strips: SlotSymbol[][]
    velocities: number[]
    phases: ('idle' | 'accel' | 'spinning' | 'decel' | 'settle')[]
    accelFrame: number[]
    settleStart: number[]
    settleFrom: number[]
    targetY: number[]
    currentY: number[]
    landed: boolean[]
  }>({
    strips: [[], [], []],
    velocities: [0, 0, 0],
    phases: ['idle', 'idle', 'idle'],
    accelFrame: [0, 0, 0],
    settleStart: [0, 0, 0],
    settleFrom: [0, 0, 0],
    targetY: [0, 0, 0],
    currentY: [0, 0, 0],
    landed: [true, true, true],
  })
  const winGlowRef = useRef<Graphics[]>([])
  const prevSpinningRef = useRef(false)
  const prevStoppedRef = useRef<[boolean, boolean, boolean]>([true, true, true])

  // ── Initialize PixiJS app ──
  const initApp = useCallback(async () => {
    if (!canvasRef.current || appRef.current) return

    const app = new Application()
    await app.init({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    })

    canvasRef.current.appendChild(app.canvas as HTMLCanvasElement)
    appRef.current = app

    // Create reel containers
    for (let r = 0; r < REEL_COUNT; r++) {
      const reelContainer = new Container()
      reelContainer.x = 10 + r * (REEL_WIDTH + REEL_GAP)
      reelContainer.y = 0
      app.stage.addChild(reelContainer)
      reelContainersRef.current.push(reelContainer)

      // Blur filter per reel (vertical only)
      const blur = new BlurFilter({ strengthY: 0, strengthX: 0 })
      reelContainer.filters = [blur]
      blurFiltersRef.current.push(blur)

      // Win glow overlay per reel
      const glow = new Graphics()
      glow.rect(0, SYMBOL_HEIGHT, REEL_WIDTH, SYMBOL_HEIGHT)
      glow.fill({ color: 0x39FF8E, alpha: 0 })
      glow.x = 10 + r * (REEL_WIDTH + REEL_GAP)
      glow.y = 0
      app.stage.addChild(glow)
      winGlowRef.current.push(glow)
    }

    // Render initial idle symbols
    renderIdleSymbols(reels)

    // Main animation ticker
    app.ticker.add(() => {
      const st = animStateRef.current
      const now = performance.now()

      for (let r = 0; r < REEL_COUNT; r++) {
        const phase = st.phases[r]

        if (phase === 'accel') {
          st.accelFrame[r]++
          const progress = Math.min(st.accelFrame[r] / SPIN_ACCEL_FRAMES, 1)
          st.velocities[r] = progress * SPIN_SPEED_MAX
          if (progress >= 1) st.phases[r] = 'spinning'
          updateReelScroll(r, st.velocities[r])
          blurFiltersRef.current[r].strengthY = st.velocities[r] * 0.35
        } else if (phase === 'spinning') {
          updateReelScroll(r, SPIN_SPEED_MAX)
          blurFiltersRef.current[r].strengthY = SPIN_SPEED_MAX * 0.35
        } else if (phase === 'decel') {
          // Quick decel to position, then settle
          st.velocities[r] *= 0.85
          if (st.velocities[r] < 2) {
            st.phases[r] = 'settle'
            st.settleStart[r] = now
            st.settleFrom[r] = st.currentY[r]
          }
          updateReelScroll(r, st.velocities[r])
          blurFiltersRef.current[r].strengthY = st.velocities[r] * 0.35
        } else if (phase === 'settle') {
          const elapsed = now - st.settleStart[r]
          const t = Math.min(elapsed / SETTLE_DURATION_MS, 1)
          const eased = elasticOut(t)
          st.currentY[r] = st.settleFrom[r] + (st.targetY[r] - st.settleFrom[r]) * eased
          positionReelStrip(r, st.currentY[r])
          blurFiltersRef.current[r].strengthY = Math.max(0, (1 - t) * 4)

          if (t >= 1) {
            st.phases[r] = 'idle'
            st.velocities[r] = 0
            blurFiltersRef.current[r].strengthY = 0
            if (!st.landed[r]) {
              st.landed[r] = true
              onReelLand?.(r)
            }
          }
        }
      }

      // Win glow pulsing
      for (let r = 0; r < REEL_COUNT; r++) {
        const glow = winGlowRef.current[r]
        if (winningReels[r] && st.phases[r] === 'idle') {
          const pulse = 0.12 + 0.08 * Math.sin(now * 0.004)
          glow.alpha = pulse
          if (isJackpot) {
            glow.tint = 0xFFD700
            glow.alpha = 0.18 + 0.12 * Math.sin(now * 0.006)
          }
        } else {
          glow.alpha = 0
        }
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render idle (static) symbols ──
  const renderIdleSymbols = useCallback((symbols: SlotSymbol[]) => {
    for (let r = 0; r < REEL_COUNT; r++) {
      const container = reelContainersRef.current[r]
      if (!container) continue
      container.removeChildren()

      // Draw 3 rows: above, center (payline), below
      for (let row = -1; row <= 1; row++) {
        const sym = row === 0 ? symbols[r] : ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]
        const tile = createSymbolTile(sym, row === 0)
        tile.y = (row + 1) * SYMBOL_HEIGHT
        container.addChild(tile)
      }
    }
  }, [])

  // ── Build reel strip graphics ──
  const buildReelStripGraphics = useCallback((reelIndex: number) => {
    const container = reelContainersRef.current[reelIndex]
    if (!container) return
    container.removeChildren()

    const strip = animStateRef.current.strips[reelIndex]
    for (let i = 0; i < strip.length; i++) {
      const tile = createSymbolTile(strip[i], false)
      tile.y = i * SYMBOL_HEIGHT
      container.addChild(tile)
    }
  }, [])

  // ── Scroll reel during spin ──
  const updateReelScroll = useCallback((reelIndex: number, speed: number) => {
    const st = animStateRef.current
    st.currentY[reelIndex] += speed
    const stripHeight = st.strips[reelIndex].length * SYMBOL_HEIGHT
    if (st.currentY[reelIndex] > stripHeight) {
      st.currentY[reelIndex] -= stripHeight
    }
    positionReelStrip(reelIndex, st.currentY[reelIndex])
  }, [])

  // ── Position reel strip (scroll offset) ──
  const positionReelStrip = useCallback((reelIndex: number, scrollY: number) => {
    const container = reelContainersRef.current[reelIndex]
    if (!container) return
    // The container scrolls downward. Negate for upward reel motion.
    container.y = -scrollY
    // Wrap children for infinite scroll illusion
    const stripHeight = animStateRef.current.strips[reelIndex].length * SYMBOL_HEIGHT
    container.children.forEach((child) => {
      const worldY = child.y - scrollY
      if (worldY < -SYMBOL_HEIGHT * 2) {
        child.y += stripHeight
      } else if (worldY > CANVAS_HEIGHT + SYMBOL_HEIGHT) {
        child.y -= stripHeight
      }
    })
  }, [])

  // ── Start spinning ──
  useEffect(() => {
    if (spinning && !prevSpinningRef.current) {
      const st = animStateRef.current
      for (let r = 0; r < REEL_COUNT; r++) {
        st.strips[r] = buildStrip(reels[r])
        buildReelStripGraphics(r)
        st.phases[r] = 'accel'
        st.accelFrame[r] = 0
        st.velocities[r] = 0
        st.currentY[r] = 0
        st.landed[r] = false

        // Target Y: center the landing symbol in the viewport
        const landIndex = Math.floor(STRIP_LENGTH / 2)
        st.targetY[r] = landIndex * SYMBOL_HEIGHT - SYMBOL_HEIGHT // offset so center row aligns
      }
    }
    prevSpinningRef.current = spinning
  }, [spinning, reels, buildReelStripGraphics])

  // ── Stop individual reels ──
  useEffect(() => {
    for (let r = 0; r < REEL_COUNT; r++) {
      if (stoppedReels[r] && !prevStoppedRef.current[r]) {
        const st = animStateRef.current
        if (st.phases[r] === 'spinning' || st.phases[r] === 'accel') {
          st.phases[r] = 'decel'
        }
      }
    }
    prevStoppedRef.current = [...stoppedReels] as [boolean, boolean, boolean]
  }, [stoppedReels])

  // ── Re-render idle when results change and not spinning ──
  useEffect(() => {
    if (!spinning && animStateRef.current.phases.every(p => p === 'idle')) {
      renderIdleSymbols(reels)
    }
  }, [reels, spinning, renderIdleSymbols])

  // ── Mount/unmount ──
  useEffect(() => {
    initApp()
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
        reelContainersRef.current = []
        blurFiltersRef.current = []
        winGlowRef.current = []
      }
    }
  }, [initApp])

  return (
    <div
      ref={canvasRef}
      className="slots-pixi-canvas"
      aria-hidden="true"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    />
  )
}

// ── Create a symbol tile (container with bg + text) ──
function createSymbolTile(symbol: SlotSymbol, isCenter: boolean): Container {
  const container = new Container()
  const config = SYMBOL_GLYPHS[symbol]

  // Background tile
  const bg = new Graphics()
  bg.roundRect(2, 2, REEL_WIDTH - 4, SYMBOL_HEIGHT - 4, 6)
  if (isCenter) {
    bg.fill({ color: 0x1a0f30, alpha: 0.9 })
    bg.stroke({ color: config.color, width: 1.5, alpha: 0.5 })
  } else {
    bg.fill({ color: 0x0d0620, alpha: 0.7 })
  }
  container.addChild(bg)

  // Symbol text
  const isEmoji = symbol === 'cherry' || symbol === 'bell' || symbol === 'lemon' || symbol === 'grape' || symbol === 'diamond' || symbol === 'star'
  const style = new TextStyle({
    fontFamily: isEmoji ? 'system-ui, sans-serif' : '"Oswald", "Impact", sans-serif',
    fontSize: symbol === '7' ? 52 : symbol === 'BAR' ? 36 : 44,
    fontWeight: (symbol === '7' || symbol === 'BAR') ? 'bold' : 'normal',
    fill: symbol === '7' || symbol === 'BAR' ? config.color : 0xFFFFFF,
    dropShadow: isCenter ? {
      color: config.color,
      blur: 8,
      distance: 0,
      alpha: 0.6,
    } : undefined,
  })

  const label = symbol === 'BAR' ? 'BAR' : config.emoji
  const text = new Text({ text: label, style })
  text.anchor.set(0.5)
  text.x = REEL_WIDTH / 2
  text.y = SYMBOL_HEIGHT / 2
  container.addChild(text)

  return container
}
