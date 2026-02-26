// ── Canvas 2D Character Art Engine ──
// Generates illustrated face-card characters on a 600×840 canvas,
// exports as WebP data URLs for use as card background images.
// This is the rendering pipeline specified in CLAUDE.md.

export type FaceRank = 'J' | 'Q' | 'K' | 'A'
export type SkinId = string

export interface CanvasCharacterOptions {
  rank: FaceRank
  skinId: SkinId
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
}

// Cache generated WebP data URLs to avoid re-rendering
const artCache = new Map<string, string>()

function cacheKey(opts: CanvasCharacterOptions): string {
  return `${opts.skinId}:${opts.rank}:${opts.suit}`
}

/** Clear all cached character art (for dev/testing) */
export function clearArtCache(): void {
  artCache.clear()
}

/**
 * Generate character art for a face card.
 * Returns a WebP data URL ready to use as background-image.
 * Returns empty string in test environments without Canvas support.
 */
export function generateCharacterArt(opts: CanvasCharacterOptions): string {
  const key = cacheKey(opts)
  const cached = artCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 840
  const ctx = canvas.getContext('2d')

  // In test environments (jsdom), Canvas 2D context is not available
  if (!ctx) return ''

  // Dispatch to skin-specific drawing function
  const drawFn = SKIN_DRAW_MAP[opts.skinId]
  if (drawFn) {
    drawFn(ctx, opts.rank, opts.suit)
  } else {
    // Fallback: draw a simple gradient card for unknown skins
    drawFallback(ctx, opts.rank)
  }

  const dataUrl = canvas.toDataURL('image/webp', 0.82)
  artCache.set(key, dataUrl)
  return dataUrl
}

/**
 * Check if a skin has Canvas 2D character art implemented.
 * If false, the card component should use the legacy SVG rendering.
 */
export function hasCanvasArt(skinId: string): boolean {
  return skinId in SKIN_DRAW_MAP
}

// ── Drawing dispatch table ──
type DrawFunction = (ctx: CanvasRenderingContext2D, rank: FaceRank, suit: string) => void

const SKIN_DRAW_MAP: Record<string, DrawFunction> = {
  'classic': drawClassic,
  'neon-nights': drawNeonNights,
  'velvet-noir': drawVelvetNoir,
  'shadow-dynasty': drawShadowDynasty,
  'sakura-bloom': drawSakuraBloom,
  'blood-moon': drawBloodMoon,
  'gilded-serpent': drawGildedSerpent,
}
// NOTE: Do not add entries for skins without draw functions below.
// Unimplemented skins use the SVG fallback path in Card.tsx.

// ── Fallback ──
function drawFallback(ctx: CanvasRenderingContext2D, rank: FaceRank) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#333')
  bg.addColorStop(1, '#111')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)
  ctx.fillStyle = '#888'
  ctx.font = 'bold 120px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(rank, 300, 420)
}


// ═══════════════════════════════════════════════════════════════
// CLASSIC SKIN — Card Maker's Workshop
// ═══════════════════════════════════════════════════════════════

function drawClassic(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawClassicJack(ctx); break
    case 'Q': drawClassicQueen(ctx); break
    case 'K': drawClassicKing(ctx); break
    case 'A': drawClassicAce(ctx); break
  }
}

// ── Shared workshop environment ──
function drawWorkshopBackground(ctx: CanvasRenderingContext2D) {
  // Warm workshop base
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#3A2A1A')
  bg.addColorStop(0.3, '#4A3828')
  bg.addColorStop(0.6, '#3D2D1E')
  bg.addColorStop(1, '#2A1C10')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Wood grain texture
  ctx.globalAlpha = 0.06
  for (let y = 0; y < 840; y += 12) {
    ctx.strokeStyle = '#5C4033'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x < 600; x += 30) {
      ctx.lineTo(x + 15, y + Math.sin(x * 0.02 + y * 0.01) * 3)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Warm ambient light from candle/window (upper left)
  const warmGlow = ctx.createRadialGradient(150, 200, 50, 250, 300, 400)
  warmGlow.addColorStop(0, 'rgba(255, 220, 160, 0.12)')
  warmGlow.addColorStop(0.5, 'rgba(200, 160, 100, 0.06)')
  warmGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = warmGlow
  ctx.fillRect(0, 0, 600, 840)
}

function drawClassicJack(ctx: CanvasRenderingContext2D) {
  // ── Background: Workshop interior ──
  drawWorkshopBackground(ctx)

  // Cards hanging on drying lines
  ctx.globalAlpha = 0.15
  // Line 1
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, 80)
  ctx.lineTo(560, 95)
  ctx.stroke()
  // Hanging cards
  for (let i = 0; i < 4; i++) {
    const x = 100 + i * 120
    ctx.fillStyle = '#F5F0E0'
    ctx.save()
    ctx.translate(x, 95)
    ctx.rotate(-0.05 + i * 0.03)
    ctx.fillRect(-15, 0, 30, 42)
    ctx.strokeStyle = '#5C4033'
    ctx.lineWidth = 0.5
    ctx.strokeRect(-15, 0, 30, 42)
    ctx.restore()
  }
  ctx.globalAlpha = 1

  // Wooden workbench at bottom
  const bench = ctx.createLinearGradient(0, 620, 0, 840)
  bench.addColorStop(0, '#5C4033')
  bench.addColorStop(0.1, '#6B4D38')
  bench.addColorStop(0.5, '#4A3328')
  bench.addColorStop(1, '#3A2518')
  ctx.fillStyle = bench
  ctx.fillRect(0, 620, 600, 220)
  // Bench edge highlight
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 622)
  ctx.lineTo(600, 622)
  ctx.stroke()

  // ── The Apprentice — young man, ink-smudged, holding pressed card + carving tool ──

  // BODY — leather apron over simple shirt
  // Shirt (cream linen)
  const shirt = ctx.createLinearGradient(200, 300, 400, 560)
  shirt.addColorStop(0, '#E8DCC8')
  shirt.addColorStop(1, '#D4C5A0')
  ctx.fillStyle = shirt
  ctx.beginPath()
  ctx.moveTo(210, 340)
  ctx.quadraticCurveTo(300, 310, 390, 340)
  ctx.lineTo(380, 580)
  ctx.quadraticCurveTo(300, 600, 220, 580)
  ctx.closePath()
  ctx.fill()

  // Leather apron
  const apron = ctx.createLinearGradient(230, 360, 370, 580)
  apron.addColorStop(0, '#6B4D38')
  apron.addColorStop(0.5, '#5C4033')
  apron.addColorStop(1, '#4A3328')
  ctx.fillStyle = apron
  ctx.beginPath()
  ctx.moveTo(240, 370)
  ctx.lineTo(360, 370)
  ctx.lineTo(350, 590)
  ctx.quadraticCurveTo(300, 610, 250, 590)
  ctx.closePath()
  ctx.fill()

  // Apron strap across chest
  ctx.strokeStyle = '#5C4033'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(240, 370)
  ctx.lineTo(300, 330)
  ctx.lineTo(360, 370)
  ctx.stroke()

  // Apron stitching detail
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(248, 380)
  ctx.lineTo(352, 380)
  ctx.stroke()
  ctx.setLineDash([])

  // ── HEAD — young man, messy hair pushed back ──
  // Neck
  ctx.fillStyle = '#C68B5B'
  ctx.fillRect(280, 290, 40, 50)

  // Head shape — youthful oval
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 250, 52, 60, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — messy, pushed back, brown
  ctx.fillStyle = '#6E4424'
  ctx.beginPath()
  ctx.ellipse(300, 210, 56, 38, 0, Math.PI, 0)
  ctx.fill()
  // Messy front strands
  ctx.beginPath()
  ctx.moveTo(252, 220)
  ctx.quadraticCurveTo(260, 200, 275, 218)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(310, 215)
  ctx.quadraticCurveTo(330, 195, 345, 220)
  ctx.fill()
  // Hair highlight
  ctx.fillStyle = '#8A5A38'
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.ellipse(290, 205, 25, 12, -0.2, Math.PI, 0)
  ctx.fill()
  ctx.globalAlpha = 1

  // Forehead highlight
  const fhGlow = ctx.createRadialGradient(300, 230, 5, 300, 230, 30)
  fhGlow.addColorStop(0, 'rgba(240, 220, 190, 0.2)')
  fhGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = fhGlow
  ctx.fillRect(260, 210, 80, 40)

  // EYES — round, eager (slightly wide)
  // Whites
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(280, 252, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(320, 252, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  // Iris — brown
  ctx.fillStyle = '#5C3D1A'
  ctx.beginPath()
  ctx.arc(281, 252, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(321, 252, 4, 0, Math.PI * 2)
  ctx.fill()
  // Pupil
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.arc(282, 251, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(322, 251, 2, 0, Math.PI * 2)
  ctx.fill()
  // Catchlight
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(279, 250, 1.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 250, 1.2, 0, Math.PI * 2)
  ctx.fill()

  // Eyebrows — slightly raised (eager)
  ctx.strokeStyle = '#5C3D1A'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(270, 242)
  ctx.quadraticCurveTo(280, 237, 290, 241)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(310, 241)
  ctx.quadraticCurveTo(320, 237, 330, 242)
  ctx.stroke()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 250)
  ctx.lineTo(296, 268)
  ctx.stroke()
  // Nostril hint
  ctx.beginPath()
  ctx.arc(294, 268, 3, 0.5, Math.PI - 0.5)
  ctx.stroke()

  // Mouth — slight eager smile
  ctx.strokeStyle = '#8B5E3C'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(283, 278)
  ctx.quadraticCurveTo(300, 288, 317, 278)
  ctx.stroke()
  // Lip color
  ctx.fillStyle = '#B87060'
  ctx.beginPath()
  ctx.moveTo(285, 279)
  ctx.quadraticCurveTo(300, 286, 315, 279)
  ctx.quadraticCurveTo(300, 282, 285, 279)
  ctx.fill()

  // Ink smudges on face
  ctx.fillStyle = 'rgba(30, 20, 10, 0.12)'
  ctx.beginPath()
  ctx.ellipse(340, 260, 8, 5, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(268, 275, 5, 3, -0.2, 0, Math.PI * 2)
  ctx.fill()

  // ── ARMS + HANDS ──
  // Right arm — holding freshly pressed card
  ctx.strokeStyle = '#E8DCC8'
  ctx.lineWidth = 24
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(380, 380)
  ctx.quadraticCurveTo(420, 430, 400, 500)
  ctx.stroke()

  // Right hand
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(400, 505, 16, 0, Math.PI * 2)
  ctx.fill()

  // Freshly pressed card in right hand
  ctx.save()
  ctx.translate(410, 480)
  ctx.rotate(0.15)
  ctx.fillStyle = '#F5F0E0'
  ctx.fillRect(-20, -28, 40, 56)
  ctx.strokeStyle = '#5C4033'
  ctx.lineWidth = 1
  ctx.strokeRect(-20, -28, 40, 56)
  // Small suit symbol on card
  ctx.fillStyle = '#a41428'
  ctx.font = '14px serif'
  ctx.textAlign = 'center'
  ctx.fillText('♥', 0, 5)
  ctx.restore()

  // Left arm — holding carving tool
  ctx.strokeStyle = '#E8DCC8'
  ctx.lineWidth = 22
  ctx.beginPath()
  ctx.moveTo(220, 380)
  ctx.quadraticCurveTo(180, 430, 200, 500)
  ctx.stroke()

  // Left hand
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(200, 505, 15, 0, Math.PI * 2)
  ctx.fill()

  // Carving tool in left hand
  ctx.save()
  ctx.translate(195, 475)
  ctx.rotate(-0.3)
  // Handle
  ctx.fillStyle = '#5C4033'
  ctx.fillRect(-4, -40, 8, 50)
  // Metal blade
  ctx.fillStyle = '#B0B8B8'
  ctx.beginPath()
  ctx.moveTo(-5, -40)
  ctx.lineTo(0, -58)
  ctx.lineTo(5, -40)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#D0D8D8'
  ctx.lineWidth = 0.5
  ctx.stroke()
  ctx.restore()

  // Ink pots on workbench
  ctx.fillStyle = '#1A1A1A'
  for (const x of [100, 470, 520]) {
    ctx.beginPath()
    ctx.ellipse(x, 635, 18, 12, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#333333'
    ctx.beginPath()
    ctx.ellipse(x, 632, 16, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1A1A1A'
  }

  // Candle glow at left
  const candleGlow = ctx.createRadialGradient(80, 200, 5, 80, 200, 120)
  candleGlow.addColorStop(0, 'rgba(255, 200, 100, 0.15)')
  candleGlow.addColorStop(0.5, 'rgba(255, 180, 80, 0.06)')
  candleGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = candleGlow
  ctx.fillRect(0, 80, 300, 300)

  // Candle
  ctx.fillStyle = '#F5F0E0'
  ctx.fillRect(72, 160, 16, 60)
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.ellipse(80, 155, 5, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFF8E1'
  ctx.beginPath()
  ctx.ellipse(80, 155, 2, 6, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawClassicQueen(ctx: CanvasRenderingContext2D) {
  // ── Background: Artist's studio corner ──
  drawWorkshopBackground(ctx)

  // Window with warm light on right
  ctx.fillStyle = '#8B7355'
  ctx.fillRect(430, 50, 140, 200)
  // Window panes
  const windowLight = ctx.createLinearGradient(440, 60, 560, 240)
  windowLight.addColorStop(0, '#FFF8E1')
  windowLight.addColorStop(0.5, '#F5E6C8')
  windowLight.addColorStop(1, '#E8DCC8')
  ctx.fillStyle = windowLight
  ctx.fillRect(440, 60, 55, 85)
  ctx.fillRect(505, 60, 55, 85)
  ctx.fillRect(440, 155, 55, 85)
  ctx.fillRect(505, 155, 55, 85)
  // Window frame
  ctx.strokeStyle = '#5C4033'
  ctx.lineWidth = 4
  ctx.strokeRect(430, 50, 140, 200)
  ctx.beginPath()
  ctx.moveTo(500, 50)
  ctx.lineTo(500, 250)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(430, 150)
  ctx.lineTo(570, 150)
  ctx.stroke()

  // Window light spill on floor / scene
  const lightSpill = ctx.createRadialGradient(480, 200, 30, 400, 400, 350)
  lightSpill.addColorStop(0, 'rgba(255, 240, 210, 0.2)')
  lightSpill.addColorStop(0.5, 'rgba(255, 220, 170, 0.08)')
  lightSpill.addColorStop(1, 'transparent')
  ctx.fillStyle = lightSpill
  ctx.fillRect(100, 0, 500, 840)

  // Easel with painting (self-portrait, meta)
  ctx.save()
  ctx.translate(100, 200)
  ctx.rotate(-0.08)
  // Easel legs
  ctx.strokeStyle = '#5C4033'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(30, 0)
  ctx.lineTo(10, 400)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(130, 0)
  ctx.lineTo(150, 400)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(80, 50)
  ctx.lineTo(80, 420)
  ctx.stroke()
  // Canvas on easel
  ctx.fillStyle = '#F5F0E0'
  ctx.fillRect(15, -10, 130, 180)
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 3
  ctx.strokeRect(15, -10, 130, 180)
  // Rough self-portrait sketch on canvas
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(80, 60, 25, 30, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#6E4424'
  ctx.beginPath()
  ctx.ellipse(80, 40, 28, 18, 0, Math.PI, 0)
  ctx.fill()
  ctx.fillStyle = '#8B7355'
  ctx.fillRect(55, 95, 50, 70)
  ctx.globalAlpha = 1
  ctx.restore()

  // Draped fabric at bottom
  const drape = ctx.createLinearGradient(0, 650, 0, 840)
  drape.addColorStop(0, '#8B1A28')
  drape.addColorStop(0.5, '#6B1420')
  drape.addColorStop(1, '#4A0E18')
  ctx.fillStyle = drape
  ctx.beginPath()
  ctx.moveTo(0, 700)
  ctx.quadraticCurveTo(150, 660, 300, 690)
  ctx.quadraticCurveTo(450, 720, 600, 680)
  ctx.lineTo(600, 840)
  ctx.lineTo(0, 840)
  ctx.closePath()
  ctx.fill()
  // Fabric folds
  ctx.strokeStyle = '#A41428'
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  ctx.moveTo(100, 690)
  ctx.quadraticCurveTo(200, 670, 250, 695)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(350, 700)
  ctx.quadraticCurveTo(450, 680, 500, 695)
  ctx.stroke()
  ctx.globalAlpha = 1

  // ── The Muse — woman mid-30s, knowing smirk, relaxed lean ──

  // BODY — period dress with rolled sleeves
  const dress = ctx.createLinearGradient(200, 340, 400, 620)
  dress.addColorStop(0, '#8B6A50')
  dress.addColorStop(0.4, '#7A5C44')
  dress.addColorStop(1, '#6B4D38')
  ctx.fillStyle = dress
  ctx.beginPath()
  ctx.moveTo(220, 360)
  ctx.quadraticCurveTo(300, 330, 380, 360)
  ctx.lineTo(400, 620)
  ctx.quadraticCurveTo(300, 650, 200, 620)
  ctx.closePath()
  ctx.fill()

  // Bodice lacing detail
  ctx.strokeStyle = '#F5F0E0'
  ctx.lineWidth = 1.5
  for (let y = 380; y < 520; y += 25) {
    ctx.beginPath()
    ctx.moveTo(285, y)
    ctx.lineTo(300, y + 12)
    ctx.lineTo(315, y)
    ctx.stroke()
  }

  // Rolled sleeves
  ctx.fillStyle = '#E8DCC8'
  ctx.beginPath()
  ctx.ellipse(220, 370, 25, 18, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(380, 370, 25, 18, -0.3, 0, Math.PI * 2)
  ctx.fill()

  // Neck
  ctx.fillStyle = '#D4A574'
  ctx.fillRect(280, 300, 40, 60)

  // HEAD — woman, confident, hair pinned up loosely
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 250, 50, 58, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — pinned up with falling strands
  ctx.fillStyle = '#6E4424'
  // Updo bun
  ctx.beginPath()
  ctx.ellipse(300, 195, 42, 30, 0, Math.PI, 0)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(310, 190, 22, 18, 0.2, 0, Math.PI * 2)
  ctx.fill()
  // Strands falling on sides
  ctx.strokeStyle = '#6E4424'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(255, 225)
  ctx.quadraticCurveTo(240, 270, 245, 320)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(345, 225)
  ctx.quadraticCurveTo(360, 270, 355, 320)
  ctx.stroke()
  // Hair highlight
  ctx.strokeStyle = '#8A5A38'
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(260, 230)
  ctx.quadraticCurveTo(250, 270, 252, 300)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Forehead highlight
  const qFhGlow = ctx.createRadialGradient(300, 235, 5, 300, 235, 25)
  qFhGlow.addColorStop(0, 'rgba(240, 220, 190, 0.2)')
  qFhGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = qFhGlow
  ctx.fillRect(270, 215, 60, 40)

  // EYES — knowing, slightly narrowed
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(280, 252, 7, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(320, 252, 7, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  // Iris — green
  ctx.fillStyle = '#4A7A4A'
  ctx.beginPath()
  ctx.arc(281, 252, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(321, 252, 3.5, 0, Math.PI * 2)
  ctx.fill()
  // Pupil
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.arc(282, 252, 1.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(322, 252, 1.8, 0, Math.PI * 2)
  ctx.fill()
  // Catchlight
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(279, 251, 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 251, 1, 0, Math.PI * 2)
  ctx.fill()

  // Eyebrows — one slightly raised (knowing)
  ctx.strokeStyle = '#5C3D1A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(270, 244)
  ctx.quadraticCurveTo(280, 240, 290, 244)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(310, 243)
  ctx.quadraticCurveTo(320, 238, 330, 243)
  ctx.stroke()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(300, 252)
  ctx.lineTo(297, 266)
  ctx.stroke()

  // Mouth — knowing smirk
  ctx.fillStyle = '#B87060'
  ctx.beginPath()
  ctx.moveTo(284, 276)
  ctx.quadraticCurveTo(300, 285, 318, 274)
  ctx.quadraticCurveTo(300, 280, 284, 276)
  ctx.fill()

  // Cheek warmth
  ctx.fillStyle = 'rgba(216, 160, 128, 0.15)'
  ctx.beginPath()
  ctx.ellipse(268, 265, 12, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(332, 265, 12, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  // ── Arms — one resting on painting, other relaxed ──
  // Right arm reaching toward easel
  ctx.strokeStyle = '#D4A574'
  ctx.lineWidth = 20
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(220, 380)
  ctx.quadraticCurveTo(170, 420, 160, 470)
  ctx.stroke()

  // Right hand on painting
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(155, 475, 13, 0, Math.PI * 2)
  ctx.fill()

  // Left arm relaxed at side
  ctx.strokeStyle = '#D4A574'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(380, 380)
  ctx.quadraticCurveTo(410, 440, 400, 520)
  ctx.stroke()

  // Left hand
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(398, 525, 12, 0, Math.PI * 2)
  ctx.fill()
}

function drawClassicKing(ctx: CanvasRenderingContext2D) {
  // ── Background: Full workshop — shelves, inks, printing press ──
  drawWorkshopBackground(ctx)

  // Shelves of inks at top
  ctx.fillStyle = '#5C4033'
  ctx.fillRect(0, 60, 600, 8)
  ctx.fillRect(0, 180, 600, 8)

  // Ink bottles on shelves
  const bottleColors = ['#1A1A1A', '#8B0000', '#0A2E50', '#046A38', '#4A3328', '#8B7355']
  for (let i = 0; i < 6; i++) {
    const x = 50 + i * 100
    ctx.fillStyle = bottleColors[i]
    ctx.beginPath()
    ctx.roundRect(x - 12, 20, 24, 38, 4)
    ctx.fill()
    ctx.fillStyle = '#8B7355'
    ctx.fillRect(x - 6, 12, 12, 10)
    // Cork
    ctx.fillStyle = '#D4C5A0'
    ctx.fillRect(x - 4, 8, 8, 6)
  }

  // Second shelf bottles
  for (let i = 0; i < 5; i++) {
    const x = 80 + i * 110
    ctx.fillStyle = bottleColors[(i + 2) % 6]
    ctx.beginPath()
    ctx.roundRect(x - 10, 100, 20, 75, 3)
    ctx.fill()
    // Label
    ctx.fillStyle = '#F5F0E0'
    ctx.fillRect(x - 8, 130, 16, 12)
  }

  // Warm lamp overhead
  const lampGlow = ctx.createRadialGradient(300, 100, 20, 300, 300, 350)
  lampGlow.addColorStop(0, 'rgba(255, 220, 150, 0.2)')
  lampGlow.addColorStop(0.4, 'rgba(255, 200, 120, 0.1)')
  lampGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = lampGlow
  ctx.fillRect(0, 0, 600, 700)

  // Printing press visible at right side
  ctx.fillStyle = '#333333'
  ctx.fillRect(480, 300, 100, 400)
  ctx.fillStyle = '#444444'
  ctx.fillRect(490, 320, 80, 100)
  // Press wheel
  ctx.strokeStyle = '#666666'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(530, 370, 30, 0, Math.PI * 2)
  ctx.stroke()
  // Spoke
  ctx.beginPath()
  ctx.moveTo(530, 340)
  ctx.lineTo(530, 400)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(500, 370)
  ctx.lineTo(560, 370)
  ctx.stroke()

  // ── The Card Maker — elderly man, spectacles, ink-stained ──

  // BODY — craftsman's apron over vest (MASSIVE build for King)
  // Vest
  const vest = ctx.createLinearGradient(180, 360, 420, 650)
  vest.addColorStop(0, '#333333')
  vest.addColorStop(0.5, '#2A2A2A')
  vest.addColorStop(1, '#1A1A1A')
  ctx.fillStyle = vest
  ctx.beginPath()
  ctx.moveTo(180, 370)
  ctx.quadraticCurveTo(300, 340, 420, 370)
  ctx.lineTo(430, 680)
  ctx.quadraticCurveTo(300, 720, 170, 680)
  ctx.closePath()
  ctx.fill()

  // Work apron
  const workApron = ctx.createLinearGradient(210, 400, 390, 680)
  workApron.addColorStop(0, '#6B4D38')
  workApron.addColorStop(1, '#5C4033')
  ctx.fillStyle = workApron
  ctx.beginPath()
  ctx.moveTo(220, 420)
  ctx.lineTo(380, 420)
  ctx.lineTo(370, 680)
  ctx.quadraticCurveTo(300, 700, 230, 680)
  ctx.closePath()
  ctx.fill()

  // Shirt collar visible at neck
  ctx.fillStyle = '#E8DCC8'
  ctx.beginPath()
  ctx.moveTo(260, 340)
  ctx.lineTo(300, 360)
  ctx.lineTo(340, 340)
  ctx.quadraticCurveTo(300, 350, 260, 340)
  ctx.fill()

  // Neck
  ctx.fillStyle = '#C68B5B'
  ctx.fillRect(275, 300, 50, 55)

  // HEAD — elderly, 60s+, round spectacles, white beard
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 245, 55, 62, 0, 0, Math.PI * 2)
  ctx.fill()

  // White/grey hair — balding on top, at sides
  ctx.fillStyle = '#C0C0C0'
  ctx.beginPath()
  ctx.ellipse(300, 200, 50, 25, 0, Math.PI, 0)
  ctx.fill()
  // Bald dome showing
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 198, 35, 20, 0, Math.PI, 0)
  ctx.fill()
  // Side hair
  ctx.fillStyle = '#C8C8C8'
  ctx.beginPath()
  ctx.ellipse(250, 235, 12, 25, 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(350, 235, 12, 25, -0.2, 0, Math.PI * 2)
  ctx.fill()

  // WHITE BEARD — big, distinguished
  ctx.fillStyle = '#D8D8D8'
  ctx.beginPath()
  ctx.moveTo(265, 280)
  ctx.quadraticCurveTo(270, 330, 300, 345)
  ctx.quadraticCurveTo(330, 330, 335, 280)
  ctx.fill()
  // Beard texture lines
  ctx.strokeStyle = '#E8E8E8'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.3
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(275 + i * 12, 285)
    ctx.quadraticCurveTo(278 + i * 10, 315, 285 + i * 6, 340)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Forehead — age lines
  ctx.strokeStyle = '#B08860'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(272, 215)
  ctx.quadraticCurveTo(300, 212, 328, 215)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(275, 220)
  ctx.quadraticCurveTo(300, 218, 325, 220)
  ctx.stroke()

  // EYES — wise, slight squint
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(280, 248, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(320, 248, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  // Iris — grey-blue
  ctx.fillStyle = '#5A7A8A'
  ctx.beginPath()
  ctx.arc(281, 248, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(321, 248, 3.5, 0, Math.PI * 2)
  ctx.fill()
  // Pupil
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.arc(282, 248, 1.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(322, 248, 1.8, 0, Math.PI * 2)
  ctx.fill()
  // Catchlight
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(279, 247, 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 247, 1, 0, Math.PI * 2)
  ctx.fill()

  // ROUND SPECTACLES
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(280, 248, 14, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(320, 248, 14, 0, Math.PI * 2)
  ctx.stroke()
  // Bridge
  ctx.beginPath()
  ctx.moveTo(294, 248)
  ctx.lineTo(306, 248)
  ctx.stroke()
  // Temples
  ctx.beginPath()
  ctx.moveTo(266, 248)
  ctx.lineTo(250, 243)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(334, 248)
  ctx.lineTo(350, 243)
  ctx.stroke()
  // Lens reflection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.beginPath()
  ctx.ellipse(276, 244, 6, 4, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(316, 244, 6, 4, -0.3, 0, Math.PI * 2)
  ctx.fill()

  // Eyebrows — bushy, grey
  ctx.strokeStyle = '#AAAAAA'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(268, 234)
  ctx.quadraticCurveTo(280, 228, 292, 233)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(308, 233)
  ctx.quadraticCurveTo(320, 228, 332, 234)
  ctx.stroke()

  // Nose — broader (age)
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 248)
  ctx.lineTo(296, 268)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(293, 270)
  ctx.quadraticCurveTo(298, 274, 305, 270)
  ctx.stroke()

  // Mouth — wise, focused, hidden by beard
  ctx.fillStyle = '#B87060'
  ctx.beginPath()
  ctx.moveTo(288, 278)
  ctx.quadraticCurveTo(300, 282, 312, 278)
  ctx.quadraticCurveTo(300, 280, 288, 278)
  ctx.fill()

  // ── ARMS ──
  // Right arm — holding magnifying glass inspecting a card
  ctx.strokeStyle = '#333333'
  ctx.lineWidth = 28
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(420, 400)
  ctx.quadraticCurveTo(450, 450, 440, 500)
  ctx.stroke()

  // Hand
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(438, 505, 14, 0, Math.PI * 2)
  ctx.fill()

  // Ink stains on fingers
  ctx.fillStyle = 'rgba(30, 20, 10, 0.25)'
  ctx.beginPath()
  ctx.ellipse(442, 500, 4, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(435, 510, 3, 4, 0.5, 0, Math.PI * 2)
  ctx.fill()

  // Magnifying glass
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(455, 480, 25, 0, Math.PI * 2)
  ctx.stroke()
  // Handle
  ctx.strokeStyle = '#5C4033'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(472, 500)
  ctx.lineTo(490, 530)
  ctx.stroke()
  // Lens
  ctx.fillStyle = 'rgba(200, 220, 255, 0.12)'
  ctx.beginPath()
  ctx.arc(455, 480, 23, 0, Math.PI * 2)
  ctx.fill()

  // Card being inspected (under magnifying glass)
  ctx.save()
  ctx.translate(455, 520)
  ctx.rotate(0.1)
  ctx.fillStyle = '#F5F0E0'
  ctx.fillRect(-22, -30, 44, 62)
  ctx.strokeStyle = '#5C4033'
  ctx.lineWidth = 1
  ctx.strokeRect(-22, -30, 44, 62)
  ctx.fillStyle = '#141430'
  ctx.font = '12px serif'
  ctx.textAlign = 'center'
  ctx.fillText('♠', 0, 5)
  ctx.restore()

  // Left arm at side
  ctx.strokeStyle = '#333333'
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.moveTo(180, 400)
  ctx.quadraticCurveTo(160, 480, 170, 550)
  ctx.stroke()

  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(168, 555, 13, 0, Math.PI * 2)
  ctx.fill()
}

function drawClassicAce(ctx: CanvasRenderingContext2D) {
  // ── Parchment/handmade paper background ──
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#F5F0E0')
  bg.addColorStop(0.3, '#F0EAD6')
  bg.addColorStop(0.7, '#EBE4D0')
  bg.addColorStop(1, '#E5DEC8')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Visible paper texture / fibers
  ctx.globalAlpha = 0.04
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 600
    const y = Math.random() * 840
    const len = 10 + Math.random() * 30
    const angle = Math.random() * Math.PI
    ctx.strokeStyle = '#8B7355'
    ctx.lineWidth = 0.3
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Woodblock texture around suit symbol
  ctx.globalAlpha = 0.03
  for (let x = 150; x < 450; x += 4) {
    for (let y = 220; y < 620; y += 4) {
      if (Math.random() > 0.7) {
        ctx.fillStyle = '#5C4033'
        ctx.fillRect(x, y, 2, 2)
      }
    }
  }
  ctx.globalAlpha = 1

  // Large suit symbol — pressed into handmade paper
  // Spade symbol (default ace)
  ctx.fillStyle = '#333333'
  ctx.beginPath()
  ctx.moveTo(300, 280)
  ctx.bezierCurveTo(270, 300, 180, 360, 180, 430)
  ctx.bezierCurveTo(180, 490, 230, 520, 280, 500)
  ctx.bezierCurveTo(290, 495, 295, 490, 300, 480)
  ctx.bezierCurveTo(305, 490, 310, 495, 320, 500)
  ctx.bezierCurveTo(370, 520, 420, 490, 420, 430)
  ctx.bezierCurveTo(420, 360, 330, 300, 300, 280)
  ctx.fill()

  // Stem
  ctx.fillStyle = '#333333'
  ctx.fillRect(288, 490, 24, 80)

  // Flourish at bottom
  ctx.beginPath()
  ctx.moveTo(260, 570)
  ctx.quadraticCurveTo(280, 545, 300, 570)
  ctx.quadraticCurveTo(320, 545, 340, 570)
  ctx.fill()

  // Ink bleed at edges
  ctx.globalAlpha = 0.08
  ctx.strokeStyle = '#333333'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(300, 278)
  ctx.bezierCurveTo(268, 298, 178, 358, 178, 428)
  ctx.bezierCurveTo(178, 492, 228, 522, 278, 502)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(300, 278)
  ctx.bezierCurveTo(332, 298, 422, 358, 422, 428)
  ctx.bezierCurveTo(422, 492, 372, 522, 322, 502)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Faint fingerprint smudge in corner
  ctx.globalAlpha = 0.04
  ctx.fillStyle = '#5C4033'
  for (let r = 5; r < 30; r += 3) {
    ctx.beginPath()
    ctx.arc(490, 720, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}


// ═══════════════════════════════════════════════════════════════
// NEON NIGHTS SKIN — Rain-soaked Tokyo backstreet, 2087
// ═══════════════════════════════════════════════════════════════

function drawNeonNights(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawNeonJack(ctx); break
    case 'Q': drawNeonQueen(ctx); break
    case 'K': drawNeonKing(ctx); break
    case 'A': drawNeonAce(ctx); break
  }
}

function drawNeonCityBackground(ctx: CanvasRenderingContext2D) {
  // Deep navy night sky
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#060612')
  bg.addColorStop(0.3, '#0A1628')
  bg.addColorStop(0.7, '#0D1F35')
  bg.addColorStop(1, '#060612')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Distant building silhouettes
  ctx.fillStyle = '#0D1520'
  const buildings = [
    [20, 150, 60, 500], [90, 200, 50, 450], [150, 100, 70, 550],
    [240, 180, 45, 470], [300, 120, 65, 530], [380, 160, 55, 490],
    [450, 90, 80, 560], [540, 140, 60, 510],
  ]
  for (const [x, y, w, h] of buildings) {
    ctx.fillRect(x, y, w, h)
    // Window lights
    ctx.fillStyle = 'rgba(0, 229, 255, 0.04)'
    for (let wy = y + 15; wy < y + h - 15; wy += 20) {
      for (let wx = x + 8; wx < x + w - 8; wx += 14) {
        if (Math.random() > 0.5) {
          ctx.fillRect(wx, wy, 6, 8)
        }
      }
    }
    ctx.fillStyle = '#0D1520'
  }

  // Neon signs in background (blurred, low opacity = depth)
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#FF006E'
  ctx.fillRect(50, 80, 80, 30)
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(420, 120, 120, 25)
  ctx.fillStyle = '#FF006E'
  ctx.fillRect(350, 200, 60, 20)
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(100, 160, 90, 18)
  ctx.globalAlpha = 1

  // Wet ground / puddle reflections
  const puddle = ctx.createRadialGradient(300, 750, 10, 300, 750, 250)
  puddle.addColorStop(0, 'rgba(0, 229, 255, 0.12)')
  puddle.addColorStop(0.4, 'rgba(255, 0, 110, 0.06)')
  puddle.addColorStop(1, 'transparent')
  ctx.fillStyle = puddle
  ctx.fillRect(0, 600, 600, 240)

  // Wet pavement
  const pavement = ctx.createLinearGradient(0, 650, 0, 840)
  pavement.addColorStop(0, 'rgba(13, 21, 32, 0.5)')
  pavement.addColorStop(0.3, 'rgba(10, 22, 40, 0.8)')
  pavement.addColorStop(1, '#060612')
  ctx.fillStyle = pavement
  ctx.fillRect(0, 680, 600, 160)

  // Neon reflection streaks on wet ground
  ctx.globalAlpha = 0.06
  for (let x = 50; x < 550; x += 80) {
    const color = x % 160 < 80 ? '#00E5FF' : '#FF006E'
    ctx.fillStyle = color
    ctx.fillRect(x, 700, 40, 120)
  }
  ctx.globalAlpha = 1
}

function drawNeonJack(ctx: CanvasRenderingContext2D) {
  drawNeonCityBackground(ctx)

  // Alley with neon signs — closer
  // Side wall with neon sign
  ctx.fillStyle = '#0D1520'
  ctx.fillRect(0, 200, 80, 600)
  // Neon sign on wall
  ctx.fillStyle = '#FF006E'
  ctx.globalAlpha = 0.3
  ctx.fillRect(10, 250, 60, 24)
  ctx.globalAlpha = 0.15
  const neonGlow1 = ctx.createRadialGradient(40, 262, 10, 40, 262, 60)
  neonGlow1.addColorStop(0, '#FF006E')
  neonGlow1.addColorStop(1, 'transparent')
  ctx.fillStyle = neonGlow1
  ctx.fillRect(0, 220, 120, 80)
  ctx.globalAlpha = 1

  // Right wall neon
  ctx.fillStyle = '#0D1520'
  ctx.fillRect(520, 180, 80, 620)
  ctx.fillStyle = '#00E5FF'
  ctx.globalAlpha = 0.3
  ctx.fillRect(530, 220, 60, 18)
  ctx.globalAlpha = 0.15
  const neonGlow2 = ctx.createRadialGradient(560, 229, 10, 560, 229, 60)
  neonGlow2.addColorStop(0, '#00E5FF')
  neonGlow2.addColorStop(1, 'transparent')
  ctx.fillStyle = neonGlow2
  ctx.fillRect(480, 200, 120, 60)
  ctx.globalAlpha = 1

  // ── The Runner — young bike messenger, grinning ──

  // BODY — cropped jacket, cargo pants
  // Cargo pants
  const pants = ctx.createLinearGradient(220, 520, 380, 700)
  pants.addColorStop(0, '#1A2A3A')
  pants.addColorStop(1, '#0D1A28')
  ctx.fillStyle = pants
  ctx.beginPath()
  ctx.moveTo(240, 520)
  ctx.lineTo(210, 700)
  ctx.lineTo(260, 700)
  ctx.lineTo(280, 540)
  ctx.lineTo(320, 540)
  ctx.lineTo(340, 700)
  ctx.lineTo(390, 700)
  ctx.lineTo(360, 520)
  ctx.closePath()
  ctx.fill()

  // Cargo pocket detail
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.3
  ctx.strokeRect(230, 580, 30, 25)
  ctx.strokeRect(340, 580, 30, 25)
  ctx.globalAlpha = 1

  // Sneakers with neon accent
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.roundRect(200, 690, 60, 25, 8)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(330, 690, 60, 25, 8)
  ctx.fill()
  // Neon accent on shoes
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(210, 705, 40, 3)
  ctx.fillRect(340, 705, 40, 3)

  // Cropped jacket
  const jacket = ctx.createLinearGradient(200, 320, 400, 530)
  jacket.addColorStop(0, '#151F2E')
  jacket.addColorStop(1, '#0D1520')
  ctx.fillStyle = jacket
  ctx.beginPath()
  ctx.moveTo(210, 340)
  ctx.quadraticCurveTo(300, 310, 390, 340)
  ctx.lineTo(370, 530)
  ctx.quadraticCurveTo(300, 545, 230, 530)
  ctx.closePath()
  ctx.fill()

  // Collar detail
  ctx.strokeStyle = 'rgba(255, 0, 110, 0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(240, 340)
  ctx.lineTo(300, 360)
  ctx.lineTo(360, 340)
  ctx.stroke()

  // Belt with cyan buckle
  ctx.fillStyle = '#0A1420'
  ctx.fillRect(220, 515, 160, 10)
  ctx.fillStyle = '#00E5FF'
  ctx.fillRect(290, 515, 20, 10)

  // Neck
  ctx.fillStyle = '#C68B5B'
  ctx.fillRect(280, 300, 40, 45)

  // HEAD — young, grinning
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.ellipse(300, 255, 48, 55, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — short, styled, with cyan-tinted tips
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.ellipse(300, 218, 50, 32, 0, Math.PI, 0)
  ctx.fill()
  // Styled up front
  ctx.beginPath()
  ctx.moveTo(260, 222)
  ctx.quadraticCurveTo(280, 190, 310, 200)
  ctx.quadraticCurveTo(340, 190, 345, 222)
  ctx.fill()

  // Holographic goggles pushed up on forehead
  ctx.fillStyle = '#2A3A4A'
  ctx.beginPath()
  ctx.roundRect(258, 210, 84, 18, 6)
  ctx.fill()
  // Lenses (cyan)
  ctx.fillStyle = '#00E5FF'
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.ellipse(280, 219, 14, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(320, 219, 14, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  // Strap
  ctx.strokeStyle = '#3A4A5A'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(258, 219)
  ctx.quadraticCurveTo(240, 230, 245, 250)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(342, 219)
  ctx.quadraticCurveTo(360, 230, 355, 250)
  ctx.stroke()

  // EYES — lively, grinning
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(280, 255, 7, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(320, 255, 7, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  // Iris — bright
  ctx.fillStyle = '#00B8D4'
  ctx.beginPath()
  ctx.arc(281, 255, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(321, 255, 3.5, 0, Math.PI * 2)
  ctx.fill()
  // Pupil
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(282, 255, 1.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(322, 255, 1.8, 0, Math.PI * 2)
  ctx.fill()
  // Catchlight
  ctx.fillStyle = '#FFF'
  ctx.beginPath()
  ctx.arc(279, 254, 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 254, 1, 0, Math.PI * 2)
  ctx.fill()

  // Eyebrows
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(268, 245)
  ctx.quadraticCurveTo(280, 240, 292, 244)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(308, 244)
  ctx.quadraticCurveTo(320, 240, 332, 245)
  ctx.stroke()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(300, 255)
  ctx.lineTo(297, 270)
  ctx.stroke()

  // Mouth — wide grin
  ctx.fillStyle = '#C06060'
  ctx.beginPath()
  ctx.moveTo(278, 280)
  ctx.quadraticCurveTo(300, 295, 322, 280)
  ctx.quadraticCurveTo(300, 288, 278, 280)
  ctx.fill()
  // Teeth hint
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.beginPath()
  ctx.moveTo(285, 282)
  ctx.quadraticCurveTo(300, 290, 315, 282)
  ctx.quadraticCurveTo(300, 285, 285, 282)
  ctx.fill()

  // ── ARMS ──
  // Right arm — longboard tucked under
  ctx.strokeStyle = '#151F2E'
  ctx.lineWidth = 22
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(380, 370)
  ctx.quadraticCurveTo(420, 420, 410, 480)
  ctx.stroke()

  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(408, 485, 12, 0, Math.PI * 2)
  ctx.fill()

  // Electric longboard — magenta with cyan wheel accents
  ctx.save()
  ctx.translate(430, 400)
  ctx.rotate(-0.25)
  const boardGrad = ctx.createLinearGradient(0, 0, 0, 140)
  boardGrad.addColorStop(0, '#FF006E')
  boardGrad.addColorStop(1, '#AA0048')
  ctx.fillStyle = boardGrad
  ctx.beginPath()
  ctx.roundRect(-10, 0, 20, 150, 10)
  ctx.fill()
  // Wheels
  ctx.fillStyle = '#00E5FF'
  ctx.beginPath()
  ctx.arc(0, 20, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 130, 5, 0, Math.PI * 2)
  ctx.fill()
  // Neon strip
  ctx.fillStyle = '#00E5FF'
  ctx.globalAlpha = 0.4
  ctx.fillRect(-2, 30, 4, 90)
  ctx.globalAlpha = 1
  ctx.restore()

  // Left arm
  ctx.strokeStyle = '#151F2E'
  ctx.lineWidth = 20
  ctx.beginPath()
  ctx.moveTo(220, 370)
  ctx.quadraticCurveTo(190, 430, 200, 490)
  ctx.stroke()

  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(198, 495, 11, 0, Math.PI * 2)
  ctx.fill()

  // Neon uplighting from ground puddles
  const uplight = ctx.createRadialGradient(300, 700, 20, 300, 600, 250)
  uplight.addColorStop(0, 'rgba(0, 229, 255, 0.06)')
  uplight.addColorStop(0.5, 'rgba(255, 0, 110, 0.03)')
  uplight.addColorStop(1, 'transparent')
  ctx.fillStyle = uplight
  ctx.fillRect(100, 400, 400, 400)

  // Face neon ambient
  const faceGlow = ctx.createRadialGradient(300, 255, 20, 300, 255, 80)
  faceGlow.addColorStop(0, 'rgba(0, 229, 255, 0.05)')
  faceGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = faceGlow
  ctx.fillRect(220, 180, 160, 150)
}

function drawNeonQueen(ctx: CanvasRenderingContext2D) {
  drawNeonCityBackground(ctx)

  // Tech-lit corridor background
  ctx.fillStyle = '#0A1420'
  ctx.fillRect(80, 100, 440, 600)

  // Corridor walls with holographic panels
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.1
  for (let y = 120; y < 680; y += 40) {
    ctx.strokeRect(90, y, 100, 30)
    ctx.strokeRect(410, y, 100, 30)
  }
  ctx.globalAlpha = 1

  // Holographic displays in background
  ctx.fillStyle = '#00E5FF'
  ctx.globalAlpha = 0.06
  ctx.fillRect(100, 150, 80, 50)
  ctx.fillRect(420, 200, 80, 40)
  ctx.globalAlpha = 1

  // ── The Fixer — calm, smart tech-fabric trench coat ──

  // BODY — tech trench coat
  const coat = ctx.createLinearGradient(190, 340, 410, 680)
  coat.addColorStop(0, '#1A2030')
  coat.addColorStop(0.5, '#151A28')
  coat.addColorStop(1, '#0D1218')
  ctx.fillStyle = coat
  ctx.beginPath()
  ctx.moveTo(210, 350)
  ctx.quadraticCurveTo(300, 320, 390, 350)
  ctx.lineTo(410, 680)
  ctx.quadraticCurveTo(300, 710, 190, 680)
  ctx.closePath()
  ctx.fill()

  // Coat lapels
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(250, 355)
  ctx.lineTo(300, 400)
  ctx.lineTo(350, 355)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Coat edge highlights (tech fabric shimmer)
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 0.5
  ctx.globalAlpha = 0.15
  ctx.beginPath()
  ctx.moveTo(195, 380)
  ctx.lineTo(190, 680)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(405, 380)
  ctx.lineTo(410, 680)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Neck
  ctx.fillStyle = '#D4A574'
  ctx.fillRect(280, 300, 40, 50)

  // HEAD — woman 30s, calm
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 250, 48, 56, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — short styled
  ctx.fillStyle = '#1A1A2A'
  ctx.beginPath()
  ctx.ellipse(300, 215, 52, 32, 0, Math.PI, 0)
  ctx.fill()
  // Styled asymmetric
  ctx.beginPath()
  ctx.moveTo(252, 218)
  ctx.quadraticCurveTo(260, 200, 285, 210)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(310, 208)
  ctx.quadraticCurveTo(340, 195, 352, 218)
  ctx.fill()

  // EYES — one normal, one cybernetic
  // Left eye (normal)
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(280, 252, 7, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#5A3D2A'
  ctx.beginPath()
  ctx.arc(281, 252, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(282, 252, 1.8, 0, Math.PI * 2)
  ctx.fill()

  // Right eye (CYBERNETIC — glowing cyan)
  ctx.fillStyle = '#001A20'
  ctx.beginPath()
  ctx.ellipse(320, 252, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#00E5FF'
  ctx.beginPath()
  ctx.arc(321, 252, 4, 0, Math.PI * 2)
  ctx.fill()
  // Cyber iris detail
  ctx.strokeStyle = '#00B0D0'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.arc(321, 252, 3, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#00FFFF'
  ctx.beginPath()
  ctx.arc(321, 252, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // Eye glow
  const eyeGlow = ctx.createRadialGradient(321, 252, 3, 321, 252, 30)
  eyeGlow.addColorStop(0, 'rgba(0, 229, 255, 0.15)')
  eyeGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = eyeGlow
  ctx.fillRect(290, 230, 60, 45)

  // Catchlights
  ctx.fillStyle = '#FFF'
  ctx.beginPath()
  ctx.arc(279, 251, 1, 0, Math.PI * 2)
  ctx.fill()

  // Eyebrows
  ctx.strokeStyle = '#1A1A2A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(270, 244)
  ctx.quadraticCurveTo(280, 240, 290, 244)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(310, 244)
  ctx.quadraticCurveTo(320, 240, 330, 244)
  ctx.stroke()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(300, 252)
  ctx.lineTo(297, 268)
  ctx.stroke()

  // Mouth — small confident smile
  ctx.fillStyle = '#C06870'
  ctx.beginPath()
  ctx.moveTo(286, 278)
  ctx.quadraticCurveTo(300, 285, 314, 278)
  ctx.quadraticCurveTo(300, 282, 286, 278)
  ctx.fill()

  // Cybernetic eye glow on face
  const cyberFaceGlow = ctx.createRadialGradient(330, 252, 5, 330, 252, 40)
  cyberFaceGlow.addColorStop(0, 'rgba(0, 229, 255, 0.08)')
  cyberFaceGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = cyberFaceGlow
  ctx.fillRect(300, 230, 60, 60)

  // ── Arms ──
  // Right arm — holding translucent data tablet
  ctx.strokeStyle = '#1A2030'
  ctx.lineWidth = 20
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(380, 380)
  ctx.quadraticCurveTo(420, 430, 410, 490)
  ctx.stroke()

  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(408, 495, 12, 0, Math.PI * 2)
  ctx.fill()

  // Data tablet
  ctx.save()
  ctx.translate(420, 460)
  ctx.rotate(0.15)
  ctx.fillStyle = 'rgba(0, 229, 255, 0.08)'
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(-25, -35, 50, 70, 4)
  ctx.fill()
  ctx.stroke()
  // Data lines on tablet
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 0.5
  ctx.globalAlpha = 0.4
  for (let y = -25; y < 25; y += 8) {
    ctx.beginPath()
    ctx.moveTo(-18, y)
    ctx.lineTo(-18 + Math.random() * 30, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.restore()

  // Left arm
  ctx.strokeStyle = '#1A2030'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(220, 380)
  ctx.quadraticCurveTo(190, 440, 200, 510)
  ctx.stroke()

  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(198, 515, 11, 0, Math.PI * 2)
  ctx.fill()
}

function drawNeonKing(ctx: CanvasRenderingContext2D) {
  drawNeonCityBackground(ctx)

  // Cityscape with geometric buildings — wider view for King
  // Larger building shapes
  ctx.fillStyle = '#0D1520'
  const kingBuildings = [
    [0, 100, 120, 550], [130, 60, 100, 590], [250, 120, 80, 530],
    [350, 80, 90, 570], [460, 50, 140, 600],
  ]
  for (const [x, y, w, h] of kingBuildings) {
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = 'rgba(0, 229, 255, 0.03)'
    for (let wy = y + 15; wy < y + h - 15; wy += 18) {
      for (let wx = x + 6; wx < x + w - 6; wx += 12) {
        if (Math.random() > 0.5) ctx.fillRect(wx, wy, 5, 7)
      }
    }
    ctx.fillStyle = '#0D1520'
  }

  // Deep navy sky
  ctx.fillStyle = '#0A1628'
  ctx.fillRect(0, 0, 600, 80)

  // ── The Architect — older man, silver hair, long coat, calm authority ──

  // BODY — long flowing coat (MASSIVE, imposing)
  const longCoat = ctx.createLinearGradient(160, 320, 440, 750)
  longCoat.addColorStop(0, '#141C2E')
  longCoat.addColorStop(0.5, '#101828')
  longCoat.addColorStop(1, '#0A1018')
  ctx.fillStyle = longCoat
  ctx.beginPath()
  ctx.moveTo(180, 360)
  ctx.quadraticCurveTo(300, 320, 420, 360)
  ctx.lineTo(450, 760)
  ctx.quadraticCurveTo(300, 790, 150, 760)
  ctx.closePath()
  ctx.fill()

  // Coat edge highlights (blue trim)
  ctx.strokeStyle = '#3B82F6'
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(155, 380)
  ctx.lineTo(150, 760)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(445, 380)
  ctx.lineTo(450, 760)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Inner vest
  ctx.fillStyle = '#1A2840'
  ctx.beginPath()
  ctx.moveTo(240, 370)
  ctx.lineTo(360, 370)
  ctx.lineTo(350, 550)
  ctx.quadraticCurveTo(300, 565, 250, 550)
  ctx.closePath()
  ctx.fill()

  // Neck
  ctx.fillStyle = '#C68B5B'
  ctx.fillRect(275, 300, 50, 60)

  // HEAD — older man, silver swept-back hair (LARGEST)
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.ellipse(300, 245, 55, 62, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — silver, swept back
  ctx.fillStyle = '#B0B8C8'
  ctx.beginPath()
  ctx.ellipse(300, 205, 58, 35, 0, Math.PI, 0)
  ctx.fill()
  // Swept back styling
  ctx.beginPath()
  ctx.moveTo(248, 215)
  ctx.quadraticCurveTo(270, 185, 300, 195)
  ctx.quadraticCurveTo(330, 185, 352, 215)
  ctx.fill()
  // Side hair
  ctx.fillStyle = '#A0A8B8'
  ctx.beginPath()
  ctx.moveTo(248, 220)
  ctx.quadraticCurveTo(235, 250, 240, 280)
  ctx.lineTo(252, 260)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(352, 220)
  ctx.quadraticCurveTo(365, 250, 360, 280)
  ctx.lineTo(348, 260)
  ctx.closePath()
  ctx.fill()

  // EYES — knowing, distinguished
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(278, 250, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(322, 250, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  // Iris
  ctx.fillStyle = '#4A6A8A'
  ctx.beginPath()
  ctx.arc(279, 250, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(323, 250, 3.5, 0, Math.PI * 2)
  ctx.fill()
  // Pupil
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(280, 250, 1.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(324, 250, 1.8, 0, Math.PI * 2)
  ctx.fill()
  // Catchlight
  ctx.fillStyle = '#FFF'
  ctx.beginPath()
  ctx.arc(277, 249, 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(321, 249, 1, 0, Math.PI * 2)
  ctx.fill()

  // Slight wrinkles (age)
  ctx.strokeStyle = '#A0856B'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(265, 258)
  ctx.quadraticCurveTo(260, 262, 265, 266)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(335, 258)
  ctx.quadraticCurveTo(340, 262, 335, 266)
  ctx.stroke()

  // Eyebrows — distinguished
  ctx.strokeStyle = '#A0A8B8'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(265, 242)
  ctx.quadraticCurveTo(278, 237, 290, 241)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(310, 241)
  ctx.quadraticCurveTo(322, 237, 335, 242)
  ctx.stroke()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 248)
  ctx.lineTo(296, 268)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(293, 270)
  ctx.quadraticCurveTo(298, 274, 305, 270)
  ctx.stroke()

  // Mouth — composed
  ctx.fillStyle = '#A06858'
  ctx.beginPath()
  ctx.moveTo(286, 280)
  ctx.quadraticCurveTo(300, 286, 314, 280)
  ctx.quadraticCurveTo(300, 283, 286, 280)
  ctx.fill()

  // ── Arms — one extended projecting hologram ──
  // Right arm extended — holographic city
  ctx.strokeStyle = '#141C2E'
  ctx.lineWidth = 26
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(400, 390)
  ctx.quadraticCurveTo(440, 430, 430, 480)
  ctx.stroke()

  // Hand
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(430, 485, 14, 0, Math.PI * 2)
  ctx.fill()

  // Open palm (fingers spread)
  ctx.fillStyle = '#C68B5B'
  for (let i = 0; i < 4; i++) {
    ctx.save()
    ctx.translate(430, 485)
    ctx.rotate(-0.3 + i * 0.2)
    ctx.fillRect(-3, -22, 6, 20)
    ctx.restore()
  }

  // HOLOGRAPHIC CITY — cyan wireframe buildings projecting from palm
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.4
  // Wireframe buildings
  const holoBldgs = [
    [415, 440, 12, 30], [430, 445, 8, 25], [445, 438, 15, 35],
    [425, 450, 10, 20], [440, 442, 12, 28],
  ]
  for (const [x, y, w, h] of holoBldgs) {
    ctx.strokeRect(x, y - h, w, h)
    // Window grid
    for (let wy = y - h + 4; wy < y - 4; wy += 6) {
      ctx.beginPath()
      ctx.moveTo(x + 2, wy)
      ctx.lineTo(x + w - 2, wy)
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1

  // Hologram glow
  const holoGlow = ctx.createRadialGradient(435, 455, 10, 435, 455, 60)
  holoGlow.addColorStop(0, 'rgba(0, 229, 255, 0.15)')
  holoGlow.addColorStop(0.5, 'rgba(0, 229, 255, 0.05)')
  holoGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = holoGlow
  ctx.fillRect(380, 400, 110, 100)

  // Face illumination from hologram
  const holoFaceGlow = ctx.createRadialGradient(350, 270, 30, 350, 270, 100)
  holoFaceGlow.addColorStop(0, 'rgba(0, 229, 255, 0.06)')
  holoFaceGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = holoFaceGlow
  ctx.fillRect(250, 200, 200, 150)

  // Left arm at side
  ctx.strokeStyle = '#141C2E'
  ctx.lineWidth = 24
  ctx.beginPath()
  ctx.moveTo(200, 390)
  ctx.quadraticCurveTo(170, 460, 180, 540)
  ctx.stroke()

  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(178, 545, 13, 0, Math.PI * 2)
  ctx.fill()
}

function drawNeonAce(ctx: CanvasRenderingContext2D) {
  // Dark rain-soaked wall background
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#0A1628')
  bg.addColorStop(0.5, '#0D1F35')
  bg.addColorStop(1, '#060612')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Brick wall texture
  ctx.fillStyle = '#151F2E'
  for (let y = 50; y < 800; y += 24) {
    const offset = (Math.floor(y / 24) % 2) * 30
    for (let x = offset; x < 600; x += 60) {
      ctx.fillRect(x + 1, y + 1, 56, 20)
    }
  }

  // Neon suit symbol (spade) — as a neon sign on the wall
  // Glow behind
  const neonGlow = ctx.createRadialGradient(300, 380, 30, 300, 380, 200)
  neonGlow.addColorStop(0, 'rgba(0, 229, 255, 0.2)')
  neonGlow.addColorStop(0.5, 'rgba(0, 229, 255, 0.08)')
  neonGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = neonGlow
  ctx.fillRect(50, 150, 500, 500)

  // Neon spade outline (bright cyan)
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 5
  ctx.shadowColor = '#00E5FF'
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.moveTo(300, 220)
  ctx.bezierCurveTo(270, 240, 180, 300, 180, 380)
  ctx.bezierCurveTo(180, 430, 230, 460, 275, 445)
  ctx.bezierCurveTo(285, 440, 295, 435, 300, 425)
  ctx.bezierCurveTo(305, 435, 315, 440, 325, 445)
  ctx.bezierCurveTo(370, 460, 420, 430, 420, 380)
  ctx.bezierCurveTo(420, 300, 330, 240, 300, 220)
  ctx.stroke()
  // Stem
  ctx.beginPath()
  ctx.moveTo(288, 440)
  ctx.lineTo(288, 520)
  ctx.lineTo(312, 520)
  ctx.lineTo(312, 440)
  ctx.stroke()
  // Flourish
  ctx.beginPath()
  ctx.moveTo(260, 520)
  ctx.quadraticCurveTo(280, 500, 300, 520)
  ctx.quadraticCurveTo(320, 500, 340, 520)
  ctx.stroke()
  ctx.shadowBlur = 0

  // Power cable dangling from sign
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(300, 220)
  ctx.quadraticCurveTo(310, 150, 280, 80)
  ctx.lineTo(280, 0)
  ctx.stroke()

  // Puddle reflection below
  const puddleReflect = ctx.createRadialGradient(300, 650, 20, 300, 650, 150)
  puddleReflect.addColorStop(0, 'rgba(0, 229, 255, 0.15)')
  puddleReflect.addColorStop(0.5, 'rgba(0, 229, 255, 0.05)')
  puddleReflect.addColorStop(1, 'transparent')
  ctx.fillStyle = puddleReflect
  ctx.fillRect(100, 560, 400, 200)

  // Reflected spade (inverted, blurred)
  ctx.globalAlpha = 0.08
  ctx.save()
  ctx.translate(300, 1100)
  ctx.scale(1, -0.6)
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(0, 220)
  ctx.bezierCurveTo(-30, 240, -120, 300, -120, 380)
  ctx.bezierCurveTo(-120, 430, -70, 460, -25, 445)
  ctx.bezierCurveTo(-15, 440, -5, 435, 0, 425)
  ctx.bezierCurveTo(5, 435, 15, 440, 25, 445)
  ctx.bezierCurveTo(70, 460, 120, 430, 120, 380)
  ctx.bezierCurveTo(120, 300, 30, 240, 0, 220)
  ctx.stroke()
  ctx.restore()
  ctx.globalAlpha = 1
}


// ═══════════════════════════════════════════════════════════════
// VELVET NOIR — 1940s Film Noir
// ═══════════════════════════════════════════════════════════════

function drawVelvetNoir(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawVelvetNoirJack(ctx); break
    case 'Q': drawVelvetNoirQueen(ctx); break
    case 'K': drawVelvetNoirKing(ctx); break
    case 'A': drawVelvetNoirAce(ctx); break
  }
}

// Shared noir environment base
function drawNoirBackground(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#0D0D0D')
  bg.addColorStop(0.4, '#1A1A1A')
  bg.addColorStop(0.7, '#141414')
  bg.addColorStop(1, '#0A0A0A')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)
}

// Venetian blind shadow stripes
function drawVenetianBlinds(ctx: CanvasRenderingContext2D, angle: number, opacity: number) {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.rotate(angle)
  for (let y = -200; y < 1200; y += 60) {
    const stripe = ctx.createLinearGradient(0, y, 0, y + 30)
    stripe.addColorStop(0, 'rgba(255, 240, 200, 0.08)')
    stripe.addColorStop(0.5, 'rgba(255, 240, 200, 0.04)')
    stripe.addColorStop(1, 'transparent')
    ctx.fillStyle = stripe
    ctx.fillRect(-200, y, 1000, 25)
  }
  ctx.restore()
  ctx.globalAlpha = 1
}

function drawVelvetNoirJack(ctx: CanvasRenderingContext2D) {
  drawNoirBackground(ctx)

  // Card room — single overhead light cone
  const overhead = ctx.createRadialGradient(300, 100, 20, 300, 300, 350)
  overhead.addColorStop(0, 'rgba(255, 230, 170, 0.15)')
  overhead.addColorStop(0.4, 'rgba(255, 220, 150, 0.06)')
  overhead.addColorStop(1, 'transparent')
  ctx.fillStyle = overhead
  ctx.fillRect(0, 0, 600, 840)

  // Table surface at bottom
  const table = ctx.createLinearGradient(0, 600, 0, 840)
  table.addColorStop(0, '#1A2A1A')
  table.addColorStop(1, '#0D1A0D')
  ctx.fillStyle = table
  ctx.fillRect(0, 600, 600, 240)

  // Venetian blind shadows
  drawVenetianBlinds(ctx, 0.05, 0.5)

  // Smoke haze at top
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 5; i++) {
    const smokeGrad = ctx.createRadialGradient(150 + i * 100, 120 + i * 30, 20, 150 + i * 100, 120, 120)
    smokeGrad.addColorStop(0, '#D4D4D4')
    smokeGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = smokeGrad
    ctx.fillRect(0, 0, 600, 300)
  }
  ctx.globalAlpha = 1

  // ── THE SMOOTH DEALER — lean, cocky, card sharp ──

  // BODY — pinstripe vest over rolled-sleeve shirt
  // Shirt (rolled sleeves, cream)
  ctx.fillStyle = '#D4C8B0'
  ctx.beginPath()
  ctx.moveTo(195, 340)
  ctx.quadraticCurveTo(300, 310, 405, 340)
  ctx.lineTo(400, 580)
  ctx.quadraticCurveTo(300, 600, 200, 580)
  ctx.closePath()
  ctx.fill()

  // Rolled sleeve detail
  ctx.strokeStyle = '#B8AC96'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(195, 355)
  ctx.lineTo(218, 350)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(405, 355)
  ctx.lineTo(382, 350)
  ctx.stroke()

  // Vest — dark pinstripe
  const vest = ctx.createLinearGradient(220, 350, 380, 580)
  vest.addColorStop(0, '#2A2A2A')
  vest.addColorStop(1, '#1A1A1A')
  ctx.fillStyle = vest
  ctx.beginPath()
  ctx.moveTo(230, 350)
  ctx.lineTo(370, 350)
  ctx.lineTo(360, 580)
  ctx.quadraticCurveTo(300, 600, 240, 580)
  ctx.closePath()
  ctx.fill()

  // Pinstripes
  ctx.strokeStyle = '#3A3A3A'
  ctx.lineWidth = 0.5
  for (let x = 240; x < 365; x += 12) {
    ctx.beginPath()
    ctx.moveTo(x, 355)
    ctx.lineTo(x - 2, 580)
    ctx.stroke()
  }

  // RED ACCENT: pocket square (noir red)
  ctx.fillStyle = '#9B111E'
  ctx.beginPath()
  ctx.moveTo(340, 358)
  ctx.lineTo(352, 358)
  ctx.lineTo(348, 375)
  ctx.lineTo(338, 372)
  ctx.closePath()
  ctx.fill()

  // Vest buttons
  ctx.fillStyle = '#555'
  for (let y = 400; y < 560; y += 50) {
    ctx.beginPath()
    ctx.arc(300, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // Neck
  ctx.fillStyle = '#C4956A'
  ctx.fillRect(280, 290, 40, 55)

  // HEAD — lean face, cocky grin, shadowed
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 245, 48, 56, 0, 0, Math.PI * 2)
  ctx.fill()

  // Half-shadow on face (noir lighting from overhead-left)
  const faceShadow = ctx.createLinearGradient(260, 200, 360, 300)
  faceShadow.addColorStop(0, 'transparent')
  faceShadow.addColorStop(0.55, 'transparent')
  faceShadow.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)')
  faceShadow.addColorStop(1, 'rgba(0, 0, 0, 0.5)')
  ctx.fillStyle = faceShadow
  ctx.beginPath()
  ctx.ellipse(300, 245, 48, 56, 0, 0, Math.PI * 2)
  ctx.fill()

  // FEDORA — tilted, classic noir
  ctx.fillStyle = '#222'
  // Brim
  ctx.beginPath()
  ctx.ellipse(300, 200, 72, 14, -0.08, 0, Math.PI * 2)
  ctx.fill()
  // Crown
  ctx.beginPath()
  ctx.moveTo(245, 200)
  ctx.quadraticCurveTo(250, 155, 280, 150)
  ctx.lineTo(325, 148)
  ctx.quadraticCurveTo(355, 155, 358, 200)
  ctx.closePath()
  ctx.fill()
  // Hat band
  ctx.fillStyle = '#333'
  ctx.fillRect(248, 192, 108, 8)
  // Crown dent
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(270, 160)
  ctx.quadraticCurveTo(300, 155, 330, 158)
  ctx.stroke()

  // EYES — slightly squinted, confident
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(280, 248, 7, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(320, 248, 7, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
  // Iris — dark
  ctx.fillStyle = '#2A1A0A'
  ctx.beginPath()
  ctx.arc(281, 248, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(321, 248, 3, 0, Math.PI * 2)
  ctx.fill()
  // Pupil
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(281, 248, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(321, 248, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // Eyebrows — one raised (cocky)
  ctx.strokeStyle = '#4A3020'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(270, 240)
  ctx.quadraticCurveTo(280, 237, 290, 240)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(310, 238)
  ctx.quadraticCurveTo(320, 234, 332, 239)
  ctx.stroke()

  // Nose
  ctx.strokeStyle = '#B8845A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(298, 245)
  ctx.lineTo(295, 262)
  ctx.lineTo(300, 265)
  ctx.stroke()

  // Cocky grin
  ctx.strokeStyle = '#8B5A3A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(282, 276)
  ctx.quadraticCurveTo(300, 288, 322, 274)
  ctx.stroke()

  // Cigarette behind right ear
  ctx.fillStyle = '#F5F0E0'
  ctx.save()
  ctx.translate(348, 230)
  ctx.rotate(0.3)
  ctx.fillRect(-2, -20, 4, 28)
  // Filter
  ctx.fillStyle = '#D4A574'
  ctx.fillRect(-2, 5, 4, 6)
  ctx.restore()

  // LEFT ARM — holding cards (one-handed shuffle)
  ctx.strokeStyle = '#2A2A2A'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(210, 370)
  ctx.quadraticCurveTo(170, 430, 185, 500)
  ctx.stroke()
  // Sleeve
  ctx.strokeStyle = '#D4C8B0'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(195, 350)
  ctx.lineTo(200, 380)
  ctx.stroke()
  // Hand
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(185, 505, 12, 0, Math.PI * 2)
  ctx.fill()

  // Cards being shuffled — fanned
  for (let i = 0; i < 4; i++) {
    ctx.save()
    ctx.translate(185, 505)
    ctx.rotate(-0.3 + i * 0.18)
    ctx.fillStyle = '#F5F0E0'
    ctx.fillRect(-10, -35, 20, 32)
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 0.5
    ctx.strokeRect(-10, -35, 20, 32)
    ctx.restore()
  }

  // RIGHT ARM at side
  ctx.strokeStyle = '#2A2A2A'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(380, 370)
  ctx.quadraticCurveTo(410, 440, 395, 520)
  ctx.stroke()
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(395, 525, 11, 0, Math.PI * 2)
  ctx.fill()

  // Chip stacks on table
  for (let s = 0; s < 3; s++) {
    const sx = 430 + s * 50
    for (let c = 0; c < 4 - s; c++) {
      ctx.fillStyle = s === 0 ? '#9B111E' : s === 1 ? '#1A1A1A' : '#D4D4D4'
      ctx.beginPath()
      ctx.ellipse(sx, 650 - c * 5, 14, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }
}

function drawVelvetNoirQueen(ctx: CanvasRenderingContext2D) {
  drawNoirBackground(ctx)

  // Bar background with bottles and mirror
  // Mirror (dim reflection)
  const mirror = ctx.createLinearGradient(100, 60, 500, 250)
  mirror.addColorStop(0, '#1A1A1A')
  mirror.addColorStop(0.5, '#252525')
  mirror.addColorStop(1, '#1A1A1A')
  ctx.fillStyle = mirror
  ctx.fillRect(80, 50, 440, 200)
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.strokeRect(80, 50, 440, 200)

  // Bottles on bar shelf
  ctx.globalAlpha = 0.25
  const bottleColors = ['#3A2A1A', '#2A3A2A', '#3A2A3A', '#2A2A3A', '#3A3A2A']
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = bottleColors[i]
    const bx = 120 + i * 90
    ctx.fillRect(bx, 100, 18, 55)
    ctx.fillRect(bx + 4, 85, 10, 20)
    ctx.beginPath()
    ctx.arc(bx + 9, 85, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Bar counter
  const bar = ctx.createLinearGradient(0, 250, 0, 310)
  bar.addColorStop(0, '#3A2A1A')
  bar.addColorStop(0.5, '#2A1C10')
  bar.addColorStop(1, '#1A1008')
  ctx.fillStyle = bar
  ctx.fillRect(0, 260, 600, 50)
  ctx.strokeStyle = '#4A3828'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, 262)
  ctx.lineTo(600, 262)
  ctx.stroke()

  // Side lighting — harsh from right
  const sideLight = ctx.createLinearGradient(500, 0, 100, 0)
  sideLight.addColorStop(0, 'rgba(255, 220, 160, 0.1)')
  sideLight.addColorStop(0.4, 'rgba(255, 220, 160, 0.03)')
  sideLight.addColorStop(1, 'transparent')
  ctx.fillStyle = sideLight
  ctx.fillRect(0, 0, 600, 840)

  // ── THE FEMME FATALE — glamorous, dangerous ──

  // BODY — black velvet gown
  const gown = ctx.createLinearGradient(200, 340, 400, 700)
  gown.addColorStop(0, '#1A1A1A')
  gown.addColorStop(0.3, '#222222')
  gown.addColorStop(0.6, '#1A1A1A')
  gown.addColorStop(1, '#111111')
  ctx.fillStyle = gown
  ctx.beginPath()
  ctx.moveTo(230, 360)
  ctx.quadraticCurveTo(300, 330, 370, 360)
  ctx.lineTo(380, 620)
  ctx.quadraticCurveTo(350, 680, 310, 700)
  ctx.lineTo(290, 700)
  ctx.quadraticCurveTo(250, 680, 220, 620)
  ctx.closePath()
  ctx.fill()

  // Gown shimmer highlight
  const shimmer = ctx.createLinearGradient(270, 360, 330, 700)
  shimmer.addColorStop(0, 'rgba(255, 255, 255, 0.03)')
  shimmer.addColorStop(0.3, 'rgba(255, 255, 255, 0.06)')
  shimmer.addColorStop(0.6, 'rgba(255, 255, 255, 0.02)')
  shimmer.addColorStop(1, 'transparent')
  ctx.fillStyle = shimmer
  ctx.beginPath()
  ctx.moveTo(260, 360)
  ctx.lineTo(340, 360)
  ctx.lineTo(330, 700)
  ctx.lineTo(270, 700)
  ctx.closePath()
  ctx.fill()

  // Gown neckline — V-shaped
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(248, 360)
  ctx.lineTo(300, 390)
  ctx.lineTo(352, 360)
  ctx.stroke()

  // Pearl necklace
  ctx.fillStyle = '#E8E0D0'
  for (let i = 0; i < 9; i++) {
    const angle = -0.6 + i * 0.15
    const px = 300 + Math.sin(angle) * 55
    const py = 355 + Math.cos(angle) * 12 + i * 0.5
    ctx.beginPath()
    ctx.arc(px, py, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Neck
  ctx.fillStyle = '#D4A574'
  ctx.fillRect(283, 300, 34, 55)

  // HEAD — glamorous, side-lit, dramatic face split
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 255, 46, 54, 0, 0, Math.PI * 2)
  ctx.fill()

  // Dramatic half-shadow (side light from right)
  const halfShadow = ctx.createLinearGradient(260, 200, 320, 200)
  halfShadow.addColorStop(0, 'rgba(0, 0, 0, 0.5)')
  halfShadow.addColorStop(0.45, 'rgba(0, 0, 0, 0.3)')
  halfShadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)')
  halfShadow.addColorStop(1, 'transparent')
  ctx.fillStyle = halfShadow
  ctx.beginPath()
  ctx.ellipse(300, 255, 46, 54, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — finger wave, dark, 1940s style
  ctx.fillStyle = '#1A1008'
  ctx.beginPath()
  ctx.ellipse(300, 225, 52, 38, 0, Math.PI, 0)
  ctx.fill()
  // Side waves
  ctx.beginPath()
  ctx.moveTo(252, 230)
  ctx.quadraticCurveTo(240, 260, 248, 295)
  ctx.quadraticCurveTo(255, 310, 260, 290)
  ctx.quadraticCurveTo(252, 270, 258, 245)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(348, 230)
  ctx.quadraticCurveTo(360, 260, 355, 295)
  ctx.quadraticCurveTo(348, 310, 342, 290)
  ctx.quadraticCurveTo(350, 270, 344, 245)
  ctx.closePath()
  ctx.fill()
  // Hair highlight
  ctx.fillStyle = '#2A1C10'
  ctx.globalAlpha = 0.4
  ctx.beginPath()
  ctx.ellipse(315, 222, 20, 10, 0.2, Math.PI, 0)
  ctx.fill()
  ctx.globalAlpha = 1

  // EYES — one eyebrow raised
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 255, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 255, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  // Green-grey iris
  ctx.fillStyle = '#4A6A5A'
  ctx.beginPath()
  ctx.arc(283, 255, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 255, 3.5, 0, Math.PI * 2)
  ctx.fill()
  // Pupil
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(283, 255, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 255, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // Eyebrows — one raised
  ctx.strokeStyle = '#1A1008'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(273, 248)
  ctx.quadraticCurveTo(282, 245, 292, 248)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(308, 244)
  ctx.quadraticCurveTo(318, 240, 330, 246)
  ctx.stroke()

  // Nose
  ctx.strokeStyle = '#B8845A'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 252)
  ctx.lineTo(297, 268)
  ctx.lineTo(301, 270)
  ctx.stroke()

  // RED ACCENT: lipstick — deep crimson
  ctx.fillStyle = '#9B111E'
  ctx.beginPath()
  ctx.moveTo(289, 280)
  ctx.quadraticCurveTo(300, 276, 311, 280)
  ctx.quadraticCurveTo(300, 286, 289, 280)
  ctx.fill()

  // RIGHT ARM — holding cigarette holder
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(360, 380)
  ctx.quadraticCurveTo(400, 340, 410, 310)
  ctx.stroke()
  // Hand
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(412, 305, 10, 0, Math.PI * 2)
  ctx.fill()
  // Cigarette holder
  ctx.fillStyle = '#1A1A1A'
  ctx.save()
  ctx.translate(415, 295)
  ctx.rotate(-0.6)
  ctx.fillRect(-2, -40, 4, 40)
  ctx.restore()
  // Smoke wisps
  ctx.globalAlpha = 0.06
  ctx.strokeStyle = '#D4D4D4'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(420, 260)
  ctx.quadraticCurveTo(430, 230, 415, 200)
  ctx.quadraticCurveTo(425, 170, 410, 140)
  ctx.stroke()
  ctx.globalAlpha = 1

  // LEFT ARM — clutch purse with hidden revolver
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(240, 380)
  ctx.quadraticCurveTo(200, 440, 210, 500)
  ctx.stroke()
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(210, 505, 10, 0, Math.PI * 2)
  ctx.fill()
  // Clutch purse
  ctx.fillStyle = '#222'
  ctx.save()
  ctx.translate(210, 510)
  ctx.rotate(0.1)
  ctx.fillRect(-18, -5, 36, 20)
  // Clasp
  ctx.fillStyle = '#D4D4D4'
  ctx.fillRect(-2, -5, 4, 4)
  ctx.restore()
  // Revolver hint (barely visible)
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#555'
  ctx.save()
  ctx.translate(215, 520)
  ctx.rotate(0.2)
  ctx.fillRect(0, 0, 22, 3)
  ctx.fillRect(8, 0, 3, 8)
  ctx.restore()
  ctx.globalAlpha = 1

  // Amber bar light reflection
  const amber = ctx.createRadialGradient(450, 200, 10, 450, 200, 150)
  amber.addColorStop(0, 'rgba(255, 180, 80, 0.06)')
  amber.addColorStop(1, 'transparent')
  ctx.fillStyle = amber
  ctx.fillRect(300, 50, 300, 300)
}

function drawVelvetNoirKing(ctx: CanvasRenderingContext2D) {
  drawNoirBackground(ctx)

  // Study/office — barely visible
  // Bookshelf in background
  ctx.globalAlpha = 0.08
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const bx = 50 + col * 65
      const by = 40 + row * 80
      ctx.fillStyle = ['#3A2A1A', '#2A1A0A', '#1A2A1A'][row]
      ctx.fillRect(bx, by, 55, 70)
    }
  }
  ctx.globalAlpha = 1

  // Extreme chiaroscuro — light from left only
  const chiaroscuro = ctx.createLinearGradient(0, 0, 600, 0)
  chiaroscuro.addColorStop(0, 'rgba(255, 220, 160, 0.08)')
  chiaroscuro.addColorStop(0.3, 'rgba(255, 220, 160, 0.04)')
  chiaroscuro.addColorStop(0.5, 'transparent')
  chiaroscuro.addColorStop(1, 'rgba(0, 0, 0, 0.3)')
  ctx.fillStyle = chiaroscuro
  ctx.fillRect(0, 0, 600, 840)

  // ── THE GODFATHER — massive, seated, commanding ──

  // Leather chair
  const chair = ctx.createRadialGradient(300, 400, 50, 300, 400, 250)
  chair.addColorStop(0, '#2A1C10')
  chair.addColorStop(0.7, '#1A1008')
  chair.addColorStop(1, '#0D0A06')
  ctx.fillStyle = chair
  // Chair back
  ctx.beginPath()
  ctx.moveTo(120, 200)
  ctx.quadraticCurveTo(130, 140, 200, 120)
  ctx.lineTo(400, 120)
  ctx.quadraticCurveTo(470, 140, 480, 200)
  ctx.lineTo(480, 650)
  ctx.lineTo(120, 650)
  ctx.closePath()
  ctx.fill()
  // Chair arm (left)
  ctx.fillStyle = '#2A1C10'
  ctx.beginPath()
  ctx.moveTo(120, 400)
  ctx.quadraticCurveTo(90, 390, 85, 420)
  ctx.lineTo(85, 550)
  ctx.quadraticCurveTo(90, 570, 120, 560)
  ctx.closePath()
  ctx.fill()
  // Chair arm (right)
  ctx.beginPath()
  ctx.moveTo(480, 400)
  ctx.quadraticCurveTo(510, 390, 515, 420)
  ctx.lineTo(515, 550)
  ctx.quadraticCurveTo(510, 570, 480, 560)
  ctx.closePath()
  ctx.fill()

  // Button tufting on chair
  ctx.fillStyle = '#3A2A18'
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      ctx.beginPath()
      ctx.arc(200 + col * 70, 170 + row * 70, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // BODY — massive, dark double-breasted suit
  const suit = ctx.createLinearGradient(180, 340, 420, 640)
  suit.addColorStop(0, '#1A1A1A')
  suit.addColorStop(0.5, '#222222')
  suit.addColorStop(1, '#151515')
  ctx.fillStyle = suit
  ctx.beginPath()
  ctx.moveTo(180, 350)
  ctx.quadraticCurveTo(300, 310, 420, 350)
  ctx.lineTo(430, 650)
  ctx.lineTo(170, 650)
  ctx.closePath()
  ctx.fill()

  // Double-breasted lapels
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(240, 350)
  ctx.lineTo(290, 430)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(360, 350)
  ctx.lineTo(310, 430)
  ctx.stroke()

  // Suit buttons (double-breasted — 2 rows)
  ctx.fillStyle = '#444'
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(275, 440 + i * 45, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(325, 440 + i * 45, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // White shirt underneath
  ctx.fillStyle = '#D4D4D4'
  ctx.beginPath()
  ctx.moveTo(275, 350)
  ctx.lineTo(300, 370)
  ctx.lineTo(325, 350)
  ctx.lineTo(310, 430)
  ctx.lineTo(290, 430)
  ctx.closePath()
  ctx.fill()

  // BLACK TIE
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.moveTo(295, 358)
  ctx.lineTo(305, 358)
  ctx.lineTo(303, 420)
  ctx.lineTo(297, 420)
  ctx.closePath()
  ctx.fill()

  // RED ACCENT: rose on lapel
  ctx.fillStyle = '#9B111E'
  ctx.beginPath()
  ctx.arc(350, 370, 8, 0, Math.PI * 2)
  ctx.fill()
  // Rose petals
  ctx.beginPath()
  ctx.arc(347, 366, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(354, 367, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#7A0D16'
  ctx.beginPath()
  ctx.arc(350, 372, 4, 0, Math.PI * 2)
  ctx.fill()
  // Stem
  ctx.strokeStyle = '#2A4A2A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(350, 378)
  ctx.lineTo(348, 395)
  ctx.stroke()

  // Broad shoulders padding
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.moveTo(160, 355)
  ctx.quadraticCurveTo(200, 330, 240, 350)
  ctx.lineTo(235, 365)
  ctx.quadraticCurveTo(195, 360, 160, 370)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(440, 355)
  ctx.quadraticCurveTo(400, 330, 360, 350)
  ctx.lineTo(365, 365)
  ctx.quadraticCurveTo(405, 360, 440, 370)
  ctx.closePath()
  ctx.fill()

  // Neck — thick
  ctx.fillStyle = '#C4956A'
  ctx.fillRect(275, 295, 50, 55)

  // HEAD — broad, powerful, half in shadow
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 252, 52, 58, 0, 0, Math.PI * 2)
  ctx.fill()

  // EXTREME half-shadow — right half in total darkness
  const godShadow = ctx.createLinearGradient(250, 200, 340, 200)
  godShadow.addColorStop(0, 'transparent')
  godShadow.addColorStop(0.45, 'transparent')
  godShadow.addColorStop(0.55, 'rgba(0, 0, 0, 0.6)')
  godShadow.addColorStop(1, 'rgba(0, 0, 0, 0.85)')
  ctx.fillStyle = godShadow
  ctx.beginPath()
  ctx.ellipse(300, 252, 52, 58, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — slicked back, silver-grey
  ctx.fillStyle = '#4A4A4A'
  ctx.beginPath()
  ctx.ellipse(300, 215, 54, 32, 0, Math.PI, 0)
  ctx.fill()
  // Silver streaks
  ctx.fillStyle = '#888'
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.ellipse(285, 210, 15, 8, -0.2, Math.PI, 0)
  ctx.fill()
  ctx.globalAlpha = 1

  // EYES — minimal expression, total control (only left eye visible in light)
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(280, 255, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  // Right eye barely visible in shadow
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.ellipse(322, 255, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  // Iris
  ctx.fillStyle = '#2A2A2A'
  ctx.beginPath()
  ctx.arc(281, 255, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.arc(323, 255, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  // Pupil
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(281, 255, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // Eyebrows — flat, stern
  ctx.strokeStyle = '#3A3A3A'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(268, 247)
  ctx.lineTo(292, 247)
  ctx.stroke()
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(312, 247)
  ctx.lineTo(336, 247)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Nose
  ctx.strokeStyle = '#B8845A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(299, 250)
  ctx.lineTo(296, 268)
  ctx.lineTo(301, 271)
  ctx.stroke()

  // Mouth — tight, controlled
  ctx.strokeStyle = '#8B5A3A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(284, 280)
  ctx.lineTo(316, 280)
  ctx.stroke()

  // LEFT ARM on chair arm — crystal glass in hand
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(200, 380)
  ctx.quadraticCurveTo(140, 430, 120, 480)
  ctx.stroke()
  ctx.fillStyle = '#C4956A'
  ctx.beginPath()
  ctx.arc(118, 485, 12, 0, Math.PI * 2)
  ctx.fill()

  // Crystal glass
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(105, 460)
  ctx.lineTo(100, 475)
  ctx.lineTo(130, 475)
  ctx.lineTo(125, 460)
  ctx.stroke()
  // Whiskey color
  ctx.fillStyle = 'rgba(180, 120, 40, 0.25)'
  ctx.fillRect(102, 465, 26, 10)
  // Stem and base
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)'
  ctx.beginPath()
  ctx.moveTo(115, 475)
  ctx.lineTo(115, 490)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(105, 490)
  ctx.lineTo(125, 490)
  ctx.stroke()

  // RIGHT ARM resting on chair arm
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(400, 380)
  ctx.quadraticCurveTo(460, 430, 480, 480)
  ctx.stroke()
  ctx.fillStyle = '#C4956A'
  ctx.beginPath()
  ctx.arc(482, 485, 12, 0, Math.PI * 2)
  ctx.fill()
}

function drawVelvetNoirAce(ctx: CanvasRenderingContext2D) {
  drawNoirBackground(ctx)

  // Green felt table
  const felt = ctx.createRadialGradient(300, 420, 50, 300, 420, 350)
  felt.addColorStop(0, '#1A3A1A')
  felt.addColorStop(0.7, '#0D2A0D')
  felt.addColorStop(1, '#0A1A0A')
  ctx.fillStyle = felt
  ctx.fillRect(0, 200, 600, 440)

  // Harsh overhead light cone
  const overheadLight = ctx.createRadialGradient(300, 200, 10, 300, 420, 280)
  overheadLight.addColorStop(0, 'rgba(255, 230, 170, 0.2)')
  overheadLight.addColorStop(0.5, 'rgba(255, 230, 170, 0.06)')
  overheadLight.addColorStop(1, 'transparent')
  ctx.fillStyle = overheadLight
  ctx.fillRect(0, 0, 600, 700)

  // Black velvet poker chip — center
  // Chip base
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.arc(300, 420, 100, 0, Math.PI * 2)
  ctx.fill()

  // Silver stitching around chip edge
  ctx.strokeStyle = '#D4D4D4'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.arc(300, 420, 90, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(300, 420, 80, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // Edge notches (classic chip detail)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const x1 = 300 + Math.cos(angle) * 95
    const y1 = 420 + Math.sin(angle) * 95
    const x2 = 300 + Math.cos(angle) * 100
    const y2 = 420 + Math.sin(angle) * 100
    ctx.strokeStyle = '#D4D4D4'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // Suit symbol (spade) in center of chip — large
  ctx.fillStyle = '#D4D4D4'
  ctx.beginPath()
  ctx.moveTo(300, 370)
  ctx.bezierCurveTo(280, 385, 245, 410, 245, 435)
  ctx.bezierCurveTo(245, 455, 265, 465, 285, 455)
  ctx.bezierCurveTo(292, 450, 296, 446, 300, 440)
  ctx.bezierCurveTo(304, 446, 308, 450, 315, 455)
  ctx.bezierCurveTo(335, 465, 355, 455, 355, 435)
  ctx.bezierCurveTo(355, 410, 320, 385, 300, 370)
  ctx.fill()
  // Stem
  ctx.fillRect(294, 452, 12, 20)

  // Whiskey glass nearby (bottom-right)
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.25)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(460, 350)
  ctx.lineTo(450, 390)
  ctx.lineTo(490, 390)
  ctx.lineTo(480, 350)
  ctx.stroke()
  // Whiskey
  ctx.fillStyle = 'rgba(180, 120, 40, 0.2)'
  ctx.fillRect(453, 365, 34, 25)
  // Ice cube
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.15)'
  ctx.strokeRect(462, 368, 8, 8)

  // Scattered chips
  ctx.globalAlpha = 0.4
  ctx.fillStyle = '#9B111E'
  ctx.beginPath()
  ctx.ellipse(160, 520, 20, 7, 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.ellipse(440, 560, 20, 7, -0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}


// ═══════════════════════════════════════════════════════════════
// SHADOW DYNASTY — Chinese Shadow Puppet Theater
// ═══════════════════════════════════════════════════════════════

function drawShadowDynasty(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawShadowDynastyJack(ctx); break
    case 'Q': drawShadowDynastyQueen(ctx); break
    case 'K': drawShadowDynastyKing(ctx); break
    case 'A': drawShadowDynastyAce(ctx); break
  }
}

function drawShadowScreen(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createRadialGradient(300, 420, 50, 300, 420, 500)
  bg.addColorStop(0, '#F5A623')
  bg.addColorStop(0.3, '#E8932B')
  bg.addColorStop(0.6, '#D4801A')
  bg.addColorStop(0.85, '#A05A10')
  bg.addColorStop(1, '#3A2005')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  ctx.fillStyle = '#1A0A00'
  ctx.fillRect(0, 0, 20, 840)
  ctx.fillRect(580, 0, 20, 840)
  ctx.fillRect(0, 0, 600, 15)
  ctx.fillRect(0, 825, 600, 15)

  ctx.globalAlpha = 0.04
  for (let y = 20; y < 820; y += 6) {
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(25, y)
    ctx.lineTo(575, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const candle = ctx.createRadialGradient(300, 800, 5, 300, 800, 120)
  candle.addColorStop(0, 'rgba(255, 200, 80, 0.15)')
  candle.addColorStop(0.5, 'rgba(255, 160, 40, 0.06)')
  candle.addColorStop(1, 'transparent')
  ctx.fillStyle = candle
  ctx.fillRect(100, 700, 400, 140)
}

function drawPuppetJoint(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function drawPuppetStrings(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.lineWidth = 1.5
  for (const [x, y] of pts) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.quadraticCurveTo(x + 5, y * 0.4, x, y)
    ctx.stroke()
  }
}

function drawShadowDynastyJack(ctx: CanvasRenderingContext2D) {
  drawShadowScreen(ctx)
  drawPuppetStrings(ctx, [[200, 220], [300, 180], [400, 260], [340, 350]])

  ctx.fillStyle = '#000000'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 8

  // Head
  ctx.beginPath()
  ctx.ellipse(300, 210, 35, 40, -0.1, 0, Math.PI * 2)
  ctx.fill()
  // Warrior crest
  ctx.beginPath()
  ctx.moveTo(275, 175)
  ctx.quadraticCurveTo(290, 140, 320, 165)
  ctx.quadraticCurveTo(310, 155, 300, 170)
  ctx.closePath()
  ctx.fill()

  drawPuppetJoint(ctx, 252, 270, 6)
  drawPuppetJoint(ctx, 348, 270, 6)

  // Torso — lean, dynamic mid-leap
  ctx.beginPath()
  ctx.moveTo(260, 255)
  ctx.lineTo(250, 390)
  ctx.quadraticCurveTo(300, 410, 350, 390)
  ctx.lineTo(340, 255)
  ctx.quadraticCurveTo(300, 240, 260, 255)
  ctx.fill()

  // Left arm raised cutting a string
  ctx.lineWidth = 18
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#000000'
  ctx.beginPath()
  ctx.moveTo(255, 275)
  ctx.quadraticCurveTo(190, 240, 170, 180)
  ctx.stroke()
  drawPuppetJoint(ctx, 170, 180, 10)
  drawPuppetJoint(ctx, 215, 245, 5)
  // Curved blade
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(160, 170)
  ctx.quadraticCurveTo(140, 130, 165, 110)
  ctx.stroke()

  // Right arm extended
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(345, 275)
  ctx.quadraticCurveTo(410, 310, 440, 350)
  ctx.stroke()
  drawPuppetJoint(ctx, 380, 310, 5)
  drawPuppetJoint(ctx, 440, 350, 10)

  // Left leg kicked forward
  ctx.lineWidth = 20
  ctx.beginPath()
  ctx.moveTo(275, 395)
  ctx.quadraticCurveTo(230, 480, 200, 560)
  ctx.stroke()
  drawPuppetJoint(ctx, 245, 470, 6)
  drawPuppetJoint(ctx, 200, 560, 12)
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(200, 560)
  ctx.lineTo(170, 565)
  ctx.stroke()

  // Right leg bent behind
  ctx.lineWidth = 20
  ctx.beginPath()
  ctx.moveTo(325, 395)
  ctx.quadraticCurveTo(370, 470, 390, 530)
  ctx.stroke()
  drawPuppetJoint(ctx, 355, 450, 6)
  drawPuppetJoint(ctx, 390, 530, 12)

  // Cut string — dangling frayed
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 3])
  ctx.beginPath()
  ctx.moveTo(340, 0)
  ctx.quadraticCurveTo(345, 70, 338, 120)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.shadowBlur = 0
}

function drawShadowDynastyQueen(ctx: CanvasRenderingContext2D) {
  drawShadowScreen(ctx)

  ctx.fillStyle = '#000000'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 8

  // Desk
  ctx.fillRect(80, 500, 440, 12)
  ctx.fillRect(100, 512, 10, 100)
  ctx.fillRect(490, 512, 10, 100)

  // Old scroll being crossed out
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(350, 440, 100, 55)
  ctx.strokeStyle = 'rgba(245, 166, 35, 0.15)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(360, 445)
  ctx.lineTo(440, 490)
  ctx.moveTo(440, 445)
  ctx.lineTo(360, 490)
  ctx.stroke()

  ctx.fillStyle = '#000000'
  // Head
  ctx.beginPath()
  ctx.ellipse(280, 240, 32, 38, 0, 0, Math.PI * 2)
  ctx.fill()
  // Elegant updo
  ctx.beginPath()
  ctx.moveTo(255, 210)
  ctx.quadraticCurveTo(280, 170, 310, 200)
  ctx.quadraticCurveTo(320, 185, 305, 210)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(290, 185, 12, 0, Math.PI * 2)
  ctx.fill()

  // Torso — seated, elegant
  ctx.beginPath()
  ctx.moveTo(245, 280)
  ctx.quadraticCurveTo(230, 340, 220, 500)
  ctx.lineTo(340, 500)
  ctx.quadraticCurveTo(330, 340, 315, 280)
  ctx.quadraticCurveTo(280, 270, 245, 280)
  ctx.fill()

  // Flowing left sleeve
  ctx.beginPath()
  ctx.moveTo(245, 290)
  ctx.quadraticCurveTo(200, 330, 180, 380)
  ctx.quadraticCurveTo(170, 400, 190, 410)
  ctx.quadraticCurveTo(210, 380, 250, 340)
  ctx.closePath()
  ctx.fill()

  // Right arm writing with ink brush
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#000000'
  ctx.beginPath()
  ctx.moveTo(310, 300)
  ctx.quadraticCurveTo(340, 380, 330, 440)
  ctx.stroke()
  drawPuppetJoint(ctx, 330, 440, 10)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(330, 440)
  ctx.lineTo(320, 500)
  ctx.stroke()

  // Ink marks on desk
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(140 + i * 30, 470 + Math.sin(i) * 3)
    ctx.lineTo(155 + i * 30, 470 + Math.cos(i) * 2)
    ctx.stroke()
  }

  // Candle — flame shows amber through
  ctx.fillStyle = '#000000'
  ctx.fillRect(530, 460, 8, 40)
  ctx.fillStyle = '#F5A623'
  ctx.globalAlpha = 0.6
  ctx.beginPath()
  ctx.ellipse(534, 455, 5, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
}

function drawShadowDynastyKing(ctx: CanvasRenderingContext2D) {
  drawShadowScreen(ctx)

  // Puppeteer's hands from top — translucent
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#1A0A00'
  ctx.beginPath()
  ctx.moveTo(150, 0)
  ctx.quadraticCurveTo(140, 40, 130, 80)
  ctx.lineTo(110, 100)
  ctx.lineTo(120, 105)
  ctx.lineTo(135, 90)
  ctx.lineTo(140, 110)
  ctx.lineTo(155, 92)
  ctx.lineTo(148, 75)
  ctx.lineTo(165, 78)
  ctx.lineTo(150, 55)
  ctx.quadraticCurveTo(165, 30, 170, 0)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(430, 0)
  ctx.quadraticCurveTo(440, 40, 450, 80)
  ctx.lineTo(470, 100)
  ctx.lineTo(465, 107)
  ctx.lineTo(458, 88)
  ctx.lineTo(448, 100)
  ctx.lineTo(440, 68)
  ctx.quadraticCurveTo(425, 30, 420, 0)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Strings from hands to throne
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.lineWidth = 1.5
  const tops: [number, number][] = [[130, 100], [150, 85], [165, 80], [435, 88], [458, 90], [470, 100]]
  for (const [sx, sy] of tops) {
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(300 + (sx - 300) * 0.3, 300, 300 + (sx - 300) * 0.15, 480)
    ctx.stroke()
  }

  ctx.fillStyle = '#000000'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 12

  // Head — massive
  ctx.beginPath()
  ctx.ellipse(300, 260, 45, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  // Crown of knotted strings
  ctx.beginPath()
  ctx.moveTo(255, 230)
  ctx.lineTo(260, 195)
  ctx.quadraticCurveTo(280, 210, 300, 195)
  ctx.quadraticCurveTo(320, 210, 340, 195)
  ctx.lineTo(345, 230)
  ctx.quadraticCurveTo(300, 240, 255, 230)
  ctx.fill()

  // Massive torso — seated authority
  ctx.beginPath()
  ctx.moveTo(220, 310)
  ctx.quadraticCurveTo(200, 400, 190, 520)
  ctx.lineTo(410, 520)
  ctx.quadraticCurveTo(400, 400, 380, 310)
  ctx.quadraticCurveTo(300, 290, 220, 310)
  ctx.fill()

  // Arms on string-throne armrests
  ctx.lineWidth = 22
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#000000'
  ctx.beginPath()
  ctx.moveTo(225, 330)
  ctx.quadraticCurveTo(180, 380, 160, 440)
  ctx.stroke()
  drawPuppetJoint(ctx, 160, 440, 12)
  ctx.beginPath()
  ctx.moveTo(375, 330)
  ctx.quadraticCurveTo(420, 380, 440, 440)
  ctx.stroke()
  drawPuppetJoint(ctx, 440, 440, 12)

  // Legs seated
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.moveTo(260, 520)
  ctx.quadraticCurveTo(230, 600, 210, 680)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(340, 520)
  ctx.quadraticCurveTo(370, 600, 390, 680)
  ctx.stroke()
  ctx.lineWidth = 16
  ctx.beginPath()
  ctx.moveTo(210, 680)
  ctx.lineTo(180, 690)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(390, 680)
  ctx.lineTo(420, 690)
  ctx.stroke()

  ctx.shadowBlur = 0
}

function drawShadowDynastyAce(ctx: CanvasRenderingContext2D) {
  drawShadowScreen(ctx)

  ctx.fillStyle = '#000000'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 15

  // Spade shadow
  ctx.beginPath()
  ctx.moveTo(300, 200)
  ctx.bezierCurveTo(260, 230, 160, 310, 160, 400)
  ctx.bezierCurveTo(160, 460, 220, 490, 275, 470)
  ctx.bezierCurveTo(288, 465, 296, 458, 300, 445)
  ctx.bezierCurveTo(304, 458, 312, 465, 325, 470)
  ctx.bezierCurveTo(380, 490, 440, 460, 440, 400)
  ctx.bezierCurveTo(440, 310, 340, 230, 300, 200)
  ctx.fill()
  ctx.fillRect(285, 465, 30, 80)
  ctx.beginPath()
  ctx.moveTo(250, 545)
  ctx.quadraticCurveTo(275, 525, 300, 545)
  ctx.quadraticCurveTo(325, 525, 350, 545)
  ctx.fill()

  // Severed strings from top
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.lineWidth = 1.5
  for (const x of [150, 230, 300, 370, 450]) {
    const endY = 120 + Math.abs(x - 300) * 0.2
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.quadraticCurveTo(x + 3, 60, x - 2, endY)
    ctx.stroke()
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x - 2, endY)
    ctx.lineTo(x - 5, endY + 8)
    ctx.moveTo(x - 2, endY)
    ctx.lineTo(x + 2, endY + 6)
    ctx.stroke()
    ctx.lineWidth = 1.5
  }

  // Candle at bottom
  ctx.fillStyle = '#000000'
  ctx.fillRect(290, 650, 20, 80)
  ctx.beginPath()
  ctx.ellipse(300, 730, 25, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#F5A623'
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.ellipse(300, 640, 8, 15, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
}


// ═══════════════════════════════════════════════════════════════
// SOLAR PHARAOH — Ancient Egypt, Human Power Meets Solar Divinity
// ═══════════════════════════════════════════════════════════════

function drawSolarPharaoh(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawSolarPharaohJack(ctx); break
    case 'Q': drawSolarPharaohQueen(ctx); break
    case 'K': drawSolarPharaohKing(ctx); break
    case 'A': drawSolarPharaohAce(ctx); break
  }
}

function drawDesertTempleBackground(ctx: CanvasRenderingContext2D) {
  // Sky — amber to deep blue
  const sky = ctx.createLinearGradient(0, 0, 0, 500)
  sky.addColorStop(0, '#1A237E')
  sky.addColorStop(0.3, '#283593')
  sky.addColorStop(0.6, '#F57F17')
  sky.addColorStop(1, '#D4A574')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, 600, 500)

  // Desert sand
  const sand = ctx.createLinearGradient(0, 500, 0, 840)
  sand.addColorStop(0, '#D4A574')
  sand.addColorStop(0.5, '#C49464')
  sand.addColorStop(1, '#A07850')
  ctx.fillStyle = sand
  ctx.fillRect(0, 500, 600, 340)

  // Sand dune curves
  ctx.fillStyle = '#C49464'
  ctx.beginPath()
  ctx.moveTo(0, 520)
  ctx.quadraticCurveTo(150, 490, 300, 510)
  ctx.quadraticCurveTo(450, 530, 600, 500)
  ctx.lineTo(600, 540)
  ctx.lineTo(0, 540)
  ctx.closePath()
  ctx.fill()
}

function drawSolarPharaohJack(ctx: CanvasRenderingContext2D) {
  drawDesertTempleBackground(ctx)

  // Temple entrance — stone columns
  ctx.fillStyle = '#D4A574'
  ctx.fillRect(40, 200, 50, 500)
  ctx.fillRect(510, 200, 50, 500)
  // Column capitals
  ctx.fillStyle = '#D4A017'
  ctx.fillRect(30, 190, 70, 20)
  ctx.fillRect(500, 190, 70, 20)

  // Hieroglyphs on walls
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#D4A017'
  for (let y = 230; y < 600; y += 40) {
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(50 + i * 12, y, 8, 20)
      ctx.fillRect(520 + i * 12, y, 8, 20)
    }
  }
  ctx.globalAlpha = 1

  // Sun Priest — young, channeling sunlight through ankh
  // Skin tone
  const skinTone = '#C68B5B'

  // Linen robes — white with gold trim
  const robe = ctx.createLinearGradient(220, 300, 380, 600)
  robe.addColorStop(0, '#F5F0E0')
  robe.addColorStop(0.5, '#EDE5D0')
  robe.addColorStop(1, '#D4C5A0')
  ctx.fillStyle = robe
  ctx.beginPath()
  ctx.moveTo(240, 310)
  ctx.quadraticCurveTo(300, 290, 360, 310)
  ctx.lineTo(380, 620)
  ctx.quadraticCurveTo(300, 640, 220, 620)
  ctx.closePath()
  ctx.fill()

  // Gold belt/sash
  ctx.fillStyle = '#D4A017'
  ctx.fillRect(230, 420, 140, 10)
  ctx.fillStyle = '#F5E6C8'
  ctx.fillRect(292, 418, 16, 14)

  // Arms — left holding ankh staff upward
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(250, 330)
  ctx.quadraticCurveTo(200, 280, 180, 200)
  ctx.stroke()
  // Hand
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(180, 200, 10, 0, Math.PI * 2)
  ctx.fill()

  // Golden ankh staff
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 6
  // Staff shaft
  ctx.beginPath()
  ctx.moveTo(180, 200)
  ctx.lineTo(180, 80)
  ctx.stroke()
  // Ankh loop
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.ellipse(180, 65, 15, 18, 0, 0, Math.PI * 2)
  ctx.stroke()
  // Ankh crossbar
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(165, 90)
  ctx.lineTo(195, 90)
  ctx.stroke()

  // Light beam through ankh — key visual
  ctx.globalAlpha = 0.2
  const beam = ctx.createLinearGradient(180, 65, 450, 400)
  beam.addColorStop(0, '#FFD700')
  beam.addColorStop(0.5, '#F5E6C8')
  beam.addColorStop(1, 'transparent')
  ctx.fillStyle = beam
  ctx.beginPath()
  ctx.moveTo(168, 55)
  ctx.lineTo(192, 55)
  ctx.lineTo(460, 380)
  ctx.lineTo(420, 400)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Symbol projected on temple wall
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(440, 390, 25, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(440, 365)
  ctx.lineTo(430, 375)
  ctx.lineTo(450, 375)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Right arm at side
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(350, 330)
  ctx.quadraticCurveTo(380, 400, 370, 460)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(370, 460, 10, 0, Math.PI * 2)
  ctx.fill()

  // Head — shaved, kohl eyes
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.ellipse(300, 260, 38, 42, 0, 0, Math.PI * 2)
  ctx.fill()

  // Kohl-lined eyes
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 258, 7, 4, -0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 258, 7, 4, 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.arc(282, 258, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(318, 258, 2.5, 0, Math.PI * 2)
  ctx.fill()
  // Kohl liner
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(290, 258)
  ctx.lineTo(298, 255)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(310, 258)
  ctx.lineTo(302, 255)
  ctx.stroke()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 252)
  ctx.lineTo(297, 270)
  ctx.stroke()

  // Mouth — determined
  ctx.strokeStyle = '#8B5A3A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(288, 280)
  ctx.quadraticCurveTo(300, 286, 312, 280)
  ctx.stroke()

  // Ears
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.ellipse(260, 262, 6, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(340, 262, 6, 10, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawSolarPharaohQueen(ctx: CanvasRenderingContext2D) {
  // Throne room interior
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#2A1810')
  bg.addColorStop(0.3, '#3D2A1E')
  bg.addColorStop(0.6, '#4A3328')
  bg.addColorStop(1, '#2A1810')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Painted walls
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#D4A017'
  for (let y = 50; y < 800; y += 80) {
    ctx.fillRect(0, y, 600, 2)
  }
  ctx.globalAlpha = 1

  // Columns with arched doorways
  ctx.fillStyle = '#3D2A1E'
  ctx.fillRect(0, 0, 70, 840)
  ctx.fillRect(530, 0, 70, 840)
  // Arch
  ctx.fillStyle = '#2A1810'
  ctx.beginPath()
  ctx.moveTo(70, 0)
  ctx.quadraticCurveTo(300, 80, 530, 0)
  ctx.lineTo(530, 100)
  ctx.lineTo(70, 100)
  ctx.closePath()
  ctx.fill()

  // Latticed window light
  const windowLight = ctx.createRadialGradient(480, 200, 20, 480, 200, 200)
  windowLight.addColorStop(0, 'rgba(255, 215, 0, 0.12)')
  windowLight.addColorStop(1, 'transparent')
  ctx.fillStyle = windowLight
  ctx.fillRect(300, 50, 300, 400)

  const skinTone = '#C68B5B'

  // Pharaoh Queen — Nefertiti inspired
  // Elaborate dress
  const dress = ctx.createLinearGradient(200, 320, 400, 700)
  dress.addColorStop(0, '#00897B')
  dress.addColorStop(0.5, '#00796B')
  dress.addColorStop(1, '#004D40')
  ctx.fillStyle = dress
  ctx.beginPath()
  ctx.moveTo(235, 340)
  ctx.quadraticCurveTo(300, 320, 365, 340)
  ctx.lineTo(400, 700)
  ctx.quadraticCurveTo(300, 720, 200, 700)
  ctx.closePath()
  ctx.fill()

  // Gold collar jewelry
  ctx.fillStyle = '#D4A017'
  ctx.beginPath()
  ctx.moveTo(240, 310)
  ctx.quadraticCurveTo(300, 350, 360, 310)
  ctx.quadraticCurveTo(300, 290, 240, 310)
  ctx.fill()
  // Collar jewel details
  ctx.fillStyle = '#00897B'
  ctx.beginPath()
  ctx.arc(270, 320, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(300, 325, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(330, 320, 4, 0, Math.PI * 2)
  ctx.fill()

  // Left arm holding was-scepter
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(240, 350)
  ctx.quadraticCurveTo(200, 400, 190, 460)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(190, 460, 8, 0, Math.PI * 2)
  ctx.fill()
  // Was-scepter
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(190, 460)
  ctx.lineTo(175, 250)
  ctx.stroke()
  // Scepter head — stylized animal
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(175, 250)
  ctx.quadraticCurveTo(165, 235, 160, 240)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(175, 250)
  ctx.quadraticCurveTo(185, 235, 190, 240)
  ctx.stroke()

  // Right arm holding ankh
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(360, 350)
  ctx.quadraticCurveTo(400, 400, 410, 470)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(410, 470, 8, 0, Math.PI * 2)
  ctx.fill()
  // Ankh
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(415, 450, 10, 13, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(415, 463)
  ctx.lineTo(415, 510)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(405, 475)
  ctx.lineTo(425, 475)
  ctx.stroke()

  // Head
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.ellipse(300, 250, 36, 40, 0, 0, Math.PI * 2)
  ctx.fill()

  // Flat-topped crown with sun disk (Nefertiti style)
  ctx.fillStyle = '#1A237E'
  ctx.beginPath()
  ctx.moveTo(265, 250)
  ctx.lineTo(260, 170)
  ctx.lineTo(340, 170)
  ctx.lineTo(335, 250)
  ctx.closePath()
  ctx.fill()
  // Sun disk on crown
  ctx.fillStyle = '#D4A017'
  ctx.beginPath()
  ctx.arc(300, 165, 18, 0, Math.PI * 2)
  ctx.fill()
  // Cobra uraeus
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(300, 170)
  ctx.quadraticCurveTo(300, 150, 295, 140)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(290, 142)
  ctx.lineTo(295, 138)
  ctx.lineTo(300, 142)
  ctx.fill()

  // Eyes — kohl-lined, elegant
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(284, 248, 7, 4, -0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(316, 248, 7, 4, 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4A2800'
  ctx.beginPath()
  ctx.arc(284, 248, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(316, 248, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(276, 248)
  ctx.lineTo(270, 252)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(324, 248)
  ctx.lineTo(330, 252)
  ctx.stroke()

  // Serene smile
  ctx.strokeStyle = '#8B5A3A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(290, 268)
  ctx.quadraticCurveTo(300, 274, 310, 268)
  ctx.stroke()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 244)
  ctx.lineTo(297, 262)
  ctx.stroke()

  // Earrings
  ctx.fillStyle = '#D4A017'
  ctx.beginPath()
  ctx.arc(262, 260, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(338, 260, 4, 0, Math.PI * 2)
  ctx.fill()

  // Sun disk radiates
  const diskGlow = ctx.createRadialGradient(300, 165, 18, 300, 165, 80)
  diskGlow.addColorStop(0, 'rgba(255, 215, 0, 0.15)')
  diskGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = diskGlow
  ctx.fillRect(200, 80, 200, 180)
}

function drawSolarPharaohKing(ctx: CanvasRenderingContext2D) {
  // Sky transitioning — the King IS the sun
  const sky = ctx.createLinearGradient(0, 0, 0, 840)
  sky.addColorStop(0, '#1A237E')
  sky.addColorStop(0.2, '#283593')
  sky.addColorStop(0.4, '#F57F17')
  sky.addColorStop(0.6, '#D4A017')
  sky.addColorStop(1, '#D4A574')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, 600, 840)

  // Solar barque (boat) in background sky
  ctx.globalAlpha = 0.1
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(100, 150)
  ctx.quadraticCurveTo(200, 120, 300, 140)
  ctx.quadraticCurveTo(400, 160, 500, 130)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(120, 155)
  ctx.quadraticCurveTo(300, 180, 480, 140)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Desert below
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.moveTo(0, 700)
  ctx.quadraticCurveTo(300, 670, 600, 690)
  ctx.lineTo(600, 840)
  ctx.lineTo(0, 840)
  ctx.closePath()
  ctx.fill()

  const skinTone = '#C68B5B'

  // The Sun God — MASSIVE, merging with Ra
  // Solar halo behind head — the king IS the light source
  const halo = ctx.createRadialGradient(300, 230, 30, 300, 230, 200)
  halo.addColorStop(0, 'rgba(255, 215, 0, 0.4)')
  halo.addColorStop(0.3, 'rgba(245, 127, 23, 0.2)')
  halo.addColorStop(0.6, 'rgba(212, 160, 23, 0.08)')
  halo.addColorStop(1, 'transparent')
  ctx.fillStyle = halo
  ctx.fillRect(50, 30, 500, 400)

  // Sun ray lines radiating
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.12)'
  ctx.lineWidth = 2
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
    ctx.beginPath()
    ctx.moveTo(300 + Math.cos(angle) * 60, 230 + Math.sin(angle) * 60)
    ctx.lineTo(300 + Math.cos(angle) * 250, 230 + Math.sin(angle) * 250)
    ctx.stroke()
  }

  // Full ceremonial regalia
  const regalia = ctx.createLinearGradient(180, 340, 420, 680)
  regalia.addColorStop(0, '#D4A017')
  regalia.addColorStop(0.3, '#B8860B')
  regalia.addColorStop(0.7, '#8B6914')
  regalia.addColorStop(1, '#6B5210')
  ctx.fillStyle = regalia
  ctx.beginPath()
  ctx.moveTo(200, 340)
  ctx.quadraticCurveTo(300, 310, 400, 340)
  ctx.lineTo(430, 700)
  ctx.quadraticCurveTo(300, 730, 170, 700)
  ctx.closePath()
  ctx.fill()

  // Crook and flail crossed over chest
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 5
  // Crook
  ctx.beginPath()
  ctx.moveTo(260, 500)
  ctx.lineTo(270, 360)
  ctx.quadraticCurveTo(250, 330, 240, 340)
  ctx.stroke()
  // Flail
  ctx.beginPath()
  ctx.moveTo(340, 500)
  ctx.lineTo(330, 360)
  ctx.stroke()
  // Flail strips
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(330, 360)
  ctx.lineTo(345, 330)
  ctx.moveTo(330, 360)
  ctx.lineTo(355, 340)
  ctx.moveTo(330, 360)
  ctx.lineTo(360, 350)
  ctx.stroke()

  // Arms holding regalia
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(210, 370)
  ctx.quadraticCurveTo(230, 430, 260, 500)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(390, 370)
  ctx.quadraticCurveTo(370, 430, 340, 500)
  ctx.stroke()

  // Head
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.ellipse(300, 270, 42, 48, 0, 0, Math.PI * 2)
  ctx.fill()

  // Pharaoh headdress (nemes)
  ctx.fillStyle = '#D4A017'
  ctx.beginPath()
  ctx.moveTo(255, 270)
  ctx.lineTo(240, 230)
  ctx.lineTo(245, 200)
  ctx.quadraticCurveTo(300, 180, 355, 200)
  ctx.lineTo(360, 230)
  ctx.lineTo(345, 270)
  ctx.closePath()
  ctx.fill()
  // Nemes side flaps
  ctx.fillStyle = '#B8860B'
  ctx.beginPath()
  ctx.moveTo(255, 270)
  ctx.quadraticCurveTo(230, 320, 220, 380)
  ctx.lineTo(240, 380)
  ctx.quadraticCurveTo(250, 320, 265, 275)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(345, 270)
  ctx.quadraticCurveTo(370, 320, 380, 380)
  ctx.lineTo(360, 380)
  ctx.quadraticCurveTo(350, 320, 335, 275)
  ctx.closePath()
  ctx.fill()

  // Nemes stripes
  ctx.strokeStyle = '#1A237E'
  ctx.lineWidth = 2
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(260 + i * 22, 210)
    ctx.lineTo(258 + i * 22, 265)
    ctx.stroke()
  }

  // Eyes — divine, commanding
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 265, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 265, 8, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#F57F17'
  ctx.beginPath()
  ctx.arc(282, 265, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(318, 265, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.arc(282, 265, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(318, 265, 1.5, 0, Math.PI * 2)
  ctx.fill()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 260)
  ctx.lineTo(297, 278)
  ctx.stroke()

  // Stern mouth
  ctx.strokeStyle = '#8B5A3A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(288, 288)
  ctx.lineTo(312, 288)
  ctx.stroke()

  // Beard
  ctx.fillStyle = '#1A237E'
  ctx.beginPath()
  ctx.moveTo(292, 298)
  ctx.lineTo(290, 340)
  ctx.lineTo(310, 340)
  ctx.lineTo(308, 298)
  ctx.closePath()
  ctx.fill()
}

function drawSolarPharaohAce(ctx: CanvasRenderingContext2D) {
  // Sandstone background
  const bg = ctx.createRadialGradient(300, 420, 50, 300, 420, 450)
  bg.addColorStop(0, '#F5E6C8')
  bg.addColorStop(0.5, '#D4A574')
  bg.addColorStop(1, '#A07850')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Sunburst behind suit symbol
  ctx.strokeStyle = 'rgba(212, 160, 23, 0.2)'
  ctx.lineWidth = 3
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
    ctx.beginPath()
    ctx.moveTo(300 + Math.cos(angle) * 80, 380 + Math.sin(angle) * 80)
    ctx.lineTo(300 + Math.cos(angle) * 300, 380 + Math.sin(angle) * 300)
    ctx.stroke()
  }

  // Golden hieroglyph suit symbol
  ctx.fillStyle = '#D4A017'
  ctx.shadowColor = 'rgba(212, 160, 23, 0.3)'
  ctx.shadowBlur = 15
  ctx.beginPath()
  ctx.moveTo(300, 240)
  ctx.bezierCurveTo(270, 260, 190, 320, 190, 390)
  ctx.bezierCurveTo(190, 440, 240, 460, 280, 448)
  ctx.bezierCurveTo(290, 445, 296, 438, 300, 425)
  ctx.bezierCurveTo(304, 438, 310, 445, 320, 448)
  ctx.bezierCurveTo(360, 460, 410, 440, 410, 390)
  ctx.bezierCurveTo(410, 320, 330, 260, 300, 240)
  ctx.fill()
  ctx.fillRect(287, 445, 26, 60)
  ctx.beginPath()
  ctx.moveTo(260, 505)
  ctx.quadraticCurveTo(280, 490, 300, 505)
  ctx.quadraticCurveTo(320, 490, 340, 505)
  ctx.fill()

  // Scarab beetle at bottom
  ctx.fillStyle = '#00897B'
  ctx.beginPath()
  ctx.ellipse(300, 620, 25, 18, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(300, 620, 25, 18, 0, 0, Math.PI * 2)
  ctx.stroke()
  // Wings
  ctx.beginPath()
  ctx.moveTo(275, 620)
  ctx.quadraticCurveTo(220, 600, 200, 620)
  ctx.quadraticCurveTo(220, 640, 275, 625)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(325, 620)
  ctx.quadraticCurveTo(380, 600, 400, 620)
  ctx.quadraticCurveTo(380, 640, 325, 625)
  ctx.stroke()

  ctx.shadowBlur = 0
}


// ═══════════════════════════════════════════════════════════════
// SAKURA BLOOM — Feudal Japan / Ukiyo-e
// ═══════════════════════════════════════════════════════════════

function drawSakuraBloom(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawSakuraJack(ctx); break
    case 'Q': drawSakuraQueen(ctx); break
    case 'K': drawSakuraKing(ctx); break
    case 'A': drawSakuraAce(ctx); break
  }
}

function drawPetal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSakuraSky(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#F0D4DC')
  bg.addColorStop(0.3, '#E8C8D4')
  bg.addColorStop(0.7, '#DCC0C8')
  bg.addColorStop(1, '#D0B8C0')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)
}

function drawSakuraJack(ctx: CanvasRenderingContext2D) {
  drawSakuraSky(ctx)

  // Distant mountains — ukiyo-e flat perspective
  ctx.fillStyle = '#546E7A'
  ctx.globalAlpha = 0.25
  ctx.beginPath()
  ctx.moveTo(0, 200)
  ctx.quadraticCurveTo(100, 100, 200, 180)
  ctx.quadraticCurveTo(300, 80, 400, 160)
  ctx.quadraticCurveTo(500, 90, 600, 170)
  ctx.lineTo(600, 280)
  ctx.lineTo(0, 280)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Willow trees (left side)
  ctx.strokeStyle = '#546E7A'
  ctx.lineWidth = 4
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(50, 840)
  ctx.quadraticCurveTo(60, 500, 80, 200)
  ctx.stroke()
  ctx.strokeStyle = '#6A8A6A'
  ctx.lineWidth = 1
  for (let i = 0; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(80, 200 + i * 30)
    ctx.quadraticCurveTo(60 + i * 5, 300 + i * 20, 30, 400 + i * 30)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Arched bridge
  const bridgeGrad = ctx.createLinearGradient(100, 550, 500, 620)
  bridgeGrad.addColorStop(0, '#8B4513')
  bridgeGrad.addColorStop(1, '#5A2D0E')
  ctx.fillStyle = bridgeGrad
  ctx.beginPath()
  ctx.moveTo(80, 620)
  ctx.quadraticCurveTo(300, 530, 520, 620)
  ctx.lineTo(520, 650)
  ctx.quadraticCurveTo(300, 560, 80, 650)
  ctx.closePath()
  ctx.fill()
  // Railing posts
  ctx.fillStyle = '#5A2D0E'
  for (let i = 0; i < 7; i++) {
    const px = 120 + i * 60
    const py = 615 - Math.sin((i / 6) * Math.PI) * 45
    ctx.fillRect(px - 3, py - 40, 6, 42)
    ctx.beginPath()
    ctx.arc(px, py - 40, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.strokeStyle = '#5A2D0E'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(100, 585)
  ctx.quadraticCurveTo(300, 505, 500, 585)
  ctx.stroke()

  // Koi pond water
  const water = ctx.createLinearGradient(0, 650, 0, 840)
  water.addColorStop(0, '#4A7A8A')
  water.addColorStop(1, '#2A5A6A')
  ctx.fillStyle = water
  ctx.fillRect(0, 650, 600, 190)
  // Water ripples
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1
  for (let y = 670; y < 840; y += 25) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x < 600; x += 40) {
      ctx.quadraticCurveTo(x + 20, y - 4, x + 40, y)
    }
    ctx.stroke()
  }
  // Koi
  ctx.fillStyle = '#FFD700'
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.ellipse(350, 730, 18, 7, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FF6B35'
  ctx.beginPath()
  ctx.ellipse(345, 728, 6, 4, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(368, 732)
  ctx.lineTo(380, 725)
  ctx.lineTo(378, 740)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // ── THE RONIN ──
  const clothes = ctx.createLinearGradient(230, 340, 370, 580)
  clothes.addColorStop(0, '#4A5A6A')
  clothes.addColorStop(1, '#2A3A4A')
  ctx.fillStyle = clothes
  ctx.beginPath()
  ctx.moveTo(235, 340)
  ctx.quadraticCurveTo(300, 320, 365, 340)
  ctx.lineTo(360, 580)
  ctx.quadraticCurveTo(300, 600, 240, 580)
  ctx.closePath()
  ctx.fill()
  // Kimono overlap
  ctx.strokeStyle = '#2A3A4A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(265, 340)
  ctx.lineTo(310, 430)
  ctx.stroke()
  // Obi
  ctx.fillStyle = '#546E7A'
  ctx.fillRect(230, 460, 140, 20)

  // Neck + head
  ctx.fillStyle = '#D4A574'
  ctx.fillRect(282, 295, 36, 45)
  ctx.beginPath()
  ctx.ellipse(300, 255, 44, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  // Straw hat (sugegasa)
  ctx.fillStyle = '#D4C5A0'
  ctx.beginPath()
  ctx.moveTo(200, 230)
  ctx.quadraticCurveTo(300, 150, 400, 230)
  ctx.lineTo(370, 235)
  ctx.quadraticCurveTo(300, 200, 230, 235)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#8B0000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(230, 228)
  ctx.quadraticCurveTo(300, 207, 370, 228)
  ctx.stroke()

  // Hair peeking from hat
  ctx.fillStyle = '#1A1008'
  ctx.fillRect(253, 230, 7, 50)
  ctx.fillRect(340, 230, 7, 50)

  // Eyes — contemplative
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 258, 6, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 258, 6, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1A1008'
  ctx.beginPath()
  ctx.arc(284, 258, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(320, 258, 3, 0, Math.PI * 2)
  ctx.fill()
  // Eyebrows
  ctx.strokeStyle = '#1A1008'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(274, 251)
  ctx.quadraticCurveTo(282, 249, 290, 252)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(310, 252)
  ctx.quadraticCurveTo(318, 249, 326, 252)
  ctx.stroke()
  // Nose + mouth
  ctx.strokeStyle = '#B8845A'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 255)
  ctx.lineTo(297, 270)
  ctx.stroke()
  ctx.strokeStyle = '#9A6A4A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(290, 280)
  ctx.quadraticCurveTo(300, 283, 310, 280)
  ctx.stroke()

  // Right arm + katana at hip
  ctx.strokeStyle = '#4A5A6A'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(350, 370)
  ctx.quadraticCurveTo(380, 420, 370, 470)
  ctx.stroke()
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(370, 475, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.translate(370, 465)
  ctx.rotate(0.6)
  ctx.fillStyle = '#1A1008'
  ctx.fillRect(-4, 0, 8, 120)
  ctx.fillStyle = '#FFD700'
  ctx.fillRect(-8, -2, 16, 4)
  ctx.fillStyle = '#8B0000'
  ctx.fillRect(-5, -20, 10, 18)
  ctx.restore()

  // Left arm relaxed
  ctx.strokeStyle = '#4A5A6A'
  ctx.lineWidth = 13
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(250, 370)
  ctx.quadraticCurveTo(220, 430, 230, 500)
  ctx.stroke()
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(230, 505, 10, 0, Math.PI * 2)
  ctx.fill()

  // Falling cherry blossoms
  const petalColors = ['#FFB7C5', '#FFC8D4', '#FFAABB', '#FFD0DC']
  const petals: [number, number, number, number][] = [
    [100, 150, 5, 0.3], [450, 200, 4, 0.8], [200, 350, 3, 1.2], [500, 400, 4, 0.5],
    [80, 500, 5, 2.0], [420, 100, 3, 1.5], [550, 550, 4, 0.7], [160, 680, 3, 1.8],
  ]
  for (const [px, py, s, a] of petals) {
    drawPetal(ctx, px, py, s, a, petalColors[Math.floor(px * 0.01) % petalColors.length])
  }
}

function drawSakuraQueen(ctx: CanvasRenderingContext2D) {
  drawSakuraSky(ctx)

  // Tatami room
  const tatami = ctx.createLinearGradient(0, 500, 0, 840)
  tatami.addColorStop(0, '#C4B896')
  tatami.addColorStop(1, '#A89C78')
  ctx.fillStyle = tatami
  ctx.fillRect(0, 500, 600, 340)
  ctx.strokeStyle = '#9A8E6A'
  ctx.lineWidth = 1
  for (let x = 0; x < 600; x += 100) {
    ctx.beginPath()
    ctx.moveTo(x, 500)
    ctx.lineTo(x, 840)
    ctx.stroke()
  }

  // Painted screen background
  ctx.fillStyle = '#F5F0E0'
  ctx.fillRect(50, 60, 500, 380)
  ctx.strokeStyle = '#8B7355'
  ctx.lineWidth = 3
  ctx.strokeRect(50, 60, 500, 380)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(215, 60)
  ctx.lineTo(215, 440)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(385, 60)
  ctx.lineTo(385, 440)
  ctx.stroke()

  // Cherry tree painting on screen
  ctx.globalAlpha = 0.4
  ctx.strokeStyle = '#6B4D38'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(120, 440)
  ctx.quadraticCurveTo(150, 300, 200, 130)
  ctx.stroke()
  ctx.fillStyle = '#FFB7C5'
  const screenBlossoms: [number, number][] = [[200, 130], [250, 190], [190, 180], [100, 220], [230, 150]]
  for (const [px, py] of screenBlossoms) {
    ctx.beginPath()
    ctx.arc(px, py, 8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // ── THE GEISHA ──
  const kimono = ctx.createLinearGradient(220, 340, 380, 650)
  kimono.addColorStop(0, '#8B0000')
  kimono.addColorStop(1, '#5A0005')
  ctx.fillStyle = kimono
  ctx.beginPath()
  ctx.moveTo(230, 350)
  ctx.quadraticCurveTo(300, 330, 370, 350)
  ctx.lineTo(380, 650)
  ctx.quadraticCurveTo(300, 680, 220, 650)
  ctx.closePath()
  ctx.fill()

  // Sakura pattern on kimono
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#FFB7C5'
  const kimonoFlowers: [number, number][] = [[260, 400], [320, 450], [280, 530], [340, 380], [250, 600]]
  for (const [fx, fy] of kimonoFlowers) {
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2
      ctx.beginPath()
      ctx.ellipse(fx + Math.cos(angle) * 5, fy + Math.sin(angle) * 5, 4, 2, angle, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  // Obi sash
  ctx.fillStyle = '#FFD700'
  ctx.fillRect(225, 445, 150, 35)

  // Kimono collar (white inner)
  ctx.fillStyle = '#F5F0E0'
  ctx.beginPath()
  ctx.moveTo(265, 345)
  ctx.lineTo(300, 370)
  ctx.lineTo(335, 345)
  ctx.lineTo(325, 350)
  ctx.lineTo(300, 365)
  ctx.lineTo(275, 350)
  ctx.closePath()
  ctx.fill()

  // Neck + head
  ctx.fillStyle = '#E8C8A0'
  ctx.fillRect(285, 300, 30, 50)
  ctx.fillStyle = '#F0D4B8'
  ctx.beginPath()
  ctx.ellipse(300, 260, 42, 50, 0, 0, Math.PI * 2)
  ctx.fill()

  // Elaborate hair with kanzashi
  ctx.fillStyle = '#0A0A0A'
  ctx.beginPath()
  ctx.ellipse(300, 225, 48, 30, 0, Math.PI, 0)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(300, 200, 22, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  // Kanzashi pin
  ctx.fillStyle = '#FFD700'
  ctx.save()
  ctx.translate(325, 200)
  ctx.rotate(0.4)
  ctx.fillRect(-1, -25, 2, 30)
  ctx.fillStyle = '#FFB7C5'
  ctx.beginPath()
  ctx.arc(0, -28, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(0, -28, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Eyes — downcast, serene
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(284, 262, 5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(316, 262, 5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1A1008'
  ctx.beginPath()
  ctx.arc(284, 263, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(316, 263, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#1A1008'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(277, 256)
  ctx.quadraticCurveTo(284, 254, 291, 257)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(309, 257)
  ctx.quadraticCurveTo(316, 254, 323, 257)
  ctx.stroke()
  ctx.strokeStyle = '#C8A080'
  ctx.beginPath()
  ctx.moveTo(300, 262)
  ctx.lineTo(298, 274)
  ctx.stroke()
  // Lips
  ctx.fillStyle = '#CC3344'
  ctx.beginPath()
  ctx.moveTo(293, 282)
  ctx.quadraticCurveTo(300, 279, 307, 282)
  ctx.quadraticCurveTo(300, 285, 293, 282)
  ctx.fill()

  // Arms + tea bowl
  ctx.strokeStyle = '#8B0000'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(350, 370)
  ctx.quadraticCurveTo(370, 410, 350, 450)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(250, 370)
  ctx.quadraticCurveTo(230, 410, 250, 450)
  ctx.stroke()
  ctx.fillStyle = '#E8C8A0'
  ctx.beginPath()
  ctx.arc(348, 455, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(252, 455, 8, 0, Math.PI * 2)
  ctx.fill()

  // Tea bowl
  ctx.fillStyle = '#546E7A'
  ctx.beginPath()
  ctx.ellipse(300, 465, 20, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(280, 465)
  ctx.quadraticCurveTo(280, 480, 286, 482)
  ctx.lineTo(314, 482)
  ctx.quadraticCurveTo(320, 480, 320, 465)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#6B8B6A'
  ctx.beginPath()
  ctx.ellipse(300, 464, 16, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  // Steam
  ctx.globalAlpha = 0.12
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(295, 456)
  ctx.quadraticCurveTo(290, 440, 295, 420)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(305, 456)
  ctx.quadraticCurveTo(310, 435, 305, 415)
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawSakuraKing(ctx: CanvasRenderingContext2D) {
  drawSakuraSky(ctx)

  // Large cherry tree behind
  ctx.strokeStyle = '#5A3A2A'
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(450, 840)
  ctx.quadraticCurveTo(460, 500, 420, 200)
  ctx.stroke()
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(420, 200)
  ctx.quadraticCurveTo(350, 120, 250, 100)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(430, 250)
  ctx.quadraticCurveTo(500, 180, 560, 120)
  ctx.stroke()
  // Blossom clusters
  ctx.fillStyle = '#FFB7C5'
  ctx.globalAlpha = 0.6
  const clusters: [number, number][] = [[250, 95], [200, 80], [150, 90], [350, 120], [500, 180], [560, 120]]
  for (const [bx, by] of clusters) {
    for (let p = 0; p < 6; p++) {
      ctx.beginPath()
      ctx.arc(bx + Math.sin(p * 1.1) * 12, by + Math.cos(p * 1.3) * 10, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  // Dappled light
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 15; i++) {
    const dx = (i * 73) % 600
    const dy = (i * 47) % 500
    const dapple = ctx.createRadialGradient(dx, dy, 5, dx, dy, 30)
    dapple.addColorStop(0, '#FFD700')
    dapple.addColorStop(1, 'transparent')
    ctx.fillStyle = dapple
    ctx.fillRect(dx - 30, dy - 30, 60, 60)
  }
  ctx.globalAlpha = 1

  // Stone path
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#8A8A7A'
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.ellipse(300, 700 + i * 30, 80 - i * 8, 12, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // ── THE SHOGUN — massive, stoic ──
  const armor = ctx.createLinearGradient(170, 340, 430, 640)
  armor.addColorStop(0, '#1A1A2A')
  armor.addColorStop(0.5, '#2A2040')
  armor.addColorStop(1, '#0A0A1A')
  ctx.fillStyle = armor
  ctx.beginPath()
  ctx.moveTo(180, 350)
  ctx.quadraticCurveTo(300, 310, 420, 350)
  ctx.lineTo(430, 650)
  ctx.lineTo(170, 650)
  ctx.closePath()
  ctx.fill()

  // Shoulder guards (sode)
  ctx.fillStyle = '#2A2040'
  ctx.beginPath()
  ctx.moveTo(130, 340)
  ctx.lineTo(230, 340)
  ctx.lineTo(220, 420)
  ctx.lineTo(140, 420)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(370, 340)
  ctx.lineTo(470, 340)
  ctx.lineTo(460, 420)
  ctx.lineTo(380, 420)
  ctx.closePath()
  ctx.fill()
  // Armor lacing lines
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 0.8
  for (let y = 380; y < 640; y += 20) {
    ctx.beginPath()
    ctx.moveTo(200, y)
    ctx.lineTo(400, y)
    ctx.stroke()
  }

  // Gold clan crest
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(300, 400, 20, 0, Math.PI * 2)
  ctx.stroke()

  // Neck + head
  ctx.fillStyle = '#D4A574'
  ctx.fillRect(280, 300, 40, 50)
  ctx.beginPath()
  ctx.ellipse(300, 255, 50, 56, 0, 0, Math.PI * 2)
  ctx.fill()

  // Kabuto helmet
  ctx.fillStyle = '#1A1A2A'
  ctx.beginPath()
  ctx.ellipse(300, 230, 56, 36, 0, Math.PI, 0)
  ctx.fill()
  // Gold crescent maedate
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.moveTo(270, 200)
  ctx.quadraticCurveTo(300, 170, 330, 200)
  ctx.quadraticCurveTo(300, 180, 270, 200)
  ctx.fill()

  // Eyes — stern narrow
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 260, 6, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 260, 6, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1A1008'
  ctx.beginPath()
  ctx.arc(283, 260, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 260, 2.5, 0, Math.PI * 2)
  ctx.fill()
  // Heavy brows
  ctx.strokeStyle = '#1A1008'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(272, 253)
  ctx.lineTo(294, 254)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(306, 254)
  ctx.lineTo(328, 253)
  ctx.stroke()
  // Nose + mouth
  ctx.strokeStyle = '#B8845A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 258)
  ctx.lineTo(296, 275)
  ctx.stroke()
  ctx.strokeStyle = '#9A6A4A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(287, 286)
  ctx.lineTo(313, 286)
  ctx.stroke()

  // Left arm — war fan
  ctx.strokeStyle = '#2A2040'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(200, 380)
  ctx.quadraticCurveTo(160, 440, 170, 500)
  ctx.stroke()
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(170, 505, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.translate(165, 490)
  ctx.rotate(-0.3)
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.arc(0, 0, 25, -Math.PI * 0.7, Math.PI * 0.7)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#8B0000'
  ctx.beginPath()
  ctx.arc(0, 0, 18, -Math.PI * 0.5, Math.PI * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Right arm + katana across lap
  ctx.strokeStyle = '#2A2040'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(400, 380)
  ctx.quadraticCurveTo(440, 440, 430, 500)
  ctx.stroke()
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(430, 505, 10, 0, Math.PI * 2)
  ctx.fill()
  // Katana across lap
  ctx.fillStyle = '#1A1008'
  ctx.save()
  ctx.translate(170, 520)
  ctx.rotate(0.05)
  ctx.fillRect(0, -3, 260, 6)
  ctx.fillStyle = '#FFD700'
  ctx.fillRect(200, -7, 4, 14)
  ctx.fillStyle = '#5A3A2A'
  ctx.fillRect(204, -4, 50, 8)
  ctx.restore()

  // Edge petals — none touch the Shogun
  const petalColors3 = ['#FFB7C5', '#FFC8D4', '#FFAABB']
  const edgePetals: [number, number, number, number][] = [
    [50, 80, 5, 0.3], [100, 200, 4, 1.0], [550, 150, 4, 0.7], [60, 450, 5, 2.0],
    [540, 500, 4, 0.5], [80, 680, 3, 1.3], [520, 700, 5, 0.8],
  ]
  for (const [px, py, s, a] of edgePetals) {
    drawPetal(ctx, px, py, s, a, petalColors3[Math.floor(px * 0.02) % petalColors3.length])
  }
}

function drawSakuraAce(ctx: CanvasRenderingContext2D) {
  drawSakuraSky(ctx)

  // Unrolled scroll
  ctx.fillStyle = '#F5F0E0'
  ctx.fillRect(120, 200, 360, 440)
  ctx.fillStyle = '#D4C5A0'
  ctx.beginPath()
  ctx.ellipse(300, 200, 190, 15, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(300, 640, 190, 15, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#5A3A2A'
  ctx.fillRect(105, 192, 15, 16)
  ctx.fillRect(480, 192, 15, 16)
  ctx.fillRect(105, 632, 15, 16)
  ctx.fillRect(480, 632, 15, 16)

  // Suit symbol formed by petal swirl
  const petalColors4 = ['#FFB7C5', '#FFC8D4', '#FF9AAF', '#FFAABB']
  for (let i = 0; i < 30; i++) {
    const angle = i * 0.21 + 0.5
    const r = 15 + (i % 6) * 12
    const px = 300 + Math.cos(angle) * r * 0.7
    const py = 390 + Math.sin(angle) * r * 0.9
    drawPetal(ctx, px, py, 5, angle, petalColors4[i % 4])
  }

  // Calligraphy brush
  ctx.save()
  ctx.translate(430, 500)
  ctx.rotate(-0.4)
  ctx.fillStyle = '#8B7355'
  ctx.fillRect(-3, -80, 6, 80)
  ctx.fillStyle = '#1A1008'
  ctx.beginPath()
  ctx.moveTo(-4, 0)
  ctx.lineTo(4, 0)
  ctx.lineTo(1, 20)
  ctx.lineTo(-1, 20)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Ink drop
  ctx.fillStyle = '#1A1008'
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.arc(440, 540, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}


// ═══════════════════════════════════════════════════════════════
// CELESTIAL — Living Constellations in Deep Space
// ═══════════════════════════════════════════════════════════════

function drawCelestial(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawCelestialJack(ctx); break
    case 'Q': drawCelestialQueen(ctx); break
    case 'K': drawCelestialKing(ctx); break
    case 'A': drawCelestialAce(ctx); break
  }
}

function drawDeepSpaceBackground(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createRadialGradient(300, 420, 50, 300, 420, 500)
  bg.addColorStop(0, '#1A1A3E')
  bg.addColorStop(0.4, '#0D0D2A')
  bg.addColorStop(0.7, '#151535')
  bg.addColorStop(1, '#080818')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Star field — scattered small dots
  const starPositions = [
    [45, 60], [120, 30], [200, 90], [350, 50], [450, 80], [530, 40],
    [80, 180], [180, 200], [400, 160], [500, 200], [60, 300], [160, 350],
    [350, 300], [480, 330], [540, 280], [100, 450], [250, 480], [420, 460],
    [550, 450], [70, 560], [200, 600], [380, 580], [500, 560], [130, 700],
    [300, 720], [450, 700], [80, 780], [350, 790], [520, 750],
    [260, 140], [490, 110], [30, 400], [560, 380], [220, 320],
  ]
  for (const [x, y] of starPositions) {
    const brightness = 0.3 + Math.random() * 0.5
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
    ctx.beginPath()
    ctx.arc(x, y, 0.5 + Math.random() * 1.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Nebula tints
  ctx.globalAlpha = 0.06
  const nebula1 = ctx.createRadialGradient(150, 200, 30, 150, 200, 200)
  nebula1.addColorStop(0, '#CE93D8')
  nebula1.addColorStop(1, 'transparent')
  ctx.fillStyle = nebula1
  ctx.fillRect(0, 0, 400, 400)

  const nebula2 = ctx.createRadialGradient(450, 600, 30, 450, 600, 200)
  nebula2.addColorStop(0, '#283593')
  nebula2.addColorStop(1, 'transparent')
  ctx.fillStyle = nebula2
  ctx.fillRect(200, 400, 400, 400)
  ctx.globalAlpha = 1
}

function drawConstellationStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = '#FFD700'
  ctx.shadowColor = '#FFD700'
  ctx.shadowBlur = r * 4
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  // Core bright point
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(x, y, r * 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
}

function drawConstellationLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function drawCelestialJack(ctx: CanvasRenderingContext2D) {
  drawDeepSpaceBackground(ctx)

  // Orion's Apprentice — half constellation, half physical
  // The Orion star pattern on the LEFT side
  const orionStars: [number, number][] = [
    [120, 180], [160, 200], // shoulders
    [140, 300], [140, 350], [140, 400], // belt
    [110, 480], [170, 480], // legs
  ]
  // Constellation lines
  drawConstellationLine(ctx, 120, 180, 160, 200)
  drawConstellationLine(ctx, 120, 180, 140, 300)
  drawConstellationLine(ctx, 160, 200, 140, 300)
  drawConstellationLine(ctx, 140, 300, 140, 350)
  drawConstellationLine(ctx, 140, 350, 140, 400)
  drawConstellationLine(ctx, 140, 400, 110, 480)
  drawConstellationLine(ctx, 140, 400, 170, 480)
  for (const [x, y] of orionStars) {
    drawConstellationStar(ctx, x, y, 3)
  }

  // Transition zone — stars connecting to physical form
  // Golden connecting lines from constellation to body
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 5])
  ctx.beginPath()
  ctx.moveTo(160, 200)
  ctx.lineTo(260, 260)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(140, 400)
  ctx.lineTo(260, 500)
  ctx.stroke()
  ctx.setLineDash([])

  // Physical HALF of figure — right side becoming solid
  const skinTone = '#C68B5B'

  // Body — young hunter stepping out
  const tunic = ctx.createLinearGradient(260, 280, 420, 600)
  tunic.addColorStop(0, '#283593')
  tunic.addColorStop(0.5, '#1A237E')
  tunic.addColorStop(1, '#0D1040')
  ctx.fillStyle = tunic
  ctx.beginPath()
  ctx.moveTo(260, 300)
  ctx.quadraticCurveTo(340, 280, 400, 310)
  ctx.lineTo(410, 580)
  ctx.quadraticCurveTo(340, 610, 250, 580)
  ctx.closePath()
  ctx.fill()

  // Star patterns on tunic
  ctx.fillStyle = 'rgba(255, 215, 0, 0.08)'
  const tunicStars = [[290, 340], [340, 380], [310, 440], [360, 480], [280, 520]]
  for (const [sx, sy] of tunicStars) {
    ctx.beginPath()
    ctx.arc(sx, sy, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Left arm — still partially constellation (stars + lines)
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(260, 310)
  ctx.lineTo(220, 380)
  ctx.lineTo(200, 440)
  ctx.stroke()
  drawConstellationStar(ctx, 220, 380, 2.5)
  drawConstellationStar(ctx, 200, 440, 2.5)

  // Right arm — solid, reaching forward
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(395, 320)
  ctx.quadraticCurveTo(430, 380, 440, 430)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(440, 430, 10, 0, Math.PI * 2)
  ctx.fill()

  // Right leg stepping out — solid
  ctx.fillStyle = '#1A237E'
  ctx.beginPath()
  ctx.moveTo(330, 580)
  ctx.quadraticCurveTo(360, 660, 380, 740)
  ctx.lineTo(400, 740)
  ctx.quadraticCurveTo(380, 660, 360, 580)
  ctx.closePath()
  ctx.fill()
  // Foot
  ctx.fillStyle = '#0D1040'
  ctx.beginPath()
  ctx.ellipse(390, 745, 18, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  // Left leg — still constellation
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(270, 580)
  ctx.lineTo(240, 660)
  ctx.lineTo(220, 740)
  ctx.stroke()
  drawConstellationStar(ctx, 240, 660, 2)
  drawConstellationStar(ctx, 220, 740, 2)

  // Head — half solid, half star
  // Right half solid
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(330, 260, 35, -Math.PI / 2, Math.PI / 2)
  ctx.closePath()
  ctx.fill()

  // Left half — constellation points
  drawConstellationStar(ctx, 300, 240, 2.5)
  drawConstellationStar(ctx, 290, 260, 2)
  drawConstellationStar(ctx, 305, 280, 2)
  drawConstellationLine(ctx, 300, 240, 290, 260)
  drawConstellationLine(ctx, 290, 260, 305, 280)

  // Right eye (solid side)
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(345, 255, 5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(345, 255, 2, 0, Math.PI * 2)
  ctx.fill()

  // Hair on solid side
  ctx.fillStyle = '#1A1A3E'
  ctx.beginPath()
  ctx.moveTo(330, 225)
  ctx.quadraticCurveTo(370, 220, 365, 245)
  ctx.quadraticCurveTo(360, 235, 330, 240)
  ctx.closePath()
  ctx.fill()
}

function drawCelestialQueen(ctx: CanvasRenderingContext2D) {
  drawDeepSpaceBackground(ctx)

  // Cassiopeia Unbound — walking away from her empty W constellation chair

  // Empty W constellation chair behind her (upper area)
  const wStars: [number, number][] = [
    [120, 130], [190, 200], [260, 140], [330, 210], [400, 120],
  ]
  for (let i = 0; i < wStars.length - 1; i++) {
    drawConstellationLine(ctx, wStars[i][0], wStars[i][1], wStars[i + 1][0], wStars[i + 1][1])
  }
  for (const [x, y] of wStars) {
    drawConstellationStar(ctx, x, y, 3.5)
  }
  // "Empty" label — the chair is abandoned
  ctx.globalAlpha = 0.06
  ctx.fillStyle = '#CE93D8'
  ctx.beginPath()
  ctx.moveTo(120, 130)
  ctx.lineTo(190, 200)
  ctx.lineTo(260, 140)
  ctx.lineTo(330, 210)
  ctx.lineTo(400, 120)
  ctx.lineTo(400, 220)
  ctx.lineTo(120, 220)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Queen walking away — looking back over shoulder
  const skinTone = '#D4A574'

  // Star-cape trailing behind — connected stars flowing back
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)'
  ctx.lineWidth = 1
  const capeStars: [number, number][] = [
    [220, 340], [180, 380], [150, 440], [130, 500], [120, 570],
    [200, 400], [170, 470], [155, 530],
  ]
  for (let i = 0; i < capeStars.length - 1; i++) {
    if (i < 5) {
      ctx.beginPath()
      ctx.moveTo(capeStars[i][0], capeStars[i][1])
      ctx.lineTo(capeStars[i + 1][0], capeStars[i + 1][1])
      ctx.stroke()
    }
  }
  for (const [x, y] of capeStars) {
    drawConstellationStar(ctx, x, y, 2)
  }

  // Gown — deep space blue with star shimmer
  const gown = ctx.createLinearGradient(250, 340, 400, 750)
  gown.addColorStop(0, '#283593')
  gown.addColorStop(0.4, '#1A1A3E')
  gown.addColorStop(1, '#7B1FA2')
  ctx.fillStyle = gown
  ctx.beginPath()
  ctx.moveTo(260, 340)
  ctx.quadraticCurveTo(340, 320, 390, 350)
  ctx.lineTo(420, 750)
  ctx.quadraticCurveTo(340, 780, 230, 750)
  ctx.closePath()
  ctx.fill()

  // Gown star sparkles
  ctx.fillStyle = 'rgba(255, 215, 0, 0.12)'
  const gownStars = [[300, 400], [350, 450], [280, 500], [330, 560], [310, 650], [360, 700]]
  for (const [sx, sy] of gownStars) {
    ctx.beginPath()
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Arms
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  // Left arm trailing into cape
  ctx.beginPath()
  ctx.moveTo(265, 355)
  ctx.quadraticCurveTo(240, 380, 220, 340)
  ctx.stroke()
  // Right arm at side
  ctx.beginPath()
  ctx.moveTo(385, 360)
  ctx.quadraticCurveTo(410, 420, 400, 480)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(400, 480, 8, 0, Math.PI * 2)
  ctx.fill()

  // Head — looking back over shoulder
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.ellipse(310, 290, 34, 40, 0.15, 0, Math.PI * 2)
  ctx.fill()

  // Hair — dark with star accents
  ctx.fillStyle = '#0D0D2A'
  ctx.beginPath()
  ctx.moveTo(280, 260)
  ctx.quadraticCurveTo(310, 240, 345, 260)
  ctx.quadraticCurveTo(355, 270, 350, 290)
  ctx.quadraticCurveTo(340, 275, 310, 270)
  ctx.quadraticCurveTo(290, 275, 275, 285)
  ctx.closePath()
  ctx.fill()
  // Long hair flowing
  ctx.beginPath()
  ctx.moveTo(275, 285)
  ctx.quadraticCurveTo(260, 350, 240, 400)
  ctx.lineTo(255, 395)
  ctx.quadraticCurveTo(270, 345, 285, 290)
  ctx.closePath()
  ctx.fill()
  // Star pins in hair
  drawConstellationStar(ctx, 295, 255, 1.5)
  drawConstellationStar(ctx, 335, 265, 1.5)

  // Eyes — looking back
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(298, 287, 5, 3.5, 0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(322, 285, 5, 3.5, 0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#CE93D8'
  ctx.beginPath()
  ctx.arc(298, 287, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(322, 285, 2, 0, Math.PI * 2)
  ctx.fill()

  // Nose and mouth
  ctx.strokeStyle = '#A07858'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(310, 282)
  ctx.lineTo(308, 296)
  ctx.stroke()
  ctx.strokeStyle = '#C0826A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(302, 304)
  ctx.quadraticCurveTo(310, 308, 318, 304)
  ctx.stroke()
}

function drawCelestialKing(ctx: CanvasRenderingContext2D) {
  drawDeepSpaceBackground(ctx)

  // The Astronomer Royal — body IS the night sky, hands and face solid
  // His silhouette filled with cosmos

  // Body outline filled with deep space + galaxies
  ctx.save()
  ctx.beginPath()
  // Head
  ctx.arc(300, 240, 45, 0, Math.PI * 2)
  // Torso — massive
  ctx.moveTo(220, 300)
  ctx.quadraticCurveTo(200, 400, 185, 580)
  ctx.lineTo(415, 580)
  ctx.quadraticCurveTo(400, 400, 380, 300)
  ctx.quadraticCurveTo(300, 280, 220, 300)
  // Left arm
  ctx.moveTo(220, 320)
  ctx.quadraticCurveTo(170, 380, 150, 450)
  ctx.quadraticCurveTo(145, 465, 155, 470)
  ctx.quadraticCurveTo(175, 460, 195, 395)
  ctx.quadraticCurveTo(210, 350, 230, 330)
  // Right arm
  ctx.moveTo(380, 320)
  ctx.quadraticCurveTo(430, 380, 450, 450)
  ctx.quadraticCurveTo(455, 465, 445, 470)
  ctx.quadraticCurveTo(425, 460, 405, 395)
  ctx.quadraticCurveTo(390, 350, 370, 330)
  // Legs
  ctx.moveTo(240, 580)
  ctx.quadraticCurveTo(230, 660, 220, 740)
  ctx.lineTo(260, 740)
  ctx.quadraticCurveTo(270, 660, 280, 580)
  ctx.moveTo(320, 580)
  ctx.quadraticCurveTo(330, 660, 340, 740)
  ctx.lineTo(380, 740)
  ctx.quadraticCurveTo(370, 660, 360, 580)
  ctx.clip()

  // Fill clipped area with cosmos
  const cosmos = ctx.createRadialGradient(300, 400, 30, 300, 400, 400)
  cosmos.addColorStop(0, '#1A1A3E')
  cosmos.addColorStop(0.3, '#283593')
  cosmos.addColorStop(0.6, '#7B1FA2')
  cosmos.addColorStop(1, '#0D0D2A')
  ctx.fillStyle = cosmos
  ctx.fillRect(100, 190, 500, 600)

  // Galaxies visible through his body
  ctx.globalAlpha = 0.15
  const galaxy1 = ctx.createRadialGradient(280, 380, 5, 280, 380, 60)
  galaxy1.addColorStop(0, '#CE93D8')
  galaxy1.addColorStop(0.5, '#7B1FA2')
  galaxy1.addColorStop(1, 'transparent')
  ctx.fillStyle = galaxy1
  ctx.fillRect(220, 320, 120, 120)

  const galaxy2 = ctx.createRadialGradient(350, 500, 5, 350, 500, 50)
  galaxy2.addColorStop(0, '#FFD700')
  galaxy2.addColorStop(0.5, '#283593')
  galaxy2.addColorStop(1, 'transparent')
  ctx.fillStyle = galaxy2
  ctx.fillRect(300, 450, 100, 100)
  ctx.globalAlpha = 1

  // Stars inside body
  const bodyStars = [
    [250, 340], [310, 360], [270, 420], [340, 440], [290, 500],
    [330, 530], [260, 560], [310, 310], [350, 370], [240, 470],
  ]
  for (const [sx, sy] of bodyStars) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.4})`
    ctx.beginPath()
    ctx.arc(sx, sy, 1 + Math.random(), 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()

  // Face — SOLID, opaque (only solid part)
  const skinTone = '#C68B5B'
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.ellipse(300, 240, 40, 45, 0, 0, Math.PI * 2)
  ctx.fill()

  // Turban/head covering
  ctx.fillStyle = '#283593'
  ctx.beginPath()
  ctx.moveTo(258, 240)
  ctx.quadraticCurveTo(260, 190, 300, 185)
  ctx.quadraticCurveTo(340, 190, 342, 240)
  ctx.quadraticCurveTo(330, 220, 300, 215)
  ctx.quadraticCurveTo(270, 220, 258, 240)
  ctx.closePath()
  ctx.fill()

  // Wise, ancient eyes
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 240, 7, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 240, 7, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#7B1FA2'
  ctx.beginPath()
  ctx.arc(282, 240, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(318, 240, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Wise brow lines
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(273, 232)
  ctx.quadraticCurveTo(282, 229, 290, 232)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(310, 232)
  ctx.quadraticCurveTo(318, 229, 327, 232)
  ctx.stroke()

  // White beard — the only solid part of lower face
  ctx.fillStyle = '#E0E0E0'
  ctx.beginPath()
  ctx.moveTo(280, 270)
  ctx.quadraticCurveTo(300, 310, 320, 270)
  ctx.quadraticCurveTo(310, 295, 300, 300)
  ctx.quadraticCurveTo(290, 295, 280, 270)
  ctx.fill()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 238)
  ctx.lineTo(297, 258)
  ctx.stroke()

  // Hands — SOLID, holding brass astrolabe
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(150, 455, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(450, 455, 12, 0, Math.PI * 2)
  ctx.fill()

  // Brass astrolabe — held between hands
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(300, 440, 45, 0, Math.PI * 2)
  ctx.stroke()
  // Inner rings
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(300, 440, 30, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(300, 440, 15, 0, Math.PI * 2)
  ctx.stroke()
  // Cross lines
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(255, 440)
  ctx.lineTo(345, 440)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(300, 395)
  ctx.lineTo(300, 485)
  ctx.stroke()
  // Center point
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(300, 440, 4, 0, Math.PI * 2)
  ctx.fill()

  // Astrolabe glow lighting the face
  const astroGlow = ctx.createRadialGradient(300, 440, 10, 300, 440, 120)
  astroGlow.addColorStop(0, 'rgba(255, 215, 0, 0.08)')
  astroGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = astroGlow
  ctx.fillRect(180, 320, 240, 240)
}

function drawCelestialAce(ctx: CanvasRenderingContext2D) {
  drawDeepSpaceBackground(ctx)

  // New constellation being born — stars connecting into suit symbol

  // Completed connection lines (3/4 done)
  const spadeStars: [number, number][] = [
    [300, 220], // top
    [250, 290], [350, 290], // upper curves
    [200, 370], [400, 370], // mid curves
    [210, 430], [390, 430], // lower curves
    [260, 460], [340, 460], // inner curves
    [300, 440], // center merge
    [300, 530], // stem bottom
  ]

  // Draw completed lines
  const completedLines: [number, number, number, number][] = [
    [300, 220, 250, 290],
    [300, 220, 350, 290],
    [250, 290, 200, 370],
    [350, 290, 400, 370],
    [200, 370, 210, 430],
    [400, 370, 390, 430],
    [210, 430, 260, 460],
    [390, 430, 340, 460],
  ]
  for (const [x1, y1, x2, y2] of completedLines) {
    drawConstellationLine(ctx, x1, y1, x2, y2)
  }

  // Incomplete line — still drawing (dashed)
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 6])
  ctx.beginPath()
  ctx.moveTo(260, 460)
  ctx.lineTo(300, 440)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(340, 460)
  ctx.lineTo(300, 440)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(300, 440)
  ctx.lineTo(300, 530)
  ctx.stroke()
  ctx.setLineDash([])

  // Draw all stars
  for (const [x, y] of spadeStars) {
    drawConstellationStar(ctx, x, y, 3.5)
  }

  // Bright guiding star at next connection point
  drawConstellationStar(ctx, 300, 440, 6)

  // Stem base stars
  drawConstellationStar(ctx, 270, 540, 2.5)
  drawConstellationStar(ctx, 330, 540, 2.5)
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 5])
  ctx.beginPath()
  ctx.moveTo(300, 530)
  ctx.lineTo(270, 540)
  ctx.moveTo(300, 530)
  ctx.lineTo(330, 540)
  ctx.stroke()
  ctx.setLineDash([])
}


// ═══════════════════════════════════════════════════════════════
// BLOOD MOON — Cursed Royal Court
// ═══════════════════════════════════════════════════════════════

function drawBloodMoon(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawBloodMoonJack(ctx); break
    case 'Q': drawBloodMoonQueen(ctx); break
    case 'K': drawBloodMoonKing(ctx); break
    case 'A': drawBloodMoonAce(ctx); break
  }
}

function drawCursedHall(ctx: CanvasRenderingContext2D) {
  // Near-black base
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#1A1A1A')
  bg.addColorStop(0.5, '#212121')
  bg.addColorStop(1, '#161616')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Stone walls (faint texture)
  ctx.globalAlpha = 0.04
  for (let y = 0; y < 840; y += 40) {
    for (let x = 0; x < 600; x += 60) {
      ctx.strokeStyle = '#424242'
      ctx.lineWidth = 0.5
      ctx.strokeRect(x + (y % 80 === 0 ? 0 : 30), y, 60, 40)
    }
  }
  ctx.globalAlpha = 1
}

function drawCobweb(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.strokeStyle = '#BDBDBD'
  ctx.lineWidth = 0.5
  ctx.globalAlpha = 0.1
  // Radial strands
  for (let a = 0; a < 6; a++) {
    const angle = (a / 6) * Math.PI + 0.3
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    ctx.stroke()
  }
  // Concentric arcs
  for (let r = radius * 0.3; r < radius; r += radius * 0.25) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0.3, Math.PI + 0.3)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawBloodMoonJack(ctx: CanvasRenderingContext2D) {
  drawCursedHall(ctx)

  // Banquet table
  const table = ctx.createLinearGradient(0, 580, 0, 700)
  table.addColorStop(0, '#333333')
  table.addColorStop(0.5, '#2A2A2A')
  table.addColorStop(1, '#1A1A1A')
  ctx.fillStyle = table
  ctx.fillRect(0, 580, 600, 120)
  // Table edge
  ctx.strokeStyle = '#424242'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 582)
  ctx.lineTo(600, 582)
  ctx.stroke()

  // Dust on table
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#BDBDBD'
  ctx.fillRect(0, 582, 600, 5)
  ctx.globalAlpha = 1

  // Frozen food on table — grey, petrified
  ctx.fillStyle = '#3A3A3A'
  ctx.beginPath()
  ctx.ellipse(150, 610, 30, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(450, 615, 25, 10, 0.1, 0, Math.PI * 2)
  ctx.fill()

  // Window with blood-red moonlight shaft
  ctx.fillStyle = '#2A2A2A'
  ctx.fillRect(420, 40, 100, 180)
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 4
  ctx.strokeRect(420, 40, 100, 180)
  // Cross bar
  ctx.beginPath()
  ctx.moveTo(470, 40)
  ctx.lineTo(470, 220)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(420, 130)
  ctx.lineTo(520, 130)
  ctx.stroke()

  // Blood-red moonlight shaft from window
  ctx.globalAlpha = 0.12
  const moonShaft = ctx.createLinearGradient(470, 40, 280, 400)
  moonShaft.addColorStop(0, '#8B0000')
  moonShaft.addColorStop(0.5, '#8B0000')
  moonShaft.addColorStop(1, 'transparent')
  ctx.fillStyle = moonShaft
  ctx.beginPath()
  ctx.moveTo(420, 40)
  ctx.lineTo(520, 40)
  ctx.lineTo(340, 500)
  ctx.lineTo(240, 500)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Cobwebs
  drawCobweb(ctx, 80, 50, 80)
  drawCobweb(ctx, 550, 300, 60)

  // ── THE WAKING PAGE — frozen mid-pour ──
  // Body — servant's livery, dust-covered
  const livery = ctx.createLinearGradient(230, 330, 370, 560)
  livery.addColorStop(0, '#3A3A3A')
  livery.addColorStop(1, '#2A2A2A')
  ctx.fillStyle = livery
  ctx.beginPath()
  ctx.moveTo(240, 340)
  ctx.quadraticCurveTo(300, 320, 360, 340)
  ctx.lineTo(355, 570)
  ctx.quadraticCurveTo(300, 585, 245, 570)
  ctx.closePath()
  ctx.fill()

  // Dust on shoulders
  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#BDBDBD'
  ctx.beginPath()
  ctx.moveTo(240, 340)
  ctx.quadraticCurveTo(300, 330, 360, 340)
  ctx.lineTo(355, 355)
  ctx.quadraticCurveTo(300, 345, 245, 355)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Collar detail
  ctx.fillStyle = '#424242'
  ctx.beginPath()
  ctx.moveTo(270, 340)
  ctx.lineTo(300, 355)
  ctx.lineTo(330, 340)
  ctx.closePath()
  ctx.fill()

  // Neck
  ctx.fillStyle = '#8A7A6A'
  ctx.fillRect(283, 298, 34, 42)

  // HEAD — young face, dawning awareness
  ctx.fillStyle = '#9A8A7A'
  ctx.beginPath()
  ctx.ellipse(300, 260, 44, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  // Blood moonlight hitting face
  const faceRed = ctx.createLinearGradient(340, 200, 270, 300)
  faceRed.addColorStop(0, 'rgba(139, 0, 0, 0.15)')
  faceRed.addColorStop(1, 'transparent')
  ctx.fillStyle = faceRed
  ctx.beginPath()
  ctx.ellipse(300, 260, 44, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  // Dusty hair
  ctx.fillStyle = '#3A3A3A'
  ctx.beginPath()
  ctx.ellipse(300, 225, 46, 30, 0, Math.PI, 0)
  ctx.fill()
  // Dust in hair
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#BDBDBD'
  ctx.beginPath()
  ctx.ellipse(300, 220, 30, 10, 0, Math.PI, 0)
  ctx.fill()
  ctx.globalAlpha = 1

  // EYES — JUST opened, wide with dawning awareness
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 260, 7, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 260, 7, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  // Iris — grey-brown, wide
  ctx.fillStyle = '#5A5040'
  ctx.beginPath()
  ctx.arc(282, 260, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(318, 260, 3.5, 0, Math.PI * 2)
  ctx.fill()
  // Pupil
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(282, 260, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(318, 260, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // Eyebrows — raised in surprise
  ctx.strokeStyle = '#4A4040'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(272, 250)
  ctx.quadraticCurveTo(282, 246, 292, 251)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(308, 251)
  ctx.quadraticCurveTo(318, 246, 328, 250)
  ctx.stroke()
  // Nose
  ctx.strokeStyle = '#7A6A5A'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 258)
  ctx.lineTo(297, 272)
  ctx.stroke()
  // Mouth — slightly parted (shock of waking)
  ctx.fillStyle = '#5A4A3A'
  ctx.beginPath()
  ctx.ellipse(300, 282, 6, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // RIGHT ARM — frozen mid-pour, holding bottle
  ctx.strokeStyle = '#3A3A3A'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(350, 360)
  ctx.quadraticCurveTo(390, 400, 380, 450)
  ctx.stroke()
  ctx.fillStyle = '#8A7A6A'
  ctx.beginPath()
  ctx.arc(380, 455, 10, 0, Math.PI * 2)
  ctx.fill()
  // Wine bottle
  ctx.fillStyle = '#2A2A2A'
  ctx.save()
  ctx.translate(385, 440)
  ctx.rotate(-0.3)
  ctx.fillRect(-8, -35, 16, 35)
  ctx.fillRect(-5, -50, 10, 18)
  ctx.beginPath()
  ctx.arc(0, -50, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // SUSPENDED WINE — frozen in midair
  ctx.fillStyle = '#8B0000'
  ctx.globalAlpha = 0.6
  ctx.beginPath()
  ctx.ellipse(400, 490, 8, 14, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(395, 505, 5, 8, -0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Wine glass below (on table)
  ctx.strokeStyle = 'rgba(189, 189, 189, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(390, 560)
  ctx.lineTo(385, 575)
  ctx.lineTo(415, 575)
  ctx.lineTo(410, 560)
  ctx.stroke()

  // LEFT ARM — barely starting to move
  ctx.strokeStyle = '#3A3A3A'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(250, 360)
  ctx.quadraticCurveTo(220, 420, 225, 480)
  ctx.stroke()
  ctx.fillStyle = '#8A7A6A'
  ctx.beginPath()
  ctx.arc(225, 485, 10, 0, Math.PI * 2)
  ctx.fill()

  // Cobwebs connecting him to table
  ctx.strokeStyle = '#BDBDBD'
  ctx.lineWidth = 0.5
  ctx.globalAlpha = 0.08
  ctx.beginPath()
  ctx.moveTo(225, 490)
  ctx.quadraticCurveTo(200, 530, 180, 580)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(380, 460)
  ctx.quadraticCurveTo(400, 520, 420, 580)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Dust motes in moonlight shaft
  ctx.fillStyle = '#BDBDBD'
  ctx.globalAlpha = 0.15
  const dustMotes: [number, number, number][] = [
    [310, 200, 1.5], [330, 280, 1], [290, 350, 1.2], [350, 150, 0.8],
    [270, 420, 1], [360, 320, 0.7],
  ]
  for (const [dx, dy, dr] of dustMotes) {
    ctx.beginPath()
    ctx.arc(dx, dy, dr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawBloodMoonQueen(ctx: CanvasRenderingContext2D) {
  drawCursedHall(ctx)

  // Stone corridor
  // Perspective lines for corridor depth
  ctx.strokeStyle = '#2A2A2A'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.15
  for (let y = 0; y < 840; y += 60) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(600, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Heavy door on right side
  ctx.fillStyle = '#2A2018'
  ctx.fillRect(400, 80, 160, 600)
  // Door planks
  ctx.strokeStyle = '#1A1008'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(450, 80)
  ctx.lineTo(450, 680)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(500, 80)
  ctx.lineTo(500, 680)
  ctx.stroke()
  // Door handle
  ctx.fillStyle = '#424242'
  ctx.beginPath()
  ctx.arc(420, 380, 8, 0, Math.PI * 2)
  ctx.fill()

  // Crack in door — blood-red moonlight
  ctx.fillStyle = '#8B0000'
  ctx.globalAlpha = 0.6
  ctx.fillRect(398, 100, 4, 560)
  ctx.globalAlpha = 1

  // Red light shaft from door crack
  ctx.globalAlpha = 0.1
  const doorLight = ctx.createLinearGradient(400, 300, 200, 300)
  doorLight.addColorStop(0, '#8B0000')
  doorLight.addColorStop(1, 'transparent')
  ctx.fillStyle = doorLight
  ctx.beginPath()
  ctx.moveTo(400, 100)
  ctx.lineTo(400, 660)
  ctx.lineTo(150, 500)
  ctx.lineTo(150, 200)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Cobwebs
  drawCobweb(ctx, 100, 60, 90)
  drawCobweb(ctx, 500, 100, 50)

  // ── THE CURSED BRIDE — centuries-old wedding dress ──
  // Dress — once-white, now grey, tattered
  const dress = ctx.createLinearGradient(200, 340, 380, 700)
  dress.addColorStop(0, '#4A4A4A')
  dress.addColorStop(0.5, '#3A3A3A')
  dress.addColorStop(1, '#2A2A2A')
  ctx.fillStyle = dress
  ctx.beginPath()
  ctx.moveTo(230, 350)
  ctx.quadraticCurveTo(300, 330, 370, 350)
  ctx.lineTo(390, 700)
  ctx.quadraticCurveTo(300, 720, 210, 700)
  ctx.closePath()
  ctx.fill()

  // Tattered lace edges
  ctx.strokeStyle = '#555'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 5])
  ctx.beginPath()
  ctx.moveTo(215, 690)
  ctx.quadraticCurveTo(300, 710, 385, 690)
  ctx.stroke()
  ctx.setLineDash([])

  // Veil remnants on shoulders
  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#BDBDBD'
  ctx.beginPath()
  ctx.moveTo(230, 340)
  ctx.quadraticCurveTo(200, 360, 180, 420)
  ctx.lineTo(210, 420)
  ctx.quadraticCurveTo(220, 370, 240, 350)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(370, 340)
  ctx.quadraticCurveTo(400, 360, 420, 420)
  ctx.lineTo(390, 420)
  ctx.quadraticCurveTo(380, 370, 360, 350)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Neck
  ctx.fillStyle = '#8A7A6A'
  ctx.fillRect(285, 300, 30, 50)

  // HEAD — dawning awareness after centuries
  ctx.fillStyle = '#9A8A7A'
  ctx.beginPath()
  ctx.ellipse(300, 255, 44, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  // Blood moonlight on face (from door crack)
  const brideRed = ctx.createLinearGradient(380, 200, 260, 300)
  brideRed.addColorStop(0, 'rgba(139, 0, 0, 0.12)')
  brideRed.addColorStop(1, 'transparent')
  ctx.fillStyle = brideRed
  ctx.beginPath()
  ctx.ellipse(300, 255, 44, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — long, tangled, with dried roses and cobwebs
  ctx.fillStyle = '#2A2A2A'
  ctx.beginPath()
  ctx.ellipse(300, 220, 50, 32, 0, Math.PI, 0)
  ctx.fill()
  // Long tangled strands
  ctx.beginPath()
  ctx.moveTo(254, 230)
  ctx.quadraticCurveTo(240, 300, 235, 400)
  ctx.lineTo(245, 400)
  ctx.quadraticCurveTo(248, 300, 260, 235)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(346, 230)
  ctx.quadraticCurveTo(360, 300, 365, 400)
  ctx.lineTo(355, 400)
  ctx.quadraticCurveTo(352, 300, 340, 235)
  ctx.closePath()
  ctx.fill()

  // Dried roses in hair
  ctx.fillStyle = '#4A2020'
  ctx.beginPath()
  ctx.arc(270, 215, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(330, 210, 4, 0, Math.PI * 2)
  ctx.fill()
  // Cobweb in hair
  ctx.strokeStyle = '#BDBDBD'
  ctx.lineWidth = 0.3
  ctx.globalAlpha = 0.12
  ctx.beginPath()
  ctx.moveTo(280, 200)
  ctx.lineTo(310, 205)
  ctx.lineTo(290, 215)
  ctx.lineTo(320, 210)
  ctx.stroke()
  ctx.globalAlpha = 1

  // EYES — dawning awareness
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(284, 258, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(316, 258, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#5A5040'
  ctx.beginPath()
  ctx.arc(284, 258, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(316, 258, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(284, 258, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(316, 258, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // Eyebrows — confusion/awareness
  ctx.strokeStyle = '#4A4040'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(275, 250)
  ctx.quadraticCurveTo(284, 247, 293, 252)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(307, 252)
  ctx.quadraticCurveTo(316, 247, 325, 251)
  ctx.stroke()
  // Nose
  ctx.strokeStyle = '#7A6A5A'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 256)
  ctx.lineTo(297, 270)
  ctx.stroke()
  // Mouth — slightly parted
  ctx.fillStyle = '#5A4A3A'
  ctx.beginPath()
  ctx.ellipse(300, 280, 5, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // RIGHT ARM — reaching toward the door
  ctx.strokeStyle = '#4A4A4A'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(350, 370)
  ctx.quadraticCurveTo(380, 360, 395, 370)
  ctx.stroke()
  ctx.fillStyle = '#8A7A6A'
  ctx.beginPath()
  ctx.arc(398, 370, 10, 0, Math.PI * 2)
  ctx.fill()
  // Fingers reaching
  ctx.strokeStyle = '#8A7A6A'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(405, 365)
  ctx.lineTo(412, 362)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(406, 370)
  ctx.lineTo(414, 370)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(405, 375)
  ctx.lineTo(412, 378)
  ctx.stroke()

  // LEFT ARM — at side
  ctx.strokeStyle = '#4A4A4A'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(250, 370)
  ctx.quadraticCurveTo(220, 430, 230, 500)
  ctx.stroke()
  ctx.fillStyle = '#8A7A6A'
  ctx.beginPath()
  ctx.arc(230, 505, 10, 0, Math.PI * 2)
  ctx.fill()

  // Dust motes in red light
  ctx.fillStyle = '#BDBDBD'
  ctx.globalAlpha = 0.12
  const dustBride: [number, number, number][] = [[350, 180, 1.2], [320, 300, 1], [370, 250, 0.8], [340, 400, 1.1]]
  for (const [dx, dy, dr] of dustBride) {
    ctx.beginPath()
    ctx.arc(dx, dy, dr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawBloodMoonKing(ctx: CanvasRenderingContext2D) {
  drawCursedHall(ctx)

  // Banquet table head
  const table = ctx.createLinearGradient(0, 550, 0, 680)
  table.addColorStop(0, '#333333')
  table.addColorStop(1, '#1A1A1A')
  ctx.fillStyle = table
  ctx.fillRect(0, 550, 600, 130)
  ctx.strokeStyle = '#424242'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 552)
  ctx.lineTo(600, 552)
  ctx.stroke()

  // Petrified feast on table
  ctx.fillStyle = '#3A3A3A'
  ctx.beginPath()
  ctx.ellipse(180, 590, 35, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(420, 595, 28, 12, 0.1, 0, Math.PI * 2)
  ctx.fill()
  // Petrified bread
  ctx.fillStyle = '#4A4A3A'
  ctx.beginPath()
  ctx.ellipse(320, 585, 15, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  // Dark candelabras
  ctx.fillStyle = '#2A2A2A'
  ctx.fillRect(130, 500, 8, 55)
  ctx.fillRect(460, 500, 8, 55)
  // Candle stubs (unlit)
  ctx.fillStyle = '#3A3A3A'
  ctx.fillRect(125, 490, 6, 15)
  ctx.fillRect(137, 488, 6, 17)
  ctx.fillRect(455, 490, 6, 15)
  ctx.fillRect(467, 488, 6, 17)

  // Window with blood moon light
  ctx.fillStyle = '#2A2A2A'
  ctx.fillRect(450, 30, 110, 200)
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 4
  ctx.strokeRect(450, 30, 110, 200)
  ctx.beginPath()
  ctx.moveTo(505, 30)
  ctx.lineTo(505, 230)
  ctx.stroke()

  // Blood moonlight hitting crown specifically
  ctx.globalAlpha = 0.15
  const crownLight = ctx.createRadialGradient(300, 180, 20, 300, 180, 120)
  crownLight.addColorStop(0, '#8B0000')
  crownLight.addColorStop(1, 'transparent')
  ctx.fillStyle = crownLight
  ctx.fillRect(180, 80, 240, 200)
  ctx.globalAlpha = 1

  // Cobwebs
  drawCobweb(ctx, 60, 40, 70)
  drawCobweb(ctx, 580, 250, 50)

  // ── THE SLEEPING HOST — king at head of table ──
  // Massive body — regal robes, dust-covered
  const robes = ctx.createLinearGradient(170, 320, 430, 550)
  robes.addColorStop(0, '#3A3A3A')
  robes.addColorStop(0.5, '#333333')
  robes.addColorStop(1, '#2A2A2A')
  ctx.fillStyle = robes
  ctx.beginPath()
  ctx.moveTo(170, 340)
  ctx.quadraticCurveTo(300, 300, 430, 340)
  ctx.lineTo(440, 560)
  ctx.lineTo(160, 560)
  ctx.closePath()
  ctx.fill()

  // Dust on shoulders and robes
  ctx.globalAlpha = 0.1
  ctx.fillStyle = '#BDBDBD'
  ctx.beginPath()
  ctx.moveTo(175, 340)
  ctx.quadraticCurveTo(300, 320, 425, 340)
  ctx.lineTo(420, 360)
  ctx.quadraticCurveTo(300, 340, 180, 360)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Robe collar / ermine trim (grey, moth-eaten)
  ctx.fillStyle = '#4A4A4A'
  ctx.beginPath()
  ctx.moveTo(220, 340)
  ctx.lineTo(300, 360)
  ctx.lineTo(380, 340)
  ctx.lineTo(370, 350)
  ctx.lineTo(300, 365)
  ctx.lineTo(230, 350)
  ctx.closePath()
  ctx.fill()

  // Thick neck
  ctx.fillStyle = '#8A7A6A'
  ctx.fillRect(275, 290, 50, 50)

  // HEAD — massive, imposing
  ctx.fillStyle = '#9A8A7A'
  ctx.beginPath()
  ctx.ellipse(300, 245, 52, 58, 0, 0, Math.PI * 2)
  ctx.fill()

  // CROWN — glowing red from blood moonlight
  ctx.fillStyle = '#424242'
  // Crown base band
  ctx.fillRect(255, 195, 90, 15)
  // Crown points
  ctx.beginPath()
  ctx.moveTo(255, 195)
  ctx.lineTo(265, 170)
  ctx.lineTo(275, 195)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(285, 195)
  ctx.lineTo(300, 165)
  ctx.lineTo(315, 195)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(325, 195)
  ctx.lineTo(335, 170)
  ctx.lineTo(345, 195)
  ctx.fill()

  // Blood-red glow on crown
  ctx.globalAlpha = 0.4
  ctx.fillStyle = '#8B0000'
  ctx.fillRect(255, 165, 90, 45)
  ctx.globalAlpha = 1
  // Crown jewels (dull)
  ctx.fillStyle = '#4A2020'
  ctx.beginPath()
  ctx.arc(300, 175, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(270, 180, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(330, 180, 3, 0, Math.PI * 2)
  ctx.fill()

  // Dust on crown
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#BDBDBD'
  ctx.fillRect(258, 192, 84, 5)
  ctx.globalAlpha = 1

  // Hair/beard — grey, dusty
  ctx.fillStyle = '#4A4A4A'
  ctx.beginPath()
  ctx.ellipse(300, 218, 50, 22, 0, Math.PI, 0)
  ctx.fill()
  // Beard
  ctx.beginPath()
  ctx.moveTo(270, 285)
  ctx.quadraticCurveTo(300, 310, 330, 285)
  ctx.quadraticCurveTo(300, 320, 270, 285)
  ctx.fill()

  // EYES — closed or barely opening
  ctx.strokeStyle = '#5A5040'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(272, 260)
  ctx.quadraticCurveTo(282, 258, 292, 260)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(308, 260)
  ctx.quadraticCurveTo(318, 258, 328, 260)
  ctx.stroke()
  // Nose
  ctx.strokeStyle = '#7A6A5A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 258)
  ctx.lineTo(296, 274)
  ctx.stroke()
  // Mouth — tight, centuries-set
  ctx.strokeStyle = '#6A5A4A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(286, 288)
  ctx.lineTo(314, 288)
  ctx.stroke()

  // RIGHT ARM — goblet STILL raised for toast
  ctx.strokeStyle = '#3A3A3A'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(380, 370)
  ctx.quadraticCurveTo(420, 350, 430, 320)
  ctx.stroke()
  ctx.fillStyle = '#8A7A6A'
  ctx.beginPath()
  ctx.arc(432, 315, 12, 0, Math.PI * 2)
  ctx.fill()
  // Fingers beginning to curl
  ctx.strokeStyle = '#8A7A6A'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(440, 310)
  ctx.quadraticCurveTo(445, 308, 443, 312)
  ctx.stroke()

  // Goblet
  ctx.fillStyle = '#424242'
  ctx.beginPath()
  ctx.moveTo(420, 290)
  ctx.lineTo(415, 310)
  ctx.lineTo(445, 310)
  ctx.lineTo(440, 290)
  ctx.closePath()
  ctx.fill()
  // Goblet stem
  ctx.fillRect(427, 310, 6, 10)
  // Goblet base
  ctx.beginPath()
  ctx.ellipse(430, 322, 10, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // LEFT ARM on table
  ctx.strokeStyle = '#3A3A3A'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(220, 370)
  ctx.quadraticCurveTo(180, 430, 170, 490)
  ctx.stroke()
  ctx.fillStyle = '#8A7A6A'
  ctx.beginPath()
  ctx.arc(168, 495, 12, 0, Math.PI * 2)
  ctx.fill()

  // Cobwebs on king
  ctx.strokeStyle = '#BDBDBD'
  ctx.lineWidth = 0.4
  ctx.globalAlpha = 0.08
  ctx.beginPath()
  ctx.moveTo(430, 320)
  ctx.quadraticCurveTo(460, 380, 500, 400)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(170, 490)
  ctx.quadraticCurveTo(140, 520, 120, 555)
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawBloodMoonAce(ctx: CanvasRenderingContext2D) {
  drawCursedHall(ctx)

  // Cracked cathedral window
  // Window arch
  ctx.fillStyle = '#2A2A2A'
  ctx.beginPath()
  ctx.moveTo(150, 500)
  ctx.lineTo(150, 200)
  ctx.quadraticCurveTo(300, 50, 450, 200)
  ctx.lineTo(450, 500)
  ctx.closePath()
  ctx.fill()

  // Window panes — cracked, broken
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 4
  // Vertical bars
  ctx.beginPath()
  ctx.moveTo(250, 200)
  ctx.lineTo(250, 500)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(350, 200)
  ctx.lineTo(350, 500)
  ctx.stroke()
  // Horizontal bars
  ctx.beginPath()
  ctx.moveTo(150, 300)
  ctx.lineTo(450, 300)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(150, 400)
  ctx.lineTo(450, 400)
  ctx.stroke()

  // Blood moon visible through window — THE suit symbol
  const moonGlow = ctx.createRadialGradient(300, 280, 30, 300, 280, 100)
  moonGlow.addColorStop(0, '#8B0000')
  moonGlow.addColorStop(0.3, 'rgba(139, 0, 0, 0.5)')
  moonGlow.addColorStop(0.7, 'rgba(139, 0, 0, 0.1)')
  moonGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = moonGlow
  ctx.fillRect(150, 100, 300, 350)

  // Moon circle (blood red)
  ctx.fillStyle = '#8B0000'
  ctx.beginPath()
  ctx.arc(300, 280, 50, 0, Math.PI * 2)
  ctx.fill()
  // Moon highlight
  const moonHi = ctx.createRadialGradient(285, 265, 5, 300, 280, 45)
  moonHi.addColorStop(0, 'rgba(255, 100, 100, 0.3)')
  moonHi.addColorStop(1, 'transparent')
  ctx.fillStyle = moonHi
  ctx.beginPath()
  ctx.arc(300, 280, 50, 0, Math.PI * 2)
  ctx.fill()

  // Cracks radiating from broken panes
  ctx.strokeStyle = '#555'
  ctx.lineWidth = 1
  const cracks: [number, number, number, number][] = [
    [280, 350, 250, 380], [320, 320, 360, 290], [200, 260, 180, 230],
    [380, 420, 410, 450], [270, 440, 240, 470],
  ]
  for (const [x1, y1, x2, y2] of cracks) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // Cobwebs across broken panes
  drawCobweb(ctx, 200, 240, 50)
  drawCobweb(ctx, 380, 350, 40)

  // Dust in red light
  ctx.fillStyle = '#BDBDBD'
  ctx.globalAlpha = 0.15
  for (let i = 0; i < 20; i++) {
    const dx = 200 + (i * 17) % 200
    const dy = 150 + (i * 31) % 300
    ctx.beginPath()
    ctx.arc(dx, dy, 0.5 + (i % 3) * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}


// ═══════════════════════════════════════════════════════════════
// DRAGON'S HOARD — Dragon-Bonded Warriors Dynasty (Legendary)
// ═══════════════════════════════════════════════════════════════

function drawDragonsHoard(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawDragonsHoardJack(ctx); break
    case 'Q': drawDragonsHoardQueen(ctx); break
    case 'K': drawDragonsHoardKing(ctx); break
    case 'A': drawDragonsHoardAce(ctx); break
  }
}

function drawDragonSkyBackground(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 0, 840)
  bg.addColorStop(0, '#1A1A1A')
  bg.addColorStop(0.2, '#722F37')
  bg.addColorStop(0.5, '#E65100')
  bg.addColorStop(0.8, '#FF6D00')
  bg.addColorStop(1, '#FFD700')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Cloud wisps
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(150, 200, 100, 20, -0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(450, 300, 80, 15, 0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(250, 400, 120, 18, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Gold mountain in distance
  ctx.fillStyle = '#FFD700'
  ctx.globalAlpha = 0.15
  ctx.beginPath()
  ctx.moveTo(150, 780)
  ctx.lineTo(300, 650)
  ctx.lineTo(450, 780)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawDragonsHoardJack(ctx: CanvasRenderingContext2D) {
  drawDragonSkyBackground(ctx)

  // The Dragon Rider — mounted on young dragon mid-flight

  // Young dragon body — sleek, iridescent
  const dragonBody = ctx.createLinearGradient(100, 350, 500, 550)
  dragonBody.addColorStop(0, '#722F37')
  dragonBody.addColorStop(0.3, '#9B111E')
  dragonBody.addColorStop(0.6, '#E65100')
  dragonBody.addColorStop(1, '#FF6D00')
  ctx.fillStyle = dragonBody
  // Dragon body — serpentine
  ctx.beginPath()
  ctx.moveTo(80, 500)
  ctx.quadraticCurveTo(200, 420, 320, 440)
  ctx.quadraticCurveTo(440, 460, 520, 520)
  ctx.quadraticCurveTo(440, 490, 320, 480)
  ctx.quadraticCurveTo(200, 460, 80, 530)
  ctx.closePath()
  ctx.fill()

  // Dragon neck and head
  ctx.beginPath()
  ctx.moveTo(80, 500)
  ctx.quadraticCurveTo(50, 440, 60, 380)
  ctx.quadraticCurveTo(70, 350, 100, 340)
  ctx.lineTo(110, 370)
  ctx.quadraticCurveTo(80, 380, 80, 430)
  ctx.closePath()
  ctx.fill()
  // Dragon head
  ctx.fillStyle = '#9B111E'
  ctx.beginPath()
  ctx.ellipse(95, 340, 22, 16, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // Dragon eye
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(88, 335, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.arc(88, 335, 2, 0, Math.PI * 2)
  ctx.fill()
  // Nostrils — tiny smoke
  ctx.strokeStyle = 'rgba(255, 109, 0, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(75, 338)
  ctx.quadraticCurveTo(65, 330, 60, 320)
  ctx.stroke()

  // Dragon wings — spread in flight
  ctx.fillStyle = 'rgba(155, 17, 30, 0.6)'
  // Left wing
  ctx.beginPath()
  ctx.moveTo(180, 430)
  ctx.quadraticCurveTo(120, 300, 60, 250)
  ctx.quadraticCurveTo(100, 280, 130, 340)
  ctx.quadraticCurveTo(150, 380, 180, 430)
  ctx.fill()
  // Right wing
  ctx.beginPath()
  ctx.moveTo(380, 450)
  ctx.quadraticCurveTo(440, 300, 530, 240)
  ctx.quadraticCurveTo(500, 280, 460, 340)
  ctx.quadraticCurveTo(430, 390, 380, 450)
  ctx.fill()

  // Wing membrane lines
  ctx.strokeStyle = 'rgba(114, 47, 55, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(180, 430)
  ctx.quadraticCurveTo(140, 330, 80, 270)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(380, 450)
  ctx.quadraticCurveTo(420, 330, 500, 260)
  ctx.stroke()

  // Dragon tail
  ctx.strokeStyle = dragonBody
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(520, 520)
  ctx.quadraticCurveTo(560, 560, 550, 620)
  ctx.stroke()
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(550, 620)
  ctx.quadraticCurveTo(540, 650, 530, 640)
  ctx.stroke()

  // RIDER mounted on dragon
  const skinTone = '#C68B5B'

  // Leather flight armor
  ctx.fillStyle = '#4A2800'
  ctx.beginPath()
  ctx.moveTo(250, 310)
  ctx.quadraticCurveTo(300, 290, 340, 310)
  ctx.lineTo(350, 420)
  ctx.quadraticCurveTo(300, 440, 240, 420)
  ctx.closePath()
  ctx.fill()

  // Arms — left holding spear, right gripping dragon
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  // Left arm with spear
  ctx.beginPath()
  ctx.moveTo(255, 320)
  ctx.quadraticCurveTo(220, 280, 200, 240)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(200, 240, 8, 0, Math.PI * 2)
  ctx.fill()
  // Spear
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(200, 240)
  ctx.lineTo(180, 140)
  ctx.stroke()
  // Spear tip
  ctx.fillStyle = '#D4D4D4'
  ctx.beginPath()
  ctx.moveTo(175, 140)
  ctx.lineTo(180, 120)
  ctx.lineTo(185, 140)
  ctx.closePath()
  ctx.fill()

  // Right arm gripping
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(340, 330)
  ctx.quadraticCurveTo(360, 380, 350, 420)
  ctx.stroke()

  // Head — hair whipping back
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.ellipse(295, 275, 28, 32, 0, 0, Math.PI * 2)
  ctx.fill()

  // Wind-blown hair
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.moveTo(275, 250)
  ctx.quadraticCurveTo(295, 240, 320, 250)
  ctx.quadraticCurveTo(340, 245, 360, 255)
  ctx.quadraticCurveTo(340, 260, 320, 265)
  ctx.quadraticCurveTo(300, 258, 275, 265)
  ctx.closePath()
  ctx.fill()

  // Eyes — determined
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 273, 4, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(305, 273, 4, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4A2800'
  ctx.beginPath()
  ctx.arc(282, 273, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(305, 273, 2, 0, Math.PI * 2)
  ctx.fill()

  // Mouth — grinning
  ctx.strokeStyle = '#8B5A3A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(285, 290)
  ctx.quadraticCurveTo(293, 296, 305, 290)
  ctx.stroke()
}

function drawDragonsHoardQueen(ctx: CanvasRenderingContext2D) {
  // Dragon lair — warm cave interior
  const bg = ctx.createRadialGradient(300, 420, 50, 300, 420, 450)
  bg.addColorStop(0, '#E65100')
  bg.addColorStop(0.3, '#722F37')
  bg.addColorStop(0.6, '#3A1515')
  bg.addColorStop(1, '#1A1A1A')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Cave walls
  ctx.fillStyle = '#2A1515'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(50, 200, 30, 400)
  ctx.quadraticCurveTo(40, 600, 0, 840)
  ctx.lineTo(0, 0)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(600, 0)
  ctx.quadraticCurveTo(550, 200, 570, 400)
  ctx.quadraticCurveTo(560, 600, 600, 840)
  ctx.lineTo(600, 0)
  ctx.fill()

  // Treasure glimpses at bottom
  ctx.fillStyle = '#FFD700'
  ctx.globalAlpha = 0.15
  for (let x = 80; x < 520; x += 30) {
    ctx.beginPath()
    ctx.ellipse(x, 750 + Math.sin(x) * 10, 8 + Math.random() * 6, 4, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const skinTone = '#C68B5B'

  // Adult dragon wrapping protectively behind/around queen
  const dragonScale = ctx.createLinearGradient(100, 200, 500, 600)
  dragonScale.addColorStop(0, '#9B111E')
  dragonScale.addColorStop(0.5, '#722F37')
  dragonScale.addColorStop(1, '#4A1515')
  ctx.fillStyle = dragonScale
  // Dragon coil behind
  ctx.beginPath()
  ctx.moveTo(480, 200)
  ctx.quadraticCurveTo(520, 300, 500, 400)
  ctx.quadraticCurveTo(480, 500, 500, 600)
  ctx.lineTo(540, 600)
  ctx.quadraticCurveTo(520, 500, 540, 400)
  ctx.quadraticCurveTo(560, 300, 520, 200)
  ctx.closePath()
  ctx.fill()
  // Dragon head near queen's shoulder
  ctx.fillStyle = '#722F37'
  ctx.beginPath()
  ctx.ellipse(430, 270, 30, 22, 0.3, 0, Math.PI * 2)
  ctx.fill()
  // Dragon eye
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(445, 262, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.arc(445, 262, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Dragon-scale armor (grown, organic)
  const armor = ctx.createLinearGradient(200, 320, 400, 650)
  armor.addColorStop(0, '#722F37')
  armor.addColorStop(0.5, '#9B111E')
  armor.addColorStop(1, '#4A1515')
  ctx.fillStyle = armor
  ctx.beginPath()
  ctx.moveTo(230, 330)
  ctx.quadraticCurveTo(300, 310, 370, 330)
  ctx.lineTo(390, 650)
  ctx.quadraticCurveTo(300, 680, 210, 650)
  ctx.closePath()
  ctx.fill()

  // Scale texture on armor
  ctx.strokeStyle = 'rgba(155, 17, 30, 0.3)'
  ctx.lineWidth = 1
  for (let y = 360; y < 640; y += 20) {
    for (let x = 230; x < 380; x += 20) {
      ctx.beginPath()
      ctx.arc(x + (y % 40 === 0 ? 0 : 10), y, 8, Math.PI * 0.8, Math.PI * 2.2)
      ctx.stroke()
    }
  }

  // Arms
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  // Right arm holding dragon egg
  ctx.beginPath()
  ctx.moveTo(360, 350)
  ctx.quadraticCurveTo(380, 420, 370, 480)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(370, 480, 8, 0, Math.PI * 2)
  ctx.fill()

  // Glowing dragon egg
  const eggGlow = ctx.createRadialGradient(370, 520, 5, 370, 520, 40)
  eggGlow.addColorStop(0, '#FF6D00')
  eggGlow.addColorStop(0.5, '#E65100')
  eggGlow.addColorStop(1, '#9B111E')
  ctx.fillStyle = eggGlow
  ctx.beginPath()
  ctx.ellipse(370, 520, 25, 32, 0, 0, Math.PI * 2)
  ctx.fill()
  // Egg heat glow
  const heatGlow = ctx.createRadialGradient(370, 520, 20, 370, 520, 60)
  heatGlow.addColorStop(0, 'rgba(255, 109, 0, 0.15)')
  heatGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = heatGlow
  ctx.fillRect(310, 460, 120, 120)

  // Left arm at side
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(240, 350)
  ctx.quadraticCurveTo(210, 420, 220, 480)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(220, 480, 8, 0, Math.PI * 2)
  ctx.fill()

  // Three hatchlings at feet
  ctx.fillStyle = '#E65100'
  for (const [hx, hy] of [[200, 680], [300, 700], [380, 690]] as [number, number][]) {
    ctx.beginPath()
    ctx.ellipse(hx, hy, 12, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    // Tiny head
    ctx.beginPath()
    ctx.arc(hx + 8, hy - 5, 5, 0, Math.PI * 2)
    ctx.fill()
    // Tiny eye
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(hx + 10, hy - 6, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#E65100'
  }

  // Head
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.ellipse(300, 280, 34, 40, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — dark, flowing
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.moveTo(268, 255)
  ctx.quadraticCurveTo(300, 235, 335, 255)
  ctx.quadraticCurveTo(345, 270, 340, 310)
  ctx.quadraticCurveTo(330, 295, 300, 285)
  ctx.quadraticCurveTo(270, 295, 260, 310)
  ctx.quadraticCurveTo(255, 270, 268, 255)
  ctx.closePath()
  ctx.fill()

  // Eyes — powerful, knowing
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(284, 278, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(316, 278, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#E65100'
  ctx.beginPath()
  ctx.arc(284, 278, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(316, 278, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Nose and mouth
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 275)
  ctx.lineTo(297, 290)
  ctx.stroke()
  ctx.strokeStyle = '#C0826A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(290, 298)
  ctx.quadraticCurveTo(300, 302, 310, 298)
  ctx.stroke()
}

function drawDragonsHoardKing(ctx: CanvasRenderingContext2D) {
  // Cave with treasure mountain
  const bg = ctx.createLinearGradient(0, 0, 0, 840)
  bg.addColorStop(0, '#1A1A1A')
  bg.addColorStop(0.3, '#2A1515')
  bg.addColorStop(0.6, '#3A2010')
  bg.addColorStop(1, '#FFD700')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Cave ceiling
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(600, 0)
  ctx.lineTo(600, 100)
  ctx.quadraticCurveTo(300, 150, 0, 80)
  ctx.closePath()
  ctx.fill()

  // Treasure mountain base
  ctx.fillStyle = '#FFD700'
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(0, 600)
  ctx.quadraticCurveTo(300, 500, 600, 580)
  ctx.lineTo(600, 840)
  ctx.lineTo(0, 840)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Scattered treasure details
  ctx.fillStyle = '#FFD700'
  ctx.globalAlpha = 0.2
  for (let i = 0; i < 20; i++) {
    const tx = 50 + Math.random() * 500
    const ty = 620 + Math.random() * 180
    ctx.beginPath()
    ctx.ellipse(tx, ty, 4 + Math.random() * 8, 2 + Math.random() * 4, Math.random(), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Massive dragon curled behind king
  ctx.fillStyle = '#722F37'
  ctx.globalAlpha = 0.4
  ctx.beginPath()
  ctx.moveTo(500, 150)
  ctx.quadraticCurveTo(550, 250, 530, 400)
  ctx.quadraticCurveTo(510, 550, 540, 700)
  ctx.lineTo(580, 700)
  ctx.quadraticCurveTo(560, 550, 580, 400)
  ctx.quadraticCurveTo(600, 250, 560, 150)
  ctx.closePath()
  ctx.fill()
  // Dragon wing silhouette
  ctx.beginPath()
  ctx.moveTo(520, 250)
  ctx.quadraticCurveTo(460, 150, 400, 100)
  ctx.quadraticCurveTo(440, 170, 480, 260)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Fire glow from dragon
  const fireGlow = ctx.createRadialGradient(500, 300, 20, 500, 300, 200)
  fireGlow.addColorStop(0, 'rgba(255, 109, 0, 0.1)')
  fireGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = fireGlow
  ctx.fillRect(300, 100, 300, 400)

  const skinTone = '#C68B5B'

  // The Dragon King — becoming part dragon
  // Massive body on treasure heap
  const kingsArmor = ctx.createLinearGradient(180, 300, 420, 650)
  kingsArmor.addColorStop(0, '#722F37')
  kingsArmor.addColorStop(0.4, '#4A1515')
  kingsArmor.addColorStop(1, '#1A1A1A')
  ctx.fillStyle = kingsArmor
  ctx.beginPath()
  ctx.moveTo(190, 330)
  ctx.quadraticCurveTo(300, 300, 410, 330)
  ctx.lineTo(440, 650)
  ctx.quadraticCurveTo(300, 690, 160, 650)
  ctx.closePath()
  ctx.fill()

  // Dragon scales creeping up neck
  ctx.fillStyle = '#9B111E'
  ctx.globalAlpha = 0.5
  for (let y = 310; y < 350; y += 8) {
    for (let x = 260; x < 340; x += 10) {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  // Arms resting on treasure
  ctx.strokeStyle = skinTone
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(200, 360)
  ctx.quadraticCurveTo(160, 440, 140, 530)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(140, 530, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(400, 360)
  ctx.quadraticCurveTo(440, 440, 460, 530)
  ctx.stroke()
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.arc(460, 530, 10, 0, Math.PI * 2)
  ctx.fill()

  // Head — part human, part dragon
  ctx.fillStyle = skinTone
  ctx.beginPath()
  ctx.ellipse(300, 270, 42, 48, 0, 0, Math.PI * 2)
  ctx.fill()

  // Dragon horns growing from temples
  ctx.fillStyle = '#4A1515'
  ctx.beginPath()
  ctx.moveTo(258, 245)
  ctx.quadraticCurveTo(240, 210, 230, 190)
  ctx.quadraticCurveTo(245, 210, 265, 250)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(342, 245)
  ctx.quadraticCurveTo(360, 210, 370, 190)
  ctx.quadraticCurveTo(355, 210, 335, 250)
  ctx.closePath()
  ctx.fill()

  // Eyes — one human, one dragon-slit
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 268, 7, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 268, 7, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  // Left eye — human (brown)
  ctx.fillStyle = '#4A2800'
  ctx.beginPath()
  ctx.arc(282, 268, 3, 0, Math.PI * 2)
  ctx.fill()
  // Right eye — dragon slit (amber with vertical pupil)
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(318, 268, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.ellipse(318, 268, 1, 3, 0, 0, Math.PI * 2) // vertical slit
  ctx.fill()

  // Nose
  ctx.strokeStyle = '#A0714E'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 262)
  ctx.lineTo(297, 280)
  ctx.stroke()

  // Mouth — stern, smoke curling from nostrils
  ctx.strokeStyle = '#8B5A3A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(286, 290)
  ctx.lineTo(314, 290)
  ctx.stroke()

  // Smoke from nostrils
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.15)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(293, 280)
  ctx.quadraticCurveTo(280, 270, 275, 255)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(307, 280)
  ctx.quadraticCurveTo(320, 270, 325, 255)
  ctx.stroke()

  // Wild hair / mane
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.moveTo(258, 260)
  ctx.quadraticCurveTo(280, 220, 300, 215)
  ctx.quadraticCurveTo(320, 220, 342, 260)
  ctx.quadraticCurveTo(350, 240, 355, 255)
  ctx.quadraticCurveTo(340, 250, 335, 265)
  ctx.quadraticCurveTo(300, 240, 265, 265)
  ctx.quadraticCurveTo(260, 250, 250, 255)
  ctx.closePath()
  ctx.fill()
}

function drawDragonsHoardAce(ctx: CanvasRenderingContext2D) {
  // Treasure pile background
  const bg = ctx.createRadialGradient(300, 420, 50, 300, 420, 450)
  bg.addColorStop(0, '#FFD700')
  bg.addColorStop(0.3, '#E65100')
  bg.addColorStop(0.6, '#722F37')
  bg.addColorStop(1, '#1A1A1A')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Treasure pile
  ctx.fillStyle = '#FFD700'
  ctx.globalAlpha = 0.2
  for (let i = 0; i < 30; i++) {
    const tx = 100 + Math.random() * 400
    const ty = 500 + Math.random() * 250
    ctx.beginPath()
    ctx.ellipse(tx, ty, 5 + Math.random() * 10, 3 + Math.random() * 5, Math.random(), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Massive dragon egg — central
  const eggGrad = ctx.createRadialGradient(300, 380, 20, 300, 380, 100)
  eggGrad.addColorStop(0, '#FF6D00')
  eggGrad.addColorStop(0.4, '#E65100')
  eggGrad.addColorStop(0.7, '#9B111E')
  eggGrad.addColorStop(1, '#722F37')
  ctx.fillStyle = eggGrad
  ctx.beginPath()
  ctx.ellipse(300, 380, 80, 110, 0, 0, Math.PI * 2)
  ctx.fill()

  // Crack in egg — light/heat from within
  ctx.strokeStyle = '#FFD700'
  ctx.shadowColor = '#FFD700'
  ctx.shadowBlur = 10
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(300, 290)
  ctx.lineTo(290, 320)
  ctx.lineTo(305, 350)
  ctx.lineTo(295, 380)
  ctx.lineTo(310, 410)
  ctx.stroke()

  // Light from crack
  const crackGlow = ctx.createRadialGradient(300, 350, 5, 300, 350, 80)
  crackGlow.addColorStop(0, 'rgba(255, 215, 0, 0.2)')
  crackGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = crackGlow
  ctx.fillRect(220, 270, 160, 160)

  // Tiny dragon claw emerging from crack
  ctx.fillStyle = '#9B111E'
  ctx.beginPath()
  ctx.moveTo(305, 350)
  ctx.lineTo(320, 340)
  ctx.lineTo(315, 345)
  ctx.lineTo(325, 335)
  ctx.lineTo(310, 348)
  ctx.closePath()
  ctx.fill()

  // Suit symbol etched on egg surface
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(300, 430)
  ctx.bezierCurveTo(290, 440, 260, 455, 260, 470)
  ctx.bezierCurveTo(260, 480, 275, 485, 290, 480)
  ctx.bezierCurveTo(296, 478, 299, 475, 300, 472)
  ctx.bezierCurveTo(301, 475, 304, 478, 310, 480)
  ctx.bezierCurveTo(325, 485, 340, 480, 340, 470)
  ctx.bezierCurveTo(340, 455, 310, 440, 300, 430)
  ctx.stroke()

  ctx.shadowBlur = 0
}


// ═══════════════════════════════════════════════════════════════
// ROYAL GOLD — Mughal Empire at its peak
// ═══════════════════════════════════════════════════════════════

function drawRoyalGold(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawRoyalGoldJack(ctx); break
    case 'Q': drawRoyalGoldQueen(ctx); break
    case 'K': drawRoyalGoldKing(ctx); break
    case 'A': drawRoyalGoldAce(ctx); break
  }
}

function drawMughalBg(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#D4A574'); bg.addColorStop(0.4, '#C49464')
  bg.addColorStop(0.7, '#B88A5A'); bg.addColorStop(1, '#A07848')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 840)
  ctx.globalAlpha = 0.06; ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 0.5
  for (let x = 0; x < 600; x += 40) {
    for (let y = 0; y < 840; y += 40) {
      ctx.beginPath()
      ctx.moveTo(x + 20, y); ctx.lineTo(x + 40, y + 20)
      ctx.lineTo(x + 20, y + 40); ctx.lineTo(x, y + 20); ctx.closePath(); ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
  const glow = ctx.createRadialGradient(300, 300, 50, 300, 400, 400)
  glow.addColorStop(0, 'rgba(212,160,23,0.12)'); glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 600, 840)
}

function drawRoyalGoldJack(ctx: CanvasRenderingContext2D) {
  // Golden sky
  const sky = ctx.createLinearGradient(0, 0, 600, 500)
  sky.addColorStop(0, '#F5E6C8'); sky.addColorStop(0.4, '#E8D5A8'); sky.addColorStop(1, '#D4A574')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 600, 500)
  // Palace walls + domes
  ctx.fillStyle = '#C49464'; ctx.fillRect(0, 280, 600, 60)
  ctx.fillStyle = '#D4A017'
  ctx.beginPath(); ctx.arc(150, 280, 35, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.arc(350, 270, 28, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.arc(500, 280, 22, Math.PI, 0); ctx.fill()
  ctx.fillStyle = '#B88A5A'; ctx.fillRect(250, 230, 10, 110); ctx.fillRect(440, 240, 8, 100)
  ctx.fillStyle = '#D4A017'
  ctx.beginPath(); ctx.arc(255, 228, 6, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(444, 238, 5, 0, Math.PI * 2); ctx.fill()
  // Polo ground
  const gnd = ctx.createLinearGradient(0, 340, 0, 840)
  gnd.addColorStop(0, '#C49464'); gnd.addColorStop(1, '#A07848')
  ctx.fillStyle = gnd; ctx.fillRect(0, 340, 600, 500)
  // Dust
  ctx.globalAlpha = 0.08; ctx.fillStyle = '#D4A017'
  for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.arc(50 + (i * 137) % 500, 100 + (i * 89) % 400, 1 + (i % 3), 0, Math.PI * 2); ctx.fill() }
  ctx.globalAlpha = 1
  // Horse
  const hg = ctx.createLinearGradient(150, 400, 500, 600)
  hg.addColorStop(0, '#5C4033'); hg.addColorStop(1, '#4A3328')
  ctx.fillStyle = hg
  ctx.beginPath()
  ctx.moveTo(120, 480); ctx.quadraticCurveTo(200, 420, 350, 430)
  ctx.quadraticCurveTo(480, 440, 520, 480); ctx.lineTo(500, 620)
  ctx.quadraticCurveTo(350, 600, 150, 620); ctx.closePath(); ctx.fill()
  ctx.strokeStyle = '#4A3328'; ctx.lineWidth = 16; ctx.lineCap = 'round'
  for (const [a, b, c, d] of [[180, 600, 150, 750], [240, 590, 280, 740], [400, 590, 370, 740], [470, 600, 500, 730]] as number[][]) {
    ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke()
  }
  // Horse head
  ctx.fillStyle = '#5C4033'
  ctx.beginPath()
  ctx.moveTo(120, 480); ctx.quadraticCurveTo(80, 430, 70, 370)
  ctx.quadraticCurveTo(60, 340, 80, 320); ctx.quadraticCurveTo(110, 310, 130, 340)
  ctx.quadraticCurveTo(140, 380, 160, 440); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.arc(95, 340, 4, 0, Math.PI * 2); ctx.fill()
  // Rider torso in gold
  const jk = ctx.createLinearGradient(220, 280, 380, 460)
  jk.addColorStop(0, '#D4A017'); jk.addColorStop(1, '#9B7A0A')
  ctx.fillStyle = jk
  ctx.beginPath(); ctx.moveTo(230, 340); ctx.quadraticCurveTo(300, 310, 370, 340)
  ctx.lineTo(360, 460); ctx.quadraticCurveTo(300, 480, 240, 460); ctx.closePath(); ctx.fill()
  // Ruby sash
  ctx.fillStyle = '#9B111E'
  ctx.beginPath(); ctx.moveTo(245, 400); ctx.lineTo(355, 395); ctx.lineTo(350, 430); ctx.lineTo(240, 435); ctx.closePath(); ctx.fill()
  // Neck + head
  ctx.fillStyle = '#C68B5B'; ctx.fillRect(278, 290, 44, 50)
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.ellipse(300, 245, 48, 55, 0, 0, Math.PI * 2); ctx.fill()
  // Jeweled turban
  const tb = ctx.createLinearGradient(250, 180, 350, 220)
  tb.addColorStop(0, '#D4A017'); tb.addColorStop(0.5, '#F5E6C8'); tb.addColorStop(1, '#D4A017')
  ctx.fillStyle = tb; ctx.beginPath(); ctx.ellipse(300, 195, 55, 35, 0, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#B8900F'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(250, 200); ctx.quadraticCurveTo(300, 180, 350, 200); ctx.stroke()
  ctx.fillStyle = '#9B111E'; ctx.beginPath(); ctx.arc(300, 188, 8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FF4444'; ctx.beginPath(); ctx.arc(299, 186, 3, 0, Math.PI * 2); ctx.fill()
  // Trailing fabric
  ctx.fillStyle = 'rgba(245,230,200,0.7)'
  ctx.beginPath(); ctx.moveTo(345, 195); ctx.quadraticCurveTo(400, 200, 430, 250)
  ctx.quadraticCurveTo(440, 280, 420, 320); ctx.lineTo(410, 310)
  ctx.quadraticCurveTo(425, 270, 415, 245); ctx.quadraticCurveTo(390, 200, 345, 200); ctx.closePath(); ctx.fill()
  // Eyes
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(282, 248, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(318, 248, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#3D2B1F'
  ctx.beginPath(); ctx.arc(283, 248, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(319, 248, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(284, 248, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(320, 248, 1.8, 0, Math.PI * 2); ctx.fill()
  // Eyebrows + nose + mouth
  ctx.strokeStyle = '#3D2B1F'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(273, 239); ctx.quadraticCurveTo(282, 235, 292, 240); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(308, 240); ctx.quadraticCurveTo(318, 235, 327, 239); ctx.stroke()
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(300, 248); ctx.lineTo(297, 264); ctx.stroke()
  ctx.fillStyle = '#B87060'
  ctx.beginPath(); ctx.moveTo(286, 274); ctx.quadraticCurveTo(300, 284, 314, 274); ctx.quadraticCurveTo(300, 280, 286, 274); ctx.fill()
  // Right arm + polo mallet
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 22; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(365, 360); ctx.quadraticCurveTo(420, 300, 430, 240); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(432, 235, 12, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#5C4033'; ctx.lineWidth = 5
  ctx.beginPath(); ctx.moveTo(432, 235); ctx.lineTo(480, 160); ctx.stroke()
  ctx.fillStyle = '#8B7355'; ctx.save(); ctx.translate(480, 155); ctx.rotate(-0.5)
  ctx.fillRect(-25, -8, 50, 16); ctx.restore()
  // Left arm on reins
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 20
  ctx.beginPath(); ctx.moveTo(235, 360); ctx.quadraticCurveTo(190, 400, 170, 420); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(168, 422, 11, 0, Math.PI * 2); ctx.fill()
  // Sunlight
  const sun = ctx.createRadialGradient(500, 80, 30, 400, 200, 400)
  sun.addColorStop(0, 'rgba(245,230,200,0.2)'); sun.addColorStop(1, 'transparent')
  ctx.fillStyle = sun; ctx.fillRect(0, 0, 600, 500)
}

function drawRoyalGoldQueen(ctx: CanvasRenderingContext2D) {
  drawMughalBg(ctx)
  // Arched doorways
  ctx.fillStyle = '#1A237E'; ctx.globalAlpha = 0.15
  ctx.beginPath(); ctx.moveTo(0, 840); ctx.lineTo(0, 300); ctx.arc(60, 300, 60, Math.PI, 0); ctx.lineTo(120, 840); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(480, 840); ctx.lineTo(480, 280); ctx.arc(540, 280, 60, Math.PI, 0); ctx.lineTo(600, 840); ctx.closePath(); ctx.fill()
  ctx.globalAlpha = 1
  const wl = ctx.createRadialGradient(500, 150, 20, 400, 300, 300)
  wl.addColorStop(0, 'rgba(245,230,200,0.25)'); wl.addColorStop(1, 'transparent')
  ctx.fillStyle = wl; ctx.fillRect(0, 0, 600, 600)
  // Green court dress
  const dr = ctx.createLinearGradient(180, 340, 420, 700)
  dr.addColorStop(0, '#046A38'); dr.addColorStop(1, '#024A24')
  ctx.fillStyle = dr
  ctx.beginPath(); ctx.moveTo(200, 360); ctx.quadraticCurveTo(300, 330, 400, 360)
  ctx.lineTo(430, 750); ctx.quadraticCurveTo(300, 780, 170, 750); ctx.closePath(); ctx.fill()
  // Gold embroidery
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 1; ctx.globalAlpha = 0.3
  for (let y = 400; y < 700; y += 40) { ctx.beginPath(); ctx.moveTo(200, y); ctx.quadraticCurveTo(300, y - 10, 400, y); ctx.stroke() }
  ctx.globalAlpha = 1
  // Dupatta
  ctx.fillStyle = 'rgba(212,160,23,0.2)'
  ctx.beginPath(); ctx.moveTo(190, 340); ctx.quadraticCurveTo(160, 500, 140, 700); ctx.lineTo(170, 700); ctx.quadraticCurveTo(180, 500, 200, 360); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(410, 340); ctx.quadraticCurveTo(440, 500, 460, 700); ctx.lineTo(430, 700); ctx.quadraticCurveTo(420, 500, 400, 360); ctx.closePath(); ctx.fill()
  // Neck + collar necklace
  ctx.fillStyle = '#D4A574'; ctx.fillRect(278, 298, 44, 55)
  ctx.fillStyle = '#D4A017'
  ctx.beginPath(); ctx.moveTo(240, 340); ctx.quadraticCurveTo(300, 370, 360, 340); ctx.quadraticCurveTo(300, 360, 240, 340); ctx.fill()
  const jcol = ['#9B111E', '#1A237E', '#046A38', '#2DA5A0', '#9B111E']
  for (let i = 0; i < 5; i++) { ctx.fillStyle = jcol[i]; ctx.beginPath(); ctx.arc(260 + i * 20, 350 + Math.sin(i * 0.8) * 5, 4, 0, Math.PI * 2); ctx.fill() }
  // Head
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.ellipse(300, 250, 50, 58, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.ellipse(300, 205, 52, 30, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.ellipse(300, 195, 35, 25, 0, 0, Math.PI * 2); ctx.fill()
  // Maang tikka + earrings
  ctx.fillStyle = '#D4A017'; ctx.beginPath(); ctx.arc(300, 215, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#9B111E'; ctx.beginPath(); ctx.arc(300, 215, 3, 0, Math.PI * 2); ctx.fill()
  for (const ex of [252, 348]) {
    ctx.fillStyle = '#D4A017'; ctx.beginPath(); ctx.arc(ex, 260, 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#046A38'; ctx.beginPath(); ctx.arc(ex, 268, 3, 0, Math.PI * 2); ctx.fill()
  }
  // Eyes with kohl
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(280, 252, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(320, 252, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#3D2B1F'
  ctx.beginPath(); ctx.arc(281, 252, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(321, 252, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(282, 252, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(322, 252, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(273, 252); ctx.quadraticCurveTo(268, 250, 266, 248); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(327, 252); ctx.quadraticCurveTo(332, 250, 334, 248); ctx.stroke()
  // Eyebrows + nose + mouth + bindi
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(270, 242); ctx.quadraticCurveTo(280, 237, 292, 242); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(308, 242); ctx.quadraticCurveTo(320, 237, 330, 242); ctx.stroke()
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(300, 250); ctx.lineTo(297, 264); ctx.stroke()
  ctx.fillStyle = '#C07060'
  ctx.beginPath(); ctx.moveTo(286, 274); ctx.quadraticCurveTo(300, 283, 314, 274); ctx.quadraticCurveTo(300, 279, 286, 274); ctx.fill()
  ctx.fillStyle = '#9B111E'; ctx.beginPath(); ctx.arc(300, 232, 3, 0, Math.PI * 2); ctx.fill()
  // Right arm + architect's compass
  ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 20; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(380, 400); ctx.quadraticCurveTo(420, 460, 400, 520); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(398, 525, 12, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(400, 510); ctx.lineTo(390, 560); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(400, 510); ctx.lineTo(420, 560); ctx.stroke()
  ctx.fillStyle = '#9B111E'; ctx.beginPath(); ctx.arc(400, 508, 4, 0, Math.PI * 2); ctx.fill()
  // Blueprint scroll
  ctx.fillStyle = '#F5E6C8'; ctx.save(); ctx.translate(320, 580); ctx.rotate(0.05)
  ctx.fillRect(-60, -20, 120, 60)
  ctx.strokeStyle = '#1A237E'; ctx.lineWidth = 1; ctx.globalAlpha = 0.3
  ctx.beginPath(); ctx.arc(0, -5, 15, Math.PI, 0); ctx.stroke()
  ctx.fillRect(-3, -5, 6, 20); ctx.globalAlpha = 1; ctx.restore()
  // Left arm + bangles
  ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 18
  ctx.beginPath(); ctx.moveTo(220, 400); ctx.quadraticCurveTo(180, 470, 190, 540); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(188, 545, 11, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.ellipse(195, 500, 14, 8, 0.3, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.ellipse(198, 510, 14, 8, 0.3, 0, Math.PI * 2); ctx.stroke()
}

function drawRoyalGoldKing(ctx: CanvasRenderingContext2D) {
  drawMughalBg(ctx)
  ctx.fillStyle = '#9B111E'; ctx.globalAlpha = 0.08; ctx.fillRect(0, 0, 100, 840); ctx.fillRect(500, 0, 100, 840); ctx.globalAlpha = 1
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 3; ctx.globalAlpha = 0.2
  ctx.beginPath(); ctx.arc(300, 100, 280, Math.PI, 0); ctx.stroke()
  ctx.beginPath(); ctx.arc(300, 100, 260, Math.PI, 0); ctx.stroke(); ctx.globalAlpha = 1
  const tl = ctx.createRadialGradient(300, 100, 30, 300, 400, 400)
  tl.addColorStop(0, 'rgba(212,160,23,0.2)'); tl.addColorStop(1, 'transparent')
  ctx.fillStyle = tl; ctx.fillRect(0, 0, 600, 700)
  // Peacock Throne
  ctx.fillStyle = '#D4A017'
  ctx.beginPath(); ctx.moveTo(130, 450); ctx.quadraticCurveTo(150, 150, 300, 120); ctx.quadraticCurveTo(450, 150, 470, 450); ctx.lineTo(130, 450); ctx.fill()
  ctx.fillStyle = '#046A38'; ctx.globalAlpha = 0.3
  ctx.beginPath(); ctx.moveTo(160, 440); ctx.quadraticCurveTo(175, 180, 300, 150); ctx.quadraticCurveTo(425, 180, 440, 440); ctx.lineTo(160, 440); ctx.fill(); ctx.globalAlpha = 1
  for (const [ex, ey] of [[200, 250], [250, 200], [300, 180], [350, 200], [400, 250], [225, 320], [375, 320]] as number[][]) {
    ctx.fillStyle = '#046A38'; ctx.beginPath(); ctx.ellipse(ex, ey, 15, 20, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#2DA5A0'; ctx.beginPath(); ctx.ellipse(ex, ey, 8, 12, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1A237E'; ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#D4A017'; ctx.beginPath(); ctx.arc(ex, ey, 2, 0, Math.PI * 2); ctx.fill()
  }
  ctx.fillStyle = '#9B111E'; ctx.fillRect(160, 450, 280, 40)
  ctx.fillStyle = '#D4A017'; ctx.fillRect(160, 445, 280, 8); ctx.fillRect(160, 488, 280, 4)
  ctx.fillStyle = '#B8900F'; ctx.fillRect(140, 490, 320, 350)
  // MASSIVE regal robes
  const rb = ctx.createLinearGradient(160, 420, 440, 750)
  rb.addColorStop(0, '#D4A017'); rb.addColorStop(0.5, '#B8900F'); rb.addColorStop(1, '#8B6914')
  ctx.fillStyle = rb
  ctx.beginPath(); ctx.moveTo(160, 420); ctx.quadraticCurveTo(300, 380, 440, 420)
  ctx.lineTo(460, 840); ctx.lineTo(140, 840); ctx.closePath(); ctx.fill()
  ctx.strokeStyle = '#046A38'; ctx.lineWidth = 2; ctx.globalAlpha = 0.25
  for (let y = 500; y < 800; y += 50) { ctx.beginPath(); for (let x = 170; x < 430; x += 30) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 15, y - 8, x + 30, y) } ctx.stroke() }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#C68B5B'; ctx.fillRect(270, 330, 60, 65)
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(230, 395); ctx.quadraticCurveTo(300, 420, 370, 395); ctx.stroke()
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.ellipse(300, 285, 58, 65, 0, 0, Math.PI * 2); ctx.fill()
  // Beard
  ctx.fillStyle = '#888888'
  ctx.beginPath(); ctx.moveTo(255, 320); ctx.quadraticCurveTo(260, 400, 300, 420); ctx.quadraticCurveTo(340, 400, 345, 320); ctx.fill()
  ctx.strokeStyle = '#999999'; ctx.lineWidth = 1; ctx.globalAlpha = 0.3
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(265 + i * 14, 325); ctx.quadraticCurveTo(270 + i * 12, 370, 280 + i * 8, 415); ctx.stroke() }
  ctx.globalAlpha = 1
  // Turban
  const kt = ctx.createLinearGradient(230, 200, 370, 260)
  kt.addColorStop(0, '#D4A017'); kt.addColorStop(0.5, '#F5E6C8'); kt.addColorStop(1, '#D4A017')
  ctx.fillStyle = kt; ctx.beginPath(); ctx.ellipse(300, 225, 65, 42, 0, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#B8900F'; ctx.lineWidth = 1.5
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(240, 220 + i * 8); ctx.quadraticCurveTo(300, 210 + i * 6, 360, 220 + i * 8); ctx.stroke() }
  ctx.fillStyle = '#9B111E'; ctx.beginPath(); ctx.ellipse(300, 215, 12, 10, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FF4444'; ctx.beginPath(); ctx.arc(298, 213, 4, 0, Math.PI * 2); ctx.fill()
  // Feather
  ctx.strokeStyle = '#046A38'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(300, 210); ctx.quadraticCurveTo(310, 170, 320, 140); ctx.stroke()
  ctx.fillStyle = '#046A38'; ctx.beginPath(); ctx.ellipse(322, 135, 6, 15, 0.3, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#2DA5A0'; ctx.beginPath(); ctx.arc(323, 133, 3, 0, Math.PI * 2); ctx.fill()
  // Eyes
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(280, 290, 7, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(320, 290, 7, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#3D2B1F'
  ctx.beginPath(); ctx.arc(281, 290, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(321, 290, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(282, 290, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(322, 290, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#666666'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(268, 280); ctx.quadraticCurveTo(280, 275, 292, 280); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(308, 280); ctx.quadraticCurveTo(320, 275, 332, 280); ctx.stroke()
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(300, 290); ctx.lineTo(296, 306); ctx.stroke()
  ctx.fillStyle = '#B87060'
  ctx.beginPath(); ctx.moveTo(288, 316); ctx.quadraticCurveTo(300, 320, 312, 316); ctx.quadraticCurveTo(300, 318, 288, 316); ctx.fill()
  // Arms + jeweled dagger
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 28; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(440, 450); ctx.quadraticCurveTo(430, 520, 400, 560); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(395, 565, 14, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 26
  ctx.beginPath(); ctx.moveTo(160, 450); ctx.quadraticCurveTo(170, 520, 200, 560); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(205, 565, 14, 0, Math.PI * 2); ctx.fill()
  ctx.save(); ctx.translate(300, 560); ctx.rotate(0.1)
  ctx.fillStyle = '#C0C0C0'
  ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(-80, -6); ctx.lineTo(0, -2); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#D4A017'; ctx.beginPath(); ctx.roundRect(0, -8, 50, 16, 4); ctx.fill()
  ctx.fillStyle = '#9B111E'; ctx.beginPath(); ctx.arc(15, 0, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#046A38'; ctx.beginPath(); ctx.arc(35, 0, 3, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawRoyalGoldAce(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(0.5, '#F5F0E8'); bg.addColorStop(1, '#F8F4EE')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 840)
  ctx.globalAlpha = 0.04; ctx.strokeStyle = '#B0A090'; ctx.lineWidth = 1
  for (let i = 0; i < 15; i++) { ctx.beginPath(); const s = (i * 97) % 600, t = (i * 53) % 840; ctx.moveTo(s, t); ctx.quadraticCurveTo(s + 100, t + 50, s + 200, t + 30); ctx.stroke() }
  ctx.globalAlpha = 1
  const pc = ['#9B111E', '#1A237E', '#046A38', '#D4A017', '#2DA5A0']
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ctx.fillStyle = pc[i % 5]; ctx.globalAlpha = 0.15; ctx.save()
    ctx.translate(300 + Math.cos(a) * 200, 420 + Math.sin(a) * 200); ctx.rotate(a)
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore() }
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2; ctx.fillStyle = pc[(i + 2) % 5]; ctx.globalAlpha = 0.2; ctx.save()
    ctx.translate(300 + Math.cos(a) * 120, 420 + Math.sin(a) * 120); ctx.rotate(a)
    ctx.beginPath(); ctx.ellipse(0, 0, 6, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore() }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#1A237E'
  ctx.beginPath()
  ctx.moveTo(300, 320); ctx.bezierCurveTo(270, 340, 200, 380, 200, 430)
  ctx.bezierCurveTo(200, 480, 240, 500, 280, 485); ctx.bezierCurveTo(290, 480, 295, 475, 300, 465)
  ctx.bezierCurveTo(305, 475, 310, 480, 320, 485); ctx.bezierCurveTo(360, 500, 400, 480, 400, 430)
  ctx.bezierCurveTo(400, 380, 330, 340, 300, 320); ctx.fill()
  ctx.fillRect(288, 480, 24, 60)
  ctx.beginPath(); ctx.moveTo(265, 540); ctx.quadraticCurveTo(282, 520, 300, 540); ctx.quadraticCurveTo(318, 520, 335, 540); ctx.fill()
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(300, 320); ctx.bezierCurveTo(270, 340, 200, 380, 200, 430)
  ctx.bezierCurveTo(200, 480, 240, 500, 280, 485); ctx.bezierCurveTo(290, 480, 295, 475, 300, 465)
  ctx.bezierCurveTo(305, 475, 310, 480, 320, 485); ctx.bezierCurveTo(360, 500, 400, 480, 400, 430)
  ctx.bezierCurveTo(400, 380, 330, 340, 300, 320); ctx.stroke()
  ctx.lineWidth = 1.5; ctx.globalAlpha = 0.15
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; ctx.beginPath()
    ctx.moveTo(300 + Math.cos(a) * 60, 420 + Math.sin(a) * 60); ctx.lineTo(300 + Math.cos(a) * 280, 420 + Math.sin(a) * 280); ctx.stroke() }
  ctx.globalAlpha = 1
}


// ═══════════════════════════════════════════════════════════════
// GILDED SERPENT — Legendary: Gold & Serpent Mythology
// ═══════════════════════════════════════════════════════════════

function drawGildedSerpent(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawGildedJack(ctx); break
    case 'Q': drawGildedQueen(ctx); break
    case 'K': drawGildedKing(ctx); break
    case 'A': drawGildedAce(ctx); break
  }
}

function drawTempleInterior(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#1A1A0A')
  bg.addColorStop(0.3, '#2A2010')
  bg.addColorStop(0.7, '#1A1808')
  bg.addColorStop(1, '#0A0A04')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Warm torchlight ambient
  const torch1 = ctx.createRadialGradient(100, 200, 10, 100, 200, 200)
  torch1.addColorStop(0, 'rgba(212, 160, 23, 0.1)')
  torch1.addColorStop(1, 'transparent')
  ctx.fillStyle = torch1
  ctx.fillRect(0, 0, 300, 400)

  const torch2 = ctx.createRadialGradient(500, 200, 10, 500, 200, 200)
  torch2.addColorStop(0, 'rgba(212, 160, 23, 0.08)')
  torch2.addColorStop(1, 'transparent')
  ctx.fillStyle = torch2
  ctx.fillRect(300, 0, 300, 400)
}

function drawSnakeScale(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(x, y, size, size * 1.3, 0, 0, Math.PI * 2)
  ctx.fill()
  // Scale highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.beginPath()
  ctx.ellipse(x - size * 0.2, y - size * 0.4, size * 0.5, size * 0.3, -0.3, 0, Math.PI * 2)
  ctx.fill()
}

function drawGildedJack(ctx: CanvasRenderingContext2D) {
  drawTempleInterior(ctx)

  // Golden columns in background
  for (const colX of [80, 520]) {
    const col = ctx.createLinearGradient(colX - 20, 0, colX + 20, 0)
    col.addColorStop(0, '#8B6914')
    col.addColorStop(0.3, '#D4A017')
    col.addColorStop(0.7, '#D4A017')
    col.addColorStop(1, '#8B6914')
    ctx.fillStyle = col
    ctx.fillRect(colX - 20, 0, 40, 840)
    // Column details
    ctx.fillStyle = '#8B6914'
    ctx.fillRect(colX - 25, 0, 50, 30)
    ctx.fillRect(colX - 25, 810, 50, 30)
  }

  // Torch flames (high on columns)
  for (const [fx, fy] of [[80, 150], [520, 150]] as [number, number][]) {
    const flame = ctx.createRadialGradient(fx, fy, 3, fx, fy, 25)
    flame.addColorStop(0, 'rgba(255, 200, 50, 0.6)')
    flame.addColorStop(0.5, 'rgba(255, 150, 20, 0.3)')
    flame.addColorStop(1, 'transparent')
    ctx.fillStyle = flame
    ctx.fillRect(fx - 25, fy - 25, 50, 50)
  }

  // Stone floor
  const floor = ctx.createLinearGradient(0, 650, 0, 840)
  floor.addColorStop(0, '#2A2010')
  floor.addColorStop(1, '#1A1808')
  ctx.fillStyle = floor
  ctx.fillRect(0, 650, 600, 190)

  // ── THE SERPENT CHARMER — young, intense ──
  // Ornate robes
  const robes = ctx.createLinearGradient(220, 340, 380, 600)
  robes.addColorStop(0, '#B71C1C')
  robes.addColorStop(0.5, '#8B1515')
  robes.addColorStop(1, '#6A0E0E')
  ctx.fillStyle = robes
  ctx.beginPath()
  ctx.moveTo(235, 340)
  ctx.quadraticCurveTo(300, 320, 365, 340)
  ctx.lineTo(360, 600)
  ctx.quadraticCurveTo(300, 620, 240, 600)
  ctx.closePath()
  ctx.fill()

  // Gold trim on robes
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(260, 340)
  ctx.lineTo(300, 370)
  ctx.lineTo(340, 340)
  ctx.stroke()
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(242, 590)
  ctx.quadraticCurveTo(300, 610, 358, 590)
  ctx.stroke()
  ctx.setLineDash([])

  // Gold sash
  ctx.fillStyle = '#D4A017'
  ctx.fillRect(230, 460, 140, 16)
  ctx.fillStyle = '#8B6914'
  ctx.fillRect(230, 474, 140, 3)

  // Neck
  ctx.fillStyle = '#C68B5B'
  ctx.fillRect(283, 300, 34, 40)

  // HEAD — young, intense, calm
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 260, 44, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair — dark, pulled back
  ctx.fillStyle = '#1A1008'
  ctx.beginPath()
  ctx.ellipse(300, 230, 46, 28, 0, Math.PI, 0)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(254, 235)
  ctx.quadraticCurveTo(252, 260, 255, 275)
  ctx.lineTo(260, 275)
  ctx.quadraticCurveTo(258, 258, 259, 235)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(346, 235)
  ctx.quadraticCurveTo(348, 260, 345, 275)
  ctx.lineTo(340, 275)
  ctx.quadraticCurveTo(342, 258, 341, 235)
  ctx.closePath()
  ctx.fill()

  // Gold headband
  ctx.fillStyle = '#D4A017'
  ctx.fillRect(260, 232, 80, 5)

  // EYES — intense, looking at cobra
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 262, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 262, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#3A2A0A'
  ctx.beginPath()
  ctx.arc(283, 262, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 262, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(283, 262, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 262, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // Eyebrows — focused
  ctx.strokeStyle = '#3A2A1A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(273, 255)
  ctx.quadraticCurveTo(282, 252, 291, 256)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(309, 256)
  ctx.quadraticCurveTo(318, 252, 327, 255)
  ctx.stroke()
  // Nose
  ctx.strokeStyle = '#B8845A'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 260)
  ctx.lineTo(297, 274)
  ctx.stroke()
  // Mouth — calm determination
  ctx.strokeStyle = '#8B5A3A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(290, 282)
  ctx.quadraticCurveTo(300, 285, 310, 282)
  ctx.stroke()

  // LEFT ARM — raised, cobra coiling around forearm
  ctx.strokeStyle = '#B71C1C'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(240, 370)
  ctx.quadraticCurveTo(200, 340, 190, 300)
  ctx.stroke()
  // Forearm skin
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(190, 295, 10, 0, Math.PI * 2)
  ctx.fill()

  // GOLDEN COBRA coiling up forearm to face-level
  // Snake body coils
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(210, 370)
  ctx.quadraticCurveTo(175, 350, 195, 320)
  ctx.quadraticCurveTo(215, 290, 190, 270)
  ctx.quadraticCurveTo(165, 250, 185, 230)
  ctx.stroke()
  // Snake scales highlights
  for (let t = 0; t < 8; t++) {
    const sx = 190 + Math.sin(t * 0.8) * 15
    const sy = 360 - t * 18
    drawSnakeScale(ctx, sx, sy, 3, '#D4A017')
  }

  // Cobra head — hood spread, facing charmer
  ctx.fillStyle = '#D4A017'
  // Hood
  ctx.beginPath()
  ctx.moveTo(185, 230)
  ctx.quadraticCurveTo(160, 210, 165, 190)
  ctx.lineTo(175, 185)
  ctx.quadraticCurveTo(185, 175, 195, 185)
  ctx.lineTo(205, 190)
  ctx.quadraticCurveTo(210, 210, 185, 230)
  ctx.closePath()
  ctx.fill()
  // Hood pattern
  ctx.fillStyle = '#8B6914'
  ctx.beginPath()
  ctx.ellipse(185, 205, 8, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  // Cobra eyes
  ctx.fillStyle = '#046A38'
  ctx.beginPath()
  ctx.arc(178, 198, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(192, 198, 2, 0, Math.PI * 2)
  ctx.fill()
  // Tongue
  ctx.strokeStyle = '#B71C1C'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(185, 220)
  ctx.lineTo(183, 230)
  ctx.moveTo(185, 220)
  ctx.lineTo(187, 230)
  ctx.stroke()

  // RIGHT ARM at side
  ctx.strokeStyle = '#B71C1C'
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(360, 370)
  ctx.quadraticCurveTo(390, 430, 380, 500)
  ctx.stroke()
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(380, 505, 10, 0, Math.PI * 2)
  ctx.fill()
}

function drawGildedQueen(ctx: CanvasRenderingContext2D) {
  drawTempleInterior(ctx)

  // Throne room — reflective marble floor
  const marble = ctx.createLinearGradient(0, 550, 0, 840)
  marble.addColorStop(0, '#2A2A2A')
  marble.addColorStop(0.3, '#3A3A3A')
  marble.addColorStop(0.6, '#2A2A2A')
  marble.addColorStop(1, '#1A1A1A')
  ctx.fillStyle = marble
  ctx.fillRect(0, 550, 600, 290)

  // Marble veining
  ctx.strokeStyle = '#4A4A4A'
  ctx.lineWidth = 0.5
  ctx.globalAlpha = 0.15
  for (let i = 0; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 80, 560)
    ctx.quadraticCurveTo(i * 80 + 40, 700, i * 80 + 20, 840)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Warm gold ambient
  const goldAmb = ctx.createRadialGradient(300, 350, 50, 300, 350, 350)
  goldAmb.addColorStop(0, 'rgba(212, 160, 23, 0.08)')
  goldAmb.addColorStop(1, 'transparent')
  ctx.fillStyle = goldAmb
  ctx.fillRect(0, 0, 600, 700)

  // ── THE MEDUSA QUEEN — beautiful AND terrifying ──
  // Body — jeweled scale collar into dress
  const dress = ctx.createLinearGradient(210, 340, 390, 650)
  dress.addColorStop(0, '#046A38')
  dress.addColorStop(0.3, '#035028')
  dress.addColorStop(0.7, '#023A1C')
  dress.addColorStop(1, '#012810')
  ctx.fillStyle = dress
  ctx.beginPath()
  ctx.moveTo(225, 360)
  ctx.quadraticCurveTo(300, 340, 375, 360)
  ctx.lineTo(380, 650)
  ctx.quadraticCurveTo(300, 680, 220, 650)
  ctx.closePath()
  ctx.fill()

  // Scale collar transitioning into serpent-hair
  ctx.fillStyle = '#D4A017'
  // Overlapping scales on collar
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const sx = 245 + col * 15 + (row % 2) * 7
      const sy = 355 + row * 10
      drawSnakeScale(ctx, sx, sy, 4, row === 0 ? '#D4A017' : '#8B6914')
    }
  }

  // Jeweled details on dress
  ctx.fillStyle = '#B71C1C'
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.arc(300, 420 + i * 45, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // Neck
  ctx.fillStyle = '#D4A574'
  ctx.fillRect(285, 310, 30, 45)

  // HEAD — magnetic beauty
  ctx.fillStyle = '#E8C8A0'
  ctx.beginPath()
  ctx.ellipse(300, 265, 44, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  // Warm gold lighting on face
  const faceGlow = ctx.createRadialGradient(300, 260, 10, 300, 260, 50)
  faceGlow.addColorStop(0, 'rgba(212, 160, 23, 0.06)')
  faceGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = faceGlow
  ctx.beginPath()
  ctx.ellipse(300, 265, 44, 52, 0, 0, Math.PI * 2)
  ctx.fill()

  // SERPENT HAIR — golden snakes as crown
  const snakeHairPaths: [number, number, number, number, number, number][] = [
    [270, 225, 240, 170, 220, 140],
    [285, 220, 260, 155, 250, 120],
    [300, 218, 300, 145, 300, 110],
    [315, 220, 340, 155, 350, 120],
    [330, 225, 360, 170, 380, 140],
    [260, 230, 225, 190, 210, 170],
    [340, 230, 375, 190, 390, 170],
  ]
  for (const [x1, y1, cx, cy, ex, ey] of snakeHairPaths) {
    ctx.strokeStyle = '#D4A017'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(cx, cy, ex, ey)
    ctx.stroke()
    // Snake head at end
    ctx.fillStyle = '#D4A017'
    ctx.beginPath()
    ctx.arc(ex, ey, 4, 0, Math.PI * 2)
    ctx.fill()
    // Tiny eyes
    ctx.fillStyle = '#046A38'
    ctx.beginPath()
    ctx.arc(ex - 1.5, ey - 1, 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(ex + 1.5, ey - 1, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  // EYES — magnetic, subtle green glow
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(284, 268, 7, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(316, 268, 7, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  // Iris — jade green
  ctx.fillStyle = '#046A38'
  ctx.beginPath()
  ctx.arc(285, 268, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(317, 268, 3.5, 0, Math.PI * 2)
  ctx.fill()
  // Pupil — slit (serpentine)
  ctx.fillStyle = '#000'
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(285, 268, 1, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(317, 268, 1, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Green eye glow
  const eyeGlow = ctx.createRadialGradient(285, 268, 3, 285, 268, 15)
  eyeGlow.addColorStop(0, 'rgba(4, 106, 56, 0.15)')
  eyeGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = eyeGlow
  ctx.fillRect(270, 255, 30, 30)
  const eyeGlow2 = ctx.createRadialGradient(317, 268, 3, 317, 268, 15)
  eyeGlow2.addColorStop(0, 'rgba(4, 106, 56, 0.15)')
  eyeGlow2.addColorStop(1, 'transparent')
  ctx.fillStyle = eyeGlow2
  ctx.fillRect(302, 255, 30, 30)

  // Eyebrows — elegant arches
  ctx.strokeStyle = '#3A2A1A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(274, 260)
  ctx.quadraticCurveTo(284, 256, 294, 261)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(306, 261)
  ctx.quadraticCurveTo(316, 256, 326, 260)
  ctx.stroke()
  // Nose
  ctx.strokeStyle = '#C8A080'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 265)
  ctx.lineTo(297, 279)
  ctx.stroke()
  // Lips — full, ruby
  ctx.fillStyle = '#B71C1C'
  ctx.beginPath()
  ctx.moveTo(290, 287)
  ctx.quadraticCurveTo(300, 283, 310, 287)
  ctx.quadraticCurveTo(300, 292, 290, 287)
  ctx.fill()

  // LEFT ARM — holding mirror face-down
  ctx.strokeStyle = '#046A38'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(240, 380)
  ctx.quadraticCurveTo(200, 430, 210, 490)
  ctx.stroke()
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(210, 495, 10, 0, Math.PI * 2)
  ctx.fill()
  // Mirror (face-down)
  ctx.fillStyle = '#D4A017'
  ctx.save()
  ctx.translate(205, 500)
  ctx.rotate(0.8)
  ctx.beginPath()
  ctx.ellipse(0, 0, 20, 25, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#8B6914'
  ctx.fillRect(-3, 22, 6, 20)
  ctx.restore()

  // RIGHT ARM at side
  ctx.strokeStyle = '#046A38'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(360, 380)
  ctx.quadraticCurveTo(390, 440, 385, 510)
  ctx.stroke()
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.arc(385, 515, 10, 0, Math.PI * 2)
  ctx.fill()
}

function drawGildedKing(ctx: CanvasRenderingContext2D) {
  drawTempleInterior(ctx)

  // Grand hall — jade floor
  const jade = ctx.createLinearGradient(0, 580, 0, 840)
  jade.addColorStop(0, '#023A1C')
  jade.addColorStop(0.5, '#035028')
  jade.addColorStop(1, '#012810')
  ctx.fillStyle = jade
  ctx.fillRect(0, 580, 600, 260)

  // Golden serpent motifs on walls
  ctx.globalAlpha = 0.06
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 3
  for (let y = 80; y < 500; y += 120) {
    // Left wall serpent
    ctx.beginPath()
    ctx.moveTo(30, y)
    ctx.quadraticCurveTo(60, y - 30, 90, y)
    ctx.quadraticCurveTo(60, y + 30, 30, y)
    ctx.stroke()
    // Right wall serpent
    ctx.beginPath()
    ctx.moveTo(510, y + 20)
    ctx.quadraticCurveTo(540, y - 10, 570, y + 20)
    ctx.quadraticCurveTo(540, y + 50, 510, y + 20)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Golden glow from throne
  const throneGlow = ctx.createRadialGradient(300, 400, 50, 300, 400, 300)
  throneGlow.addColorStop(0, 'rgba(212, 160, 23, 0.12)')
  throneGlow.addColorStop(0.5, 'rgba(212, 160, 23, 0.04)')
  throneGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = throneGlow
  ctx.fillRect(0, 100, 600, 600)

  // ── THE SERPENT EMPEROR — throne of living snakes ──

  // THRONE — made of intertwined golden serpents
  // Throne back (serpent bodies forming it)
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  // Left side serpent column
  ctx.beginPath()
  ctx.moveTo(150, 600)
  ctx.quadraticCurveTo(130, 500, 145, 400)
  ctx.quadraticCurveTo(135, 300, 160, 200)
  ctx.quadraticCurveTo(170, 150, 200, 130)
  ctx.stroke()
  // Right side serpent column
  ctx.beginPath()
  ctx.moveTo(450, 600)
  ctx.quadraticCurveTo(470, 500, 455, 400)
  ctx.quadraticCurveTo(465, 300, 440, 200)
  ctx.quadraticCurveTo(430, 150, 400, 130)
  ctx.stroke()
  // Top connecting serpents
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(200, 130)
  ctx.quadraticCurveTo(300, 100, 400, 130)
  ctx.stroke()

  // Throne seat (serpent coils)
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(160, 480)
  ctx.quadraticCurveTo(300, 460, 440, 480)
  ctx.stroke()

  // Armrests — serpent heads
  // Left armrest serpent
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(150, 480)
  ctx.quadraticCurveTo(120, 440, 130, 400)
  ctx.stroke()
  // Left serpent head
  ctx.fillStyle = '#D4A017'
  ctx.beginPath()
  ctx.ellipse(130, 395, 10, 8, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#046A38'
  ctx.beginPath()
  ctx.arc(125, 392, 2, 0, Math.PI * 2)
  ctx.fill()

  // Right armrest serpent
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(450, 480)
  ctx.quadraticCurveTo(480, 440, 470, 400)
  ctx.stroke()
  ctx.fillStyle = '#D4A017'
  ctx.beginPath()
  ctx.ellipse(470, 395, 10, 8, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#046A38'
  ctx.beginPath()
  ctx.arc(475, 392, 2, 0, Math.PI * 2)
  ctx.fill()

  // Scale detail on throne
  for (let t = 0; t < 12; t++) {
    const sx = 155 + Math.sin(t * 0.5) * 8
    const sy = 200 + t * 30
    drawSnakeScale(ctx, sx, sy, 3, '#8B6914')
    const sx2 = 445 - Math.sin(t * 0.5) * 8
    drawSnakeScale(ctx, sx2, sy, 3, '#8B6914')
  }

  // BODY — massive, regal robes
  const robes = ctx.createLinearGradient(180, 350, 420, 580)
  robes.addColorStop(0, '#1A1A0A')
  robes.addColorStop(0.5, '#2A2010')
  robes.addColorStop(1, '#1A1808')
  ctx.fillStyle = robes
  ctx.beginPath()
  ctx.moveTo(190, 350)
  ctx.quadraticCurveTo(300, 320, 410, 350)
  ctx.lineTo(420, 580)
  ctx.lineTo(180, 580)
  ctx.closePath()
  ctx.fill()

  // Gold chest plate with serpent design
  ctx.fillStyle = '#D4A017'
  ctx.globalAlpha = 0.15
  ctx.beginPath()
  ctx.ellipse(300, 420, 50, 70, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 2
  // Serpent design on chest
  ctx.beginPath()
  ctx.moveTo(280, 380)
  ctx.quadraticCurveTo(300, 400, 280, 430)
  ctx.quadraticCurveTo(300, 450, 320, 430)
  ctx.quadraticCurveTo(300, 400, 320, 380)
  ctx.stroke()

  // Thick neck
  ctx.fillStyle = '#C68B5B'
  ctx.fillRect(275, 300, 50, 50)

  // HEAD — imposing, regal
  ctx.fillStyle = '#D4A574'
  ctx.beginPath()
  ctx.ellipse(300, 255, 52, 58, 0, 0, Math.PI * 2)
  ctx.fill()

  // Beard — dark, trimmed
  ctx.fillStyle = '#1A1008'
  ctx.beginPath()
  ctx.moveTo(268, 285)
  ctx.quadraticCurveTo(300, 320, 332, 285)
  ctx.quadraticCurveTo(300, 325, 268, 285)
  ctx.fill()

  // CROWN — cobra with spread hood
  ctx.fillStyle = '#D4A017'
  // Crown band
  ctx.fillRect(255, 210, 90, 12)
  // Cobra rising from crown
  ctx.beginPath()
  ctx.moveTo(290, 210)
  ctx.quadraticCurveTo(300, 170, 310, 210)
  ctx.closePath()
  ctx.fill()
  // Cobra hood
  ctx.beginPath()
  ctx.moveTo(300, 175)
  ctx.quadraticCurveTo(280, 160, 285, 145)
  ctx.lineTo(295, 140)
  ctx.quadraticCurveTo(300, 135, 305, 140)
  ctx.lineTo(315, 145)
  ctx.quadraticCurveTo(320, 160, 300, 175)
  ctx.closePath()
  ctx.fill()
  // Cobra eyes
  ctx.fillStyle = '#B71C1C'
  ctx.beginPath()
  ctx.arc(295, 153, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(305, 153, 2, 0, Math.PI * 2)
  ctx.fill()

  // EYES — calm authority
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.ellipse(282, 260, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 260, 7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#3A2A0A'
  ctx.beginPath()
  ctx.arc(283, 260, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 260, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(283, 260, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(319, 260, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // Eyebrows — regal
  ctx.strokeStyle = '#3A2A1A'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(270, 253)
  ctx.lineTo(294, 254)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(306, 254)
  ctx.lineTo(330, 253)
  ctx.stroke()
  // Nose
  ctx.strokeStyle = '#B8845A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 258)
  ctx.lineTo(296, 276)
  ctx.stroke()
  // Mouth — stern
  ctx.strokeStyle = '#8B5A3A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(286, 290)
  ctx.lineTo(314, 290)
  ctx.stroke()

  // LEFT ARM — hand resting on serpent armrest (nuzzling)
  ctx.strokeStyle = '#1A1808'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(210, 380)
  ctx.quadraticCurveTo(160, 420, 140, 400)
  ctx.stroke()
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(138, 398, 12, 0, Math.PI * 2)
  ctx.fill()

  // RIGHT ARM on armrest
  ctx.strokeStyle = '#1A1808'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(390, 380)
  ctx.quadraticCurveTo(440, 420, 460, 400)
  ctx.stroke()
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath()
  ctx.arc(462, 398, 12, 0, Math.PI * 2)
  ctx.fill()
}

function drawGildedAce(ctx: CanvasRenderingContext2D) {
  drawTempleInterior(ctx)

  // Dark jade background center
  const jadeBg = ctx.createRadialGradient(300, 420, 50, 300, 420, 250)
  jadeBg.addColorStop(0, '#023A1C')
  jadeBg.addColorStop(0.7, '#012810')
  jadeBg.addColorStop(1, '#0A0A04')
  ctx.fillStyle = jadeBg
  ctx.fillRect(100, 200, 400, 440)

  // Golden ouroboros — snake eating its own tail
  ctx.strokeStyle = '#D4A017'
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.arc(300, 420, 120, 0, Math.PI * 1.85)
  ctx.stroke()

  // Scale details along ouroboros
  for (let a = 0; a < 24; a++) {
    const angle = (a / 24) * Math.PI * 1.85
    const sx = 300 + Math.cos(angle) * 120
    const sy = 420 + Math.sin(angle) * 120
    drawSnakeScale(ctx, sx, sy, 4, a % 2 === 0 ? '#D4A017' : '#8B6914')
  }

  // Ouroboros head — eating tail
  ctx.fillStyle = '#D4A017'
  const headAngle = Math.PI * 1.85
  const headX = 300 + Math.cos(headAngle) * 120
  const headY = 420 + Math.sin(headAngle) * 120
  ctx.beginPath()
  ctx.ellipse(headX, headY, 14, 10, headAngle + Math.PI * 0.5, 0, Math.PI * 2)
  ctx.fill()

  // Ruby eye of ouroboros
  ctx.fillStyle = '#B71C1C'
  ctx.beginPath()
  ctx.arc(headX - 5, headY - 3, 4, 0, Math.PI * 2)
  ctx.fill()
  // Eye highlight
  ctx.fillStyle = '#FF4444'
  ctx.beginPath()
  ctx.arc(headX - 6, headY - 4, 1.5, 0, Math.PI * 2)
  ctx.fill()

  // Suit symbol in jaws — center
  ctx.fillStyle = '#D4A017'
  ctx.beginPath()
  ctx.moveTo(300, 370)
  ctx.bezierCurveTo(280, 385, 250, 410, 250, 430)
  ctx.bezierCurveTo(250, 450, 270, 458, 287, 448)
  ctx.bezierCurveTo(293, 445, 297, 440, 300, 435)
  ctx.bezierCurveTo(303, 440, 307, 445, 313, 448)
  ctx.bezierCurveTo(330, 458, 350, 450, 350, 430)
  ctx.bezierCurveTo(350, 410, 320, 385, 300, 370)
  ctx.fill()
  // Stem
  ctx.fillRect(294, 448, 12, 18)

  // Gold glow on the suit symbol
  const symbolGlow = ctx.createRadialGradient(300, 420, 20, 300, 420, 80)
  symbolGlow.addColorStop(0, 'rgba(212, 160, 23, 0.1)')
  symbolGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = symbolGlow
  ctx.fillRect(220, 340, 160, 160)
}


// ═══════════════════════════════════════════════════════════════
// DIAMOND DYNASTY — Civilization that Compresses Time into Crystal (Legendary)
// ═══════════════════════════════════════════════════════════════

function drawDiamondDynasty(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawDiamondDynastyJack(ctx); break
    case 'Q': drawDiamondDynastyQueen(ctx); break
    case 'K': drawDiamondDynastyKing(ctx); break
    case 'A': drawDiamondDynastyAce(ctx); break
  }
}

function drawPrismaticBackground(ctx: CanvasRenderingContext2D) {
  // Pure light environment
  const bg = ctx.createRadialGradient(300, 420, 30, 300, 420, 500)
  bg.addColorStop(0, '#FFFFFF')
  bg.addColorStop(0.2, '#E3F2FD')
  bg.addColorStop(0.4, '#F3E5F5')
  bg.addColorStop(0.6, '#E8F5E9')
  bg.addColorStop(0.8, '#FFF8E1')
  bg.addColorStop(1, '#E3F2FD')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Rainbow refractions
  ctx.globalAlpha = 0.06
  const colors = ['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#0088FF', '#8800FF']
  for (let i = 0; i < colors.length; i++) {
    const angle = (i / colors.length) * Math.PI * 2
    ctx.fillStyle = colors[i]
    ctx.beginPath()
    ctx.moveTo(300, 420)
    ctx.lineTo(300 + Math.cos(angle) * 500, 420 + Math.sin(angle) * 500)
    ctx.lineTo(300 + Math.cos(angle + 0.4) * 500, 420 + Math.sin(angle + 0.4) * 500)
    ctx.closePath()
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawFacetHighlight(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.6, 0)
  ctx.lineTo(0, size * 0.3)
  ctx.lineTo(-size * 0.6, 0)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawDiamondDynastyJack(ctx: CanvasRenderingContext2D) {
  // Void with prismatic refractions
  const bg = ctx.createRadialGradient(300, 420, 30, 300, 420, 500)
  bg.addColorStop(0, '#F5F5F5')
  bg.addColorStop(0.3, '#E3F2FD')
  bg.addColorStop(0.6, '#E8EAF6')
  bg.addColorStop(1, '#CFD8DC')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Rainbow refractions through the figure
  ctx.globalAlpha = 0.04
  const refColors = ['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#0088FF', '#8800FF']
  for (let i = 0; i < refColors.length; i++) {
    ctx.fillStyle = refColors[i]
    ctx.fillRect(80 + i * 75, 0, 75, 840)
  }
  ctx.globalAlpha = 1

  // The Future Shard — UNCUT raw diamond figure
  // Body made of jagged crystal facets

  // Main crystal body — angular, rough
  ctx.fillStyle = 'rgba(200, 220, 240, 0.7)'
  ctx.strokeStyle = 'rgba(150, 180, 210, 0.5)'
  ctx.lineWidth = 1.5

  // Torso — jagged crystalline
  ctx.beginPath()
  ctx.moveTo(260, 250)
  ctx.lineTo(240, 300)
  ctx.lineTo(230, 400)
  ctx.lineTo(250, 500)
  ctx.lineTo(280, 540)
  ctx.lineTo(320, 540)
  ctx.lineTo(350, 500)
  ctx.lineTo(370, 400)
  ctx.lineTo(360, 300)
  ctx.lineTo(340, 250)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Crystal facet lines inside body
  ctx.strokeStyle = 'rgba(150, 180, 210, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(260, 250)
  ctx.lineTo(320, 400)
  ctx.moveTo(340, 250)
  ctx.lineTo(250, 420)
  ctx.moveTo(240, 300)
  ctx.lineTo(360, 350)
  ctx.moveTo(250, 500)
  ctx.lineTo(350, 450)
  ctx.stroke()

  // Head — rough crystalline, features BLURRY
  ctx.fillStyle = 'rgba(200, 220, 240, 0.6)'
  ctx.beginPath()
  ctx.moveTo(280, 180)
  ctx.lineTo(260, 210)
  ctx.lineTo(270, 260)
  ctx.lineTo(330, 260)
  ctx.lineTo(340, 210)
  ctx.lineTo(320, 180)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(150, 180, 210, 0.5)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Blurry features — suggestion of face through frosted glass
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#8888AA'
  ctx.beginPath()
  ctx.ellipse(288, 218, 4, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(312, 218, 4, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Shard extensions from shoulders and arms — jagged
  ctx.fillStyle = 'rgba(200, 220, 240, 0.5)'
  ctx.strokeStyle = 'rgba(150, 180, 210, 0.4)'
  ctx.lineWidth = 1

  // Left shoulder shard
  ctx.beginPath()
  ctx.moveTo(240, 290)
  ctx.lineTo(190, 260)
  ctx.lineTo(200, 280)
  ctx.lineTo(180, 310)
  ctx.lineTo(220, 320)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Right shoulder shard
  ctx.beginPath()
  ctx.moveTo(360, 290)
  ctx.lineTo(410, 260)
  ctx.lineTo(400, 280)
  ctx.lineTo(420, 310)
  ctx.lineTo(380, 320)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Left arm shard
  ctx.beginPath()
  ctx.moveTo(230, 380)
  ctx.lineTo(170, 400)
  ctx.lineTo(160, 380)
  ctx.lineTo(150, 420)
  ctx.lineTo(200, 430)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Right arm shard
  ctx.beginPath()
  ctx.moveTo(370, 380)
  ctx.lineTo(430, 400)
  ctx.lineTo(440, 380)
  ctx.lineTo(450, 420)
  ctx.lineTo(400, 430)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Legs — crystalline, frozen mid-motion
  ctx.fillStyle = 'rgba(200, 220, 240, 0.6)'
  ctx.beginPath()
  ctx.moveTo(265, 540)
  ctx.lineTo(240, 650)
  ctx.lineTo(230, 740)
  ctx.lineTo(260, 740)
  ctx.lineTo(275, 650)
  ctx.lineTo(295, 540)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(305, 540)
  ctx.lineTo(330, 650)
  ctx.lineTo(350, 740)
  ctx.lineTo(380, 740)
  ctx.lineTo(355, 650)
  ctx.lineTo(335, 540)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Prismatic light passing THROUGH figure
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#FF0000'
  ctx.beginPath()
  ctx.moveTo(280, 300)
  ctx.lineTo(200, 600)
  ctx.lineTo(230, 600)
  ctx.lineTo(310, 300)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#00FF00'
  ctx.beginPath()
  ctx.moveTo(300, 280)
  ctx.lineTo(350, 600)
  ctx.lineTo(380, 600)
  ctx.lineTo(320, 280)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#0088FF'
  ctx.beginPath()
  ctx.moveTo(320, 300)
  ctx.lineTo(400, 600)
  ctx.lineTo(430, 600)
  ctx.lineTo(340, 300)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Facet highlights
  drawFacetHighlight(ctx, 280, 340, 15, 0.3)
  drawFacetHighlight(ctx, 330, 380, 12, -0.5)
  drawFacetHighlight(ctx, 310, 470, 10, 0.8)
}

function drawDiamondDynastyQueen(ctx: CanvasRenderingContext2D) {
  drawPrismaticBackground(ctx)

  // The Present Facet — PERFECT CUT, every surface a mathematical facet
  const skinTone = 'rgba(200, 220, 240, 0.85)'

  // Body — geometric perfection, every edge is a facet
  // Central column
  ctx.fillStyle = 'rgba(220, 235, 250, 0.8)'
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.6)'
  ctx.lineWidth = 1.5

  // Torso — geometric faceted gem
  ctx.beginPath()
  ctx.moveTo(270, 280)
  ctx.lineTo(250, 320)
  ctx.lineTo(240, 420)
  ctx.lineTo(260, 550)
  ctx.lineTo(300, 600)
  ctx.lineTo(340, 550)
  ctx.lineTo(360, 420)
  ctx.lineTo(350, 320)
  ctx.lineTo(330, 280)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Perfect facet lines
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.4)'
  ctx.lineWidth = 1
  // Horizontal facet cuts
  ctx.beginPath()
  ctx.moveTo(252, 340)
  ctx.lineTo(348, 340)
  ctx.moveTo(245, 400)
  ctx.lineTo(355, 400)
  ctx.moveTo(255, 480)
  ctx.lineTo(345, 480)
  ctx.stroke()
  // Diagonal facets
  ctx.beginPath()
  ctx.moveTo(270, 280)
  ctx.lineTo(300, 400)
  ctx.lineTo(330, 280)
  ctx.moveTo(260, 550)
  ctx.lineTo(300, 420)
  ctx.lineTo(340, 550)
  ctx.stroke()

  // Each facet catches light independently — prismatic
  const facetColors = [
    { x: 265, y: 310, color: '#FFB3B3', size: 8 },
    { x: 335, y: 310, color: '#B3D4FF', size: 8 },
    { x: 280, y: 370, color: '#B3FFB3', size: 10 },
    { x: 320, y: 370, color: '#FFE0B3', size: 10 },
    { x: 290, y: 450, color: '#D4B3FF', size: 9 },
    { x: 310, y: 500, color: '#FFB3E0', size: 7 },
  ]
  for (const f of facetColors) {
    ctx.globalAlpha = 0.15
    ctx.fillStyle = f.color
    ctx.beginPath()
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Head — perfectly cut gem
  ctx.fillStyle = 'rgba(220, 235, 250, 0.85)'
  ctx.beginPath()
  ctx.moveTo(300, 180)
  ctx.lineTo(270, 200)
  ctx.lineTo(260, 230)
  ctx.lineTo(270, 270)
  ctx.lineTo(300, 285)
  ctx.lineTo(330, 270)
  ctx.lineTo(340, 230)
  ctx.lineTo(330, 200)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.6)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Face facets
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 180)
  ctx.lineTo(300, 285)
  ctx.moveTo(265, 220)
  ctx.lineTo(335, 220)
  ctx.moveTo(270, 250)
  ctx.lineTo(330, 250)
  ctx.stroke()

  // Eyes — sharp, brilliant
  ctx.fillStyle = 'rgba(100, 140, 200, 0.7)'
  ctx.beginPath()
  ctx.ellipse(285, 228, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(315, 228, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(287, 227, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(317, 227, 2, 0, Math.PI * 2)
  ctx.fill()

  // Lips
  ctx.fillStyle = 'rgba(200, 150, 180, 0.4)'
  ctx.beginPath()
  ctx.moveTo(290, 258)
  ctx.quadraticCurveTo(300, 265, 310, 258)
  ctx.quadraticCurveTo(300, 262, 290, 258)
  ctx.fill()

  // Arms — geometric
  ctx.fillStyle = 'rgba(220, 235, 250, 0.7)'
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.5)'
  ctx.lineWidth = 1
  // Left arm
  ctx.beginPath()
  ctx.moveTo(250, 310)
  ctx.lineTo(210, 360)
  ctx.lineTo(190, 430)
  ctx.lineTo(200, 440)
  ctx.lineTo(215, 375)
  ctx.lineTo(258, 320)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // Right arm
  ctx.beginPath()
  ctx.moveTo(350, 310)
  ctx.lineTo(390, 360)
  ctx.lineTo(410, 430)
  ctx.lineTo(400, 440)
  ctx.lineTo(385, 375)
  ctx.lineTo(342, 320)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Legs — faceted
  ctx.beginPath()
  ctx.moveTo(275, 580)
  ctx.lineTo(260, 680)
  ctx.lineTo(250, 740)
  ctx.lineTo(280, 740)
  ctx.lineTo(290, 680)
  ctx.lineTo(305, 590)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(295, 590)
  ctx.lineTo(310, 680)
  ctx.lineTo(320, 740)
  ctx.lineTo(350, 740)
  ctx.lineTo(340, 680)
  ctx.lineTo(325, 580)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Major facet highlights
  drawFacetHighlight(ctx, 290, 340, 20, 0.2)
  drawFacetHighlight(ctx, 320, 420, 18, -0.4)
  drawFacetHighlight(ctx, 300, 230, 12, 0)
}

function drawDiamondDynastyKing(ctx: CanvasRenderingContext2D) {
  // Deep amber interior of ancient diamond
  const bg = ctx.createRadialGradient(300, 420, 30, 300, 420, 450)
  bg.addColorStop(0, '#F57F17')
  bg.addColorStop(0.3, '#E3A04A')
  bg.addColorStop(0.5, '#C8965A')
  bg.addColorStop(0.7, '#8B6914')
  bg.addColorStop(1, '#3A2A10')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Diamond surface — cool, polished but cracked
  ctx.strokeStyle = 'rgba(200, 220, 240, 0.08)'
  ctx.lineWidth = 1
  // Surface cracks
  ctx.beginPath()
  ctx.moveTo(0, 200)
  ctx.quadraticCurveTo(200, 180, 400, 210)
  ctx.quadraticCurveTo(500, 220, 600, 190)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, 600)
  ctx.quadraticCurveTo(150, 620, 300, 590)
  ctx.quadraticCurveTo(450, 560, 600, 610)
  ctx.stroke()

  // The Ancient Inclusion — massive, seated, old
  // Body shape — polished diamond surface with inclusions visible through

  // Outer body shape
  ctx.fillStyle = 'rgba(200, 220, 240, 0.25)'
  ctx.strokeStyle = 'rgba(200, 220, 240, 0.15)'
  ctx.lineWidth = 2

  // Massive seated torso
  ctx.beginPath()
  ctx.moveTo(200, 290)
  ctx.quadraticCurveTo(300, 260, 400, 290)
  ctx.lineTo(430, 600)
  ctx.quadraticCurveTo(300, 640, 170, 600)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Inclusions visible INSIDE the body — tiny trapped scenes

  // Battle scene in chest
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#9B111E'
  ctx.beginPath()
  ctx.ellipse(290, 400, 40, 30, 0, 0, Math.PI * 2)
  ctx.fill()
  // Tiny warriors
  ctx.fillStyle = '#1A1A1A'
  ctx.globalAlpha = 0.15
  for (const [wx, wy] of [[270, 395], [285, 400], [300, 393], [310, 402]] as [number, number][]) {
    ctx.fillRect(wx, wy, 3, 8)
    ctx.beginPath()
    ctx.arc(wx + 1.5, wy - 2, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Coronation scene in shoulder
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.ellipse(350, 340, 25, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Ancient forest in arm area
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#2E7D32'
  ctx.beginPath()
  ctx.ellipse(230, 450, 30, 25, 0, 0, Math.PI * 2)
  ctx.fill()
  // Tiny trees
  ctx.fillStyle = '#1B5E20'
  for (const tx of [215, 225, 235, 245]) {
    ctx.beginPath()
    ctx.moveTo(tx, 460)
    ctx.lineTo(tx - 4, 445)
    ctx.lineTo(tx + 4, 445)
    ctx.closePath()
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Surface cracks on body — weight of history
  ctx.strokeStyle = 'rgba(200, 220, 240, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(280, 300)
  ctx.lineTo(290, 380)
  ctx.lineTo(270, 450)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(340, 320)
  ctx.lineTo(330, 400)
  ctx.lineTo(350, 480)
  ctx.stroke()

  // Head — polished diamond surface
  ctx.fillStyle = 'rgba(200, 220, 240, 0.3)'
  ctx.beginPath()
  ctx.ellipse(300, 250, 45, 50, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(200, 220, 240, 0.2)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Face — suggestion through diamond
  ctx.fillStyle = 'rgba(200, 220, 240, 0.5)'
  // Eyes — ancient, deep amber
  ctx.beginPath()
  ctx.ellipse(282, 248, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(318, 248, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#F57F17'
  ctx.beginPath()
  ctx.arc(282, 248, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(318, 248, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Crown shape — faceted
  ctx.strokeStyle = 'rgba(200, 220, 240, 0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(260, 220)
  ctx.lineTo(270, 190)
  ctx.lineTo(285, 200)
  ctx.lineTo(300, 185)
  ctx.lineTo(315, 200)
  ctx.lineTo(330, 190)
  ctx.lineTo(340, 220)
  ctx.stroke()

  // Arms — massive, seated
  ctx.fillStyle = 'rgba(200, 220, 240, 0.2)'
  ctx.beginPath()
  ctx.moveTo(205, 320)
  ctx.quadraticCurveTo(160, 400, 140, 490)
  ctx.lineTo(170, 500)
  ctx.quadraticCurveTo(185, 410, 225, 340)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(395, 320)
  ctx.quadraticCurveTo(440, 400, 460, 490)
  ctx.lineTo(430, 500)
  ctx.quadraticCurveTo(415, 410, 375, 340)
  ctx.closePath()
  ctx.fill()

  // Seated legs
  ctx.beginPath()
  ctx.moveTo(220, 600)
  ctx.quadraticCurveTo(200, 670, 190, 740)
  ctx.lineTo(240, 740)
  ctx.quadraticCurveTo(250, 670, 270, 600)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(330, 600)
  ctx.quadraticCurveTo(350, 670, 360, 740)
  ctx.lineTo(410, 740)
  ctx.quadraticCurveTo(400, 670, 380, 600)
  ctx.closePath()
  ctx.fill()

  // Internal amber glow from inclusions
  const inclusionGlow = ctx.createRadialGradient(300, 400, 20, 300, 400, 150)
  inclusionGlow.addColorStop(0, 'rgba(245, 127, 23, 0.08)')
  inclusionGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = inclusionGlow
  ctx.fillRect(150, 250, 300, 300)
}

function drawDiamondDynastyAce(ctx: CanvasRenderingContext2D) {
  // Half raw crystal, half perfect cut
  const bg = ctx.createLinearGradient(0, 0, 600, 0)
  bg.addColorStop(0, '#CFD8DC')
  bg.addColorStop(0.5, '#ECEFF1')
  bg.addColorStop(1, '#F5F5F5')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  // Left half — raw crystal texture
  ctx.globalAlpha = 0.08
  for (let i = 0; i < 15; i++) {
    ctx.strokeStyle = '#90A4AE'
    ctx.lineWidth = 1
    const sx = Math.random() * 300
    const sy = Math.random() * 840
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + Math.random() * 60 - 30, sy + Math.random() * 60 - 30)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Right half — clean, polished
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillRect(300, 0, 300, 840)

  // Diamond being cut — central suit symbol
  // Left half: raw crystal
  ctx.fillStyle = 'rgba(200, 220, 240, 0.6)'
  ctx.strokeStyle = 'rgba(150, 180, 210, 0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(300, 240)
  ctx.bezierCurveTo(280, 260, 200, 320, 200, 390)
  ctx.bezierCurveTo(200, 440, 240, 460, 275, 448)
  ctx.bezierCurveTo(288, 444, 296, 438, 300, 425)
  ctx.lineTo(300, 240)
  ctx.closePath()
  ctx.fill()
  // Rough edges on raw half
  ctx.strokeStyle = 'rgba(150, 180, 210, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(240, 320)
  ctx.lineTo(260, 350)
  ctx.lineTo(230, 390)
  ctx.stroke()

  // Right half: perfect cut facets
  ctx.fillStyle = 'rgba(230, 240, 250, 0.85)'
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.7)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(300, 240)
  ctx.lineTo(300, 425)
  ctx.bezierCurveTo(304, 438, 312, 444, 325, 448)
  ctx.bezierCurveTo(360, 460, 400, 440, 400, 390)
  ctx.bezierCurveTo(400, 320, 320, 260, 300, 240)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Facet lines on perfect side
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(300, 300)
  ctx.lineTo(370, 370)
  ctx.moveTo(300, 350)
  ctx.lineTo(380, 400)
  ctx.moveTo(340, 300)
  ctx.lineTo(300, 380)
  ctx.stroke()

  // Stem
  ctx.fillStyle = 'rgba(215, 228, 240, 0.7)'
  ctx.fillRect(287, 445, 26, 60)
  // Base
  ctx.beginPath()
  ctx.moveTo(260, 505)
  ctx.quadraticCurveTo(280, 490, 300, 505)
  ctx.quadraticCurveTo(320, 490, 340, 505)
  ctx.fill()

  // Each completed facet reveals different scene inside
  ctx.globalAlpha = 0.15
  // Scene 1 in a facet
  ctx.fillStyle = '#2196F3'
  ctx.beginPath()
  ctx.arc(350, 340, 15, 0, Math.PI * 2)
  ctx.fill()
  // Scene 2
  ctx.fillStyle = '#4CAF50'
  ctx.beginPath()
  ctx.arc(370, 400, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Prismatic highlights on perfect side
  drawFacetHighlight(ctx, 340, 320, 15, 0.3)
  drawFacetHighlight(ctx, 370, 380, 12, -0.2)
  drawFacetHighlight(ctx, 330, 420, 10, 0.6)

  // Bright guiding star at the cut point
  ctx.fillStyle = '#FFD700'
  ctx.shadowColor = '#FFD700'
  ctx.shadowBlur = 15
  ctx.beginPath()
  ctx.arc(300, 330, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(300, 330, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
}


// ═══════════════════════════════════════════════════════════════
// MIDNIGHT PURPLE — Secret 1920s Harlem Jazz Club
// ═══════════════════════════════════════════════════════════════

function drawMidnightPurple(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawMidnightPurpleJack(ctx); break
    case 'Q': drawMidnightPurpleQueen(ctx); break
    case 'K': drawMidnightPurpleKing(ctx); break
    case 'A': drawMidnightPurpleAce(ctx); break
  }
}

function drawJazzClubBg(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#1E1040'); bg.addColorStop(0.3, '#2D1B4E')
  bg.addColorStop(0.7, '#1E1040'); bg.addColorStop(1, '#0E0820')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 840)
  // Smoky haze
  ctx.globalAlpha = 0.04; ctx.fillStyle = '#A855F7'
  for (let y = 100; y < 700; y += 80) {
    const haze = ctx.createRadialGradient(200 + (y % 200), y, 20, 300, y, 250)
    haze.addColorStop(0, 'rgba(168,85,247,0.06)'); haze.addColorStop(1, 'transparent')
    ctx.fillStyle = haze; ctx.fillRect(0, y - 100, 600, 200)
  }
  ctx.globalAlpha = 1
}

function drawMidnightPurpleJack(ctx: CanvasRenderingContext2D) {
  drawJazzClubBg(ctx)
  // Stage with purple spotlight
  const spot = ctx.createRadialGradient(300, 150, 20, 300, 400, 350)
  spot.addColorStop(0, 'rgba(107,33,168,0.3)'); spot.addColorStop(0.5, 'rgba(107,33,168,0.1)'); spot.addColorStop(1, 'transparent')
  ctx.fillStyle = spot; ctx.fillRect(0, 0, 600, 840)
  // Stage floor
  const stage = ctx.createLinearGradient(0, 600, 0, 840)
  stage.addColorStop(0, '#2D1B4E'); stage.addColorStop(1, '#1E1040')
  ctx.fillStyle = stage; ctx.fillRect(0, 600, 600, 240)
  ctx.strokeStyle = '#6B21A8'; ctx.lineWidth = 2; ctx.globalAlpha = 0.3
  ctx.beginPath(); ctx.moveTo(0, 602); ctx.lineTo(600, 602); ctx.stroke(); ctx.globalAlpha = 1
  // Audience silhouettes
  ctx.fillStyle = '#0E0820'; ctx.globalAlpha = 0.5
  for (let i = 0; i < 8; i++) {
    const ax = 30 + i * 75
    ctx.beginPath(); ctx.ellipse(ax, 780, 25, 35, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(ax, 740, 14, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
  // ── The Horn Player — young trumpeter, mid-solo, eyes closed ──
  // 1920s suit with suspenders
  const suit = ctx.createLinearGradient(200, 340, 400, 600)
  suit.addColorStop(0, '#2D1B4E'); suit.addColorStop(1, '#1E1040')
  ctx.fillStyle = suit
  ctx.beginPath(); ctx.moveTo(220, 350); ctx.quadraticCurveTo(300, 320, 380, 350)
  ctx.lineTo(370, 600); ctx.quadraticCurveTo(300, 620, 230, 600); ctx.closePath(); ctx.fill()
  // Suspenders
  ctx.strokeStyle = '#6B21A8'; ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(260, 350); ctx.lineTo(270, 600); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(340, 350); ctx.lineTo(330, 600); ctx.stroke()
  // Shirt collar
  ctx.fillStyle = '#E8DCC8'
  ctx.beginPath(); ctx.moveTo(265, 350); ctx.lineTo(300, 370); ctx.lineTo(335, 350); ctx.quadraticCurveTo(300, 360, 265, 350); ctx.fill()
  // Neck
  ctx.fillStyle = '#8B5E3C'; ctx.fillRect(280, 300, 40, 50)
  // Head — young man, passionate
  ctx.fillStyle = '#A0714E'; ctx.beginPath(); ctx.ellipse(300, 255, 48, 55, 0, 0, Math.PI * 2); ctx.fill()
  // Hair — 1920s style
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.ellipse(300, 215, 50, 28, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.moveTo(250, 225); ctx.quadraticCurveTo(260, 210, 280, 222); ctx.fill()
  // Hat tilted back
  ctx.fillStyle = '#2D1B4E'
  ctx.beginPath(); ctx.ellipse(300, 210, 58, 12, -0.15, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.moveTo(248, 210); ctx.quadraticCurveTo(300, 175, 352, 210); ctx.fill()
  ctx.fillStyle = '#6B21A8'; ctx.fillRect(248, 205, 104, 6)
  // Eyes CLOSED (transported by music)
  ctx.strokeStyle = '#3D2B1F'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(272, 258); ctx.quadraticCurveTo(280, 262, 288, 258); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(312, 258); ctx.quadraticCurveTo(320, 262, 328, 258); ctx.stroke()
  // Eyebrows
  ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(270, 248); ctx.quadraticCurveTo(280, 244, 290, 249); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(310, 249); ctx.quadraticCurveTo(320, 244, 330, 248); ctx.stroke()
  // Nose + mouth
  ctx.strokeStyle = '#7A5440'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(300, 255); ctx.lineTo(297, 270); ctx.stroke()
  // Mouth — puckered for trumpet
  ctx.fillStyle = '#9B6B5A'; ctx.beginPath(); ctx.ellipse(300, 282, 6, 4, 0, 0, Math.PI * 2); ctx.fill()
  // ── Arms — trumpet raised ──
  // Right arm
  ctx.strokeStyle = '#2D1B4E'; ctx.lineWidth = 22; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(370, 380); ctx.quadraticCurveTo(420, 330, 440, 280); ctx.stroke()
  ctx.fillStyle = '#8B5E3C'; ctx.beginPath(); ctx.arc(442, 275, 12, 0, Math.PI * 2); ctx.fill()
  // Left arm
  ctx.strokeStyle = '#2D1B4E'; ctx.lineWidth = 20
  ctx.beginPath(); ctx.moveTo(230, 380); ctx.quadraticCurveTo(200, 330, 210, 280); ctx.stroke()
  ctx.fillStyle = '#8B5E3C'; ctx.beginPath(); ctx.arc(212, 275, 11, 0, Math.PI * 2); ctx.fill()
  // Trumpet
  ctx.save(); ctx.translate(330, 278); ctx.rotate(-0.3)
  ctx.fillStyle = '#FFD700'
  ctx.beginPath(); ctx.roundRect(0, -4, 120, 8, 3); ctx.fill()
  // Bell
  ctx.beginPath(); ctx.moveTo(120, -4); ctx.lineTo(145, -15); ctx.lineTo(145, 19); ctx.lineTo(120, 8); ctx.fill()
  // Valves
  for (let v = 30; v < 90; v += 25) {
    ctx.fillStyle = '#B8900F'; ctx.fillRect(v, -10, 6, 6)
  }
  ctx.restore()
  // Tapping foot
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.ellipse(270, 720, 18, 8, -0.2, 0, Math.PI * 2); ctx.fill()
  // Purple spotlight cone
  ctx.globalAlpha = 0.06; ctx.fillStyle = '#A855F7'
  ctx.beginPath(); ctx.moveTo(280, 0); ctx.lineTo(100, 840); ctx.lineTo(500, 840); ctx.lineTo(320, 0); ctx.closePath(); ctx.fill()
  ctx.globalAlpha = 1
}

function drawMidnightPurpleQueen(ctx: CanvasRenderingContext2D) {
  drawJazzClubBg(ctx)
  // Stage with purple backlight
  const backlight = ctx.createRadialGradient(300, 300, 50, 300, 400, 400)
  backlight.addColorStop(0, 'rgba(168,85,247,0.15)'); backlight.addColorStop(1, 'transparent')
  ctx.fillStyle = backlight; ctx.fillRect(0, 0, 600, 840)
  // Band silhouettes behind
  ctx.fillStyle = '#0E0820'; ctx.globalAlpha = 0.3
  ctx.beginPath(); ctx.arc(120, 550, 20, 0, Math.PI * 2); ctx.fill() // head
  ctx.fillRect(100, 570, 40, 80) // body
  ctx.beginPath(); ctx.arc(500, 530, 18, 0, Math.PI * 2); ctx.fill()
  ctx.fillRect(482, 548, 36, 80)
  ctx.globalAlpha = 1
  // ── The Singer — vocalist at vintage mic, sequined dress ──
  // Sequined dress
  const dress = ctx.createLinearGradient(200, 350, 400, 840)
  dress.addColorStop(0, '#6B21A8'); dress.addColorStop(0.5, '#4A1942'); dress.addColorStop(1, '#2D1B4E')
  ctx.fillStyle = dress
  ctx.beginPath(); ctx.moveTo(210, 370); ctx.quadraticCurveTo(300, 340, 390, 370)
  ctx.lineTo(420, 840); ctx.quadraticCurveTo(300, 860, 180, 840); ctx.closePath(); ctx.fill()
  // Sequin sparkles
  ctx.fillStyle = '#FFD700'; ctx.globalAlpha = 0.15
  for (let i = 0; i < 30; i++) {
    const sx = 220 + (i * 37) % 160, sy = 400 + (i * 53) % 350
    ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
  // Neck
  ctx.fillStyle = '#A0714E'; ctx.fillRect(280, 300, 40, 60)
  // Head — woman, serene, transported
  ctx.fillStyle = '#B87A52'; ctx.beginPath(); ctx.ellipse(300, 255, 48, 56, 0, 0, Math.PI * 2); ctx.fill()
  // Finger wave hair
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.ellipse(300, 215, 52, 28, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.ellipse(300, 220, 54, 22, 0, 0, Math.PI); ctx.fill()
  // Finger wave ridges
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2
  for (let w = 0; w < 3; w++) {
    ctx.beginPath(); ctx.moveTo(255, 210 + w * 8); ctx.quadraticCurveTo(300, 205 + w * 8, 345, 210 + w * 8); ctx.stroke()
  }
  // Eyes CLOSED
  ctx.strokeStyle = '#3D2B1F'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(272, 258); ctx.quadraticCurveTo(280, 262, 288, 258); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(312, 258); ctx.quadraticCurveTo(320, 262, 328, 258); ctx.stroke()
  // Eyebrows
  ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(270, 248); ctx.quadraticCurveTo(280, 243, 292, 248); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(308, 248); ctx.quadraticCurveTo(320, 243, 330, 248); ctx.stroke()
  // Nose + open singing mouth
  ctx.strokeStyle = '#8B6B52'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(300, 255); ctx.lineTo(297, 268); ctx.stroke()
  ctx.fillStyle = '#6B4040'
  ctx.beginPath(); ctx.ellipse(300, 280, 10, 7, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(300, 276, 3, 0, Math.PI); ctx.fill()
  // Cheek warmth
  ctx.fillStyle = 'rgba(180,100,80,0.12)'
  ctx.beginPath(); ctx.ellipse(268, 268, 10, 6, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(332, 268, 10, 6, 0, 0, Math.PI * 2); ctx.fill()
  // Right arm raised
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 18; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(380, 380); ctx.quadraticCurveTo(420, 330, 430, 260); ctx.stroke()
  ctx.fillStyle = '#8B5E3C'; ctx.beginPath(); ctx.arc(432, 255, 10, 0, Math.PI * 2); ctx.fill()
  // Left arm
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 16
  ctx.beginPath(); ctx.moveTo(220, 380); ctx.quadraticCurveTo(190, 440, 200, 500); ctx.stroke()
  ctx.fillStyle = '#8B5E3C'; ctx.beginPath(); ctx.arc(198, 505, 10, 0, Math.PI * 2); ctx.fill()
  // Vintage microphone
  ctx.fillStyle = '#C0C0C0'
  ctx.beginPath(); ctx.ellipse(300, 340, 12, 18, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#888'; ctx.beginPath(); ctx.ellipse(300, 340, 10, 15, 0, 0, Math.PI * 2); ctx.fill()
  // Mic mesh
  ctx.strokeStyle = '#AAA'; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.3
  for (let my = 328; my < 355; my += 4) { ctx.beginPath(); ctx.moveTo(290, my); ctx.lineTo(310, my); ctx.stroke() }
  ctx.globalAlpha = 1
  // Mic stand
  ctx.strokeStyle = '#888'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(300, 358); ctx.lineTo(300, 700); ctx.stroke()
  // Purple backlight radiating
  const queenGlow = ctx.createRadialGradient(300, 250, 30, 300, 300, 250)
  queenGlow.addColorStop(0, 'rgba(168,85,247,0.08)'); queenGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = queenGlow; ctx.fillRect(0, 0, 600, 600)
}

function drawMidnightPurpleKing(ctx: CanvasRenderingContext2D) {
  drawJazzClubBg(ctx)
  // Bar interior — dim amber
  const barLight = ctx.createRadialGradient(400, 300, 30, 350, 400, 350)
  barLight.addColorStop(0, 'rgba(180,140,60,0.12)'); barLight.addColorStop(1, 'transparent')
  ctx.fillStyle = barLight; ctx.fillRect(0, 0, 600, 840)
  // Bar counter
  const bar = ctx.createLinearGradient(0, 580, 0, 700)
  bar.addColorStop(0, '#4A1942'); bar.addColorStop(1, '#2D1B4E')
  ctx.fillStyle = bar; ctx.fillRect(0, 580, 600, 260)
  ctx.fillStyle = '#6B21A8'; ctx.globalAlpha = 0.3; ctx.fillRect(0, 578, 600, 4); ctx.globalAlpha = 1
  // Mirror behind bar
  ctx.fillStyle = 'rgba(168,85,247,0.06)'; ctx.fillRect(400, 80, 170, 400)
  ctx.strokeStyle = '#6B21A8'; ctx.lineWidth = 2; ctx.globalAlpha = 0.3; ctx.strokeRect(400, 80, 170, 400); ctx.globalAlpha = 1
  // Bottles on bar
  const bottleCols = ['#6B21A8', '#4A1942', '#A855F7', '#FFD700', '#2D1B4E']
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = bottleCols[i]
    ctx.beginPath(); ctx.roundRect(420 + i * 30, 350, 16, 55, 4); ctx.fill()
    ctx.fillStyle = '#FFD700'; ctx.globalAlpha = 0.3; ctx.fillRect(422 + i * 30, 380, 12, 8); ctx.globalAlpha = 1
  }
  // Art Deco details
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1; ctx.globalAlpha = 0.15
  ctx.beginPath(); ctx.moveTo(50, 100); ctx.lineTo(80, 60); ctx.lineTo(110, 100); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(50, 150); ctx.lineTo(80, 110); ctx.lineTo(110, 150); ctx.stroke()
  ctx.globalAlpha = 1
  // ── The Club Owner — imposing, purple velvet suit, leaning on bar ──
  // MASSIVE body — double-breasted suit
  const ownerSuit = ctx.createLinearGradient(140, 350, 440, 700)
  ownerSuit.addColorStop(0, '#4A1942'); ownerSuit.addColorStop(0.5, '#6B21A8'); ownerSuit.addColorStop(1, '#4A1942')
  ctx.fillStyle = ownerSuit
  ctx.beginPath(); ctx.moveTo(140, 380); ctx.quadraticCurveTo(300, 340, 460, 380)
  ctx.lineTo(470, 840); ctx.lineTo(130, 840); ctx.closePath(); ctx.fill()
  // Lapels
  ctx.strokeStyle = '#A855F7'; ctx.lineWidth = 3; ctx.globalAlpha = 0.4
  ctx.beginPath(); ctx.moveTo(240, 380); ctx.lineTo(300, 420); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(360, 380); ctx.lineTo(300, 420); ctx.stroke()
  ctx.globalAlpha = 1
  // Buttons
  ctx.fillStyle = '#FFD700'
  ctx.beginPath(); ctx.arc(290, 440, 3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(290, 480, 3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(290, 520, 3, 0, Math.PI * 2); ctx.fill()
  // Neck
  ctx.fillStyle = '#A0714E'; ctx.fillRect(275, 315, 50, 60)
  // Head
  ctx.fillStyle = '#B87A52'; ctx.beginPath(); ctx.ellipse(300, 270, 55, 62, 0, 0, Math.PI * 2); ctx.fill()
  // Hair — slicked
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.ellipse(300, 225, 56, 30, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.ellipse(300, 230, 58, 15, 0, 0, Math.PI); ctx.fill()
  // Eyes — amused, knowing
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(278, 275, 7, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(322, 275, 7, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#3D2B1F'
  ctx.beginPath(); ctx.arc(279, 275, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(323, 275, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(280, 275, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(324, 275, 1.8, 0, Math.PI * 2); ctx.fill()
  // Eyebrows
  ctx.strokeStyle = '#3D2B1F'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(266, 264); ctx.quadraticCurveTo(278, 260, 290, 265); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(310, 265); ctx.quadraticCurveTo(322, 260, 334, 264); ctx.stroke()
  // Nose
  ctx.strokeStyle = '#8B6B52'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(300, 272); ctx.lineTo(296, 288); ctx.stroke()
  // Amused half-smile
  ctx.fillStyle = '#9B6B5A'
  ctx.beginPath(); ctx.moveTo(286, 298); ctx.quadraticCurveTo(300, 306, 318, 296)
  ctx.quadraticCurveTo(300, 302, 286, 298); ctx.fill()
  // Cigar in right hand
  ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(450, 460); ctx.lineTo(480, 440); ctx.stroke()
  ctx.fillStyle = '#FF6B35'; ctx.beginPath(); ctx.arc(483, 438, 4, 0, Math.PI * 2); ctx.fill()
  // Smoke wisps
  ctx.strokeStyle = 'rgba(168,85,247,0.08)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(483, 435); ctx.quadraticCurveTo(490, 410, 480, 380); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(485, 432); ctx.quadraticCurveTo(500, 400, 495, 360); ctx.stroke()
  // Right arm
  ctx.strokeStyle = '#4A1942'; ctx.lineWidth = 26; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(440, 420); ctx.quadraticCurveTo(460, 450, 450, 470); ctx.stroke()
  ctx.fillStyle = '#A0714E'; ctx.beginPath(); ctx.arc(450, 465, 13, 0, Math.PI * 2); ctx.fill()
  // Left arm leaning on bar
  ctx.strokeStyle = '#4A1942'; ctx.lineWidth = 24
  ctx.beginPath(); ctx.moveTo(160, 420); ctx.quadraticCurveTo(130, 500, 150, 570); ctx.stroke()
  ctx.fillStyle = '#A0714E'; ctx.beginPath(); ctx.arc(152, 575, 12, 0, Math.PI * 2); ctx.fill()
  // SUPERNATURAL: Shadow on wall DOESN'T MATCH pose
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.save(); ctx.translate(80, 150)
  // Shadow reaching for something (different pose)
  ctx.beginPath(); ctx.ellipse(0, 0, 35, 40, 0, 0, Math.PI * 2); ctx.fill() // head
  ctx.fillRect(-25, 40, 50, 120) // body
  // Shadow arms reaching UP (owner's arms are down/casual)
  ctx.beginPath(); ctx.moveTo(-25, 60); ctx.quadraticCurveTo(-80, 20, -90, -30); ctx.lineTo(-75, -30)
  ctx.quadraticCurveTo(-70, 20, -15, 55); ctx.fill()
  ctx.beginPath(); ctx.moveTo(25, 60); ctx.quadraticCurveTo(80, 20, 90, -30); ctx.lineTo(75, -30)
  ctx.quadraticCurveTo(70, 20, 15, 55); ctx.fill()
  ctx.restore()
}

function drawMidnightPurpleAce(ctx: CanvasRenderingContext2D) {
  drawJazzClubBg(ctx)
  // Club interior visible — piano, empty chairs
  ctx.fillStyle = '#1E1040'
  ctx.fillRect(50, 500, 200, 150) // piano body
  ctx.fillStyle = '#2D1B4E'; ctx.fillRect(50, 490, 200, 12) // piano top
  // Keys
  ctx.fillStyle = '#F5F0E0'
  for (let k = 0; k < 12; k++) { ctx.fillRect(55 + k * 16, 505, 14, 40) }
  ctx.fillStyle = '#1A1A1A'
  for (let k = 0; k < 11; k++) { if (k % 7 !== 2 && k % 7 !== 6) ctx.fillRect(65 + k * 16, 505, 8, 25) }
  // Empty chairs
  ctx.strokeStyle = '#4A1942'; ctx.lineWidth = 3
  for (const cx of [400, 480]) {
    ctx.beginPath(); ctx.arc(cx, 600, 15, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 615); ctx.lineTo(cx, 660); ctx.stroke()
  }
  // Purple spotlight from above
  const spotAce = ctx.createRadialGradient(300, 100, 10, 300, 350, 280)
  spotAce.addColorStop(0, 'rgba(107,33,168,0.25)'); spotAce.addColorStop(1, 'transparent')
  ctx.fillStyle = spotAce; ctx.fillRect(0, 0, 600, 600)
  // Cigarette smoke forming suit symbol
  ctx.strokeStyle = 'rgba(168,85,247,0.2)'; ctx.lineWidth = 3
  // Smoke base
  for (let s = 0; s < 5; s++) {
    ctx.beginPath()
    ctx.moveTo(300, 600 - s * 30)
    ctx.quadraticCurveTo(290 + s * 5, 570 - s * 30, 300 + (s % 2 ? -10 : 10), 550 - s * 30)
    ctx.stroke()
  }
  // Spade in smoke
  ctx.fillStyle = 'rgba(168,85,247,0.25)'
  ctx.beginPath()
  ctx.moveTo(300, 250); ctx.bezierCurveTo(275, 268, 210, 310, 210, 370)
  ctx.bezierCurveTo(210, 410, 245, 430, 282, 418); ctx.bezierCurveTo(290, 414, 295, 410, 300, 400)
  ctx.bezierCurveTo(305, 410, 310, 414, 318, 418); ctx.bezierCurveTo(355, 430, 390, 410, 390, 370)
  ctx.bezierCurveTo(390, 310, 325, 268, 300, 250); ctx.fill()
  ctx.fillRect(290, 415, 20, 50)
  ctx.beginPath(); ctx.moveTo(270, 465); ctx.quadraticCurveTo(285, 448, 300, 465)
  ctx.quadraticCurveTo(315, 448, 330, 465); ctx.fill()
  // Cigarette at bottom
  ctx.fillStyle = '#E8DCC8'; ctx.fillRect(290, 600, 20, 60)
  ctx.fillStyle = '#FF6B35'; ctx.beginPath(); ctx.arc(300, 598, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#888'; ctx.fillRect(290, 655, 20, 5)
}


// ═══════════════════════════════════════════════════════════════
// ARCTIC FROST — Northern Lights Kingdom
// ═══════════════════════════════════════════════════════════════

function drawArcticFrost(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawArcticFrostJack(ctx); break
    case 'Q': drawArcticFrostQueen(ctx); break
    case 'K': drawArcticFrostKing(ctx); break
    case 'A': drawArcticFrostAce(ctx); break
  }
}

function drawAuroraSky(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#0D47A1'); bg.addColorStop(0.3, '#1A237E'); bg.addColorStop(0.7, '#0D47A1'); bg.addColorStop(1, '#0A1A3A')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 840)
  // Aurora ribbons
  ctx.globalAlpha = 0.12
  const auroraGreen = ctx.createLinearGradient(0, 50, 600, 200)
  auroraGreen.addColorStop(0, '#A8E6CF'); auroraGreen.addColorStop(0.5, '#81D4FA'); auroraGreen.addColorStop(1, '#CE93D8')
  ctx.fillStyle = auroraGreen
  ctx.beginPath(); ctx.moveTo(0, 80); ctx.quadraticCurveTo(150, 40, 300, 90)
  ctx.quadraticCurveTo(450, 140, 600, 70); ctx.lineTo(600, 130)
  ctx.quadraticCurveTo(450, 200, 300, 150); ctx.quadraticCurveTo(150, 100, 0, 140); ctx.closePath(); ctx.fill()
  const auroraPurple = ctx.createLinearGradient(0, 120, 600, 250)
  auroraPurple.addColorStop(0, '#CE93D8'); auroraPurple.addColorStop(0.5, '#A8E6CF'); auroraPurple.addColorStop(1, '#81D4FA')
  ctx.fillStyle = auroraPurple
  ctx.beginPath(); ctx.moveTo(0, 150); ctx.quadraticCurveTo(200, 100, 400, 160)
  ctx.quadraticCurveTo(500, 190, 600, 140); ctx.lineTo(600, 190)
  ctx.quadraticCurveTo(500, 240, 400, 210); ctx.quadraticCurveTo(200, 150, 0, 200); ctx.closePath(); ctx.fill()
  ctx.globalAlpha = 1
  // Stars
  ctx.fillStyle = '#FFFFFF'
  for (let i = 0; i < 40; i++) {
    const sx = (i * 97 + 13) % 600, sy = (i * 41 + 7) % 300
    ctx.globalAlpha = 0.2 + (i % 5) * 0.1
    ctx.beginPath(); ctx.arc(sx, sy, 0.5 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawArcticFrostJack(ctx: CanvasRenderingContext2D) {
  drawAuroraSky(ctx)
  // Frozen landscape
  const ice = ctx.createLinearGradient(0, 450, 0, 840)
  ice.addColorStop(0, '#B3E5FC'); ice.addColorStop(0.3, '#81D4FA'); ice.addColorStop(1, '#0D47A1')
  ctx.fillStyle = ice; ctx.fillRect(0, 450, 600, 390)
  // Ice cracks
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(100, 500); ctx.lineTo(250, 550); ctx.lineTo(400, 520); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(300, 480); ctx.lineTo(450, 600); ctx.stroke()
  // Footstep glows on ice
  ctx.fillStyle = 'rgba(168,230,207,0.15)'
  ctx.beginPath(); ctx.ellipse(200, 620, 20, 8, 0.1, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(280, 610, 18, 7, -0.1, 0, Math.PI * 2); ctx.fill()
  // ── Aurora Runner — sprinting, fur parka ──
  // Fur parka (flowing behind)
  const parka = ctx.createLinearGradient(200, 300, 420, 550)
  parka.addColorStop(0, '#4A6E7A'); parka.addColorStop(1, '#2A4A55')
  ctx.fillStyle = parka
  ctx.beginPath(); ctx.moveTo(220, 340); ctx.quadraticCurveTo(300, 310, 380, 340)
  ctx.lineTo(420, 580); ctx.quadraticCurveTo(300, 600, 180, 580)
  ctx.closePath(); ctx.fill()
  // Parka flowing back
  ctx.fillStyle = '#2A4A55'
  ctx.beginPath(); ctx.moveTo(380, 350); ctx.quadraticCurveTo(450, 380, 480, 440)
  ctx.quadraticCurveTo(470, 500, 420, 530); ctx.lineTo(380, 460); ctx.closePath(); ctx.fill()
  // Fur trim
  ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.7
  ctx.beginPath(); ctx.moveTo(220, 340); ctx.quadraticCurveTo(300, 325, 380, 340)
  ctx.quadraticCurveTo(300, 332, 220, 340); ctx.fill()
  ctx.globalAlpha = 1
  // Fur hood
  ctx.fillStyle = '#546E7A'
  ctx.beginPath(); ctx.ellipse(300, 270, 55, 45, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.6
  ctx.beginPath(); ctx.ellipse(300, 262, 56, 30, 0, Math.PI, 0); ctx.fill()
  ctx.globalAlpha = 1
  // Face
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.ellipse(300, 270, 40, 48, 0, 0, Math.PI * 2); ctx.fill()
  // Rosy cheeks from cold
  ctx.fillStyle = 'rgba(220, 120, 120, 0.2)'
  ctx.beginPath(); ctx.ellipse(272, 282, 10, 7, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(328, 282, 10, 7, 0, 0, Math.PI * 2); ctx.fill()
  // Eyes — wide, alert
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(282, 272, 7, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(318, 272, 7, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#81D4FA'
  ctx.beginPath(); ctx.arc(283, 272, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(319, 272, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0D47A1'
  ctx.beginPath(); ctx.arc(284, 272, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(320, 272, 1.8, 0, Math.PI * 2); ctx.fill()
  // Eyebrows
  ctx.strokeStyle = '#5C3D1A'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(274, 262); ctx.quadraticCurveTo(282, 258, 290, 263); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(310, 263); ctx.quadraticCurveTo(318, 258, 326, 262); ctx.stroke()
  // Nose + grin
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(300, 272); ctx.lineTo(298, 284); ctx.stroke()
  ctx.fillStyle = '#B87060'
  ctx.beginPath(); ctx.moveTo(288, 294); ctx.quadraticCurveTo(300, 304, 312, 294); ctx.quadraticCurveTo(300, 300, 288, 294); ctx.fill()
  // Running legs
  ctx.strokeStyle = '#2A4A55'; ctx.lineWidth = 18; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(260, 570); ctx.quadraticCurveTo(230, 650, 200, 720); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(340, 570); ctx.quadraticCurveTo(370, 650, 400, 700); ctx.stroke()
  // Boots
  ctx.fillStyle = '#4A3328'
  ctx.beginPath(); ctx.ellipse(195, 728, 18, 10, -0.3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(405, 708, 18, 10, 0.3, 0, Math.PI * 2); ctx.fill()
  // Arms pumping
  ctx.strokeStyle = '#4A6E7A'; ctx.lineWidth = 16
  ctx.beginPath(); ctx.moveTo(230, 370); ctx.quadraticCurveTo(180, 420, 170, 470); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(168, 475, 10, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#4A6E7A'; ctx.lineWidth = 16
  ctx.beginPath(); ctx.moveTo(370, 370); ctx.quadraticCurveTo(410, 410, 420, 450); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(422, 455, 10, 0, Math.PI * 2); ctx.fill()
  // Arctic fox spirit — semi-transparent
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#B3E5FC'
  ctx.beginPath(); ctx.ellipse(480, 500, 30, 20, 0, 0, Math.PI * 2); ctx.fill() // body
  ctx.beginPath(); ctx.ellipse(515, 490, 14, 12, 0, 0, Math.PI * 2); ctx.fill() // head
  // Fox ears
  ctx.beginPath(); ctx.moveTo(510, 480); ctx.lineTo(505, 465); ctx.lineTo(515, 478); ctx.fill()
  ctx.beginPath(); ctx.moveTo(520, 478); ctx.lineTo(525, 465); ctx.lineTo(528, 480); ctx.fill()
  // Fox tail
  ctx.beginPath(); ctx.moveTo(450, 500); ctx.quadraticCurveTo(430, 480, 420, 490); ctx.lineTo(445, 510); ctx.fill()
  ctx.globalAlpha = 1
  // Aurora reflection on character
  const auroraRef = ctx.createRadialGradient(300, 270, 20, 300, 350, 200)
  auroraRef.addColorStop(0, 'rgba(168,230,207,0.06)'); auroraRef.addColorStop(1, 'transparent')
  ctx.fillStyle = auroraRef; ctx.fillRect(150, 200, 300, 300)
}

function drawArcticFrostQueen(ctx: CanvasRenderingContext2D) {
  // Split composition: pale ice above, deep ocean below
  // Ice surface
  const iceSurface = ctx.createLinearGradient(0, 0, 600, 420)
  iceSurface.addColorStop(0, '#E3F2FD'); iceSurface.addColorStop(0.5, '#B3E5FC'); iceSurface.addColorStop(1, '#81D4FA')
  ctx.fillStyle = iceSurface; ctx.fillRect(0, 0, 600, 420)
  // Ice cracks
  ctx.strokeStyle = 'rgba(13,71,161,0.15)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(200, 250); ctx.lineTo(400, 220); ctx.lineTo(600, 260); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(100, 300); ctx.lineTo(300, 350); ctx.lineTo(500, 310); ctx.stroke()
  // Deep ocean below
  const ocean = ctx.createLinearGradient(0, 420, 0, 840)
  ocean.addColorStop(0, '#0D47A1'); ocean.addColorStop(0.5, '#0A1A3A'); ocean.addColorStop(1, '#050D1A')
  ctx.fillStyle = ocean; ctx.fillRect(0, 420, 600, 420)
  // Aurora above ice
  ctx.globalAlpha = 0.1
  const aGreen = ctx.createLinearGradient(0, 20, 600, 100)
  aGreen.addColorStop(0, '#A8E6CF'); aGreen.addColorStop(1, '#CE93D8')
  ctx.fillStyle = aGreen
  ctx.beginPath(); ctx.moveTo(0, 40); ctx.quadraticCurveTo(300, 10, 600, 50)
  ctx.lineTo(600, 100); ctx.quadraticCurveTo(300, 60, 0, 90); ctx.closePath(); ctx.fill()
  ctx.globalAlpha = 1
  // ── Sedna — below ice, viewed through translucent surface ──
  // Her body — seen through ice (slightly blurred/cool tone)
  ctx.fillStyle = '#A0714E'; ctx.globalAlpha = 0.85
  ctx.beginPath(); ctx.ellipse(300, 550, 50, 60, 0, 0, Math.PI * 2); ctx.fill() // head
  ctx.globalAlpha = 1
  // Hair flowing UPWARD (becomes kelp)
  ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 6
  for (let h = 0; h < 8; h++) {
    const hx = 270 + h * 8
    ctx.beginPath(); ctx.moveTo(hx, 500)
    ctx.quadraticCurveTo(hx + (h % 2 ? 15 : -15), 440, hx + (h % 2 ? 20 : -20), 380)
    ctx.stroke()
  }
  // Hair transitions to kelp (green ends)
  ctx.strokeStyle = '#A8E6CF'; ctx.lineWidth = 3; ctx.globalAlpha = 0.4
  for (let h = 0; h < 8; h++) {
    const hx = 270 + h * 8
    ctx.beginPath(); ctx.moveTo(hx + (h % 2 ? 20 : -20), 380)
    ctx.quadraticCurveTo(hx + (h % 2 ? 25 : -25), 340, hx + (h % 2 ? 18 : -18), 300)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  // Body/dress
  const seaDress = ctx.createLinearGradient(200, 580, 400, 840)
  seaDress.addColorStop(0, '#0D47A1'); seaDress.addColorStop(1, '#050D1A')
  ctx.fillStyle = seaDress
  ctx.beginPath(); ctx.moveTo(220, 600); ctx.quadraticCurveTo(300, 580, 380, 600)
  ctx.lineTo(400, 840); ctx.lineTo(200, 840); ctx.closePath(); ctx.fill()
  // Eyes — looking up through ice, open
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(282, 552, 7, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(318, 552, 7, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#81D4FA'
  ctx.beginPath(); ctx.arc(283, 551, 4, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(319, 551, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0D47A1'
  ctx.beginPath(); ctx.arc(284, 550, 2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(320, 550, 2, 0, Math.PI * 2); ctx.fill()
  // Eyebrows
  ctx.strokeStyle = '#3D2B1F'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(274, 542); ctx.quadraticCurveTo(282, 538, 290, 543); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(310, 543); ctx.quadraticCurveTo(318, 538, 326, 542); ctx.stroke()
  // Nose + serene mouth
  ctx.strokeStyle = '#8B6B52'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(300, 552); ctx.lineTo(298, 564); ctx.stroke()
  ctx.fillStyle = '#B87060'
  ctx.beginPath(); ctx.moveTo(290, 574); ctx.quadraticCurveTo(300, 578, 310, 574); ctx.quadraticCurveTo(300, 576, 290, 574); ctx.fill()
  // Beluga whale circling
  ctx.fillStyle = '#E3F2FD'; ctx.globalAlpha = 0.5
  ctx.beginPath(); ctx.ellipse(160, 650, 50, 25, -0.3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(135, 645, 20, 15, -0.4, 0, Math.PI * 2); ctx.fill() // head
  ctx.fillStyle = '#0D47A1'; ctx.beginPath(); ctx.arc(128, 642, 2, 0, Math.PI * 2); ctx.fill() // eye
  // Tail
  ctx.beginPath(); ctx.moveTo(210, 650); ctx.quadraticCurveTo(230, 640, 235, 630)
  ctx.lineTo(240, 660); ctx.quadraticCurveTo(230, 660, 210, 655); ctx.fill()
  ctx.globalAlpha = 1
  // Bioluminescent glow from below
  const bioGlow = ctx.createRadialGradient(300, 700, 20, 300, 650, 200)
  bioGlow.addColorStop(0, 'rgba(129,212,250,0.1)'); bioGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = bioGlow; ctx.fillRect(100, 500, 400, 300)
  // Ice refraction line
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, 418); ctx.lineTo(600, 422); ctx.stroke()
}

function drawArcticFrostKing(ctx: CanvasRenderingContext2D) {
  // Pure blizzard
  const blizzard = ctx.createRadialGradient(300, 400, 100, 300, 420, 500)
  blizzard.addColorStop(0, '#E3F2FD'); blizzard.addColorStop(0.3, '#B3E5FC')
  blizzard.addColorStop(0.6, '#81D4FA'); blizzard.addColorStop(1, '#4A7A9A')
  ctx.fillStyle = blizzard; ctx.fillRect(0, 0, 600, 840)
  // Swirling wind currents
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2
  for (let w = 0; w < 15; w++) {
    const wy = 50 + w * 55
    ctx.beginPath(); ctx.moveTo(0, wy)
    ctx.quadraticCurveTo(200, wy + 30, 400, wy - 20)
    ctx.quadraticCurveTo(500, wy - 40, 600, wy + 10); ctx.stroke()
  }
  // ── The North Wind — massive face IN the blizzard ──
  // Face emerging from storm
  const faceGrad = ctx.createRadialGradient(300, 350, 50, 300, 380, 300)
  faceGrad.addColorStop(0, 'rgba(179,229,252,0.5)'); faceGrad.addColorStop(0.5, 'rgba(129,212,250,0.2)'); faceGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = faceGrad
  ctx.beginPath(); ctx.ellipse(300, 350, 200, 250, 0, 0, Math.PI * 2); ctx.fill()
  // Beard IS wind — flowing streams
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 8; ctx.lineCap = 'round'
  for (let b = 0; b < 7; b++) {
    const bx = 220 + b * 25
    ctx.beginPath(); ctx.moveTo(bx, 420)
    ctx.quadraticCurveTo(bx - 10, 520, bx + 20, 650)
    ctx.quadraticCurveTo(bx + 30, 720, bx - 5, 840); ctx.stroke()
  }
  // Hair IS wind currents
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 6
  for (let h = 0; h < 6; h++) {
    const hx = 200 + h * 40
    ctx.beginPath(); ctx.moveTo(hx, 250)
    ctx.quadraticCurveTo(hx + 30, 150, hx + 60, 80)
    ctx.quadraticCurveTo(hx + 70, 40, hx + 50, 0); ctx.stroke()
  }
  // One visible eye — ancient, knowing
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath(); ctx.ellipse(260, 340, 25, 15, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#81D4FA'
  ctx.beginPath(); ctx.arc(262, 340, 10, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0D47A1'
  ctx.beginPath(); ctx.arc(264, 340, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.arc(258, 336, 2.5, 0, Math.PI * 2); ctx.fill()
  // Other eye barely visible
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.beginPath(); ctx.ellipse(370, 335, 20, 12, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(129,212,250,0.2)'
  ctx.beginPath(); ctx.arc(372, 335, 7, 0, Math.PI * 2); ctx.fill()
  // Eyebrow ridge
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(230, 320); ctx.quadraticCurveTo(260, 310, 290, 322); ctx.stroke()
  // Nose — formed from converging wind
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(300, 340); ctx.lineTo(295, 390); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(290, 395); ctx.quadraticCurveTo(300, 400, 310, 395); ctx.stroke()
  // Mouth — wind gap
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(260, 415); ctx.quadraticCurveTo(300, 425, 340, 415); ctx.stroke()
  // Snow particles
  ctx.fillStyle = '#FFFFFF'
  for (let s = 0; s < 50; s++) {
    const sx = (s * 113 + 29) % 600, sy = (s * 67 + 11) % 840
    ctx.globalAlpha = 0.1 + (s % 4) * 0.08
    ctx.beginPath(); ctx.arc(sx, sy, 1 + (s % 3), 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawArcticFrostAce(ctx: CanvasRenderingContext2D) {
  // Ice surface
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#E3F2FD'); bg.addColorStop(0.4, '#B3E5FC'); bg.addColorStop(0.7, '#81D4FA'); bg.addColorStop(1, '#0D47A1')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 840)
  // Ice cracks radiating from center hole
  ctx.strokeStyle = 'rgba(13,71,161,0.2)'; ctx.lineWidth = 1.5
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const len = 120 + (i * 17) % 80
    ctx.beginPath()
    ctx.moveTo(300 + Math.cos(a) * 80, 420 + Math.sin(a) * 80)
    ctx.lineTo(300 + Math.cos(a) * len, 420 + Math.sin(a) * len)
    ctx.stroke()
    // Branch cracks
    if (i % 3 === 0) {
      const ba = a + 0.3
      ctx.beginPath()
      ctx.moveTo(300 + Math.cos(a) * 100, 420 + Math.sin(a) * 100)
      ctx.lineTo(300 + Math.cos(ba) * 140, 420 + Math.sin(ba) * 140)
      ctx.stroke()
    }
  }
  // Hole in ice — dark water below
  const hole = ctx.createRadialGradient(300, 420, 20, 300, 420, 80)
  hole.addColorStop(0, '#050D1A'); hole.addColorStop(0.7, '#0D47A1'); hole.addColorStop(1, '#81D4FA')
  ctx.fillStyle = hole
  ctx.beginPath(); ctx.ellipse(300, 420, 80, 60, 0, 0, Math.PI * 2); ctx.fill()
  // Suit symbol as shape of the hole
  ctx.fillStyle = '#0A1A3A'
  ctx.beginPath()
  ctx.moveTo(300, 360); ctx.bezierCurveTo(280, 372, 240, 392, 240, 420)
  ctx.bezierCurveTo(240, 445, 260, 456, 285, 448); ctx.bezierCurveTo(292, 445, 296, 442, 300, 435)
  ctx.bezierCurveTo(304, 442, 308, 445, 315, 448); ctx.bezierCurveTo(340, 456, 360, 445, 360, 420)
  ctx.bezierCurveTo(360, 392, 320, 372, 300, 360); ctx.fill()
  // Northern lights reflected in dark water
  ctx.globalAlpha = 0.2
  const reflGreen = ctx.createLinearGradient(250, 400, 350, 440)
  reflGreen.addColorStop(0, '#A8E6CF'); reflGreen.addColorStop(1, '#CE93D8')
  ctx.fillStyle = reflGreen
  ctx.beginPath(); ctx.ellipse(300, 420, 40, 15, 0, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1
  // Ice edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.ellipse(300, 420, 82, 62, 0, 0, Math.PI * 2); ctx.stroke()
}


// ═══════════════════════════════════════════════════════════════
// EMERALD FORTUNE — 1920s Monte Carlo Casino
// ═══════════════════════════════════════════════════════════════

function drawEmeraldFortune(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawEmeraldFortuneJack(ctx); break
    case 'Q': drawEmeraldFortuneQueen(ctx); break
    case 'K': drawEmeraldFortuneKing(ctx); break
    case 'A': drawEmeraldFortuneAce(ctx); break
  }
}

function drawCasinoBg(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#1B5E20'); bg.addColorStop(0.4, '#046A38')
  bg.addColorStop(0.7, '#1B5E20'); bg.addColorStop(1, '#0D3318')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 840)
  // Casino felt texture
  ctx.globalAlpha = 0.03; ctx.fillStyle = '#046A38'
  for (let y = 0; y < 840; y += 3) {
    for (let x = 0; x < 600; x += 3) {
      if ((x + y) % 6 === 0) { ctx.fillRect(x, y, 1, 1) }
    }
  }
  ctx.globalAlpha = 1
  // Warm gold overhead chandelier light
  const chandelier = ctx.createRadialGradient(300, 80, 20, 300, 300, 400)
  chandelier.addColorStop(0, 'rgba(212,160,23,0.15)'); chandelier.addColorStop(0.5, 'rgba(212,160,23,0.05)'); chandelier.addColorStop(1, 'transparent')
  ctx.fillStyle = chandelier; ctx.fillRect(0, 0, 600, 700)
}

function drawEmeraldFortuneJack(ctx: CanvasRenderingContext2D) {
  drawCasinoBg(ctx)
  // Casino table edge
  ctx.fillStyle = '#8B4513'; ctx.fillRect(0, 600, 600, 12)
  // Green felt table
  const felt = ctx.createLinearGradient(0, 610, 0, 840)
  felt.addColorStop(0, '#046A38'); felt.addColorStop(1, '#035A2E')
  ctx.fillStyle = felt; ctx.fillRect(0, 612, 600, 228)
  // Chip stacks
  const chipColors = ['#D4A017', '#9B111E', '#046A38', '#1A237E']
  for (let s = 0; s < 3; s++) {
    for (let c = 0; c < 4 - s; c++) {
      ctx.fillStyle = chipColors[(s + c) % 4]
      ctx.beginPath(); ctx.ellipse(420 + s * 50, 660 - c * 6, 18, 8, 0, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.ellipse(420 + s * 50, 660 - c * 6, 18, 8, 0, 0, Math.PI * 2); ctx.stroke()
    }
  }
  // ── The Card Counter — nervous prodigy, glasses, rumpled tux ──
  // Rumpled tuxedo
  const tux = ctx.createLinearGradient(200, 340, 400, 600)
  tux.addColorStop(0, '#1A1A1A'); tux.addColorStop(1, '#111')
  ctx.fillStyle = tux
  ctx.beginPath(); ctx.moveTo(215, 350); ctx.quadraticCurveTo(300, 320, 385, 350)
  ctx.lineTo(375, 600); ctx.quadraticCurveTo(300, 620, 225, 600); ctx.closePath(); ctx.fill()
  // White shirt front
  ctx.fillStyle = '#F5F0E0'
  ctx.beginPath(); ctx.moveTo(270, 350); ctx.lineTo(330, 350)
  ctx.lineTo(325, 550); ctx.lineTo(275, 550); ctx.closePath(); ctx.fill()
  // Bow tie (slightly askew)
  ctx.fillStyle = '#1A1A1A'
  ctx.save(); ctx.translate(300, 358); ctx.rotate(0.1)
  ctx.beginPath(); ctx.moveTo(-15, -5); ctx.lineTo(0, 0); ctx.lineTo(-15, 5); ctx.fill()
  ctx.beginPath(); ctx.moveTo(15, -5); ctx.lineTo(0, 0); ctx.lineTo(15, 5); ctx.fill()
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
  // Neck
  ctx.fillStyle = '#D4A574'; ctx.fillRect(280, 300, 40, 50)
  // Head — young, round glasses, sweat
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.ellipse(300, 255, 48, 55, 0, 0, Math.PI * 2); ctx.fill()
  // Hair — slightly messy scholarly
  ctx.fillStyle = '#6E4424'
  ctx.beginPath(); ctx.ellipse(300, 215, 50, 28, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.moveTo(255, 220); ctx.quadraticCurveTo(268, 200, 285, 218); ctx.fill()
  ctx.beginPath(); ctx.moveTo(315, 216); ctx.quadraticCurveTo(335, 198, 345, 222); ctx.fill()
  // Round glasses
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(280, 258, 15, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(320, 258, 15, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(295, 258); ctx.lineTo(305, 258); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(265, 255); ctx.lineTo(252, 250); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(335, 255); ctx.lineTo(348, 250); ctx.stroke()
  // Lens reflection
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.beginPath(); ctx.ellipse(276, 254, 6, 4, -0.3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(316, 254, 6, 4, -0.3, 0, Math.PI * 2); ctx.fill()
  // Eyes — wide, focused (behind glasses)
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(280, 258, 7, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(320, 258, 7, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#4A7A4A'
  ctx.beginPath(); ctx.arc(281, 258, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(321, 258, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(282, 258, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(322, 258, 1.8, 0, Math.PI * 2); ctx.fill()
  // Eyebrows — raised nervously
  ctx.strokeStyle = '#5C3D1A'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(268, 242); ctx.quadraticCurveTo(280, 236, 292, 242); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(308, 242); ctx.quadraticCurveTo(320, 236, 332, 242); ctx.stroke()
  // Nose
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(300, 258); ctx.lineTo(297, 272); ctx.stroke()
  // Nervous thin-lipped concentration
  ctx.strokeStyle = '#8B5E3C'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(288, 284); ctx.quadraticCurveTo(300, 286, 312, 284); ctx.stroke()
  // Sweat drops on brow
  ctx.fillStyle = 'rgba(180,220,255,0.3)'
  ctx.beginPath(); ctx.ellipse(330, 238, 3, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(345, 245, 2, 3, 0.2, 0, Math.PI * 2); ctx.fill()
  // Probability equations (ghosted)
  ctx.fillStyle = 'rgba(212,160,23,0.12)'; ctx.font = '12px monospace'; ctx.textAlign = 'center'
  ctx.fillText('P(21)=0.048', 300, 180)
  ctx.fillText('EV=+1.2%', 340, 200)
  ctx.fillText('TC=+3', 250, 195)
  ctx.fillText('Σ=4.7', 360, 175)
  // Right hand on chip stack
  ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 20; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(370, 400); ctx.quadraticCurveTo(400, 480, 410, 540); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(412, 545, 12, 0, Math.PI * 2); ctx.fill()
  // Left hand tapping table
  ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 18
  ctx.beginPath(); ctx.moveTo(230, 400); ctx.quadraticCurveTo(200, 480, 210, 560); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(208, 565, 11, 0, Math.PI * 2); ctx.fill()
  // Green felt reflection on face
  const feltGlow = ctx.createRadialGradient(300, 600, 20, 300, 400, 300)
  feltGlow.addColorStop(0, 'rgba(4,106,56,0.06)'); feltGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = feltGlow; ctx.fillRect(100, 200, 400, 400)
}

function drawEmeraldFortuneQueen(ctx: CanvasRenderingContext2D) {
  drawCasinoBg(ctx)
  // Roulette table edge
  const rouletteEdge = ctx.createLinearGradient(0, 580, 0, 840)
  rouletteEdge.addColorStop(0, '#8B4513'); rouletteEdge.addColorStop(0.05, '#046A38'); rouletteEdge.addColorStop(1, '#035A2E')
  ctx.fillStyle = rouletteEdge; ctx.fillRect(0, 580, 600, 260)
  // Roulette numbers on edge
  ctx.fillStyle = '#D4A017'; ctx.globalAlpha = 0.15; ctx.font = '10px serif'
  for (let n = 0; n < 15; n++) { ctx.fillText(String(n * 2 + 1), 20 + n * 40, 600) }
  ctx.globalAlpha = 1
  // Crystal chandelier light
  const chandelierQ = ctx.createRadialGradient(300, 60, 15, 300, 250, 350)
  chandelierQ.addColorStop(0, 'rgba(255,255,255,0.12)'); chandelierQ.addColorStop(0.3, 'rgba(212,160,23,0.06)'); chandelierQ.addColorStop(1, 'transparent')
  ctx.fillStyle = chandelierQ; ctx.fillRect(0, 0, 600, 600)
  // ── The Grifter — stunning woman at roulette, 9th consecutive win ──
  // Art Deco evening gown
  const gown = ctx.createLinearGradient(180, 350, 420, 840)
  gown.addColorStop(0, '#046A38'); gown.addColorStop(0.5, '#035A2E'); gown.addColorStop(1, '#024A24')
  ctx.fillStyle = gown
  ctx.beginPath(); ctx.moveTo(210, 370); ctx.quadraticCurveTo(300, 340, 390, 370)
  ctx.lineTo(410, 840); ctx.quadraticCurveTo(300, 860, 190, 840); ctx.closePath(); ctx.fill()
  // Art Deco dress pattern
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 1; ctx.globalAlpha = 0.15
  for (let y = 400; y < 800; y += 30) {
    ctx.beginPath(); ctx.moveTo(210, y); ctx.quadraticCurveTo(300, y - 5, 390, y); ctx.stroke()
  }
  ctx.globalAlpha = 1
  // Neck
  ctx.fillStyle = '#D4A574'; ctx.fillRect(278, 305, 44, 55)
  // Pearl necklace
  ctx.fillStyle = '#F5F0E0'
  for (let p = 0; p < 9; p++) {
    const pa = (p / 8) * Math.PI
    ctx.beginPath(); ctx.arc(300 + Math.cos(pa) * 40, 350 + Math.sin(pa) * 8, 3, 0, Math.PI * 2); ctx.fill()
  }
  // Head — glamorous
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.ellipse(300, 260, 48, 56, 0, 0, Math.PI * 2); ctx.fill()
  // Glamorous hair
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath(); ctx.ellipse(300, 220, 52, 28, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.ellipse(300, 225, 55, 20, 0, 0, Math.PI); ctx.fill()
  // Waves
  ctx.strokeStyle = '#A07040'; ctx.lineWidth = 2; ctx.globalAlpha = 0.3
  for (let w = 0; w < 3; w++) { ctx.beginPath(); ctx.moveTo(250, 215 + w * 8); ctx.quadraticCurveTo(300, 210 + w * 8, 350, 215 + w * 8); ctx.stroke() }
  ctx.globalAlpha = 1
  // Eyes — confident, sparkling
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(280, 262, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(320, 262, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#4A7A4A'
  ctx.beginPath(); ctx.arc(281, 262, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(321, 262, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(282, 262, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(322, 262, 1.8, 0, Math.PI * 2); ctx.fill()
  // Eyebrows — arched knowingly
  ctx.strokeStyle = '#5C3D1A'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(270, 252); ctx.quadraticCurveTo(280, 246, 292, 252); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(308, 252); ctx.quadraticCurveTo(320, 246, 330, 252); ctx.stroke()
  // Nose
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(300, 262); ctx.lineTo(297, 274); ctx.stroke()
  // Confident smirk + red lips
  ctx.fillStyle = '#9B111E'
  ctx.beginPath(); ctx.moveTo(284, 284); ctx.quadraticCurveTo(300, 294, 318, 282)
  ctx.quadraticCurveTo(300, 290, 284, 284); ctx.fill()
  // Diamond bracelet on right wrist
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.ellipse(410, 490, 12, 6, 0.2, 0, Math.PI * 2); ctx.stroke()
  // Sparkles on bracelet
  ctx.fillStyle = '#FFFFFF'
  for (let sp = 0; sp < 5; sp++) {
    const sa = (sp / 5) * Math.PI * 2
    ctx.globalAlpha = 0.3 + sp * 0.1
    ctx.beginPath(); ctx.arc(410 + Math.cos(sa) * 12, 490 + Math.sin(sa) * 5, 1.5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
  // Right arm — champagne
  ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 18; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(380, 400); ctx.quadraticCurveTo(420, 450, 410, 500); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(408, 505, 11, 0, Math.PI * 2); ctx.fill()
  // Champagne glass
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(405, 500); ctx.lineTo(405, 470); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(395, 470); ctx.lineTo(415, 470); ctx.lineTo(420, 440); ctx.lineTo(390, 440); ctx.closePath()
  ctx.strokeStyle = '#D4A017'; ctx.stroke()
  ctx.fillStyle = 'rgba(255,215,0,0.15)'; ctx.fill()
  // Left arm — palmed die barely visible
  ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 16
  ctx.beginPath(); ctx.moveTo(220, 400); ctx.quadraticCurveTo(190, 460, 200, 530); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(198, 535, 10, 0, Math.PI * 2); ctx.fill()
  // Loaded die (barely visible)
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(190, 530, 8, 8)
}

function drawEmeraldFortuneKing(ctx: CanvasRenderingContext2D) {
  drawCasinoBg(ctx)
  // Art Deco casino interior
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2; ctx.globalAlpha = 0.15
  // Geometric Art Deco patterns on walls
  for (let y = 50; y < 400; y += 60) {
    ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(60, y - 20); ctx.lineTo(90, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(510, y); ctx.lineTo(540, y - 20); ctx.lineTo(570, y); ctx.stroke()
  }
  // Brass rails
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(600, 400); ctx.stroke()
  ctx.globalAlpha = 1
  // Mirrors
  ctx.fillStyle = 'rgba(212,160,23,0.04)'; ctx.fillRect(480, 80, 100, 280)
  ctx.fillRect(20, 80, 100, 280)
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2; ctx.globalAlpha = 0.2
  ctx.strokeRect(480, 80, 100, 280); ctx.strokeRect(20, 80, 100, 280)
  ctx.globalAlpha = 1
  // ── The House — casino owner, white jacket, monocle, monkey ──
  // MASSIVE body — white dinner jacket
  const jacket = ctx.createLinearGradient(150, 360, 450, 700)
  jacket.addColorStop(0, '#F5F0E0'); jacket.addColorStop(0.5, '#E8DCC8'); jacket.addColorStop(1, '#D4C5A0')
  ctx.fillStyle = jacket
  ctx.beginPath(); ctx.moveTo(150, 390); ctx.quadraticCurveTo(300, 350, 450, 390)
  ctx.lineTo(460, 840); ctx.lineTo(140, 840); ctx.closePath(); ctx.fill()
  // Lapels
  ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(230, 390); ctx.lineTo(300, 440); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(370, 390); ctx.lineTo(300, 440); ctx.stroke()
  // Emerald cravat
  ctx.fillStyle = '#046A38'
  ctx.beginPath(); ctx.moveTo(280, 395); ctx.lineTo(300, 430); ctx.lineTo(320, 395); ctx.quadraticCurveTo(300, 405, 280, 395); ctx.fill()
  // Cravat pin
  ctx.fillStyle = '#D4A017'; ctx.beginPath(); ctx.arc(300, 410, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#046A38'; ctx.beginPath(); ctx.arc(300, 410, 2, 0, Math.PI * 2); ctx.fill()
  // Buttons
  ctx.fillStyle = '#D4A017'
  ctx.beginPath(); ctx.arc(295, 470, 3, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(295, 520, 3, 0, Math.PI * 2); ctx.fill()
  // Neck
  ctx.fillStyle = '#D4A574'; ctx.fillRect(272, 330, 56, 60)
  // Head — silver-haired, amused
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.ellipse(300, 280, 56, 64, 0, 0, Math.PI * 2); ctx.fill()
  // Silver hair
  ctx.fillStyle = '#C0C0C0'
  ctx.beginPath(); ctx.ellipse(300, 235, 58, 32, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.ellipse(300, 240, 60, 20, 0, 0, Math.PI * 0.3); ctx.fill()
  // Side hair
  ctx.beginPath(); ctx.ellipse(248, 270, 14, 22, 0.2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(352, 270, 14, 22, -0.2, 0, Math.PI * 2); ctx.fill()
  // Monocle (right eye)
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.arc(325, 282, 16, 0, Math.PI * 2); ctx.stroke()
  // Monocle chain
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(325, 298); ctx.quadraticCurveTo(340, 330, 350, 390); ctx.stroke()
  // Monocle lens reflection
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.beginPath(); ctx.ellipse(322, 278, 6, 4, -0.3, 0, Math.PI * 2); ctx.fill()
  // Eyes — amused, knowing
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(280, 282, 7, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(325, 282, 7, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#4A7A4A'
  ctx.beginPath(); ctx.arc(281, 282, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(326, 282, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(282, 282, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(327, 282, 1.8, 0, Math.PI * 2); ctx.fill()
  // Eyebrows
  ctx.strokeStyle = '#AAAAAA'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(268, 272); ctx.quadraticCurveTo(280, 267, 292, 272); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(313, 272); ctx.quadraticCurveTo(325, 267, 337, 272); ctx.stroke()
  // Nose
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(300, 282); ctx.lineTo(297, 298); ctx.stroke()
  // Amused smile
  ctx.fillStyle = '#B87060'
  ctx.beginPath(); ctx.moveTo(284, 310); ctx.quadraticCurveTo(300, 320, 316, 310)
  ctx.quadraticCurveTo(300, 316, 284, 310); ctx.fill()
  // Slight mustache
  ctx.strokeStyle = '#AAAAAA'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(285, 304); ctx.quadraticCurveTo(292, 300, 300, 302); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(300, 302); ctx.quadraticCurveTo(308, 300, 315, 304); ctx.stroke()
  // Arms
  ctx.strokeStyle = '#E8DCC8'; ctx.lineWidth = 28; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(440, 430); ctx.quadraticCurveTo(460, 500, 440, 560); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(438, 565, 14, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#E8DCC8'; ctx.lineWidth = 26
  ctx.beginPath(); ctx.moveTo(160, 430); ctx.quadraticCurveTo(140, 500, 160, 560); ctx.stroke()
  ctx.fillStyle = '#C68B5B'; ctx.beginPath(); ctx.arc(162, 565, 13, 0, Math.PI * 2); ctx.fill()
  // Capuchin monkey on shoulder!
  ctx.fillStyle = '#8B5E3C'
  ctx.beginPath(); ctx.ellipse(170, 360, 18, 22, -0.2, 0, Math.PI * 2); ctx.fill() // body
  ctx.beginPath(); ctx.arc(158, 340, 12, 0, Math.PI * 2); ctx.fill() // head
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.arc(158, 343, 7, 0, Math.PI * 2); ctx.fill() // face
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(155, 341, 2, 0, Math.PI * 2); ctx.fill() // eye
  ctx.beginPath(); ctx.arc(163, 341, 2, 0, Math.PI * 2); ctx.fill()
  // Monkey holding emerald
  ctx.fillStyle = '#046A38'
  ctx.beginPath(); ctx.arc(148, 355, 8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#D4A017'; ctx.globalAlpha = 0.3
  ctx.beginPath(); ctx.arc(148, 355, 8, 0, Math.PI * 2); ctx.stroke()
  ctx.globalAlpha = 1
  // Monkey's tiny hand on emerald
  ctx.fillStyle = '#8B5E3C'; ctx.beginPath(); ctx.arc(145, 353, 4, 0, Math.PI * 2); ctx.fill()
  // Monkey tail
  ctx.strokeStyle = '#8B5E3C'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(185, 375); ctx.quadraticCurveTo(200, 400, 190, 420); ctx.stroke()
}

function drawEmeraldFortuneAce(ctx: CanvasRenderingContext2D) {
  // Roulette wheel overhead view
  const bg = ctx.createRadialGradient(300, 420, 50, 300, 420, 350)
  bg.addColorStop(0, '#046A38'); bg.addColorStop(0.6, '#1B5E20'); bg.addColorStop(1, '#8B4513')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 840)
  // Wheel rim
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.arc(300, 420, 250, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(300, 420, 200, 0, Math.PI * 2); ctx.stroke()
  // Wheel segments
  ctx.lineWidth = 1.5; ctx.globalAlpha = 0.3
  for (let i = 0; i < 37; i++) {
    const a = (i / 37) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(300 + Math.cos(a) * 200, 420 + Math.sin(a) * 200)
    ctx.lineTo(300 + Math.cos(a) * 250, 420 + Math.sin(a) * 250)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  // Green zero pocket highlighted
  const zeroPocket = ctx.createRadialGradient(300, 170, 5, 300, 170, 30)
  zeroPocket.addColorStop(0, '#046A38'); zeroPocket.addColorStop(1, '#035A2E')
  ctx.fillStyle = zeroPocket
  ctx.beginPath(); ctx.arc(300, 170, 25, 0, Math.PI * 2); ctx.fill()
  // Suit symbol in the zero pocket
  ctx.fillStyle = '#D4A017'
  ctx.beginPath()
  ctx.moveTo(300, 152); ctx.bezierCurveTo(292, 157, 278, 165, 278, 175)
  ctx.bezierCurveTo(278, 183, 286, 187, 296, 183); ctx.bezierCurveTo(298, 182, 299, 181, 300, 178)
  ctx.bezierCurveTo(301, 181, 302, 182, 304, 183); ctx.bezierCurveTo(314, 187, 322, 183, 322, 175)
  ctx.bezierCurveTo(322, 165, 308, 157, 300, 152); ctx.fill()
  // Gold ball resting on it
  ctx.fillStyle = '#FFD700'
  ctx.beginPath(); ctx.arc(306, 168, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.4
  ctx.beginPath(); ctx.arc(304, 166, 2, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1
  // Inner wheel decoration
  ctx.fillStyle = '#D4A017'; ctx.globalAlpha = 0.1
  ctx.beginPath(); ctx.arc(300, 420, 100, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(300, 420, 100, 0, Math.PI * 2); ctx.stroke()
  // Center hub
  ctx.fillStyle = '#D4A017'
  ctx.beginPath(); ctx.arc(300, 420, 20, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#046A38'
  ctx.beginPath(); ctx.arc(300, 420, 10, 0, Math.PI * 2); ctx.fill()
}


// ═══════════════════════════════════════════════════════════════
// CRIMSON FLAME — A Dying Star's Last Civilization
// ═══════════════════════════════════════════════════════════════

function drawCrimsonFlame(ctx: CanvasRenderingContext2D, rank: FaceRank, _suit: string) {
  switch (rank) {
    case 'J': drawCrimsonJack(ctx); break
    case 'Q': drawCrimsonQueen(ctx); break
    case 'K': drawCrimsonKing(ctx); break
    case 'A': drawCrimsonAce(ctx); break
  }
}

function drawDyingStarBackground(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 600, 840)
  bg.addColorStop(0, '#1A0505')
  bg.addColorStop(0.25, '#2A0A0A')
  bg.addColorStop(0.5, '#3D0E0E')
  bg.addColorStop(0.75, '#2A0A0A')
  bg.addColorStop(1, '#120303')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 600, 840)

  ctx.globalAlpha = 0.06
  for (let i = 0; i < 5; i++) {
    const cx = 100 + i * 120
    const cy = 150 + Math.sin(i * 1.3) * 80
    const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 120 + i * 30)
    grad.addColorStop(0, '#FF6B35')
    grad.addColorStop(0.4, '#8B0000')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(cx - 150, cy - 150, 300, 300)
  }
  ctx.globalAlpha = 1

  ctx.globalAlpha = 0.08
  for (let i = 0; i < 30; i++) {
    const px = (i * 137.5 + 42) % 600
    const py = (i * 89.3 + 17) % 840
    const r = 0.5 + (i % 5) * 0.4
    ctx.fillStyle = i % 3 === 0 ? '#FF6B35' : i % 3 === 1 ? '#FFF8E1' : '#9E9E9E'
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const haze = ctx.createRadialGradient(300, 420, 100, 300, 420, 450)
  haze.addColorStop(0, 'rgba(139, 0, 0, 0.08)')
  haze.addColorStop(0.5, 'rgba(92, 0, 0, 0.04)')
  haze.addColorStop(1, 'transparent')
  ctx.fillStyle = haze
  ctx.fillRect(0, 0, 600, 840)
}

function drawCrimsonJack(ctx: CanvasRenderingContext2D) {
  drawDyingStarBackground(ctx)

  // Observation window showing solar corona
  const windowGrad = ctx.createRadialGradient(420, 180, 20, 420, 180, 200)
  windowGrad.addColorStop(0, 'rgba(255, 248, 225, 0.15)')
  windowGrad.addColorStop(0.3, 'rgba(255, 107, 53, 0.12)')
  windowGrad.addColorStop(0.6, 'rgba(139, 0, 0, 0.08)')
  windowGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = windowGrad
  ctx.beginPath()
  ctx.ellipse(420, 200, 180, 220, 0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#5C0000'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(420, 200, 180, 220, 0.15, 0, Math.PI * 2)
  ctx.stroke()

  // Solar flare arcs through window
  ctx.globalAlpha = 0.2
  ctx.strokeStyle = '#FF6B35'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(520, 80, 100, 0.5, 1.8); ctx.stroke()
  ctx.strokeStyle = '#FFF8E1'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(480, 40, 80, 0.8, 2.0); ctx.stroke()
  ctx.globalAlpha = 1

  // Instrument panel
  const panelGrad = ctx.createLinearGradient(0, 600, 0, 840)
  panelGrad.addColorStop(0, '#2A1010')
  panelGrad.addColorStop(0.3, '#1A0808')
  panelGrad.addColorStop(1, '#0D0303')
  ctx.fillStyle = panelGrad
  ctx.fillRect(0, 600, 600, 240)

  // Star chart lines
  ctx.globalAlpha = 0.35
  ctx.strokeStyle = '#FFF8E1'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, 650); ctx.quadraticCurveTo(200, 630, 320, 670); ctx.quadraticCurveTo(420, 690, 520, 660)
  ctx.stroke()
  ctx.strokeStyle = '#FF6B35'
  ctx.beginPath()
  ctx.moveTo(120, 700); ctx.quadraticCurveTo(250, 680, 380, 720)
  ctx.stroke()
  ctx.fillStyle = '#FFF8E1'
  for (const [dx, dy] of [[120, 648], [220, 638], [320, 670], [420, 686], [180, 694], [340, 712]]) {
    ctx.beginPath(); ctx.arc(dx, dy, 2, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1

  const instrGlow = ctx.createRadialGradient(300, 680, 10, 300, 680, 200)
  instrGlow.addColorStop(0, 'rgba(255, 248, 225, 0.08)')
  instrGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = instrGlow
  ctx.fillRect(50, 600, 500, 200)

  // Character body — lean young astronomer
  const bodysuit = ctx.createLinearGradient(200, 310, 400, 560)
  bodysuit.addColorStop(0, '#3D1515')
  bodysuit.addColorStop(0.5, '#2A0E0E')
  bodysuit.addColorStop(1, '#1A0808')
  ctx.fillStyle = bodysuit
  ctx.beginPath()
  ctx.moveTo(215, 340); ctx.quadraticCurveTo(300, 305, 370, 340)
  ctx.lineTo(360, 580); ctx.quadraticCurveTo(300, 600, 230, 580)
  ctx.closePath(); ctx.fill()

  // Thermal vest
  const vest = ctx.createLinearGradient(230, 340, 360, 500)
  vest.addColorStop(0, '#8B0000')
  vest.addColorStop(0.5, '#6B0000')
  vest.addColorStop(1, '#5C0000')
  ctx.fillStyle = vest
  ctx.beginPath()
  ctx.moveTo(245, 355); ctx.lineTo(345, 355)
  ctx.lineTo(338, 520); ctx.quadraticCurveTo(295, 540, 252, 520)
  ctx.closePath(); ctx.fill()

  // Collar
  ctx.strokeStyle = '#FF6B35'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(248, 340); ctx.quadraticCurveTo(300, 325, 342, 340); ctx.stroke()
  ctx.strokeStyle = 'rgba(255, 107, 53, 0.4)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(252, 344); ctx.quadraticCurveTo(300, 330, 338, 344); ctx.stroke()

  // Belt
  ctx.fillStyle = '#1A0808'; ctx.fillRect(235, 510, 120, 8)
  ctx.fillStyle = '#FFD700'; ctx.fillRect(288, 510, 16, 8)

  // Left arm pointing at chart
  ctx.strokeStyle = '#2A0E0E'; ctx.lineWidth = 16; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(230, 360); ctx.quadraticCurveTo(170, 440, 150, 520); ctx.stroke()
  ctx.strokeStyle = '#5C0000'; ctx.lineWidth = 12
  ctx.beginPath(); ctx.moveTo(230, 360); ctx.quadraticCurveTo(175, 430, 155, 500); ctx.stroke()
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.arc(148, 530, 11, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#D4A574'; ctx.lineWidth = 5
  ctx.beginPath(); ctx.moveTo(148, 530); ctx.lineTo(135, 560); ctx.stroke()

  // Right arm holding visor
  ctx.strokeStyle = '#2A0E0E'; ctx.lineWidth = 16
  ctx.beginPath(); ctx.moveTo(360, 360); ctx.quadraticCurveTo(400, 400, 390, 340); ctx.stroke()
  ctx.strokeStyle = '#5C0000'; ctx.lineWidth = 12
  ctx.beginPath(); ctx.moveTo(360, 360); ctx.quadraticCurveTo(395, 395, 388, 345); ctx.stroke()
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.arc(388, 340, 10, 0, Math.PI * 2); ctx.fill()

  // Head
  ctx.fillStyle = '#C68B5B'; ctx.fillRect(280, 290, 36, 50)
  ctx.fillStyle = '#D4A574'
  ctx.beginPath(); ctx.ellipse(300, 250, 48, 56, 0, 0, Math.PI * 2); ctx.fill()

  // Hair — short dark, windswept
  ctx.fillStyle = '#2A1A10'
  ctx.beginPath(); ctx.ellipse(300, 215, 50, 32, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath()
  ctx.moveTo(340, 218); ctx.quadraticCurveTo(365, 210, 358, 230); ctx.quadraticCurveTo(350, 222, 340, 225)
  ctx.fill()

  // Sweat
  ctx.fillStyle = 'rgba(255, 248, 225, 0.4)'
  ctx.beginPath(); ctx.ellipse(285, 228, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(310, 232, 1.5, 1, 0, 0, Math.PI * 2); ctx.fill()

  // Visor pushed up
  const visorGrad = ctx.createLinearGradient(260, 210, 340, 225)
  visorGrad.addColorStop(0, 'rgba(255, 107, 53, 0.6)')
  visorGrad.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)')
  visorGrad.addColorStop(1, 'rgba(255, 107, 53, 0.6)')
  ctx.fillStyle = visorGrad
  ctx.beginPath(); ctx.ellipse(300, 218, 42, 10, -0.05, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#5C0000'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.ellipse(300, 218, 43, 11, -0.05, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = '#3D1515'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(258, 218); ctx.quadraticCurveTo(240, 240, 248, 270); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(342, 218); ctx.quadraticCurveTo(360, 240, 352, 270); ctx.stroke()

  // Eyes — determined
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(280, 252, 7, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(318, 252, 7, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#8B6914'
  ctx.beginPath(); ctx.arc(281, 252, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(319, 252, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(282, 252, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(320, 252, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FFF8E1'
  ctx.beginPath(); ctx.arc(279, 250, 1, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(317, 250, 1, 0, Math.PI * 2); ctx.fill()

  // Eyebrows — furrowed
  ctx.strokeStyle = '#2A1A10'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(268, 244); ctx.quadraticCurveTo(278, 240, 290, 244); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(308, 244); ctx.quadraticCurveTo(318, 240, 330, 244); ctx.stroke()

  // Nose
  ctx.strokeStyle = '#B8845A'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(298, 248); ctx.lineTo(294, 264); ctx.lineTo(298, 266); ctx.stroke()

  // Mouth — focused
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(284, 275); ctx.quadraticCurveTo(300, 278, 316, 275); ctx.stroke()
  ctx.strokeStyle = '#8B5E3C'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(292, 276); ctx.lineTo(308, 276); ctx.stroke()

  // Jaw shadow
  ctx.fillStyle = 'rgba(100, 60, 30, 0.15)'
  ctx.beginPath(); ctx.ellipse(300, 295, 45, 15, 0, 0, Math.PI); ctx.fill()

  // Lighting
  const faceGlow = ctx.createRadialGradient(300, 300, 20, 300, 300, 100)
  faceGlow.addColorStop(0, 'rgba(255, 248, 225, 0.08)'); faceGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = faceGlow; ctx.fillRect(220, 200, 160, 160)
  const starAmbient = ctx.createRadialGradient(420, 200, 50, 420, 200, 350)
  starAmbient.addColorStop(0, 'rgba(139, 0, 0, 0.1)'); starAmbient.addColorStop(0.5, 'rgba(92, 0, 0, 0.05)'); starAmbient.addColorStop(1, 'transparent')
  ctx.fillStyle = starAmbient; ctx.fillRect(0, 0, 600, 600)
}

function drawCrimsonQueen(ctx: CanvasRenderingContext2D) {
  drawDyingStarBackground(ctx)

  // Clock chamber gears
  ctx.globalAlpha = 0.08; ctx.strokeStyle = '#8B0000'; ctx.lineWidth = 3
  for (let i = 0; i < 3; i++) {
    const gx = 150 + i * 200, gy = 200 + (i % 2) * 100, gr = 80 + i * 20
    ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke()
    for (let t = 0; t < 12; t++) {
      const a = (t / 12) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(gx + Math.cos(a) * (gr - 5), gy + Math.sin(a) * (gr - 5))
      ctx.lineTo(gx + Math.cos(a) * (gr + 10), gy + Math.sin(a) * (gr + 10))
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1

  // Solar clock
  const cCx = 300, cCy = 350, cR = 200
  const clockGlow = ctx.createRadialGradient(cCx, cCy, 30, cCx, cCy, cR)
  clockGlow.addColorStop(0, 'rgba(255, 248, 225, 0.12)')
  clockGlow.addColorStop(0.3, 'rgba(255, 107, 53, 0.08)')
  clockGlow.addColorStop(0.7, 'rgba(139, 0, 0, 0.05)')
  clockGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = clockGlow; ctx.beginPath(); ctx.arc(cCx, cCy, cR, 0, Math.PI * 2); ctx.fill()

  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2; ctx.globalAlpha = 0.25
  ctx.beginPath(); ctx.arc(cCx, cCy, cR, 0, Math.PI * 2); ctx.stroke()
  ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.arc(cCx, cCy, cR - 20, 0, Math.PI * 2); ctx.stroke()
  ctx.globalAlpha = 1

  // Clock symbols
  ctx.globalAlpha = 0.3; ctx.fillStyle = '#FFD700'; ctx.font = '16px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const syms = ['\u2609', '\u263D', '\u2606', '\u2726', '\u2736', '\u2605', '\u25C6', '\u2727']
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    ctx.fillText(syms[i], cCx + Math.cos(a) * (cR - 35), cCy + Math.sin(a) * (cR - 35))
  }
  ctx.globalAlpha = 1

  // Clock hands
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.globalAlpha = 0.4
  ctx.beginPath(); ctx.moveTo(cCx, cCy); ctx.lineTo(cCx - 50, cCy - 90); ctx.stroke()
  ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cCx, cCy); ctx.lineTo(cCx + 30, cCy - 120); ctx.stroke()
  ctx.globalAlpha = 1

  // Floor
  const fl = ctx.createLinearGradient(0, 600, 0, 840)
  fl.addColorStop(0, '#1A0808'); fl.addColorStop(0.4, '#120505'); fl.addColorStop(1, '#0D0303')
  ctx.fillStyle = fl; ctx.fillRect(0, 620, 600, 220)
  const fg = ctx.createRadialGradient(300, 680, 10, 300, 680, 200)
  fg.addColorStop(0, 'rgba(255, 248, 225, 0.06)'); fg.addColorStop(0.5, 'rgba(255, 107, 53, 0.03)'); fg.addColorStop(1, 'transparent')
  ctx.fillStyle = fg; ctx.fillRect(50, 620, 500, 200)

  // Character — elegant woman in crimson robes
  const robes = ctx.createLinearGradient(180, 320, 420, 700)
  robes.addColorStop(0, '#8B0000'); robes.addColorStop(0.3, '#6B0000'); robes.addColorStop(0.6, '#5C0000'); robes.addColorStop(1, '#3D0E0E')
  ctx.fillStyle = robes
  ctx.beginPath()
  ctx.moveTo(210, 350); ctx.quadraticCurveTo(300, 315, 380, 350)
  ctx.quadraticCurveTo(400, 500, 410, 700); ctx.lineTo(180, 700); ctx.quadraticCurveTo(190, 500, 210, 350)
  ctx.closePath(); ctx.fill()

  // Fold shadows
  ctx.globalAlpha = 0.15; ctx.fillStyle = '#1A0505'
  ctx.beginPath(); ctx.moveTo(270, 400); ctx.quadraticCurveTo(280, 550, 260, 700); ctx.lineTo(250, 700); ctx.quadraticCurveTo(270, 540, 265, 400); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(340, 410); ctx.quadraticCurveTo(345, 560, 360, 700); ctx.lineTo(350, 700); ctx.quadraticCurveTo(335, 550, 335, 410); ctx.closePath(); ctx.fill()
  ctx.globalAlpha = 1

  // Gold trim
  ctx.strokeStyle = '#D4A017'; ctx.lineWidth = 2; ctx.globalAlpha = 0.5
  ctx.beginPath(); ctx.moveTo(240, 350); ctx.quadraticCurveTo(300, 332, 350, 350); ctx.stroke()
  ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(245, 356); ctx.quadraticCurveTo(300, 340, 345, 356); ctx.stroke()
  ctx.globalAlpha = 1
  ctx.fillStyle = '#D4A017'; ctx.globalAlpha = 0.35; ctx.fillRect(220, 480, 150, 6); ctx.globalAlpha = 1

  // Left arm raised to clock
  ctx.strokeStyle = '#6B0000'; ctx.lineWidth = 14; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(220, 370); ctx.quadraticCurveTo(160, 350, 180, 290); ctx.stroke()
  ctx.fillStyle = '#8B0000'
  ctx.beginPath(); ctx.moveTo(220, 365); ctx.quadraticCurveTo(190, 360, 175, 320); ctx.lineTo(165, 330); ctx.quadraticCurveTo(185, 370, 215, 375); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.arc(178, 285, 10, 0, Math.PI * 2); ctx.fill()

  // Right arm relaxed
  ctx.strokeStyle = '#6B0000'; ctx.lineWidth = 14
  ctx.beginPath(); ctx.moveTo(370, 370); ctx.quadraticCurveTo(400, 440, 395, 520); ctx.stroke()
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.arc(394, 528, 10, 0, Math.PI * 2); ctx.fill()

  // Head
  ctx.fillStyle = '#D4A574'; ctx.fillRect(282, 295, 32, 55)
  ctx.beginPath(); ctx.ellipse(300, 250, 44, 54, 0, 0, Math.PI * 2); ctx.fill()

  // Hair — dark, flowing
  ctx.fillStyle = '#1A0A05'
  ctx.beginPath(); ctx.ellipse(300, 215, 48, 30, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.moveTo(254, 230); ctx.quadraticCurveTo(235, 300, 225, 400); ctx.lineTo(240, 400); ctx.quadraticCurveTo(248, 300, 260, 235); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(346, 230); ctx.quadraticCurveTo(365, 300, 375, 400); ctx.lineTo(360, 400); ctx.quadraticCurveTo(352, 300, 340, 235); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#3D1A10'; ctx.globalAlpha = 0.3
  ctx.beginPath(); ctx.ellipse(290, 210, 20, 10, -0.2, Math.PI, 0); ctx.fill()
  ctx.globalAlpha = 1

  // Eyes — serene
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.ellipse(282, 252, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(318, 252, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#8B4513'
  ctx.beginPath(); ctx.arc(283, 253, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(319, 253, 3.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath(); ctx.arc(283, 253, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(319, 253, 1.8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FFF8E1'
  ctx.beginPath(); ctx.arc(281, 251, 1, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(317, 251, 1, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#1A0A05'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(282, 252, 8, Math.PI + 0.3, -0.3); ctx.stroke()
  ctx.beginPath(); ctx.arc(318, 252, 8, Math.PI + 0.3, -0.3); ctx.stroke()

  // Eyebrows
  ctx.strokeStyle = '#1A0A05'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(270, 243); ctx.quadraticCurveTo(280, 239, 292, 243); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(308, 243); ctx.quadraticCurveTo(320, 239, 330, 243); ctx.stroke()

  // Nose
  ctx.strokeStyle = '#B8845A'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(299, 250); ctx.lineTo(296, 264); ctx.lineTo(300, 266); ctx.stroke()

  // Mouth
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.moveTo(286, 276); ctx.quadraticCurveTo(300, 282, 314, 276); ctx.stroke()
  ctx.strokeStyle = '#8B5E3C'; ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(288, 274); ctx.quadraticCurveTo(300, 271, 312, 274); ctx.stroke()

  // Evaporating tears
  ctx.globalAlpha = 0.3; ctx.strokeStyle = '#FFF8E1'; ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(278, 262); ctx.quadraticCurveTo(276, 268, 278, 275); ctx.stroke()
  ctx.globalAlpha = 0.15
  ctx.beginPath(); ctx.moveTo(276, 275); ctx.quadraticCurveTo(275, 280, 277, 285); ctx.stroke()
  ctx.globalAlpha = 0.25
  ctx.beginPath(); ctx.moveTo(322, 263); ctx.quadraticCurveTo(324, 270, 322, 278); ctx.stroke()
  ctx.globalAlpha = 1

  // Lighting
  const cl = ctx.createRadialGradient(cCx, cCy, 50, cCx, cCy, 300)
  cl.addColorStop(0, 'rgba(255, 248, 225, 0.06)'); cl.addColorStop(0.5, 'rgba(255, 107, 53, 0.03)'); cl.addColorStop(1, 'transparent')
  ctx.fillStyle = cl; ctx.fillRect(0, 0, 600, 840)
}

function drawCrimsonKing(ctx: CanvasRenderingContext2D) {
  drawDyingStarBackground(ctx)

  // Extra ash
  ctx.globalAlpha = 0.1
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = '#9E9E9E'
    ctx.beginPath(); ctx.arc((i * 97.3 + 55) % 600, (i * 71.7 + 33) % 840, 0.8 + (i % 4) * 0.3, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1

  // Crumbling walls
  ctx.globalAlpha = 0.1
  const wg = ctx.createLinearGradient(0, 0, 0, 600)
  wg.addColorStop(0, '#3D1515'); wg.addColorStop(1, '#1A0808')
  ctx.fillStyle = wg; ctx.fillRect(0, 0, 120, 600); ctx.fillRect(480, 0, 120, 600)
  ctx.globalAlpha = 1

  // Stone cracks
  ctx.globalAlpha = 0.08; ctx.strokeStyle = '#5C0000'; ctx.lineWidth = 1
  for (const cr of [[[30,100],[50,180],[40,260]],[[520,150],[540,230],[530,310]],[[80,400],[60,450],[70,500]],[[550,350],[560,420],[545,480]]]) {
    ctx.beginPath(); ctx.moveTo(cr[0][0], cr[0][1])
    for (let j = 1; j < cr.length; j++) ctx.lineTo(cr[j][0], cr[j][1])
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Throne
  const tb = ctx.createLinearGradient(180, 100, 420, 400)
  tb.addColorStop(0, '#3D1515'); tb.addColorStop(0.4, '#2A0E0E'); tb.addColorStop(1, '#1A0808')
  ctx.fillStyle = tb
  ctx.beginPath(); ctx.moveTo(180, 120); ctx.lineTo(200, 100); ctx.lineTo(400, 100); ctx.lineTo(420, 120); ctx.lineTo(410, 500); ctx.lineTo(190, 500); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#2A0E0E'; ctx.fillRect(150, 380, 60, 140); ctx.fillRect(390, 380, 60, 140)

  // Throne edge glow
  ctx.globalAlpha = 0.35; ctx.strokeStyle = '#FF6B35'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(180, 140); ctx.lineTo(190, 480); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(420, 140); ctx.lineTo(410, 480); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(200, 102); ctx.lineTo(400, 102); ctx.stroke()
  ctx.globalAlpha = 1

  // Ember particles at edges
  ctx.globalAlpha = 0.6
  const ec = ['#FF6B35', '#FFF8E1', '#FFD700', '#FF6B35']
  const te = [[175,150],[173,200],[178,280],[170,350],[165,420],[425,160],[428,240],[422,310],[430,380],[435,450],[210,98],[260,95],[340,96],[380,98]]
  for (let i = 0; i < te.length; i++) {
    ctx.fillStyle = ec[i % ec.length]; ctx.beginPath(); ctx.arc(te[i][0], te[i][1], 1.5 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1

  // Ash-covered floor
  const fl = ctx.createLinearGradient(0, 550, 0, 840)
  fl.addColorStop(0, '#1A0808'); fl.addColorStop(0.3, '#120505'); fl.addColorStop(1, '#0D0303')
  ctx.fillStyle = fl; ctx.fillRect(0, 550, 600, 290)
  ctx.globalAlpha = 0.05; ctx.fillStyle = '#9E9E9E'
  for (let i = 0; i < 20; i++) ctx.fillRect((i * 143 + 20) % 600, 580 + (i * 37 + 10) % 200, 20 + (i % 4) * 10, 2)
  ctx.globalAlpha = 1

  // MASSIVE king body
  const kr = ctx.createLinearGradient(160, 280, 440, 700)
  kr.addColorStop(0, '#8B0000'); kr.addColorStop(0.4, '#6B0000'); kr.addColorStop(0.7, '#5C0000'); kr.addColorStop(1, '#4A3535')
  ctx.fillStyle = kr
  ctx.beginPath(); ctx.moveTo(180, 350); ctx.quadraticCurveTo(300, 300, 420, 350); ctx.lineTo(440, 650); ctx.lineTo(160, 650); ctx.closePath(); ctx.fill()

  // Fold shadows
  ctx.globalAlpha = 0.12; ctx.fillStyle = '#1A0505'
  ctx.beginPath(); ctx.moveTo(250, 380); ctx.quadraticCurveTo(255, 520, 240, 650); ctx.lineTo(230, 650); ctx.quadraticCurveTo(245, 510, 245, 380); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(360, 390); ctx.quadraticCurveTo(365, 530, 380, 650); ctx.lineTo(370, 650); ctx.quadraticCurveTo(355, 520, 355, 390); ctx.closePath(); ctx.fill()
  ctx.globalAlpha = 1

  // Dust on shoulders
  ctx.globalAlpha = 0.08; ctx.fillStyle = '#9E9E9E'; ctx.fillRect(190, 345, 80, 15); ctx.fillRect(330, 345, 80, 15); ctx.globalAlpha = 1

  // Massive shoulders
  for (const [sx, rot] of [[210, -0.2], [390, 0.2]] as [number, number][]) {
    const sg = ctx.createRadialGradient(sx, 340, 10, sx, 340, 50)
    sg.addColorStop(0, '#8B0000'); sg.addColorStop(1, '#5C0000')
    ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(sx, 345, 50, 25, rot, 0, Math.PI * 2); ctx.fill()
  }

  // Arms on armrests
  ctx.strokeStyle = '#6B0000'; ctx.lineWidth = 18; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(195, 360); ctx.quadraticCurveTo(170, 420, 175, 470); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(405, 360); ctx.quadraticCurveTo(430, 420, 425, 470); ctx.stroke()
  ctx.fillStyle = '#C68B5B'
  ctx.beginPath(); ctx.arc(175, 478, 13, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(425, 478, 13, 0, Math.PI * 2); ctx.fill()

  // Head — large
  ctx.fillStyle = '#C68B5B'; ctx.fillRect(275, 280, 50, 65)
  ctx.fillStyle = '#D4A574'; ctx.beginPath(); ctx.ellipse(300, 230, 55, 62, 0, 0, Math.PI * 2); ctx.fill()

  // Beard — white
  ctx.fillStyle = '#D4D4D4'
  ctx.beginPath(); ctx.moveTo(265, 272); ctx.quadraticCurveTo(265, 340, 275, 380); ctx.lineTo(325, 380); ctx.quadraticCurveTo(335, 340, 335, 272); ctx.quadraticCurveTo(300, 290, 265, 272); ctx.fill()
  ctx.strokeStyle = '#BDBDBD'; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.3
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(275 + i * 12, 285); ctx.quadraticCurveTo(273 + i * 12, 330, 276 + i * 12, 370); ctx.stroke() }
  ctx.globalAlpha = 1

  // Hair — white
  ctx.fillStyle = '#D4D4D4'
  ctx.beginPath(); ctx.ellipse(300, 195, 52, 28, 0, Math.PI, 0); ctx.fill()
  ctx.beginPath(); ctx.moveTo(248, 210); ctx.quadraticCurveTo(240, 250, 250, 280); ctx.lineTo(256, 280); ctx.quadraticCurveTo(248, 250, 254, 215); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(352, 210); ctx.quadraticCurveTo(360, 250, 350, 280); ctx.lineTo(344, 280); ctx.quadraticCurveTo(352, 250, 346, 215); ctx.closePath(); ctx.fill()

  // Crown fused to head
  const cg = ctx.createLinearGradient(260, 170, 340, 195)
  cg.addColorStop(0, '#8B6914'); cg.addColorStop(0.5, '#D4A017'); cg.addColorStop(1, '#8B6914')
  ctx.fillStyle = cg; ctx.fillRect(258, 185, 84, 18)
  ctx.beginPath(); ctx.moveTo(260, 185); ctx.lineTo(268, 162); ctx.lineTo(276, 185); ctx.fill()
  ctx.beginPath(); ctx.moveTo(286, 185); ctx.lineTo(300, 155); ctx.lineTo(314, 185); ctx.fill()
  ctx.beginPath(); ctx.moveTo(324, 185); ctx.lineTo(332, 162); ctx.lineTo(340, 185); ctx.fill()
  ctx.globalAlpha = 0.5; ctx.strokeStyle = '#FF6B35'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(258, 202); ctx.lineTo(342, 202); ctx.stroke()
  ctx.globalAlpha = 0.3; ctx.strokeStyle = '#FFF8E1'; ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(260, 200); ctx.lineTo(340, 200); ctx.stroke()
  ctx.globalAlpha = 1

  // Eyes — closed
  ctx.strokeStyle = '#5C3D1A'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(282, 242, 7, 0, Math.PI); ctx.stroke()
  ctx.beginPath(); ctx.arc(318, 242, 7, 0, Math.PI); ctx.stroke()

  // Eyebrows
  ctx.strokeStyle = '#BDBDBD'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(270, 232); ctx.quadraticCurveTo(280, 228, 292, 232); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(308, 232); ctx.quadraticCurveTo(320, 228, 332, 232); ctx.stroke()

  // Nose
  ctx.strokeStyle = '#B8845A'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(298, 240); ctx.lineTo(293, 258); ctx.lineTo(298, 262); ctx.stroke()

  // Mouth (behind beard)
  ctx.strokeStyle = '#A0714E'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(286, 270); ctx.quadraticCurveTo(300, 275, 314, 270); ctx.stroke()

  // Wrinkles
  ctx.strokeStyle = '#B8845A'; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.2
  ctx.beginPath(); ctx.moveTo(270, 215); ctx.lineTo(330, 215); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(275, 220); ctx.lineTo(325, 220); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(267, 240); ctx.lineTo(260, 236); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(333, 240); ctx.lineTo(340, 236); ctx.stroke()
  ctx.globalAlpha = 1

  // Lighting
  const tel = ctx.createRadialGradient(300, 300, 50, 300, 300, 350)
  tel.addColorStop(0, 'transparent'); tel.addColorStop(0.7, 'rgba(255, 107, 53, 0.03)'); tel.addColorStop(1, 'rgba(255, 107, 53, 0.06)')
  ctx.fillStyle = tel; ctx.fillRect(0, 0, 600, 840)
  const ew = ctx.createRadialGradient(300, 450, 30, 300, 450, 400)
  ew.addColorStop(0, 'rgba(255, 248, 225, 0.04)'); ew.addColorStop(1, 'transparent')
  ctx.fillStyle = ew; ctx.fillRect(0, 0, 600, 840)
}

function drawCrimsonAce(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createRadialGradient(300, 420, 20, 300, 420, 450)
  bg.addColorStop(0, '#3D0E0E'); bg.addColorStop(0.2, '#2A0A0A'); bg.addColorStop(0.5, '#1A0505'); bg.addColorStop(0.8, '#0D0303'); bg.addColorStop(1, '#060101')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 840)

  // Solar flare arcs
  ctx.globalAlpha = 0.15; ctx.strokeStyle = '#FF6B35'; ctx.lineWidth = 2
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    ctx.beginPath(); ctx.arc(300 + Math.cos(a) * 50, 420 + Math.sin(a) * 50, 180 + (i % 3) * 30, a - 0.4, a + 0.4); ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Corona layers: outer red
  const oc = ctx.createRadialGradient(300, 420, 100, 300, 420, 250)
  oc.addColorStop(0, 'transparent'); oc.addColorStop(0.6, 'rgba(139, 0, 0, 0.15)'); oc.addColorStop(0.8, 'rgba(139, 0, 0, 0.08)'); oc.addColorStop(1, 'transparent')
  ctx.fillStyle = oc; ctx.beginPath(); ctx.arc(300, 420, 250, 0, Math.PI * 2); ctx.fill()

  // Mid orange
  const mc = ctx.createRadialGradient(300, 420, 50, 300, 420, 150)
  mc.addColorStop(0, 'transparent'); mc.addColorStop(0.5, 'rgba(255, 107, 53, 0.2)'); mc.addColorStop(0.8, 'rgba(255, 107, 53, 0.08)'); mc.addColorStop(1, 'transparent')
  ctx.fillStyle = mc; ctx.beginPath(); ctx.arc(300, 420, 150, 0, Math.PI * 2); ctx.fill()

  // Yellow-hot
  const yl = ctx.createRadialGradient(300, 420, 20, 300, 420, 80)
  yl.addColorStop(0, 'rgba(255, 215, 0, 0.3)'); yl.addColorStop(0.5, 'rgba(255, 200, 50, 0.15)'); yl.addColorStop(1, 'transparent')
  ctx.fillStyle = yl; ctx.beginPath(); ctx.arc(300, 420, 80, 0, Math.PI * 2); ctx.fill()

  // White-hot core
  const co = ctx.createRadialGradient(300, 420, 5, 300, 420, 40)
  co.addColorStop(0, '#FFFFFF'); co.addColorStop(0.3, '#FFF8E1'); co.addColorStop(0.6, 'rgba(255, 248, 225, 0.6)'); co.addColorStop(1, 'rgba(255, 215, 0, 0.2)')
  ctx.fillStyle = co; ctx.beginPath(); ctx.arc(300, 420, 40, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(300, 420, 12, 0, Math.PI * 2); ctx.fill()

  // Starburst rays
  ctx.globalAlpha = 0.12
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const rg = ctx.createLinearGradient(300 + Math.cos(a) * 20, 420 + Math.sin(a) * 20, 300 + Math.cos(a) * 300, 420 + Math.sin(a) * 300)
    rg.addColorStop(0, '#FFF8E1'); rg.addColorStop(0.3, '#FF6B35'); rg.addColorStop(1, 'transparent')
    ctx.strokeStyle = rg; ctx.lineWidth = 1.5 + (i % 3)
    ctx.beginPath(); ctx.moveTo(300 + Math.cos(a) * 25, 420 + Math.sin(a) * 25); ctx.lineTo(300 + Math.cos(a) * 280, 420 + Math.sin(a) * 280); ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Floating embers
  ctx.globalAlpha = 0.4
  for (const [ex, ey, ec, er] of [[120,200,'#FF6B35',2],[480,180,'#FFF8E1',1.5],[80,500,'#9E9E9E',1.8],[520,600,'#FF6B35',1.2],[200,700,'#FFD700',1.5],[400,150,'#9E9E9E',2],[150,350,'#FF6B35',1],[450,450,'#FFF8E1',1.3],[100,650,'#FF6B35',1.6],[500,300,'#FFD700',1.1]] as [number,number,string,number][]) {
    ctx.fillStyle = ec; ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
}
