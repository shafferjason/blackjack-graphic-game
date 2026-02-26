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
}

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
