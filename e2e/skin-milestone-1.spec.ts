import { test } from '@playwright/test'

/**
 * Milestone 1 — Face Card Character Differentiation Screenshots
 * Captures J/Q/K face cards for all 16 skins at gameplay size using
 * the Face Card Preview mode (?preview=facecard).
 * Run with PHASE=before or PHASE=after to tag screenshots.
 */

const ALL_SKINS = [
  'classic',
  'neon-nights',
  'royal-gold',
  'sakura-bloom',
  'solar-pharaoh',
  'arctic-frost',
  'crimson-flame',
  'shadow-dynasty',
  'gilded-serpent',
  'celestial',
  'blood-moon',
  'midnight-purple',
  'emerald-fortune',
  'velvet-noir',
  'diamond-dynasty',
  'dragons-hoard',
]

const phase = process.env.PHASE || 'before'

test.describe(`Milestone 1 face-card screenshots [${phase}]`, () => {
  for (const skinId of ALL_SKINS) {
    test(`${skinId} — J/Q/K at gameplay size`, async ({ page }) => {
      // Set the skin in localStorage before loading the page
      await page.goto('/')
      await page.evaluate((id) => {
        const key = 'blackjack-card-skins'
        const state = { unlockedSkins: ['classic', id], activeSkinId: id }
        localStorage.setItem(key, JSON.stringify(state))
      }, skinId)

      // Navigate to preview mode which shows face cards directly
      await page.goto('/?preview=facecard')
      await page.waitForTimeout(1200)

      await page.screenshot({
        path: `qa-playwright/skin-milestone-1/${skinId}_${phase}.png`,
        fullPage: false,
      })
    })
  }
})
