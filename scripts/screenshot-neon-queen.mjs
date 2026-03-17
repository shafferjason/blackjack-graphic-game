/**
 * Playwright screenshot script for Neon Nights Queen calibration pass.
 * Captures before/after screenshots of the Neon Nights Queen card.
 *
 * Usage: node scripts/screenshot-neon-queen.mjs [before|after]
 * Requires: vite dev server running on port 5173
 */
import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '..', 'preview', 'theme-style-pass-v3-neon-queen')
const BASE_URL = process.env.PREVIEW_URL || 'http://localhost:5173'
const PHASE = process.argv[2] || 'before' // 'before' or 'after'

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  // Navigate to canvas art preview
  await page.goto(`${BASE_URL}/?preview=canvas`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Select Neon Nights skin
  const neonBtn = page.locator('.cap-btn', { hasText: /Neon Nights/i })
  await neonBtn.click()
  await page.waitForTimeout(500)

  // Set to "Full Canvas" size for best detail
  const fullBtn = page.locator('.cap-btn', { hasText: /Full Canvas/i })
  await fullBtn.click()
  await page.waitForTimeout(500)

  // Screenshot the full preview panel
  console.log(`📸 Capturing ${PHASE} screenshot — full panel...`)
  await page.screenshot({
    path: path.join(OUT_DIR, `${PHASE}-neon-nights-panel.png`),
    fullPage: false,
  })
  console.log(`  ✓ ${PHASE}-neon-nights-panel.png`)

  // Try to capture just the Queen card area
  // Cards are in .cap-card-row, Queen is the 2nd card (index 1: J, Q, K, A)
  const queenCard = page.locator('.cap-card-slot').nth(1)
  if (await queenCard.isVisible()) {
    await queenCard.screenshot({
      path: path.join(OUT_DIR, `${PHASE}-neon-queen-card.png`),
    })
    console.log(`  ✓ ${PHASE}-neon-queen-card.png`)
  }

  // Also capture at Medium size for gameplay readability check
  const medBtn = page.locator('.cap-btn', { hasText: /Medium/i })
  await medBtn.click()
  await page.waitForTimeout(500)
  const queenMed = page.locator('.cap-card-slot').nth(1)
  if (await queenMed.isVisible()) {
    await queenMed.screenshot({
      path: path.join(OUT_DIR, `${PHASE}-neon-queen-medium.png`),
    })
    console.log(`  ✓ ${PHASE}-neon-queen-medium.png`)
  }

  // Gameplay size
  const gameBtn = page.locator('.cap-btn', { hasText: /Gameplay/i })
  await gameBtn.click()
  await page.waitForTimeout(500)
  const queenSmall = page.locator('.cap-card-slot').nth(1)
  if (await queenSmall.isVisible()) {
    await queenSmall.screenshot({
      path: path.join(OUT_DIR, `${PHASE}-neon-queen-gameplay.png`),
    })
    console.log(`  ✓ ${PHASE}-neon-queen-gameplay.png`)
  }

  // In-card view at full size (shows SVG overlays)
  const inCardBtn = page.locator('.cap-btn', { hasText: /In-Card/i })
  await inCardBtn.click()
  await page.waitForTimeout(300)
  await fullBtn.click()
  await page.waitForTimeout(500)
  const queenLayered = page.locator('.cap-card-slot').nth(1)
  if (await queenLayered.isVisible()) {
    await queenLayered.screenshot({
      path: path.join(OUT_DIR, `${PHASE}-neon-queen-layered.png`),
    })
    console.log(`  ✓ ${PHASE}-neon-queen-layered.png`)
  }

  await browser.close()
  console.log(`\n✅ ${PHASE} screenshots saved to ${OUT_DIR}`)
}

main().catch(err => {
  console.error('Screenshot failed:', err)
  process.exit(1)
})
