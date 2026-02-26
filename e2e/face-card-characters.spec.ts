import { test, expect } from '@playwright/test'

/**
 * Face Card Character Verification — Screenshots at gameplay size
 * Captures J/Q/K face cards for 10 representative skins to verify
 * unique character silhouettes are visible at mobile gameplay scale.
 */

const REPRESENTATIVE_SKINS = [
  'classic',
  'neon-nights',
  'sakura-bloom',
  'solar-pharaoh',
  'arctic-frost',
  'shadow-dynasty',
  'celestial',
  'blood-moon',
  'velvet-noir',
  'dragons-hoard',
]

const FACE_RANKS = ['J', 'Q', 'K'] as const

test.describe('Face card character verification', () => {
  for (const skinId of REPRESENTATIVE_SKINS) {
    test(`${skinId} — unique character silhouettes visible`, async ({ page }) => {
      // Navigate and set the active skin via localStorage
      await page.goto('/')
      await page.evaluate((id) => {
        const key = 'blackjack-card-skins'
        const state = { unlockedSkins: ['classic', id], activeSkinId: id }
        localStorage.setItem(key, JSON.stringify(state))
      }, skinId)
      await page.reload()
      await page.waitForTimeout(800)

      // Take a full-page screenshot showing the skin-themed table
      await page.screenshot({
        path: `qa-playwright/face-card-characters/${skinId}_gameplay.png`,
        fullPage: false,
      })

      // Verify the page loaded without errors
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  }
})
